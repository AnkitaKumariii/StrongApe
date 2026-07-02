/**
 * useChat — Real-time chat hook with optimistic UI and graceful fallback.
 *
 * Strategy:
 *  1. Always load message history via REST on thread open (reliable baseline).
 *  2. Open a WebSocket for instant real-time delivery.
 *  3. If the WS is down, fall back to REST polling every 5 s so messages
 *     always appear even when WebSocket connectivity is unavailable.
 *  4. Optimistic UI: messages appear immediately on send, reconciled or
 *     rolled back when the server responds.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/api";

export interface Message {
  id: number;
  thread_id: number;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  /** Present only on optimistic (not-yet-confirmed) messages. */
  optimisticId?: string;
  /** True while waiting for server confirmation. */
  pending?: boolean;
  /** True if the server rejected the message. */
  failed?: boolean;
}

export type WsStatus = "connecting" | "connected" | "reconnecting" | "closed";

/** Derive the WebSocket base URL from env or window.location (proxy mode). */
function getWsBase(): string {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrl) {
    return apiUrl.replace(/^http/, "ws").replace(/\/$/, "");
  }
  // Vite proxy mode: connect to the same host, Vite's /ws rule forwards it
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}`;
}

const WS_BASE = getWsBase();
const MAX_BACKOFF_MS = 16_000;
const POLL_INTERVAL_MS = 5_000; // fallback poll when WS is down

const mkOptId = () => `opt_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export function useChat(threadId: number | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [wsStatus, setWsStatus] = useState<WsStatus>("closed");

  // Refs — stable across renders, no re-render on change
  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsConnectedRef = useRef(false);
  const activeThreadRef = useRef<number | null>(null);

  // ── REST: poll/fetch messages ─────────────────────────────────────────────
  const fetchMessages = useCallback(async (id: number, signal?: AbortSignal) => {
    try {
      const data = await api.get<Message[]>(
        `/api/chats/threads/${id}/messages`,
        signal ? { signal } : undefined
      );
      // Don't overwrite state if there are pending optimistic messages in-flight
      setMessages((prev) => {
        if (prev.some((m) => m.pending)) return prev;
        return data;
      });
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("Failed to fetch messages:", err);
      }
    }
  }, []);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  const openSocket = useCallback((id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Tear down any existing socket cleanly
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    wsConnectedRef.current = false;
    setWsStatus(retryCountRef.current === 0 ? "connecting" : "reconnecting");

    let ws: WebSocket;
    try {
      ws = new WebSocket(
        `${WS_BASE}/ws/chats/${id}?token=${encodeURIComponent(token)}`
      );
    } catch (e) {
      console.error("WS URL error:", e);
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      if (activeThreadRef.current !== id) return; // stale connection
      retryCountRef.current = 0;
      wsConnectedRef.current = true;
      setWsStatus("connected");
    };

    ws.onmessage = (event) => {
      if (activeThreadRef.current !== id) return;
      try {
        const payload = JSON.parse(event.data as string);
        if (payload.type === "message") {
          const confirmed: Message = payload.data;
          setMessages((prev) => {
            // Replace the first matching pending optimistic message
            const optIdx = prev.findIndex(
              (m) =>
                m.pending &&
                m.content === confirmed.content &&
                m.sender_id === confirmed.sender_id
            );
            if (optIdx !== -1) {
              const next = [...prev];
              next[optIdx] = { ...confirmed };
              return next;
            }
            // Incoming from other participant — deduplicate and append
            if (prev.some((m) => m.id === confirmed.id)) return prev;
            return [...prev, confirmed];
          });
        }
      } catch {
        /* ignore malformed frames */
      }
    };

    ws.onclose = () => {
      if (activeThreadRef.current !== id) return; // stale
      wsRef.current = null;
      wsConnectedRef.current = false;
      setWsStatus("reconnecting");
      // Exponential back-off
      const delay = Math.min(500 * 2 ** retryCountRef.current, MAX_BACKOFF_MS);
      retryCountRef.current += 1;
      retryTimerRef.current = setTimeout(() => {
        if (activeThreadRef.current === id) openSocket(id);
      }, delay);
    };

    ws.onerror = () => ws.close();
  }, []); // stable — uses refs only

  // ── Fallback REST poll (fires only when WS is not connected) ──────────────
  const startFallbackPoll = useCallback((id: number) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(() => {
      if (!wsConnectedRef.current && activeThreadRef.current === id) {
        fetchMessages(id);
      }
    }, POLL_INTERVAL_MS);
  }, [fetchMessages]);

  // ── Send message (optimistic) ─────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string, senderId: number): Promise<void> => {
      const id = activeThreadRef.current;
      if (!id) return;

      const optId = mkOptId();
      const optimistic: Message = {
        id: -1,
        thread_id: id,
        sender_id: senderId,
        content,
        is_read: false,
        created_at: new Date().toISOString(),
        optimisticId: optId,
        pending: true,
      };

      // Show instantly in the UI
      setMessages((prev) => [...prev, optimistic]);

      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        // Fastest path — WS is open
        ws.send(JSON.stringify({ type: "message", content }));
        return;
      }

      // Fallback: REST when WS is temporarily down
      try {
        const confirmed = await api.post<Message>(
          `/api/chats/threads/${id}/messages`,
          { content }
        );
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.optimisticId === optId);
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = { ...confirmed };
          return next;
        });
      } catch (err) {
        console.error("Failed to send message:", err);
        setMessages((prev) =>
          prev.map((m) =>
            m.optimisticId === optId
              ? { ...m, pending: false, failed: true }
              : m
          )
        );
      }
    },
    [] // uses refs — always fresh
  );

  // ── Main effect: runs when threadId changes ───────────────────────────────
  useEffect(() => {
    if (!threadId) {
      activeThreadRef.current = null;
      setMessages([]);
      setWsStatus("closed");
      return;
    }

    activeThreadRef.current = threadId;
    retryCountRef.current = 0;
    wsConnectedRef.current = false;

    // Clear existing state immediately
    setMessages([]);
    setLoadingMessages(true);

    // 1. Load history via REST (reliable, always works)
    const controller = new AbortController();
    api
      .get<Message[]>(`/api/chats/threads/${threadId}/messages`, {
        signal: controller.signal,
      })
      .then((data) => {
        setMessages(data);
        setLoadingMessages(false);
      })
      .catch((err: any) => {
        if (err?.name !== "AbortError") {
          console.error("Failed to load message history:", err);
          setLoadingMessages(false);
        }
      });

    // 2. Open WebSocket for real-time delivery
    openSocket(threadId);

    // 3. Start fallback poll (only fires when WS is down)
    startFallbackPoll(threadId);

    return () => {
      // Abort the in-flight REST fetch
      controller.abort();

      // Stop reconnect timer
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      // Close WS without triggering the reconnect handler
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }

      // Stop fallback poll
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }

      wsConnectedRef.current = false;
      setWsStatus("closed");
    };
  }, [threadId, openSocket, startFallbackPoll]);

  return { messages, setMessages, loadingMessages, wsStatus, sendMessage };
}
