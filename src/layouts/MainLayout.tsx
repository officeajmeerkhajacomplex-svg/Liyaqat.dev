import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  Clock, 
  Compass,
  User,
  LayoutDashboard,
  Moon,
  Sun,
  Library,
  MapPin,
  List,
  MessageCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useThemeStore } from '../store/useThemeStore';
import { usePrayerStore } from '../store/usePrayerStore';
import { playSound } from '../lib/sounds';
import { useEffect } from 'react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/messages', icon: MessageCircle, label: 'Messages' },
  { path: '/chat', icon: MessageSquare, label: 'Ask AI' },
  { path: '/qibla', icon: Compass, label: 'Qibla' },
  { path: '/tasbeeh', icon: List, label: 'Tasbeeh' },
  { path: '/masjids', icon: MapPin, label: 'Masjids' },
  { path: '/quran', icon: BookOpen, label: 'Quran' },
  { path: '/prayer-times', icon: Clock, label: 'Prayers' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function MainLayout() {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();
  const { initialize: initPrayers } = usePrayerStore();

  useEffect(() => {
    initPrayers();
  }, [initPrayers]);

  const handleNavClick = () => {
    playSound('tap');
  };

  const handleThemeToggle = () => {
    toggleTheme();
    playSound('click');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-brand-black transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 p-6 fixed inset-y-0 z-50">
        <div className="flex items-center justify-between mb-10">
          <NavLink to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 overflow-hidden">
              <img src="/favicon.svg" alt="DeenFlow Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-brand-emerald">DeenFlow</h1>
          </NavLink>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-brand-emerald/10 text-brand-emerald font-semibold" 
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:text-slate-400"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <button 
            onClick={handleThemeToggle}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mb-1 uppercase tracking-wider">DeenFlow Pro</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your spiritual companion, always guided.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 md:ml-64",
        "pb-24 md:pb-0"
      )}>
        {!location.pathname.startsWith('/chat') && (
          <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-30">
            <NavLink to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 overflow-hidden">
                <img src="/favicon.svg" alt="DeenFlow Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold dark:text-white">DeenFlow</span>
            </NavLink>
            <button 
              onClick={handleThemeToggle}
              className="p-2 text-slate-500 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </header>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "p-4 md:p-8 w-full mx-auto",
              location.pathname === '/masjids' ? "max-w-none h-full" : 
              (location.pathname.startsWith('/chat') || location.pathname.startsWith('/messages')) ? "max-w-none h-[calc(100vh-160px)] md:h-full p-0 md:p-0" : "max-w-5xl"
            )}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] px-2 py-2 flex items-center justify-start overflow-x-auto no-scrollbar shadow-2xl z-[50] border border-slate-200/50 dark:border-zinc-800/50 gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={cn(
                "relative flex-shrink-0 flex flex-col items-center p-2 rounded-full transition-all min-w-[50px]",
                isActive ? "bg-brand-emerald/10" : "hover:bg-slate-100 dark:hover:bg-zinc-800/50"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-brand-emerald" : "text-slate-400 dark:text-slate-500"
              )} />
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -bottom-1 w-1 h-1 bg-brand-emerald rounded-full"
                />
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
