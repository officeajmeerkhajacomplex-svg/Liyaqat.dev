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
  Quote
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
    <div className="max-w-2xl mx-auto space-y-8 pb-32">
      {/* Profile Header */}
      <div className="relative p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[3rem] shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 p-6">
           <button 
             onClick={() => setShowAvatarPicker(!showAvatarPicker)}
             className="p-3 bg-slate-100 dark:bg-zinc-800 text-slate-500 rounded-2xl hover:scale-105 transition-transform"
           >
             <Camera className="w-5 h-5" />
           </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div 
              style={{ backgroundColor: profile?.avatarColor || '#10B981' }}
              className="w-28 h-28 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20"
            >
              <IconComponent size={48} className="drop-shadow-lg" />
            </div>
            <div className="absolute -bottom-2 -right-2 p-2.5 bg-brand-gold text-white rounded-2xl border-4 border-white dark:border-zinc-900 shadow-lg">
              <Heart className="w-5 h-5 fill-current" />
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2 w-full max-w-sm">
            {isEditingName ? (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/50 p-1 pl-4 rounded-2xl border border-slate-200 dark:border-zinc-700 w-full mb-2">
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  placeholder="Display Name"
                  className="bg-transparent border-none focus:ring-0 text-xl font-bold dark:text-white w-full"
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                />
                <button 
                  onClick={handleUpdateName}
                  disabled={savingName}
                  className="p-2.5 bg-brand-emerald text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {savingName ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold dark:text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                  {profile?.displayName || 'Seeker'}
                </h1>
                <button 
                  onClick={() => setIsEditingName(true)}
                  className="p-2 text-slate-400 hover:text-brand-emerald hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-slate-400 font-medium">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{profile?.email}</span>
            </div>

            {isEditingBio ? (
              <div className="w-full mt-4 flex gap-2">
                <textarea
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  placeholder="Share a thought or goal..."
                  className="w-full p-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-2xl focus:ring-1 focus:ring-brand-emerald text-sm dark:text-white resize-none"
                  rows={2}
                />
                <button 
                  onClick={handleUpdateName}
                  className="self-end p-3 bg-brand-emerald text-white rounded-xl"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditingBio(true)}
                className="mt-4 text-sm text-slate-500 dark:text-slate-400 italic flex items-center gap-2 hover:text-brand-emerald transition-colors"
              >
                <Quote className="w-3 h-3 text-brand-emerald" />
                {profile?.bio || 'No bio yet. Tap to add one...'}
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
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-center">
          <MessageSquare className="w-6 h-6 text-brand-emerald mx-auto mb-3" />
          <p className="text-2xl font-bold dark:text-white">{stats.chats}</p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Chat Sessions</p>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-center">
          <Bookmark className="w-6 h-6 text-brand-gold mx-auto mb-3" />
          <p className="text-2xl font-bold dark:text-white">{stats.bookmarks}</p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Saved Ayahs</p>
        </div>
      </div>

      {/* Settings List */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4">Preference</h3>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          <button 
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-4 text-slate-700 dark:text-slate-200">
              <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-xl">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <span className="font-semibold">Dark Mode</span>
            </div>
            <div className={cn(
              "w-12 h-6 rounded-full p-1 transition-all",
              theme === 'dark' ? "bg-brand-emerald" : "bg-slate-200"
            )}>
              <div className={cn(
                "w-4 h-4 bg-white rounded-full transition-all",
                theme === 'dark' ? "translate-x-6" : "translate-x-0"
              )} />
            </div>
          </button>

          <button 
            onClick={handleToggleNotifications}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-4 text-slate-700 dark:text-slate-200">
              <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-xl">
                <Bell className="w-5 h-5" />
              </div>
              <span className="font-semibold">Notifications</span>
            </div>
            <div className={cn(
              "w-12 h-6 rounded-full p-1 transition-all",
              profile?.notificationsEnabled ? "bg-brand-emerald" : "bg-slate-200"
            )}>
              <div className={cn(
                "w-4 h-4 bg-white rounded-full transition-all",
                profile?.notificationsEnabled ? "translate-x-6" : "translate-x-0"
              )} />
            </div>
          </button>

          <SettingItem icon={Shield} label="Privacy Policy" />
        </div>
      </div>

      {/* Logout */}
      <button 
        onClick={() => signOut()}
        className="w-full py-5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-3xl font-bold flex items-center justify-center gap-3 border border-red-100 dark:border-red-900/50 hover:bg-red-100 transition-all shadow-sm"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </button>

      <div className="text-center pt-4">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">DeenFlow Version 1.0.0 (Beta)</p>
      </div>
    </div>
  );
}

function SettingItem({ icon: Icon, label }: any) {
  return (
    <button className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
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
