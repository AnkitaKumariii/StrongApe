/**
 * useChat — WebSocket-powered chat hook with optimistic UI.
 *
 * Manages the full lifecycle of a WebSocket connection for a given thread:
 *  - Opens a WS connection when threadId changes.
 *  - Reconnects automatically with exponential back-off on failures.
 *  - Pushes received messages directly into state (no polling needed).
 *  - Optimistic UI: messages appear instantly on send; reconciled when the
 *    server echo arrives, rolled back on failure.
 *  - Returns a `wsStatus` so the UI can show "Connecting…" / "Live" / "Reconnecting".
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

/**
 * Build the WebSocket base URL.
 *
 * Two cases:
 *  1. VITE_API_URL is set (e.g. "http://localhost:8000") → swap http→ws
 *  2. VITE_API_URL is empty (Vite proxy mode) → derive from window.location
 *     so we get "ws://localhost:5173" and the Vite /ws proxy forwards it.
 */
function getWsBase(): string {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrl) {
    return apiUrl.replace(/^http/, "ws").replace(/\/$/, "");
  }
  // Proxy mode: build from the browser's own origin
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}`;
}

const WS_BASE = getWsBase();

const MAX_BACKOFF_MS = 16_000;

/** Generate a unique temporary key for an optimistic message. */
const mkOptId = () => `opt_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export function useChat(threadId: number | null, currentUserId?: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [wsStatus, setWsStatus] = useState<WsStatus>("closed");

  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // ── REST: load initial history ────────────────────────────────────────────
  const loadHistory = useCallback(async (id: number) => {
    try {
      setLoadingMessages(true);
      const data = await api.get<Message[]>(`/api/chats/threads/${id}/messages`);
      if (mountedRef.current) setMessages(data);
    } catch (err) {
      console.error("Failed to load message history:", err);
    } finally {
      if (mountedRef.current) setLoadingMessages(false);
    }
  }, []);

  // ── WebSocket lifecycle ───────────────────────────────────────────────────
  const openSocket = useCallback((id: number) => {
    if (!mountedRef.current) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    setWsStatus(retryCountRef.current === 0 ? "connecting" : "reconnecting");

    const url = `${WS_BASE}/ws/chats/${id}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      retryCountRef.current = 0;
      setWsStatus("connected");
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const payload = JSON.parse(event.data as string);
        if (payload.type === "message") {
          const confirmed: Message = payload.data;
          setMessages((prev) => {
            // If there's a pending optimistic message with matching content from
            // the current user, replace the FIRST one (FIFO order) with the
            // confirmed server message. Otherwise just append (dedup by id).
            const optIdx = prev.findIndex(
              (m) => m.pending && m.content === confirmed.content && m.sender_id === confirmed.sender_id
            );
            if (optIdx !== -1) {
              const next = [...prev];
              next[optIdx] = { ...confirmed }; // replace optimistic with real
              return next;
            }
            // Message from the other participant — just deduplicate and append
            if (prev.some((m) => m.id === confirmed.id)) return prev;
            return [...prev, confirmed];
          });
        }
      } catch {
        // ignore malformed frames
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      wsRef.current = null;
      setWsStatus("reconnecting");
      const delay = Math.min(500 * 2 ** retryCountRef.current, MAX_BACKOFF_MS);
      retryCountRef.current += 1;
      retryTimerRef.current = setTimeout(() => {
        if (mountedRef.current) openSocket(id);
      }, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  // ── Send message (optimistic) ─────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string, senderId: number): Promise<void> => {
      if (!threadId) return;

      const optId = mkOptId();
      const optimistic: Message = {
        id: -1,               // placeholder — never persisted
        thread_id: threadId,
        sender_id: senderId,
        content,
        is_read: false,
        created_at: new Date().toISOString(),
        optimisticId: optId,
        pending: true,
      };

      // Show instantly
      setMessages((prev) => [...prev, optimistic]);

      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        // WS path — server will broadcast back and onmessage reconciles it
        ws.send(JSON.stringify({ type: "message", content }));
        return;
      }

      // Fallback: REST (e.g. during reconnect window)
      try {
        const confirmed = await api.post<Message>(
          `/api/chats/threads/${threadId}/messages`,
          { content }
        );
        // Replace the optimistic placeholder with the confirmed message
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.optimisticId === optId);
          if (idx === -1) return prev; // already reconciled
          const next = [...prev];
          next[idx] = { ...confirmed };
          return next;
        });
      } catch (err) {
        console.error("Failed to send message:", err);
        // Mark as failed so the UI can indicate the error
        setMessages((prev) =>
          prev.map((m) =>
            m.optimisticId === optId ? { ...m, pending: false, failed: true } : m
          )
        );
      }
    },
    [threadId]
  );

  // ── Effect: open socket & load history when threadId changes ──────────────
  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      setWsStatus("closed");
      return;
    }

    setMessages([]);
    retryCountRef.current = 0;

    loadHistory(threadId);
    openSocket(threadId);

    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsStatus("closed");
    };
  }, [threadId, loadHistory, openSocket]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, []);

  return { messages, setMessages, loadingMessages, wsStatus, sendMessage };
}
