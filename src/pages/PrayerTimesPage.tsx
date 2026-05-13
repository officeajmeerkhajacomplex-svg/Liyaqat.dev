import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  MapPin, 
  ChevronRight,
  Loader2,
  X,
  Volume2,
  VolumeX,
  Settings as SettingsIcon,
  Moon,
  Sun,
  CloudSun
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format, parse } from 'date-fns';
import { usePrayerStore } from '../store/usePrayerStore';
import { AdhanNotificationSettings } from '../components/AdhanNotificationSettings';
import { playSound } from '../lib/sounds';

const prayerMeta = {
  Fajr: { icon: Moon, color: 'indigo' },
  Sunrise: { icon: Sun, color: 'amber' },
  Dhuhr: { icon: Sun, color: 'yellow' },
  Asr: { icon: CloudSun, color: 'orange' },
  Maghrib: { icon: Sun, color: 'rose' },
  Isha: { icon: Moon, color: 'violet' }
};

type PrayerName = keyof typeof prayerMeta;

export default function PrayerTimesPage() {
  const { 
    times, 
    loading, 
    location, 
    hijriDate, 
    nextPrayer, 
    currentPrayer,
    settings,
    updateSettings,
    calculateNextPrayer 
  } = usePrayerStore();

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      calculateNextPrayer();
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateNextPrayer]);

  if (loading && !times) return (
    <div className="h-[calc(100vh-200px)] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-brand-emerald" />
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white mb-1">Prayer Times & Adhan</h1>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-emerald" />
              <span className="truncate max-w-[200px] md:max-w-none">{location?.name || 'Detecting...'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-gold" />
              <span>{hijriDate}</span>
            </div>
          </div>
        </div>
      
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { updateSettings({ soundEnabled: !settings.soundEnabled }); playSound('click'); }}
            className={cn(
              "p-3 rounded-2xl flex items-center gap-2 transition-all font-bold text-sm",
              settings.soundEnabled ? "bg-emerald-100 text-brand-emerald" : "bg-slate-100 dark:bg-zinc-800 text-slate-400"
            )}
          >
            {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            Adhan {settings.soundEnabled ? 'ON' : 'OFF'}
          </button>
          <button 
            onClick={() => { setShowSettings(true); playSound('click'); }}
            className="p-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl dark:text-white hover:bg-slate-50 dark:hover:bg-zinc-750 transition-colors"
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 md:p-12 bg-zinc-900 text-white rounded-[3rem] relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5"
      >
        <div className="relative z-10 text-center md:text-left">
          <p className="text-emerald-400 font-bold tracking-widest uppercase mb-2">Next Prayer: {nextPrayer?.name}</p>
          <h2 className="text-6xl md:text-8xl font-bold mb-4 tracking-tighter tabular-nums drop-shadow-lg text-emerald-50">{nextPrayer?.countdown}</h2>
          <p className="text-slate-400 font-medium italic">"Indeed, prayer prohibits immorality and wrongdoing."</p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4 w-full md:w-auto">
          <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] text-center">
            <p className="text-[10px] font-bold text-white/40 mb-1 tracking-widest uppercase">SUNRISE</p>
            <p className="font-bold text-xl">{times?.Sunrise ? format(parse(times.Sunrise, 'HH:mm', new Date()), 'h:mm a') : '--:--'}</p>
          </div>
          <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] text-center">
            <p className="text-[10px] font-bold text-white/40 mb-1 tracking-widest uppercase">SUNSET</p>
            <p className="font-bold text-xl">{times?.Sunset ? format(parse(times.Sunset, 'HH:mm', new Date()), 'h:mm a') : '--:--'}</p>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-emerald opacity-20 blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -ml-32 -mb-32" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Object.entries(prayerMeta) as [PrayerName, any][]).map(([name, meta]) => {
          const time = times?.[name as keyof typeof times];
          const isCurrent = currentPrayer === name;
          return (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              key={name}
              className={cn(
                "p-8 rounded-[2.5rem] border transition-all duration-500 group relative overflow-hidden",
                isCurrent 
                  ? "bg-brand-emerald text-white border-brand-emerald shadow-2xl shadow-emerald-500/20" 
                  : "bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 dark:text-white hover:shadow-xl hover:border-brand-emerald/30"
              )}
            >
              {isCurrent && (
                <div className="absolute top-0 right-0 p-4">
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase">Current</div>
                </div>
              )}

              <div className="flex flex-col h-full space-y-8">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                  isCurrent ? "bg-white/20" : "bg-slate-50 dark:bg-zinc-800"
                )}>
                  <meta.icon className={cn(
                    "w-7 h-7",
                    isCurrent ? "text-white" : `text-slate-400 dark:text-slate-500`
                  )} />
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-bold text-xl opacity-60 uppercase tracking-widest text-[10px]">{name}</h3>
                  <p className={cn("text-4xl font-bold tabular-nums tracking-tighter", isCurrent ? "text-white" : "text-slate-900 dark:text-white")}>
                    {time ? format(parse(time as string, 'HH:mm', new Date()), 'h:mm a') : '--:--'}
                  </p>
                </div>
                
                <div className="mt-auto flex items-center justify-between pt-6 border-t border-current opacity-10">
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Alerts Enabled</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold dark:text-white">Prayer Settings</h2>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">Fine-tune your spiritual companion</p>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-slate-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto no-scrollbar">
                <AdhanNotificationSettings />
              </div>

              <div className="p-8 bg-slate-50 dark:bg-zinc-800/30 border-t border-slate-100 dark:border-zinc-800">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full py-5 bg-brand-emerald text-white rounded-[2rem] font-bold shadow-xl shadow-emerald-500/10 hover:translate-y-[-2px] transition-all"
                >
                  Save & Apply Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
