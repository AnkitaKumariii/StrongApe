import { useState, useEffect, useRef } from "react"
import { Layout } from "@/components/layout/Layout"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { MessageSquare, Send, Plus, ArrowLeft } from "lucide-react"
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

  const fetchThreads = async (selectThreadId?: number) => {
    try {
      setLoadingThreads(true);
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
      setLoadingThreads(false);
    }
  };

  const fetchMessages = async (threadId: number) => {
    try {
      setLoadingMessages(true);
      const data = await api.get<Message[]>(`/api/chats/threads/${threadId}/messages`);
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadNearbyUsers = async () => {
    try {
      setLoadingNearby(true);
      const data = await api.get<NearbyUser[]>("/api/users/nearby?max_distance_km=100");
      setNearbyUsers(data);
    } catch (err) {
      console.error("Failed to fetch users to message:", err);
    } finally {
      setLoadingNearby(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    if (activeThreadId !== null) {
      fetchMessages(activeThreadId);
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-[calc(100vh-12rem)] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Threads List Sidebar */}
        <div className={`md:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/50 ${activeThreadId !== null ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-200 bg-white font-bold text-slate-700 text-sm tracking-wider uppercase">
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
              threads.map((t) => {
                const recipient = getRecipient(t);
                const isActive = t.id === activeThreadId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveThreadId(t.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left cursor-pointer border-none bg-transparent ${
                      isActive ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="bg-primary text-white font-bold text-sm">
                        {recipient.full_name ? recipient.full_name.charAt(0).toUpperCase() : recipient.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm truncate">{recipient.full_name || recipient.username}</span>
                        {t.unread_count > 0 && (
                          <span className="w-2.5 h-2.5 bg-destructive rounded-full shrink-0"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {t.last_message ? t.last_message.content : "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Messaging Chat Window */}
        <div className={`md:col-span-8 flex flex-col h-full bg-white ${activeThreadId === null ? 'hidden md:flex' : 'flex'}`}>
          {activeThreadId === null ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/20">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">Your Inbox</h3>
              <p className="text-slate-500 font-medium max-w-xs text-sm">
                Select a thread from the sidebar or start a new conversation to begin chatting.
              </p>
            </div>
          ) : (
            <>
              {/* Chat Thread Header */}
              <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setActiveThreadId(null)}
                  className="md:hidden text-slate-500 hover:text-slate-900 rounded-full h-8 w-8"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                {activeRecipient && (
                  <>
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary text-white font-bold">
                        {activeRecipient.full_name ? activeRecipient.full_name.charAt(0).toUpperCase() : activeRecipient.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {activeRecipient.full_name || activeRecipient.username}
                      </h3>
                      {activeRecipient.gym_name && (
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          {activeRecipient.gym_name}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Chat Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {loadingMessages && messages.length === 0 ? (
                  <div className="text-center text-slate-400 text-xs py-8">Loading conversation history...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-slate-400 text-xs py-8">No messages yet. Send a message to start the chat!</div>
                ) : (
                  messages.map((m) => {
                    const isOutgoing = m.sender_id === user?.id;
                    return (
                      <div 
                        key={m.id} 
                        className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                          isOutgoing 
                            ? 'bg-primary text-white rounded-br-none' 
                            : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                        }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                          <div className={`text-[9px] font-bold text-right mt-1 ${isOutgoing ? 'text-white/70' : 'text-slate-400'}`}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex gap-2">
                <Input 
                  placeholder="Type a message..." 
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 rounded-xl h-12 border-slate-200 focus-visible:ring-primary text-sm font-medium"
                  required
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="rounded-xl h-12 w-12 shrink-0 cursor-pointer shadow-md shadow-primary/20"
                  disabled={!newMessageText.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
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
                No nearby workout partners found to start a conversation. Make sure your profile location is set!
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
