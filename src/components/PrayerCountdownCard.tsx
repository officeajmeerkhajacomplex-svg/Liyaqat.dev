import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  MapPin, 
  Bell, 
  BellOff, 
  Settings, 
  ChevronRight,
  Sun,
  Moon,
  CloudSun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { usePrayerStore } from '../store/usePrayerStore';
import { cn } from '../lib/utils';
import { format, parse } from 'date-fns';
import { playSound } from '../lib/sounds';

const prayerIcons: Record<string, any> = {
  Fajr: Moon,
  Sunrise: Sun,
  Dhuhr: Sun,
  Asr: CloudSun,
  Maghrib: Sun,
  Isha: Moon
};

export const PrayerCountdownCard: React.FC<{ onSettingsClick?: () => void }> = ({ onSettingsClick }) => {
  const { 
    settings, 
    nextPrayer, 
    currentPrayer, 
    times, 
    location, 
    hijriDate, 
    updateSettings,
    calculateNextPrayer 
  } = usePrayerStore();

  useEffect(() => {
    const timer = setInterval(() => {
      calculateNextPrayer();
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateNextPrayer]);

  if (!nextPrayer || !times) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-900 dark:from-emerald-900 dark:to-zinc-950 rounded-[2.5rem] shadow-2xl shadow-emerald-500/10" />
      
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 blur-[80px] rounded-full -ml-32 -mb-32" />

      <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
            <Clock className="w-4 h-4 text-emerald-300" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">
              NEXT: {nextPrayer.name} AT {format(parse(nextPrayer.time, 'HH:mm', new Date()), 'h:mm a')}
            </span>
          </div>
          
          <div className="space-y-1">
            <h2 className="text-6xl md:text-8xl font-bold text-white tracking-tighter tabular-nums drop-shadow-sm">
              {nextPrayer.countdown}
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-4 text-emerald-100/60 font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-sm truncate max-w-[150px]">{location?.name || 'Local'}</span>
              </div>
              <span className="w-1 h-1 bg-current rounded-full" />
              <span className="text-sm">{hijriDate}</span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto grid grid-cols-2 md:flex md:flex-col gap-3">
          <button 
            onClick={() => {
              updateSettings({ soundEnabled: !settings.soundEnabled });
              playSound('tap');
            }}
            className={cn(
              "flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all border",
              settings.soundEnabled 
                ? "bg-white text-emerald-900 border-white shadow-lg" 
                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
            )}
          >
            {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span>Adhan {settings.soundEnabled ? 'On' : 'Off'}</span>
          </button>
          
          <button 
            onClick={onSettingsClick}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold border border-white/10 transition-all backdrop-blur-md"
          >
            <Settings className="w-5 h-5" />
            <span>Customize</span>
          </button>
        </div>
      </div>

      {/* Mini prayer list footer */}
      <div className="relative z-10 px-8 md:px-12 pb-8 flex flex-wrap justify-center md:justify-start gap-6 md:gap-10 border-t border-white/10 pt-8 mt-2">
        {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((name) => {
          const Icon = prayerIcons[name];
          const isCurrent = currentPrayer === name;
          return (
            <div key={name} className={cn(
              "flex flex-col items-center gap-2 transition-opacity",
              isCurrent ? "opacity-100" : "opacity-40"
            )}>
              <Icon className="w-5 h-5 text-white" />
              <div className="text-center">
                <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-tighter">{name}</p>
                <p className="text-xs font-bold text-white">{times[name as keyof typeof times]}</p>
              </div>
              {isCurrent && <motion.div layoutId="activeDot" className="w-1 h-1 bg-white rounded-full mt-1" />}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
