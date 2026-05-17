import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronRight, 
  Bookmark, 
  MessageSquare,
  Shield,
  Bell,
  Heart,
  Loader2,
  Edit2,
  Check,
  X,
  Star,
  Compass,
  Flower,
  Zap,
  Cloud,
  Music,
  Camera,
  Quote,
  Info,
  Code,
  Instagram,
  Globe
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { cn } from '../lib/utils';
import { collection, query, getDocs, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { playSound } from '../lib/sounds';

const AVATAR_ICONS = {
  User, Star, Heart, Compass, Flower, Zap, Cloud, Music, Moon, Sun
};

const AVATAR_COLORS = [
  { name: 'Emerald', value: '#10B981' },
  { name: 'Gold', value: '#D4AF37' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Rose', value: '#F43F5E' },
];

export default function ProfilePage() {
  const { profile, signOut, setProfile } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  
  const [stats, setStats] = useState({ chats: 0, bookmarks: 0 });
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const handleExternalLink = (url: string) => {
    if (window.confirm("Do you want to open this link in your browser?")) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    if (profile?.displayName) {
      setNewName(profile.displayName);
    }
    if (profile?.bio) {
      setNewBio(profile.bio);
    }
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    
    const fetchStats = async () => {
      try {
        const chatsQ = query(collection(db, 'users', profile.uid, 'chats'));
        const bookmarksQ = query(collection(db, 'users', profile.uid, 'bookmarks'));
        
        const [chatsSnap, bookmarksSnap] = await Promise.all([
          getDocs(chatsQ),
          getDocs(bookmarksQ)
        ]);
        
        setStats({
          chats: chatsSnap.size,
          bookmarks: bookmarksSnap.size
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [profile]);

  const handleUpdateName = async () => {
    if (!profile || (!newName.trim() && !isEditingBio)) {
      setIsEditingName(false);
      setIsEditingBio(false);
      return;
    }

    setSavingName(true);
    try {
      const updates: any = {};
      if (isEditingName) {
        updates.displayName = newName;
        updates.username = newName.toLowerCase().replace(/\s+/g, '_');
      }
      if (isEditingBio) updates.bio = newBio;

      if (isEditingName && auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, { displayName: newName });
      }

      await updateDoc(doc(db, 'users', profile.uid), updates);
      
      // Also update public profile if it exists
      try {
        const publicProfileRef = doc(db, 'public_profiles', profile.uid);
        const publicProfileSnap = await getDoc(publicProfileRef);
        if (publicProfileSnap.exists()) {
          const publicUpdates: any = { updatedAt: serverTimestamp() };
          if (updates.displayName) publicUpdates.displayName = updates.displayName;
          if (updates.username) publicUpdates.username = updates.username;
          await updateDoc(publicProfileRef, publicUpdates);
        }
      } catch (e) {
        console.error("Failed to update public profile:", e);
      }

      setProfile({ ...profile, ...updates });
      setIsEditingName(false);
      setIsEditingBio(false);
      playSound('success');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingName(false);
    }
  };

  const handleUpdateAvatar = async (icon: string, color: string) => {
    if (!profile) return;
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        avatarIcon: icon,
        avatarColor: color
      });
      setProfile({ ...profile, avatarIcon: icon, avatarColor: color });
      playSound('success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleNotifications = async () => {
    if (!profile) return;
    try {
      const newState = !profile.notificationsEnabled;
      await updateDoc(doc(db, 'users', profile.uid), {
        notificationsEnabled: newState
      });
      setProfile({ ...profile, notificationsEnabled: newState });
      playSound('tap');
    } catch (err) {
      console.error(err);
    }
  };

  const onToggleTheme = () => {
    toggleTheme();
    playSound('tap');
  };

  const IconComponent = (AVATAR_ICONS as any)[profile?.avatarIcon || 'User'] || User;

  return (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 pb-32">
      {/* Profile Header */}
      <div className="relative p-6 md:p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl md:rounded-[3rem] shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 p-4 md:p-6">
           <button 
             onClick={() => setShowAvatarPicker(!showAvatarPicker)}
             className="p-2 md:p-3 bg-slate-100 dark:bg-zinc-800 text-slate-500 rounded-xl md:rounded-2xl hover:scale-105 transition-transform"
           >
             <Camera className="w-4 h-4 md:w-5 md:h-5" />
           </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative mb-4 md:mb-6">
            <div 
              style={{ backgroundColor: profile?.avatarColor || '#10B981' }}
              className="w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center text-white shadow-xl shadow-emerald-500/10"
            >
              <IconComponent size={36} className="md:w-12 md:h-12 drop-shadow-lg" />
            </div>
            <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 p-1.5 md:p-2.5 bg-brand-gold text-white rounded-lg md:rounded-2xl border-2 md:border-4 border-white dark:border-zinc-900 shadow-lg">
              <Heart className="w-3 h-3 md:w-5 md:h-5 fill-current" />
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-1 md:gap-2 w-full max-w-sm text-center">
            {isEditingName ? (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/50 p-1 pl-3 md:pl-4 rounded-xl md:rounded-2xl border border-slate-200 dark:border-zinc-700 w-full mb-2">
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  placeholder="Display Name"
                  className="bg-transparent border-none focus:ring-0 text-base md:text-xl font-bold dark:text-white w-full"
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                />
                <button 
                  onClick={handleUpdateName}
                  disabled={savingName}
                  className="p-2 bg-brand-emerald text-white rounded-lg md:rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-3">
                <h1 className="text-xl md:text-3xl lg:text-4xl font-bold dark:text-white tracking-tight">
                  {profile?.displayName || 'Seeker'}
                </h1>
                <button 
                  onClick={() => setIsEditingName(true)}
                  className="p-1.5 text-slate-400 hover:text-brand-emerald hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 text-slate-400 font-medium">
              <Mail className="w-3.5 h-3.5" />
              <span className="text-xs md:text-sm">{profile?.email}</span>
            </div>

            {isEditingBio ? (
              <div className="w-full mt-3 flex gap-2">
                <textarea
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  placeholder="Share a thought..."
                  className="w-full p-3 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl md:rounded-2xl focus:ring-1 focus:ring-brand-emerald text-xs md:text-sm dark:text-white resize-none"
                  rows={2}
                />
                <button 
                  onClick={handleUpdateName}
                  className="self-end p-2.5 bg-brand-emerald text-white rounded-lg md:rounded-xl"
                >
                  <Check className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditingBio(true)}
                className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 italic flex items-center gap-2 hover:text-brand-emerald transition-colors"
              >
                <Quote className="w-2.5 h-2.5 text-brand-emerald" />
                {profile?.bio || 'Tap to add bio...'}
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showAvatarPicker && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-8 pt-8 border-t border-slate-100 dark:border-zinc-800"
            >
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Choose Icon</label>
                  <div className="grid grid-cols-5 gap-3">
                    {Object.entries(AVATAR_ICONS).map(([name, Icon]) => (
                      <button
                        key={name}
                        onClick={() => handleUpdateAvatar(name, profile?.avatarColor || '#10B981')}
                        className={cn(
                          "p-3 rounded-2xl flex items-center justify-center transition-all",
                          profile?.avatarIcon === name 
                            ? "bg-brand-emerald text-white shadow-lg shadow-emerald-500/20 scale-110" 
                            : "bg-slate-50 dark:bg-zinc-800 text-slate-400 hover:bg-slate-100"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Choose Color</label>
                  <div className="grid grid-cols-4 gap-3">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => handleUpdateAvatar(profile?.avatarIcon || 'User', color.value)}
                        className={cn(
                          "h-10 rounded-xl transition-all border-2",
                          profile?.avatarColor === color.value 
                            ? "border-brand-emerald scale-105" 
                            : "border-transparent"
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="p-4 md:p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl md:rounded-3xl text-center">
          <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-brand-emerald mx-auto mb-2 md:mb-3" />
          <p className="text-xl md:text-2xl font-bold dark:text-white">{stats.chats}</p>
          <p className="text-[9px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5 md:mt-1 leading-none">Chat Sessions</p>
        </div>
        <div className="p-4 md:p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl md:rounded-3xl text-center">
          <Bookmark className="w-5 h-5 md:w-6 md:h-6 text-brand-gold mx-auto mb-2 md:mb-3" />
          <p className="text-xl md:text-2xl font-bold dark:text-white">{stats.bookmarks}</p>
          <p className="text-[9px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5 md:mt-1 leading-none">Saved Ayahs</p>
        </div>
      </div>

      {/* Settings List */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-3 md:p-4 bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
           <h3 className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest px-3 md:px-4">Preferences</h3>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          <button 
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-3 md:gap-4 text-slate-700 dark:text-slate-200">
              <div className="p-1.5 md:p-2 bg-slate-100 dark:bg-zinc-800 rounded-lg md:rounded-xl">
                {theme === 'dark' ? <Moon className="w-4 h-4 md:w-5 md:h-5" /> : <Sun className="w-4 h-4 md:w-5 md:h-5" />}
              </div>
              <span className="font-semibold text-sm md:text-base">Dark Mode</span>
            </div>
            <div className={cn(
              "w-10 h-5 md:w-12 md:h-6 rounded-full p-1 transition-all",
              theme === 'dark' ? "bg-brand-emerald" : "bg-slate-200"
            )}>
              <div className={cn(
                "w-3 h-3 md:w-4 md:h-4 bg-white rounded-full transition-all",
                theme === 'dark' ? "translate-x-5 md:translate-x-6" : "translate-x-0"
              )} />
            </div>
          </button>

          <button 
            onClick={handleToggleNotifications}
            className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-3 md:gap-4 text-slate-700 dark:text-slate-200">
              <div className="p-1.5 md:p-2 bg-slate-100 dark:bg-zinc-800 rounded-lg md:rounded-xl">
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <span className="font-semibold text-sm md:text-base">Notifications</span>
            </div>
            <div className={cn(
              "w-10 h-5 md:w-12 md:h-6 rounded-full p-1 transition-all",
              profile?.notificationsEnabled ? "bg-brand-emerald" : "bg-slate-200"
            )}>
              <div className={cn(
                "w-3 h-3 md:w-4 md:h-4 bg-white rounded-full transition-all",
                profile?.notificationsEnabled ? "translate-x-5 md:translate-x-6" : "translate-x-0"
              )} />
            </div>
          </button>
        </div>

        <div className="p-3 md:p-4 bg-slate-50 dark:bg-zinc-800/50 border-y border-slate-100 dark:border-zinc-800 mt-2 md:mt-4">
           <h3 className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest px-3 md:px-4">About & Support</h3>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          <SettingItem icon={Info} label="About the App" onClick={() => setShowAboutModal(true)} />
          <SettingItem icon={Code} label="Developer Support" onClick={() => setShowSupportModal(true)} />
          <SettingItem icon={Shield} label="Privacy Policy" onClick={() => setShowPrivacyModal(true)} />
        </div>
      </div>

      {/* Logout */}
      <button 
        onClick={() => signOut()}
        className="w-full py-4 md:py-5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl md:rounded-3xl font-bold flex items-center justify-center gap-2 md:gap-3 border border-red-100 dark:border-red-900/50 hover:bg-red-100 transition-all shadow-sm text-sm md:text-base"
      >
        <LogOut className="w-4 h-4 md:w-5 md:h-5" />
        Log Out
      </button>

      <div className="text-center pt-4">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">DeenFlow Version 1.0.0 (Beta)</p>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showPrivacyModal && (
          <Modal onClose={() => setShowPrivacyModal(false)} title="Privacy Policy">
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <p><strong>1. Introduction</strong><br/>Welcome to DeenFlow. Your privacy and trust are extremely important to us.</p>
              <p><strong>2. Information Collection</strong><br/>We collect basic account information (name, email) and app usage data to personalize your experience and sync your preferences securely.</p>
              <p><strong>3. Use of Google Services</strong><br/>When you authenticate using Google, we only access your email, name, and profile picture to create your DeenFlow account.</p>
              <p><strong>4. Data Security</strong><br/>Your data is securely stored using enterprise-grade completely secure databases. We never sell your personal information.</p>
              <p><strong>5. Contact Us</strong><br/>For any privacy-related queries, please explore the Developer Support section.</p>
            </div>
          </Modal>
        )}

        {showAboutModal && (
          <Modal onClose={() => setShowAboutModal(false)} title="About DeenFlow">
            <div className="space-y-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed text-center">
              <div className="flex justify-center mb-6">
                <img src="/favicon.svg" className="w-16 h-16" alt="DeenFlow" />
              </div>
              <p><strong>DeenFlow</strong> is a modern spiritual companion designed to help you connect deeper with your Deen through AI-guided reminders, Quranic insights, and beautifully crafted tools.</p>
              <p>Built with minimal aesthetics and focus in mind, DeenFlow aims to bring peace and tranquility to your daily spiritual routines.</p>
            </div>
          </Modal>
        )}

        {showSupportModal && (
          <Modal onClose={() => setShowSupportModal(false)} title="Developer Support">
             <div className="space-y-6">
               <div className="text-center">
                 <div className="w-20 h-20 bg-brand-emerald/10 text-brand-emerald rounded-full flex flex-col items-center justify-center mx-auto mb-4 border-2 border-brand-emerald/20 shadow-lg shadow-emerald-500/10">
                   <Code size={32} />
                 </div>
                 <h3 className="text-xl font-bold dark:text-white mb-1">Liyaqat</h3>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Lead Developer & Designer</p>
               </div>
               
               <div className="grid grid-cols-1 gap-3">
                 <button 
                   onClick={() => handleExternalLink('https://www.instagram.com/l.yaqat_')}
                   className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-2xl hover:border-pink-300 dark:hover:border-pink-900/50 transition-all group"
                 >
                   <div className="flex items-center gap-4">
                     <div className="p-2.5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform">
                       <Instagram size={20} />
                     </div>
                     <span className="font-bold dark:text-white text-left text-sm leading-tight">
                       Follow on Instagram<br/>
                       <span className="text-xs text-slate-500 font-medium">@l.yaqat_</span>
                     </span>
                   </div>
                   <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-pink-500 transition-colors" />
                 </button>

                 <button 
                   onClick={() => handleExternalLink('https://liyaqat-dev.github.io')}
                   className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-2xl hover:border-blue-300 dark:hover:border-blue-900/50 transition-all group"
                 >
                   <div className="flex items-center gap-4">
                     <div className="p-2.5 bg-blue-500 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform">
                       <Globe size={20} />
                     </div>
                     <span className="font-bold dark:text-white text-left text-sm leading-tight">
                       Visit Website<br/>
                       <span className="text-xs text-slate-500 font-medium">liyaqat-dev.github.io</span>
                     </span>
                   </div>
                   <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                 </button>
               </div>
             </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ onClose, title, children }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }} 
        className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800"
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
          <h3 className="font-bold text-lg dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-white dark:bg-zinc-800 rounded-full transition-colors shadow-sm">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function SettingItem({ icon: Icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
      <div className="flex items-center gap-4 text-slate-700 dark:text-slate-200">
        <div className={cn("p-2 rounded-xl bg-slate-100 dark:bg-zinc-800")}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-semibold">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300" />
    </button>
  );
}
