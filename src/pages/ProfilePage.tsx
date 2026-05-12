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
  X
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { cn } from '../lib/utils';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { playSound } from '../lib/sounds';

export default function ProfilePage() {
  const { profile, signOut, setProfile } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  
  const [stats, setStats] = useState({ chats: 0, bookmarks: 0 });
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (profile?.displayName) {
      setNewName(profile.displayName);
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
    if (!profile || !newName.trim() || newName === profile.displayName) {
      setIsEditingName(false);
      return;
    }

    setSavingName(true);
    try {
      if (auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, { displayName: newName });
      }
      await updateDoc(doc(db, 'users', profile.uid), {
        displayName: newName
      });
      setProfile({ ...profile, displayName: newName });
      setIsEditingName(false);
      playSound('success');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingName(false);
    }
  };

  const onToggleTheme = () => {
    toggleTheme();
    playSound('tap');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="text-center">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 bg-brand-emerald rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-emerald-500/10">
            {profile?.displayName?.[0] || <User className="w-10 h-10" />}
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 bg-brand-gold text-white rounded-xl border-4 border-white dark:border-brand-black shadow-lg">
            <Heart className="w-4 h-4 fill-current" />
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 p-1 pl-4 rounded-full border border-slate-200 dark:border-zinc-700">
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  className="bg-transparent border-none focus:ring-0 text-lg font-bold dark:text-white w-40"
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                />
                <div className="flex gap-1">
                  <button 
                    onClick={handleUpdateName}
                    disabled={savingName}
                    className="p-2 bg-brand-emerald text-white rounded-full hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => { setIsEditingName(false); setNewName(profile?.displayName || ''); }}
                    className="p-2 bg-white dark:bg-zinc-700 text-slate-400 rounded-full hover:scale-105 transition-transform"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold dark:text-white uppercase tracking-tight">{profile?.displayName || 'Seeker'}</h1>
                <button 
                  onClick={() => { setIsEditingName(true); playSound('click'); }}
                  className="p-1.5 text-slate-400 hover:text-brand-emerald hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-sm">
            <Mail className="w-4 h-4" />
            <span>{profile?.email}</span>
          </div>
        </div>
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

          <SettingItem icon={Bell} label="Notifications" color="blue" />
          <SettingItem icon={Shield} label="Privacy Policy" color="emerald" />
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

function SettingItem({ icon: Icon, label, color }: any) {
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
