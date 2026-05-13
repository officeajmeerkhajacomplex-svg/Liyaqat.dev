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
  { path: '/quran', icon: BookOpen, label: 'Quran' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const desktopNavItems = [
  ...navItems.slice(0, 3),
  { path: '/qibla', icon: Compass, label: 'Qibla' },
  { path: '/tasbeeh', icon: List, label: 'Tasbeeh' },
  { path: '/masjids', icon: MapPin, label: 'Masjids' },
  ...navItems.slice(3),
  { path: '/prayer-times', icon: Clock, label: 'Prayers' },
];

export default function MainLayout() {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();
  const { initialize: initPrayers, calculateNextPrayer, settings } = usePrayerStore();

  useEffect(() => {
    initPrayers();
    
    // Set up global timer for notifications/countdown logic
    const timer = setInterval(() => {
      calculateNextPrayer();
    }, 1000);
    
    // Request notification permission if enabled in settings but not granted yet
    if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    return () => clearInterval(timer);
  }, [initPrayers, calculateNextPrayer, settings.notificationsEnabled]);

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
        <div className="flex items-center justify-between mb-8">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 overflow-hidden">
              <img src="/favicon.svg" alt="DeenFlow Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-bold text-brand-emerald tracking-tight">DeenFlow</h1>
          </NavLink>
        </div>

        <nav className="flex-1 space-y-1">
          {desktopNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm",
                isActive 
                  ? "bg-brand-emerald/10 text-brand-emerald font-semibold" 
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:text-slate-400"
              )}
            >
              <item.icon className="w-4.5 h-4.5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <button 
            onClick={handleThemeToggle}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all text-sm"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </button>

          <div className="p-4 bg-emerald-50 dark:bg-brand-emerald/10 rounded-2xl border border-brand-emerald/10 dark:border-brand-emerald/20">
            <p className="text-[10px] text-brand-emerald font-black mb-0.5 uppercase tracking-widest">DeenFlow Pro</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Your spiritual companion, always guided.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 md:ml-64",
        "pb-20 md:pb-0"
      )}>
        {!location.pathname.startsWith('/chat') && (
          <header 
            style={{ paddingTop: 'var(--safe-area-top)' }}
            className="md:hidden flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-zinc-800/50 sticky top-0 z-30 shadow-sm"
          >
            <NavLink to="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 overflow-hidden">
                <img src="/favicon.svg" alt="DeenFlow Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-base dark:text-white tracking-tight">DeenFlow</span>
            </NavLink>
            <button 
              onClick={handleThemeToggle}
              className="p-1.5 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-zinc-800 rounded-xl"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </header>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "px-4 py-5 md:p-8 w-full mx-auto",
              location.pathname === '/masjids' ? "max-w-none h-full" : 
              (location.pathname.startsWith('/chat') || location.pathname.startsWith('/messages')) ? "max-w-none h-[calc(100vh-140px)] md:h-full p-0 md:p-0" : "max-w-5xl"
            )}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav 
        style={{ paddingBottom: 'calc(0.5rem + var(--safe-area-bottom))' }}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl px-4 py-2 flex items-center justify-between shadow-[0_-8px_30px_rgb(0,0,0,0.06)] z-[50] border-t border-slate-200/50 dark:border-zinc-800/50"
      >
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={cn(
                "relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-all duration-300 min-w-[64px]",
                isActive ? "text-brand-emerald" : "text-slate-400 dark:text-slate-600 hover:text-slate-500"
              )}
            >
              <motion.div
                animate={isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-all",
                  isActive ? "stroke-[2.5px]" : "stroke-[2px]"
                )} />
              </motion.div>
              <AnimatePresence>
                {isActive && (
                  <motion.span 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="text-[9px] font-black mt-1 uppercase tracking-widest"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -top-2 w-1 h-1 bg-brand-emerald rounded-full"
                />
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
