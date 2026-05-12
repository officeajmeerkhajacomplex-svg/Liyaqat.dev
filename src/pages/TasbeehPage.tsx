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
  History as HistoryIcon
} from 'lucide-react';
import { db, auth } from '@/src/firebase/config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp,
  serverTimestamp
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

  const handleReset = () => {
    if (count > 0) {
      saveToHistory(count);
    }
    setCount(0);
  };

  return (
    <div className="min-h-screen bg-[#0a0502] text-white pt-20 px-6 pb-24 relative overflow-hidden">
      {/* Bio-Lumining Background Glare */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] left-[10%] w-[60%] h-[60%] bg-brand-emerald/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-md mx-auto relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold font-serif"
          >
            Digital Tasbeeh
          </motion.h1>
          <p className="text-slate-400">Pure focus on your Dhikr</p>
        </div>

        {/* Goal Selector */}
        <div className="flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Dhikr</span>
            <select 
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="SubhanAllah">SubhanAllah</option>
              <option value="Alhamdulillah">Alhamdulillah</option>
              <option value="Allahu Akbar">Allahu Akbar</option>
              <option value="La ilaha illallah">La ilaha illallah</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setGoal(prev => Math.max(1, prev - 1))}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Minus size={18} />
            </button>
            <div className="text-center min-w-[3rem]">
              <span className="text-xs font-bold text-slate-500 uppercase block">Goal</span>
              <span className="font-mono font-bold text-brand-emerald">{goal}</span>
            </div>
            <button 
              onClick={() => setGoal(prev => prev + 1)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Counter Display */}
        <div className="relative aspect-square flex items-center justify-center">
          {/* Progress Ring */}
          <svg className="absolute w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="4"
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
            className="w-4/5 h-4/5 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.1)] flex flex-col items-center justify-center space-y-2 relative"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={count}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="text-8xl font-mono font-bold"
              >
                {count}
              </motion.span>
            </AnimatePresence>
            <span className="text-slate-500 uppercase tracking-[0.3em] text-xs font-bold">Tap to Count</span>
          </motion.button>

          {/* Floating Actions */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6">
            <button 
              onClick={handleReset}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors"
              title="Reset"
            >
              <RotateCcw size={20} className="text-slate-400" />
            </button>
            <button 
              onClick={() => setVibrateEnabled(!vibrateEnabled)}
              className={`p-3 rounded-full border border-white/10 transition-colors ${vibrateEnabled ? 'bg-brand-emerald/20 text-brand-emerald' : 'bg-white/5 text-slate-400'}`}
              title="Toggle Vibration"
            >
              <Vibrate size={20} />
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors"
              title="History"
            >
              <HistoryIcon size={20} className="text-slate-400" />
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
              className="overflow-hidden space-y-4"
            >
              <h3 className="text-lg font-bold flex items-center gap-2">
                <History className="text-brand-emerald" size={20} />
                Recent Sessions
              </h3>
              <div className="space-y-3">
                {history.length > 0 ? history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-emerald/20 rounded-lg flex items-center justify-center text-brand-emerald font-bold">
                        {item.count}
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {item.timestamp?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                )) : (
                  <p className="text-center text-slate-500 py-4 italic">No sessions recorded yet.</p>
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
            className="p-6 bg-brand-emerald text-white rounded-[2rem] shadow-xl shadow-brand-emerald/20 text-center flex flex-col items-center gap-3"
          >
            <Trophy size={32} />
            <div>
              <h3 className="font-bold text-lg">Mubarak!</h3>
              <p className="text-emerald-100 text-sm">You've completed your goal of {goal} {label}</p>
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
