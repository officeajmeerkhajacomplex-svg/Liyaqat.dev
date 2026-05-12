import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  Clock, 
  Compass,
  User,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/chat', icon: MessageSquare, label: 'Ask AI' },
  { path: '/quran', icon: BookOpen, label: 'Quran' },
  { path: '/prayer-times', icon: Clock, label: 'Prayers' },
  { path: '/qibla', icon: Compass, label: 'Qibla' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-brand-black">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 p-6 fixed inset-y-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-brand-emerald rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-emerald">DeenFlow</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
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

        <div className="mt-auto p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mb-1">PRO PREVIEW</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">Enjoy full access to DeenFlow AI.</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4 md:p-8 max-w-5xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass-dark dark:glass rounded-full px-6 py-4 flex items-center justify-between shadow-2xl z-50 overflow-hidden">
         {/* Use a slight background for the active pill */}
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center"
            >
              <item.icon className={cn(
                "w-6 h-6 transition-colors",
                isActive ? "text-brand-emerald" : "text-slate-400 dark:text-slate-500"
              )} />
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -bottom-2 w-1 h-1 bg-brand-emerald rounded-full"
                />
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
