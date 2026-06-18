import { useState, useEffect, useRef } from "react"
import { Layout } from "@/components/layout/Layout"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { MessageSquare, Send, Plus, ArrowLeft, CheckCheck, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"

interface Participant {
  id: number;
  username: string;
  full_name: string;
  avatar_url: string | null;
  level: number;
  current_streak: number;
  gym_name: string | null;
}

interface Message {
  id: number;
  thread_id: number;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
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
  
  // Chat States
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [newMessageText, setNewMessageText] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Dialog States (New Conversation)
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchThreads = async (selectThreadId?: number, isPolling = false) => {
    try {
      if (!isPolling) setLoadingThreads(true);
      const data = await api.get<ChatThread[]>("/api/chats/threads");
      setThreads(data);
      if (selectThreadId) {
        setActiveThreadId(selectThreadId);
      } else if (data.length > 0 && activeThreadId === null) {
        setActiveThreadId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch chat threads:", err);
    } finally {
      if (!isPolling) setLoadingThreads(false);
    }
  };

  const fetchMessages = async (threadId: number, isPolling = false) => {
    try {
      if (!isPolling) setLoadingMessages(true);
      const data = await api.get<Message[]>(`/api/chats/threads/${threadId}/messages`);
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      if (!isPolling) setLoadingMessages(false);
    }
  };

  const loadNearbyUsers = async () => {
    try {
      setLoadingNearby(true);
      const data = await api.get<NearbyUser[]>("/api/users/nearby?max_distance_km=100");
      if (data && data.length > 0) {
        setNearbyUsers(data);
      } else {
        // Fallback to top users if no one is nearby
        const fallbackData = await api.get<any[]>("/api/users/leaderboard?limit=10");
        const mappedFallback = fallbackData
          .filter(u => u.id !== user?.id)
          .map(u => ({
            ...u,
            distance_km: 0
          }));
        setNearbyUsers(mappedFallback);
      }
    } catch (err) {
      console.error("Failed to fetch users to message:", err);
    } finally {
      setLoadingNearby(false);
    }
  };

  useEffect(() => {
    fetchThreads();
    const intervalId = setInterval(() => {
      fetchThreads(undefined, true);
    }, 5000); // Background poll for thread unread counts
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (activeThreadId !== null) {
      fetchMessages(activeThreadId);
      const intervalId = setInterval(() => {
        fetchMessages(activeThreadId, true);
      }, 3000); // High frequency poll for active thread messages
      return () => clearInterval(intervalId);
    }
  }, [activeThreadId]);

  useEffect(() => {
    // Scroll to bottom whenever messages list changes
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || activeThreadId === null) return;

    const textToSend = newMessageText.trim();
    setNewMessageText("");

    try {
      const sentMsg = await api.post<Message>(`/api/chats/threads/${activeThreadId}/messages`, {
        content: textToSend
      });
      // Append the message locally
      setMessages((prev) => [...prev, sentMsg]);
      // Update the threads list last message locally
      setThreads((prevThreads) =>
        prevThreads.map((t) =>
          t.id === activeThreadId ? { ...t, last_message: sentMsg } : t
        )
      );
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (activeThreadId === null) return;
    try {
      await api.delete(`/api/chats/threads/${activeThreadId}/messages/${messageId}`);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleDeleteThread = async (e: React.MouseEvent, threadId: number) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/chats/threads/${threadId}`);
      setThreads(prev => prev.filter(t => t.id !== threadId));
      if (activeThreadId === threadId) {
        setActiveThreadId(null);
      }
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  const handleStartConversation = async (recipientId: number) => {
    try {
      // Create thread
      const thread = await api.post<ChatThread>(`/api/chats/threads?recipient_id=${recipientId}`);
      setIsNewChatOpen(false);
      // Refresh threads and automatically select the new/existing thread
      await fetchThreads(thread.id);
    } catch (err) {
      console.error("Failed to create thread:", err);
    }
  };

  const getRecipient = (thread: ChatThread) => {
    return thread.participants.find((p) => p.id !== user?.id) || thread.participants[0];
  };

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const activeRecipient = activeThread ? getRecipient(activeThread) : null;

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
        
        {/* Threads List Sidebar */}
        <div className={`md:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/50 z-10 ${activeThreadId !== null ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-200 bg-white font-black text-slate-800 text-sm tracking-wider uppercase">
            Conversations
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingThreads && threads.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-medium">Loading threads...</div>
            ) : threads.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-medium px-4">
                No active conversations yet. Click "New Chat" to start messaging.
              </div>
            ) : (
              <AnimatePresence>
                {threads.map((t) => {
                  const recipient = getRecipient(t);
                  const isActive = t.id === activeThreadId;
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                      className="group"
                    >
                      <button
                        onClick={() => setActiveThreadId(t.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors duration-200 text-left cursor-pointer border-none relative hover:bg-slate-100 ${
                          isActive ? 'bg-primary/5' : 'bg-transparent'
                        }`}
                      >
                        <Avatar className="w-10 h-10 shrink-0 border border-slate-200">
                          <AvatarFallback className="bg-primary text-white font-bold text-sm">
                            {recipient.full_name ? recipient.full_name.charAt(0).toUpperCase() : recipient.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 pr-8">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm truncate">{recipient.full_name || recipient.username}</span>
                            {t.unread_count > 0 && (
                              <span className="w-2.5 h-2.5 bg-primary rounded-full shrink-0"></span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                            {t.last_message ? t.last_message.content : "No messages yet"}
                          </p>
                        </div>
                        
                        <button 
                          onClick={(e) => handleDeleteThread(e, t.id)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                          title="Delete Conversation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Messaging Chat Window */}
        <div className={`md:col-span-8 flex flex-col h-full bg-[#f8fafc] relative overflow-hidden z-10 ${activeThreadId === null ? 'hidden md:flex' : 'flex'}`}>
          {/* Subtle Dot Grid Background */}
          <div className="absolute inset-0 z-0 opacity-[0.3]" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
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
              {/* Chat Thread Header */}
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
                        {activeRecipient.full_name ? activeRecipient.full_name.charAt(0).toUpperCase() : activeRecipient.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                        {activeRecipient.full_name || activeRecipient.username}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <p className="text-[11px] font-bold text-green-600 uppercase tracking-wider">
                          Online
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Chat Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10 scrollbar-thin scrollbar-thumb-slate-300">
                {loadingMessages && messages.length === 0 ? (
                  <div className="flex justify-center py-4">
                    <span className="bg-[#EFEAE2] shadow-sm text-slate-500 text-xs px-4 py-1.5 rounded-full">Loading conversation...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center py-4">
                    <span className="bg-[#FFF5C4] text-yellow-800 shadow-sm text-xs px-4 py-2 rounded-lg text-center max-w-xs leading-relaxed">
                      Messages are end-to-end encrypted. No one outside of this chat, not even StrongApe, can read to them.
                    </span>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((m) => {
                      const isOutgoing = m.sender_id === user?.id;
                      return (
                        <motion.div 
                          key={m.id} 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex group ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                        >
                          {isOutgoing && (
                            <button
                              onClick={() => handleDeleteMessage(m.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 p-1 text-slate-400 hover:text-rose-500 rounded-full self-center"
                              title="Delete Message"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className={`relative max-w-[85%] md:max-w-[70%] px-4 py-2.5 text-[15px] transition-transform duration-200 hover:-translate-y-[1px] ${
                            isOutgoing 
                              ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl rounded-tr-sm shadow-sm' 
                              : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm shadow-sm'
                          }`}>
                            <p className="leading-relaxed whitespace-pre-wrap font-medium">{m.content}</p>
                            <div className="flex items-center gap-1.5 justify-end mt-1 opacity-80">
                              <span className={`text-[10px] font-bold tracking-wider ${isOutgoing ? 'text-slate-300' : 'text-slate-400'}`}>
                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isOutgoing && (
                                <CheckCheck className="w-3.5 h-3.5 text-slate-300" />
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

              {/* Message Input Box */}
              <div className="p-4 bg-transparent z-20">
                <form onSubmit={handleSendMessage} className="flex gap-2 p-1.5 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm transition-all focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100">
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

      {/* New Conversation dialog */}
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
                      <div className="font-bold text-slate-900 text-sm">
                        {u.full_name || u.username}
                      </div>
                      <div className="text-xs text-slate-500 font-semibold">
                        {u.gym_name || "Ape Gym"}
                      </div>
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
  )
}
