import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  Settings, 
  History, 
  CheckCircle2, 
  Trophy,
  Plus,
  Minus,
  Vibrate,
  History as HistoryIcon,
  Trash2
} from 'lucide-react';
import { db, auth } from '@/src/firebase/config';
import { cn } from '@/src/lib/utils';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp,
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';

interface HistoryItem {
  id: string;
  count: number;
  label: string;
  timestamp: any;
}

export default function TasbeehPage() {
  const [count, setCount] = useState(0);
  const [goal, setGoal] = useState(33);
  const [label, setLabel] = useState('SubhanAllah');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);

  // Load history
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, `users/${auth.currentUser.uid}/tasbeeh_history`),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HistoryItem[];
      setHistory(items);
    });

    return () => unsubscribe();
  }, []);

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);

    if (vibrateEnabled && "vibrate" in navigator) {
      // Subtle pulse for each click
      navigator.vibrate(25);
    }

    if (newCount === goal) {
      if (vibrateEnabled && "vibrate" in navigator) {
        // Longer vibration for goal completion
        navigator.vibrate([100, 50, 100]);
      }
      saveToHistory(newCount);
      // Reset after a brief delay or let user reset?
      // Actually, let's keep going but show a success state.
    }
  };

  const saveToHistory = async (finalCount: number) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, `users/${auth.currentUser.uid}/tasbeeh_history`), {
        userId: auth.currentUser.uid,
        count: finalCount,
        label: label,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error saving history:", error);
    }
  };

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, `users/${auth.currentUser.uid}/tasbeeh_history`, id));
    } catch (error) {
      console.error("Error deleting history:", error);
    }
  };

  const handleReset = () => {
    if (count > 0) {
      saveToHistory(count);
    }
    setCount(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0502] text-slate-900 dark:text-white pt-16 md:pt-20 px-4 md:px-6 pb-24 relative overflow-hidden">
      {/* Bio-Lumining Background Glare */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] md:top-[20%] left-[10%] w-[80%] md:[60%] h-[60%] bg-brand-emerald/10 blur-[80px] md:blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-md mx-auto relative z-10 space-y-8 md:space-y-12">
        {/* Header */}
        <div className="text-center space-y-1 md:space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-4xl font-bold font-serif"
          >
            Digital Tasbeeh
          </motion.h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">Pure focus on your Dhikr</p>
        </div>

        {/* Goal Selector */}
        <div className="flex items-center justify-between bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm mx-1 md:mx-0">
          <div className="space-y-0.5 md:space-y-1 max-w-[120px] md:max-w-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Dhikr</span>
            <select 
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold text-sm md:text-base focus:outline-none cursor-pointer w-full"
            >
              <option value="SubhanAllah">SubhanAllah</option>
              <option value="Alhamdulillah">Alhamdulillah</option>
              <option value="Allahu Akbar">Allahu Akbar</option>
              <option value="La ilaha illallah">La ilaha illallah</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setGoal(prev => Math.max(1, prev - 1))}
              className="p-1 text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <Minus size={16} />
            </button>
            <div className="text-center min-w-[2.5rem] md:min-w-[3rem]">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Goal</span>
              <span className="font-mono font-bold text-brand-emerald text-sm md:text-base">{goal}</span>
            </div>
            <button 
              onClick={() => setGoal(prev => prev + 1)}
              className="p-1 text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Counter Display */}
        <div className="relative aspect-square flex items-center justify-center max-w-[280px] md:max-w-none mx-auto">
          {/* Progress Ring */}
          <svg className="absolute w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="transparent"
              strokeWidth="4"
              className="stroke-slate-200 dark:stroke-[rgba(255,255,255,0.05)]"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray="100 100"
              initial={{ strokeDashoffset: 100 }}
              animate={{ strokeDashoffset: 100 - (Math.min(count, goal) / goal) * 100 }}
              className="text-brand-emerald"
            />
          </svg>

          {/* Main Counter Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleIncrement}
            className="w-4/5 h-4/5 rounded-full bg-gradient-to-br from-white to-slate-50 dark:from-white/10 dark:to-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-[0_0_50px_rgba(16,185,129,0.1)] flex flex-col items-center justify-center space-y-1 md:space-y-2 relative"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={count}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="text-6xl md:text-8xl font-mono font-bold"
              >
                {count}
              </motion.span>
            </AnimatePresence>
            <span className="text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs font-bold font-sans">Tap to Count</span>
          </motion.button>

          {/* Floating Actions */}
          <div className="absolute -bottom-4 md:-bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 md:gap-6">
            <button 
              onClick={handleReset}
              className="p-2.5 md:p-3 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full border border-slate-200 dark:border-white/10 transition-colors shadow-sm"
              title="Reset"
            >
              <RotateCcw size={18} md:size={20} className="text-slate-500 dark:text-slate-400" />
            </button>
            <button 
              onClick={() => setVibrateEnabled(!vibrateEnabled)}
              className={cn(
                "p-2.5 md:p-3 rounded-full border transition-colors shadow-sm",
                vibrateEnabled 
                  ? "bg-brand-emerald/20 text-brand-emerald border-brand-emerald/20" 
                  : "bg-white dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10"
              )}
              title="Toggle Vibration"
            >
              <Vibrate size={18} md:size={20} />
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-2.5 md:p-3 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full border border-slate-200 dark:border-white/10 transition-colors shadow-sm"
              title="History"
            >
              <HistoryIcon size={18} md:size={20} className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Recent History */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-4 px-1"
            >
              <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                <History className="text-brand-emerald" size={18} md:size={20} />
                Recent Sessions
              </h3>
              <div className="space-y-2 md:space-y-3">
                {history.length > 0 ? history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 md:p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 md:w-8 md:h-8 bg-brand-emerald/10 dark:bg-brand-emerald/20 rounded-lg flex items-center justify-center text-brand-emerald font-bold text-xs md:text-sm">
                        {item.count}
                      </div>
                      <span className="font-bold text-sm md:text-base text-slate-900 dark:text-white">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] md:text-xs text-slate-400 font-medium">
                        {item.timestamp?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <button 
                        onClick={(e) => handleDeleteHistory(item.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                        title="Delete session"
                      >
                        <Trash2 size={14} md:size={16} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-slate-500 py-4 italic text-sm">No sessions recorded yet.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goal Badge */}
        {count >= goal && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 bg-brand-emerald text-white rounded-2xl md:rounded-[2rem] shadow-xl shadow-brand-emerald/20 text-center flex flex-col items-center gap-3 mx-1 md:mx-0"
          >
            <Trophy size={28} md:size={32} />
            <div>
              <h3 className="font-bold text-base md:text-lg">Mubarak!</h3>
              <p className="text-emerald-100 text-xs md:text-sm opacity-90 leading-tight">You've completed your goal of {goal} {label}</p>
            </div>
            <button 
              onClick={handleReset}
              className="bg-white text-brand-emerald px-6 py-2 rounded-full font-bold text-sm hover:bg-emerald-50 transition-colors"
            >
              Start New Session
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
