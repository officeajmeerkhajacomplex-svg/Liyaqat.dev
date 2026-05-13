import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Plus, 
  MessageSquare, 
  MoreVertical,
  Loader2,
  Trash2,
  Sparkles,
  ArrowLeft,
  Share2,
  Shield,
  List
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { useAuthStore } from '../store/useAuthStore';
import { getChatResponse } from '../services/geminiService';
import { cn } from '../lib/utils';
import { playSound } from '../lib/sounds';

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [isNewChat, setIsNewChat] = useState(!chatId);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch user chats
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'chats'),
      orderBy('updatedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user]);

  // Fetch messages for current chat
  useEffect(() => {
    if (!user || !chatId) {
      setMessages([]);
      return;
    }
    const q = query(
      collection(db, 'users', user.uid, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/chats/${chatId}/messages`);
    });
    return unsubscribe;
  }, [user, chatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || loading) return;

    const userMessage = input.trim();
    setInput('');
    playSound('message');
    try {
      let currentChatId = chatId;

      // 1. Create chat if it doesn't exist
      if (!currentChatId) {
        const chatDoc = await addDoc(collection(db, 'users', user.uid, 'chats'), {
          userId: user.uid,
          title: userMessage.length > 30 ? userMessage.substring(0, 30) + '...' : userMessage,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        currentChatId = chatDoc.id;
        navigate(`/chat/${currentChatId}`);
      }

      // 2. Add user message
      await addDoc(collection(db, 'users', user.uid, 'chats', currentChatId, 'messages'), {
        role: 'user',
        content: userMessage,
        createdAt: serverTimestamp(),
      });

      // 3. Update chat timestamp
      await updateDoc(doc(db, 'users', user.uid, 'chats', currentChatId), {
        updatedAt: serverTimestamp(),
      });

      // 4. Get AI response
      setLoading(true);
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const aiResponse = await getChatResponse(history, userMessage);

      // 5. Add AI message
      await addDoc(collection(db, 'users', user.uid, 'chats', currentChatId, 'messages'), {
        role: 'assistant',
        content: aiResponse || "I am sorry, I couldn't generate a response. Please try again.",
        createdAt: serverTimestamp(),
      });
      playSound('tap');

    } catch (err) {
      console.error(err);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'chats', id));
      if (chatId === id) navigate('/chat');
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete chat');
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 relative">
      {/* Sidebar - Desktop & Mobile Chat History */}
      <div className={cn(
        "fixed inset-0 z-[100] md:z-0 md:relative md:inset-auto md:flex w-full md:w-72 flex-col bg-slate-900/40 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none transition-opacity duration-300",
        isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto"
      )} onClick={() => setIsSidebarOpen(false)}>
        <motion.div 
          initial={false}
          animate={{ x: isSidebarOpen || !isMobile ? 0 : -300 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-72 h-full flex flex-col bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 shadow-xl md:shadow-sm md:rounded-[2rem] md:border md:x-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <button 
              onClick={() => { navigate('/chat'); setIsSidebarOpen(false); playSound('click'); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-emerald text-white rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-emerald-500/10"
            >
              <Plus className="w-5 h-5" />
              <span>New Chat</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
            {chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => { navigate(`/chat/${chat.id}`); setIsSidebarOpen(false); }}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all",
                  chatId === chat.id 
                    ? "bg-brand-emerald/10 text-brand-emerald" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{chat.title}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmId(chat.id);
                  }}
                  className="p-1 hover:text-red-500 transition-all text-slate-300 dark:text-zinc-600 hover:dark:text-red-400 opacity-0 group-hover:opacity-100"
                  title="Delete Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm relative">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              <List className="w-5 h-5 dark:text-white" />
            </button>
            <div className="hidden md:block">
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 dark:text-white" />
              </button>
            </div>
            <div>
              <h2 className="font-bold dark:text-white flex items-center gap-2">
                DeenFlow AI
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">Spiritual Companion</p>
            </div>
          </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                   e.stopPropagation();
                   if (chatId) setDeleteConfirmId(chatId);
                }}
                className={cn(
                  "p-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 rounded-lg transition-all",
                  !chatId && "hidden"
                )}
                title="Delete Current Chat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg">
                <MoreVertical className="w-5 h-5 text-slate-400" />
              </button>
            </div>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
        >
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-6">
              <div className="w-16 h-16 bg-brand-emerald/10 text-brand-emerald rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">Start a Conversation</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ask me anything about Islam, Quranic interpretation, or daily spiritual practice.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full">
                {["Explain Surah Al-Fatiha", "How to pray Tahajjud?", "Duas for anxiety"].map(prompt => (
                  <button 
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="text-xs font-semibold p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-brand-emerald transition-all border border-slate-100 dark:border-zinc-700 hover:border-brand-emerald/50"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id || idx}
              className={cn(
                "flex flex-col",
                msg.role === 'user' ? "items-end" : "items-start"
              )}
            >
              <div className={cn(
                "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-brand-emerald text-white rounded-tr-none" 
                  : "bg-slate-100 dark:bg-zinc-800 dark:text-slate-200 rounded-tl-none shadow-sm prose dark:prose-invert prose-sm"
              )}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-medium px-1">
                {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
              </span>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-brand-emerald/10 text-brand-emerald flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm border border-slate-200/50 dark:border-zinc-700/50">
                <div className="flex gap-1.5 py-1">
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                    className="w-1.5 h-1.5 bg-brand-emerald rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.2 }}
                    className="w-1.5 h-1.5 bg-brand-emerald rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.4 }}
                    className="w-1.5 h-1.5 bg-brand-emerald rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 md:p-6 border-t border-slate-100 dark:border-zinc-800/50">
          <form onSubmit={handleSend} className="relative flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 pl-6 pr-14 py-4 bg-slate-100 dark:bg-zinc-800 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-emerald/50 dark:text-white transition-all text-sm font-medium"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 bg-brand-emerald text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 font-medium justify-center">
            <Shield className="w-3 h-3" />
            <span>AI responses should be verified with authentic Islamic scholars.</span>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl p-8 border border-slate-200 dark:border-zinc-800 text-center space-y-6"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold dark:text-white">Delete this chat?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  This action cannot be undone. All messages in this conversation will be permanently removed.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-zinc-750 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteChat(deleteConfirmId)}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
