import { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { Compass, MapPin, Navigation, Info, AlertTriangle, CheckCircle2, Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface QiblaCompassProps {
  qiblaAngle: number;
  userHeading: number | null;
  locationName: string;
}

export default function QiblaCompass({ qiblaAngle, userHeading, locationName }: QiblaCompassProps) {
  const controls = useAnimation();
  const isAligned = userHeading !== null && Math.abs(userHeading - qiblaAngle) < 5;

  useEffect(() => {
    if (isAligned && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, [isAligned]);

  return (
    <div className="relative flex flex-col items-center justify-center p-8">
      {/* Location Badge */}
      <div className="absolute top-0 flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-full shadow-sm mb-8 z-10 transition-all">
        <MapPin className="w-4 h-4 text-brand-emerald" />
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">{locationName}</span>
      </div>

      {/* Compass Outer Ring */}
      <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
        {/* Animated Glow when Aligned */}
        {isAligned && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.3 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute inset-0 bg-brand-emerald rounded-full blur-3xl"
          />
        )}

        {/* Compass Dial */}
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-zinc-800 flex items-center justify-center"
          animate={{ rotate: userHeading !== null ? -userHeading : 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 60 }}
        >
          {/* Degree Markers */}
          {[...Array(72)].map((_, i) => {
            const deg = i * 5;
            return (
              <div 
                key={deg}
                className="absolute h-full flex flex-col items-center pt-1"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div className={cn(
                  "rounded-full transition-all duration-300",
                  deg % 90 === 0 ? "w-0.5 h-4 bg-brand-gold" : 
                  deg % 30 === 0 ? "w-0.5 h-3 bg-slate-400 dark:bg-zinc-500" : 
                  "w-px h-1.5 bg-slate-300 dark:bg-zinc-800"
                )} />
                {deg % 90 === 0 && (
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 mt-1 select-none">
                    {deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : 'W'}
                  </span>
                )}
              </div>
            );
          })}

          {/* Islamic Pattern Background */}
          <div className="absolute inset-8 rounded-full border border-slate-100 dark:border-zinc-800/50 flex items-center justify-center opacity-40">
             <div className="w-full h-full border-4 border-dashed border-slate-100 dark:border-zinc-800/20 rounded-full animate-spin-slow" />
          </div>

          {/* Qibla Marker (Kaaba) */}
          <div 
            className="absolute inset-0 flex flex-col items-center pt-8"
            style={{ transform: `rotate(${qiblaAngle}deg)` }}
          >
            <div className="relative group cursor-pointer">
              <motion.div 
                animate={{ scale: isAligned ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -inset-4 bg-brand-emerald/30 rounded-full blur-2xl group-hover:bg-brand-emerald/50 transition-colors" 
              />
              <div className="relative w-14 h-14 bg-zinc-900 dark:bg-black rounded-2xl border-2 border-brand-gold flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)] transform transition-all duration-500 group-hover:scale-110">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-zinc-700/50 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-1/4 w-full h-1 bg-brand-gold/40" />
                  <Star className="w-4 h-4 text-brand-gold fill-current drop-shadow-sm" />
                </div>
              </div>
              <div className="absolute top-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className={cn(
                  "text-[11px] font-black uppercase tracking-[0.25em] transition-colors duration-500",
                  isAligned ? "text-brand-emerald drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "text-slate-400"
                )}>Al-Kaaba</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Central Hub */}
        <div className="relative w-20 h-20 bg-white dark:bg-zinc-900 rounded-full shadow-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center z-10">
          <div className="absolute inset-1 rounded-full border border-slate-50 dark:border-zinc-800/50" />
          <Navigation className={cn(
            "w-10 h-10 transition-all duration-700",
            isAligned ? "text-brand-emerald scale-110" : "text-slate-200 dark:text-zinc-800"
          )} />
          <AnimatePresence>
            {isAligned && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-brand-emerald/20 rounded-full"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Arrow (Static Center) */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center pt-2 select-none z-20">
          <div className="w-2 h-40 bg-gradient-to-b from-brand-emerald to-transparent rounded-full opacity-50" />
        </div>
      </div>

      {/* Alignment Indicator */}
      <motion.div 
        animate={{ 
          scale: isAligned ? 1.05 : 1,
          opacity: isAligned ? 1 : 0.5
        }}
        className={cn(
          "mt-12 px-8 py-4 rounded-3xl border flex items-center gap-4 transition-all duration-500",
          isAligned 
            ? "bg-brand-emerald text-white border-brand-emerald shadow-lg shadow-emerald-500/20" 
            : "bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-800"
        )}
      >
        {isAligned ? (
          <>
            <CheckCircle2 className="w-6 h-6 animate-pulse" />
            <span className="font-bold tracking-tight">You are facing the Qibla</span>
          </>
        ) : (
          <>
            <Compass className="w-6 h-6 text-brand-gold" />
            <span className="font-bold tracking-tight">Align your device to find Qibla</span>
          </>
        )}
      </motion.div>
    </div>
  );
}
