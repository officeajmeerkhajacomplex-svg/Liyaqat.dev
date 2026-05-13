import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  BookOpen, 
  Clock, 
  Shield, 
  ArrowRight,
  Heart
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { playSound } from '../lib/sounds';

export default function LandingPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-white dark:bg-brand-black overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-32 px-4 md:px-6">
        <div className="absolute inset-0 -z-10 overflow-hidden">
           <img 
             src="https://picsum.photos/seed/spiritual/1920/1080?blur=4" 
             className="w-full h-full object-cover opacity-20 dark:opacity-10" 
             alt="Spiritual Background"
             referrerPolicy="no-referrer"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white dark:from-brand-black dark:via-brand-black/80 dark:to-brand-black" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-brand-emerald text-[10px] md:text-sm font-bold mb-6 md:mb-8 border border-emerald-100 dark:border-emerald-900/50 uppercase tracking-wider"
          >
            <Heart className="w-3 md:w-4 h-3 md:h-4 fill-current" />
            <span>Islamic AI Spiritual Companion</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-bold tracking-tight mb-6 md:mb-8 px-2"
          >
            Nurture Your Soul with <span className="text-brand-emerald">DeenFlow</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-xl text-slate-600 dark:text-slate-400 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4"
          >
            Your premium Islamic AI companion for spiritual growth, Quranic learning, and daily reminders. Experience a deeper connection to your Deen.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4"
          >
            <Link
              to={user ? "/dashboard" : "/auth"}
              onClick={() => playSound('tap')}
              className="w-full sm:w-auto px-8 py-3.5 md:py-4 bg-brand-emerald text-white rounded-xl md:rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 text-sm md:text-base"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/auth"
              onClick={() => playSound('tap')}
              className="w-full sm:w-auto px-8 py-3.5 md:py-4 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white rounded-xl md:rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors text-sm md:text-base"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-slate-50 dark:bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">Elevate Your Practice</h2>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Thoughtfully designed features for the modern Muslim</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard 
              icon={MessageSquare} 
              title="AI Spiritual Chat" 
              desc="Ask questions about Islam, get Tafsir explanations, and find Duas for any situation." 
              color="emerald"
            />
            <FeatureCard 
              icon={BookOpen} 
              title="Quran Reader" 
              desc="Read the Holy Quran with high-quality translations and bookmark your favorite ayahs." 
              color="amber"
            />
            <FeatureCard 
              icon={Clock} 
              title="Prayer Times" 
              desc="Stay punctual with accurate prayer times based on your location worldwide." 
              color="emerald"
            />
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 md:py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <BookOpen className="w-10 md:w-12 h-10 md:h-12 text-brand-emerald/30 mx-auto mb-6 md:mb-8" />
          <p className="text-xl md:text-3xl font-serif italic text-slate-700 dark:text-slate-300 mb-6 px-4">
            "Verily, in the remembrance of Allah do hearts find rest."
          </p>
          <p className="text-brand-emerald font-bold uppercase tracking-widest text-[10px] md:text-xs">Surah Ar-Ra'd 13:28</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 px-6 border-t border-slate-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="w-7 md:w-8 h-7 md:h-8 overflow-hidden">
              <img src="/favicon.svg" alt="DeenFlow Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg md:text-xl">DeenFlow</span>
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
            © 2026 DeenFlow. All rights reserved. Spiritual journey, one ayah at a time.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="p-6 md:p-8 bg-white dark:bg-zinc-800 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-zinc-700 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className={cn(
        "w-10 md:w-12 h-10 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6",
        color === 'emerald' ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600" : "bg-amber-100 dark:bg-amber-950/50 text-amber-600"
      )}>
        <Icon className="w-5 md:w-6 h-5 md:h-6" />
      </div>
      <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{title}</h3>
      <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

import { cn } from '../lib/utils';
