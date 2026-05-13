import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSocialStore, SocialChat, PublicProfile } from '../store/useSocialStore';
import { 
  MessageCircle, Search, Edit, Users, Lock, ChevronLeft, 
  Send, Plus, MoreVertical, ShieldCheck, Share, ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { playSound } from '../lib/sounds';
import { format } from 'date-fns';
import { useAuthStore } from '../store/useAuthStore';

export default function SocialMessagesPage() {
  const { 
    initialize, isInitialized, chats, activeChatId, 
    activeChatMessages, setActiveChat, startDirectChat, sendMessage,
    loadingMessages, publicProfile, contacts, createGroupChat
  } = useSocialStore();
  const { user } = useAuthStore();

  const [messageInput, setMessageInput] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Group Creation State
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatId) return;

    const currentText = messageInput;
    setMessageInput('');
    try {
      await sendMessage(activeChatId, currentText);
      playSound('message');
    } catch (err) {
      console.error(err);
      setMessageInput(currentText);
    }
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="h-full w-full flex flex-col md:flex-row bg-white dark:bg-brand-black md:rounded-none overflow-hidden border-t md:border-t-0 border-slate-100 dark:border-zinc-800 relative shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-[0_0_40px_rgba(0,0,0,0.2)]">
      
      {/* Sidebar: Chat List */}
      <div className={cn(
        "w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40",
        activeChatId ? "hidden md:flex" : "flex flex-1"
      )}>
        <div className="p-4 md:p-6 pb-2 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            Messages
            <ShieldCheck className="w-5 h-5 text-brand-emerald" />
          </h1>
          <button 
            onClick={() => { setShowNewChat(true); playSound('click'); }}
            className="p-2 md:p-3 bg-brand-emerald hover:bg-emerald-600 text-white rounded-full transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search encrypted chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-brand-emerald/50 dark:text-white transition-all shadow-sm font-medium"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          <div className="px-3 pb-2 pt-1 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Lock className="w-3 h-3" />
            End-to-End Encrypted
          </div>
          {chats.map(chat => {
            const isGroup = chat.type === 'group';
            const name = isGroup ? chat.name : (chat.otherParticipant?.displayName || "Unknown User");
            const avatar = isGroup ? chat.groupImage : chat.otherParticipant?.photoURL;
            return (
              <button
                key={chat.id}
                onClick={() => { setActiveChat(chat.id); playSound('tap'); }}
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left",
                  activeChatId === chat.id 
                    ? "bg-white dark:bg-zinc-800 shadow-sm border border-slate-200 dark:border-zinc-700/50" 
                    : "hover:bg-white dark:hover:bg-zinc-800/80 border border-transparent"
                )}
              >
                <div className="relative flex-shrink-0">
                  {avatar ? (
                     <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-zinc-800 bg-slate-100 dark:bg-zinc-700" />
                  ) : (
                     <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold border-2 border-white dark:border-zinc-800">
                       {name?.[0]?.toUpperCase() || <Users className="w-5 h-5"/>}
                     </div>
                  )}
                  {isGroup && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-100 dark:bg-zinc-700 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-800">
                      <Users className="w-3 h-3 text-slate-500 dark:text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-slate-800 dark:text-white truncate">{name}</h3>
                    {chat.lastMessageAt && (
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                        {format(new Date(chat.lastMessageAt), 'p')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-zinc-500 truncate font-medium">
                    {/* we don't have last message preview decrypted easily, show enc status */}
                    <span className="flex items-center gap-1 opacity-80">
                      <Lock className="w-3 h-3" /> Encrypted message
                    </span>
                  </p>
                </div>
              </button>
            )
          })}
          {chats.length === 0 && (
            <div className="text-center py-10 px-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">No messages</h3>
              <p className="text-sm text-slate-500">Securely chat with your DeenFlow friends.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChatId ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-[#0a0a0a] relative z-10 w-full h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-[#0a0a0a] sticky top-0 z-20">
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setActiveChat(null); playSound('tap'); }}
                  className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                {/* Active Chat Info */}
                <div className="flex items-center gap-3">
                  {activeChat?.type === 'group' ? (
                     <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-brand-emerald">
                       <Users className="w-5 h-5"/>
                     </div>
                  ) : (
                     <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                       {activeChat?.otherParticipant?.photoURL ? (
                         <img src={activeChat.otherParticipant.photoURL} alt="" className="w-full h-full object-cover" />
                       ) : (
                         activeChat?.otherParticipant?.displayName?.[0] || 'U'
                       )}
                     </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white leading-tight">
                      {activeChat?.type === 'group' ? activeChat.name : activeChat?.otherParticipant?.displayName}
                    </h3>
                    <p className="text-xs text-brand-emerald font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" /> End-to-End Encrypted
                    </p>
                  </div>
                </div>
             </div>
             <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
               <MoreVertical className="w-5 h-5" />
             </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-slate-50/50 dark:bg-transparent">
             {loadingMessages && activeChatMessages.length === 0 ? (
               <div className="flex items-center justify-center h-full">
                 <div className="animate-spin w-8 h-8 border-4 border-emerald-100 border-t-brand-emerald rounded-full" />
               </div>
             ) : (
               activeChatMessages.map((msg, i) => {
                 const isMe = msg.senderId === user?.uid;
                 // Add subtle groupings if previous message was same sender
                 const prevMsg = activeChatMessages[i - 1];
                 const isConsecutive = prevMsg?.senderId === msg.senderId;
                 
                 return (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     key={msg.id} 
                     className={cn("flex flex-col", isMe ? "items-end" : "items-start", isConsecutive ? "mt-1" : "mt-6")}
                   >
                     {!isMe && !isConsecutive && activeChat?.type === 'group' && (
                       <span className="text-[10px] uppercase font-bold text-slate-400 ml-4 mb-1 tracking-wider">
                         {contacts.find(c => c.uid === msg.senderId)?.displayName || msg.senderId.slice(0, 5)}
                       </span>
                     )}
                     <div className={cn(
                       "px-5 py-3 md:py-3.5 max-w-[85%] md:max-w-[70%] font-medium md:text-md",
                       isMe 
                        ? "bg-brand-emerald text-white rounded-[24px] rounded-br-[8px]" 
                        : "bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 rounded-[24px] rounded-bl-[8px] border border-slate-100 dark:border-zinc-800 shadow-sm"
                     )}>
                       {msg.decryptedText || (
                         <span className="flex items-center gap-2 opacity-50">
                           <ShieldCheck className="w-4 h-4 animate-pulse" /> Decrypting...
                         </span>
                       )}
                     </div>
                     <span className={cn(
                       "text-[10px] text-slate-400 mt-1.5 font-medium",
                       isMe ? "mr-2" : "ml-2"
                     )}>
                       {format(new Date(msg.timestamp), 'h:mm a')}
                     </span>
                   </motion.div>
                 )
               })
             )}
             
             {/* Extra padding at bottom so scrolling reaches past input */}
             <div ref={messagesEndRef} className="h-4"></div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-[#0a0a0a] border-t border-slate-100 dark:border-zinc-800 sticky bottom-0">
            <form onSubmit={handleSend} className="flex gap-2">
              <div className="flex-1 relative">
                <input 
                  type="text"
                  placeholder="Type an encrypted message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-zinc-900 rounded-full pl-6 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-emerald/50 dark:text-white"
                />
              </div>
              <button 
                type="submit"
                disabled={!messageInput.trim()}
                className="w-14 h-[52px] flex items-center justify-center bg-brand-emerald text-white rounded-full disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                <Send className="w-5 h-5 -ml-1" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-50/50 dark:bg-[#0a0a0a]/50 text-center p-8">
          <div className="w-32 h-32 mb-8 relative">
            <div className="absolute inset-0 bg-brand-emerald/10 dark:bg-brand-emerald/5 rounded-[3rem] rotate-12 blur-xl" />
            <div className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-2xl flex items-center justify-center z-10">
              <ShieldCheck className="w-12 h-12 text-brand-emerald" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white dark:bg-zinc-800 rounded-full border border-slate-100 dark:border-zinc-800 shadow-lg flex items-center justify-center z-20">
              <Lock className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold dark:text-white mb-4">DeenFlow <span className="font-serif italic text-brand-emerald">Secure</span></h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-lg leading-relaxed">
             A private, beautifully crafted space to connect with your spiritual community.
          </p>
          <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 bg-white dark:bg-zinc-900 px-6 py-3 rounded-full border border-slate-100 dark:border-zinc-800">
             <Lock className="w-4 h-4" /> End-to-End Encrypted
          </div>
        </div>
      )}

      {/* New Chat / Contacts Modal */}
      <AnimatePresence>
        {showNewChat && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
               onClick={() => setShowNewChat(false)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
               className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-zinc-800 flex flex-col max-h-[80vh]"
             >
               {isCreatingGroup ? (
                 <>
                  <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-4">
                    <button onClick={() => setIsCreatingGroup(false)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                      <h3 className="font-bold text-xl dark:text-white">Create Group</h3>
                      <p className="text-xs text-slate-500">{selectedContacts.length} selected</p>
                    </div>
                  </div>
                  <div className="p-4 border-b border-slate-100 dark:border-zinc-800">
                     <input 
                       type="text"
                       placeholder="Group Name (e.g. Majlis Noor)"
                       value={groupName}
                       onChange={e => setGroupName(e.target.value)}
                       className="w-full bg-slate-100 dark:bg-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-emerald/50 dark:text-white font-medium"
                     />
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                     <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Select Members</div>
                     {contacts.map(contact => (
                       <label key={contact.uid} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-2xl transition-colors cursor-pointer">
                         <input 
                           type="checkbox" 
                           checked={selectedContacts.includes(contact.uid)}
                           onChange={(e) => {
                             if (e.target.checked) setSelectedContacts(prev => [...prev, contact.uid]);
                             else setSelectedContacts(prev => prev.filter(id => id !== contact.uid));
                           }}
                           className="w-5 h-5 rounded border-slate-300 text-brand-emerald focus:ring-brand-emerald bg-slate-100 dark:bg-zinc-800 dark:border-zinc-700"
                         />
                         <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-slate-500">
                           {contact.photoURL ? <img src={contact.photoURL} alt="" className="w-full h-full object-cover" /> : contact.displayName[0]}
                         </div>
                         <div className="flex-1">
                           <h4 className="font-bold dark:text-white text-sm">{contact.displayName}</h4>
                         </div>
                       </label>
                     ))}
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
                     <button 
                       disabled={!groupName.trim() || selectedContacts.length === 0}
                       onClick={async () => {
                         try {
                           const id = await createGroupChat(groupName, selectedContacts);
                           setActiveChat(id);
                           setShowNewChat(false);
                           setIsCreatingGroup(false);
                           setGroupName('');
                           setSelectedContacts([]);
                         } catch (err) {
                           console.error(err);
                         }
                       }}
                       className="w-full flex items-center justify-center py-4 bg-brand-emerald text-white rounded-2xl font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                     >
                       Create Encrypted Group
                     </button>
                  </div>
                 </>
               ) : (
                 <>
                  <div className="p-6 border-b border-slate-100 dark:border-zinc-800 text-center relative">
                    <h3 className="font-bold text-xl dark:text-white">New Message</h3>
                    <p className="text-sm text-slate-500">Pick a friend or create a group</p>
                  </div>
                  
                  {/* Search */}
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-zinc-800">
                    <input 
                      type="text"
                      placeholder="Search contacts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-zinc-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-emerald/50 dark:text-white transition-all text-sm"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    <div className="px-4 py-2">
                       <button 
                         onClick={() => setIsCreatingGroup(true)}
                         className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-2xl transition-colors text-left group"
                       >
                          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-brand-emerald group-hover:scale-105 transition-transform">
                            <Plus className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold dark:text-white">Create Group</h4>
                            <p className="text-xs text-slate-500">Secure group chat</p>
                          </div>
                       </button>
                    </div>
                    
                    <div className="px-6 py-2 pb-0 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                      DeenFlow Contacts
                    </div>

                    <div className="px-2 pb-4">
                       {contacts.filter(c => c.displayName.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? contacts.filter(c => c.displayName.toLowerCase().includes(searchQuery.toLowerCase())).map(contact => (
                         <button 
                           key={contact.uid}
                           onClick={async () => {
                             try {
                               const chatId = await startDirectChat(contact.uid);
                               setActiveChat(chatId);
                               setShowNewChat(false);
                             } catch (err) {
                               console.error(err);
                             }
                           }}
                           className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-2xl transition-colors text-left"
                         >
                           <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-slate-500">
                             {contact.photoURL ? (
                               <img src={contact.photoURL} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <UserPlus className="w-5 h-5"/>
                             )}
                           </div>
                           <div>
                             <h4 className="font-bold dark:text-white">{contact.displayName}</h4>
                             <p className="text-xs text-brand-emerald flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Active on DeenFlow</p>
                           </div>
                         </button>
                       )) : (
                         <div className="p-8 text-center text-slate-500">
                           No matching contacts found.
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
                     <button 
                       onClick={() => {
                          const message = encodeURIComponent("Join me on DeenFlow — Islamic AI, Quran, Prayer & Community \nhttps://deenflow.app");
                          window.open(`https://wa.me/?text=${message}`, '_blank');
                       }}
                       className="w-full flex items-center justify-center gap-2 py-4 bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 rounded-2xl font-bold dark:text-white hover:border-brand-emerald transition-colors"
                     >
                       <Share className="w-5 h-5 opacity-70" />
                       Invite Friends via WhatsApp
                     </button>
                     <button 
                       onClick={() => setShowNewChat(false)}
                       className="w-full mt-2 py-4 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-2xl"
                     >
                       Cancel
                     </button>
                  </div>
                 </>
               )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
