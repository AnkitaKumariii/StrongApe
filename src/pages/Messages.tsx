import { useState, useEffect, useRef } from "react"
import { Layout } from "@/components/layout/Layout"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { MessageSquare, Send, Plus, ArrowLeft, CheckCheck, Trash2, Search, X, Wifi, WifiOff, Loader2, Clock, AlertCircle, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { useChat } from "@/lib/useChat"
import type { Message } from "@/lib/useChat"

interface Participant {
  id: number;
  username: string;
  full_name: string;
  avatar_url: string | null;
  level: number;
  current_streak: number;
  gym_name: string | null;
}

interface ChatThread {
  id: number;
  created_at: string;
  participants: Participant[];
  last_message: Message | null;
  unread_count: number;
}

interface NearbyUser {
  id: number;
  username: string;
  full_name: string;
  avatar_url: string | null;
  level: number;
  current_streak: number;
  gym_name: string | null;
  distance_km: number;
}

export function Messages() {
  const { user } = useAuth();

  // ── Thread / sidebar state ────────────────────────────────────────────────
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // ── New conversation dialog ────────────────────────────────────────────────
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);

  // ── New message input ─────────────────────────────────────────────────────
  const [newMessageText, setNewMessageText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── WebSocket-powered chat hook ───────────────────────────────────────────
  // Compute recipientId early (from threads state) so it's ready for useChat
  const _activeThread = threads.find((t) => t.id === activeThreadId);
  const _recipientId = _activeThread
    ? (_activeThread.participants.find((p) => p.id !== user?.id) ?? _activeThread.participants[0])?.id ?? null
    : null;

  const { messages, setMessages, loadingMessages, wsStatus, recipientOnline, sendMessage } = useChat(
    activeThreadId,
    user?.id,
    _recipientId,
  );

  // ── Fetch thread list (REST) ──────────────────────────────────────────────
  const fetchThreads = async (selectThreadId?: number, isPolling = false) => {
    try {
      if (!isPolling) setLoadingThreads(true);
      const data = await api.get<ChatThread[]>("/api/chats/threads");
      setThreads(data);
      if (selectThreadId) {
        setActiveThreadId(selectThreadId);
      } else if (!isPolling && data.length > 0) {
        setActiveThreadId((current) => (current === null ? data[0].id : current));
      }
    } catch (err) {
      console.error("Failed to fetch chat threads:", err);
    } finally {
      if (!isPolling) setLoadingThreads(false);
    }
  };

  // ── Thread sidebar poll (low-frequency, unread counts only) ──────────────
  useEffect(() => {
    fetchThreads();
    const id = setInterval(() => fetchThreads(undefined, true), 10_000);
    return () => clearInterval(id);
  }, []);

  // ── Sync last_message preview in the sidebar when new messages arrive ─────
  useEffect(() => {
    if (messages.length > 0 && activeThreadId !== null) {
      const latest = messages[messages.length - 1];
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId ? { ...t, last_message: latest, unread_count: 0 } : t
        )
      );
    }
  }, [messages, activeThreadId]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Nearby users for new chat dialog ────────────────────────────────────
  const loadNearbyUsers = async () => {
    try {
      setLoadingNearby(true);
      const data = await api.get<NearbyUser[]>("/api/users/nearby?max_distance_km=100");
      if (data && data.length > 0) {
        setNearbyUsers(data);
      } else {
        const fallbackData = await api.get<any[]>("/api/users/leaderboard?limit=10");
        const mapped = fallbackData
          .filter((u) => u.id !== user?.id)
          .map((u) => ({ ...u, distance_km: 0 }));
        setNearbyUsers(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch users to message:", err);
    } finally {
      setLoadingNearby(false);
    }
  };

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newMessageText.trim();
    if (!text || activeThreadId === null || !user) return;
    setNewMessageText("");
    await sendMessage(text, user.id);
  };

  // ── Delete message (REST) ────────────────────────────────────────────────
  const handleDeleteMessage = async (messageId: number) => {
    if (activeThreadId === null) return;
    try {
      await api.delete(`/api/chats/threads/${activeThreadId}/messages/${messageId}`);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  // ── Delete thread (REST) ─────────────────────────────────────────────────
  const handleDeleteThread = async (e: React.MouseEvent, threadId: number) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/chats/threads/${threadId}`);
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      if (activeThreadId === threadId) setActiveThreadId(null);
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  // ── Start conversation (REST) ────────────────────────────────────────────
  const handleStartConversation = async (recipientId: number) => {
    try {
      const thread = await api.post<ChatThread>(`/api/chats/threads?recipient_id=${recipientId}`);
      setIsNewChatOpen(false);
      await fetchThreads(thread.id);
    } catch (err) {
      console.error("Failed to create thread:", err);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getRecipient = (thread: ChatThread) =>
    thread.participants.find((p) => p.id !== user?.id) || thread.participants[0];

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const activeRecipient = activeThread ? getRecipient(activeThread) : null;

  const filteredThreads = threads.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const r = getRecipient(t);
    return (
      (r.full_name || "").toLowerCase().includes(q) ||
      r.username.toLowerCase().includes(q) ||
      (t.last_message?.content || "").toLowerCase().includes(q)
    );
  });

  const formatThreadTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // ── WS status + recipient presence badge ─────────────────────────────────
  const WsIndicator = () => {
    // Your own connection is still handshaking
    if (wsStatus === "connecting") {
      return (
        <div className="flex items-center gap-1.5">
          <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Connecting</span>
        </div>
      );
    }
    // Your socket dropped and is retrying
    if (wsStatus === "reconnecting") {
      return (
        <div className="flex items-center gap-1.5">
          <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Reconnecting</span>
        </div>
      );
    }
    // Connected — show actual recipient presence
    if (wsStatus === "connected") {
      if (recipientOnline) {
        return (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Online</span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-1.5">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-300" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Offline</span>
        </div>
      );
    }
    return null;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Messages</h1>
          <p className="text-slate-500 font-medium">Direct chats with workout partners.</p>
        </div>
        <Button
          onClick={() => { loadNearbyUsers(); setIsNewChatOpen(true); }}
          className="rounded-full font-bold shadow-lg shadow-primary/20 gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-12rem)] rounded-3xl overflow-hidden shadow-sm border border-slate-200 bg-white">

        {/* ── Thread Sidebar ─────────────────────────────────────────────── */}
        <div className={`md:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/50 z-10 ${activeThreadId !== null ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="font-black text-slate-800 text-sm tracking-wider uppercase">Conversations</span>
              {threads.length > 0 && (
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {threads.length}
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 focus:bg-white border border-transparent focus:border-slate-300 rounded-xl outline-none transition-all placeholder:text-slate-400 text-slate-700"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {loadingThreads && threads.length === 0 ? (
              <div className="space-y-1 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-200 rounded-full w-3/4" />
                      <div className="h-2.5 bg-slate-100 rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : threads.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 px-6 text-center"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                  className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4"
                >
                  <MessageSquare className="w-7 h-7 text-slate-400" />
                </motion.div>
                <p className="text-sm font-bold text-slate-500">No conversations yet</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">Hit "New Chat" to get started</p>
              </motion.div>
            ) : filteredThreads.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 px-6 text-center"
              >
                <Search className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-500">No results</p>
                <p className="text-xs text-slate-400 mt-1">Try a different name or message</p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {filteredThreads.map((t, index) => {
                  const recipient = getRecipient(t);
                  const isActive = t.id === activeThreadId;
                  const hasUnread = t.unread_count > 0;
                  const timeLabel = t.last_message ? formatThreadTime(t.last_message.created_at) : null;
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.22, delay: index * 0.04 }}
                      className="group relative"
                    >
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            layoutId="activeAccent"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            exit={{ scaleY: 0 }}
                            className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-full"
                          />
                        )}
                      </AnimatePresence>

                      <button
                        onClick={() => setActiveThreadId(t.id)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-150 text-left cursor-pointer border-none relative ${
                          isActive ? 'bg-primary/8 shadow-sm' : 'hover:bg-slate-100 bg-transparent'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <Avatar className={`w-11 h-11 border-2 transition-all duration-200 ${
                            hasUnread ? 'border-primary shadow-md shadow-primary/20' : isActive ? 'border-slate-300' : 'border-slate-200'
                          }`}>
                            <AvatarFallback className={`font-black text-sm ${isActive ? 'bg-primary text-white' : 'bg-slate-700 text-white'}`}>
                              {(recipient.full_name || recipient.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {/* Green dot: only show for the active thread's recipient when truly online */}
                          {isActive && recipientOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-sm truncate ${hasUnread ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                              {recipient.full_name || recipient.username}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {timeLabel && (
                                <span className={`text-[10px] font-bold ${hasUnread ? 'text-primary' : 'text-slate-400'}`}>
                                  {timeLabel}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <p className={`text-xs truncate ${hasUnread ? 'text-slate-700 font-semibold' : 'text-slate-500 font-medium'}`}>
                              {t.last_message ? t.last_message.content : "No messages yet"}
                            </p>
                            {hasUnread && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="shrink-0 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center"
                              >
                                {t.unread_count > 9 ? '9+' : t.unread_count}
                              </motion.span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleDeleteThread(e, t.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full scale-90 group-hover:scale-100"
                          title="Delete Conversation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ── Chat Window ───────────────────────────────────────────────────── */}
        <div className={`md:col-span-8 flex flex-col h-full bg-[#f8fafc] relative overflow-hidden z-10 ${activeThreadId === null ? 'hidden md:flex' : 'flex'}`}>
          <div className="absolute inset-0 z-0 opacity-[0.3]" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          {activeThreadId === null ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative z-10">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-200 rotate-3 hover:rotate-0 transition-transform"
              >
                <MessageSquare className="w-12 h-12 text-slate-700" />
              </motion.div>
              <h3 className="font-bold text-3xl text-slate-900 mb-3 tracking-tight">StrongApe Chat</h3>
              <p className="text-slate-500 font-medium max-w-sm text-sm leading-relaxed">
                Select a thread from the sidebar or start a new conversation to connect.
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center gap-3 z-20 sticky top-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveThreadId(null)}
                  className="md:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full h-8 w-8"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                {activeRecipient && (
                  <>
                    <Avatar className="w-10 h-10 border border-slate-200">
                      <AvatarFallback className="bg-primary text-white font-bold">
                        {activeRecipient.full_name
                          ? activeRecipient.full_name.charAt(0).toUpperCase()
                          : activeRecipient.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                        {activeRecipient.full_name || activeRecipient.username}
                      </h3>
                      <div className="mt-0.5">
                        <WsIndicator />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10 scrollbar-thin scrollbar-thumb-slate-300">
                {loadingMessages && messages.length === 0 ? (
                  <div className="flex justify-center py-4">
                    <span className="bg-[#EFEAE2] shadow-sm text-slate-500 text-xs px-4 py-1.5 rounded-full">
                      Loading conversation...
                    </span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center py-4">
                    <span className="bg-[#FFF5C4] text-yellow-800 shadow-sm text-xs px-4 py-2 rounded-lg text-center max-w-xs leading-relaxed">
                      Messages are not end-to-end encrypted. Admins of StrongApe can read your messages — maintain a good atmosphere. 🦍
                    </span>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((m) => {
                      const isOutgoing = m.sender_id === user?.id;
                      return (
                        <motion.div
                          key={m.optimisticId ?? m.id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: m.pending ? 0.65 : 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.15 }}
                          className={`flex group ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                        >
                          {/* Delete button — only for confirmed outgoing messages */}
                          {isOutgoing && !m.pending && !m.failed && (
                            <button
                              onClick={() => handleDeleteMessage(m.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 p-1 text-slate-400 hover:text-rose-500 rounded-full self-center"
                              title="Delete Message"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* Retry button for failed messages */}
                          {isOutgoing && m.failed && (
                            <button
                              onClick={() => {
                                setMessages(prev => prev.filter(x => x.optimisticId !== m.optimisticId));
                                sendMessage(m.content, user!.id);
                              }}
                              className="mr-2 p-1 text-rose-400 hover:text-rose-600 rounded-full self-center"
                              title="Retry"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className={`relative max-w-[85%] md:max-w-[70%] px-4 py-2.5 text-[15px] transition-transform duration-200 ${
                            m.failed
                              ? 'bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl rounded-tr-sm shadow-sm'
                              : isOutgoing
                                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl rounded-tr-sm shadow-sm hover:-translate-y-[1px]'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm shadow-sm hover:-translate-y-[1px]'
                          }`}>
                            <p className="leading-relaxed whitespace-pre-wrap font-medium">{m.content}</p>
                            <div className="flex items-center gap-1.5 justify-end mt-1 opacity-80">
                              {m.failed ? (
                                <>
                                  <AlertCircle className="w-3 h-3 text-rose-400" />
                                  <span className="text-[10px] font-bold text-rose-400">Failed · tap to retry</span>
                                </>
                              ) : (
                                <>
                                  <span className={`text-[10px] font-bold tracking-wider ${isOutgoing ? 'text-slate-300' : 'text-slate-400'}`}>
                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {isOutgoing && (
                                    m.pending
                                      ? <Clock className="w-3 h-3 text-slate-400" />
                                      : <CheckCheck className="w-3.5 h-3.5 text-slate-300" />
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-transparent z-20">
                <form
                  onSubmit={handleSendMessage}
                  className="flex gap-2 p-1.5 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm transition-all focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100"
                >
                  <Input
                    placeholder="Type a message..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="flex-1 rounded-2xl h-12 border-none bg-transparent focus-visible:ring-0 text-sm font-semibold px-4 shadow-none"
                    required
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-xl h-12 w-12 shrink-0 cursor-pointer bg-slate-900 hover:bg-slate-800 hover:scale-105 active:scale-95 text-white transition-all shadow-sm"
                    disabled={!newMessageText.trim()}
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="sm:rounded-3xl border-slate-200 max-w-md p-8 bg-white max-h-[80vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">New Conversation</DialogTitle>
            <DialogDescription className="text-slate-500 font-semibold mt-1">
              Select a partner to start messaging.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-2 mt-4 pr-1">
            {loadingNearby ? (
              <div className="text-center py-8 text-xs text-slate-400">Searching partners...</div>
            ) : nearbyUsers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-semibold">
                No users found yet. Wait for the StrongApe community to grow!
              </div>
            ) : (
              nearbyUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleStartConversation(u.id)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors text-left bg-white cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary text-white font-bold text-sm">
                        {u.full_name ? u.full_name.charAt(0).toUpperCase() : u.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{u.full_name || u.username}</div>
                      <div className="text-xs text-slate-500 font-semibold">{u.gym_name || "Ape Gym"}</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-primary">Message</span>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
