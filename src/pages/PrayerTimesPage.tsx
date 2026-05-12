import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  MapPin, 
  Volume2, 
  VolumeX, 
  Settings,
  Sun,
  Moon,
  CloudSun,
  ChevronRight,
  Loader2,
  X,
  Check,
  Bell,
  BellOff
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format, differenceInSeconds, parse, isAfter, addDays } from 'date-fns';
import { playSound } from '../lib/sounds';
import { HADITHS } from '../constants/hadiths';

const prayerMeta = {
  Fajr: { icon: Moon, color: 'indigo' },
  Sunrise: { icon: Sun, color: 'amber' },
  Dhuhr: { icon: Sun, color: 'yellow' },
  Asr: { icon: CloudSun, color: 'orange' },
  Maghrib: { icon: Sun, color: 'rose' },
  Isha: { icon: Moon, color: 'violet' }
};

const calcMethods = [
  { id: 2, name: 'ISNA (North America)' },
  { id: 3, name: 'Muslim World League' },
  { id: 1, name: 'Karachi (PT)' },
  { id: 4, name: 'Umm al-Qura' },
  { id: 5, name: 'Egyptian' },
  { id: 13, name: 'Turkey (Diyanet)' },
  { id: 14, name: 'Russia' },
  { id: 11, name: 'Singapore' },
];

type PrayerName = keyof typeof prayerMeta;

export default function PrayerTimesPage() {
  const [times, setTimes] = useState<Record<string, string> | null>(null);
  const [hijriDate, setHijriDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState('Detecting location...');
  const [isAtheanOn, setIsAtheanOn] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; countdown: string } | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<string>('');
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [calcMethod, setCalcMethod] = useState(Number(localStorage.getItem('calcMethod')) || 2);
  const [asrMethod, setAsrMethod] = useState(Number(localStorage.getItem('asrMethod')) || 0); // 0: Standard, 1: Hanafi
  const [notificationsEnabled, setNotificationsEnabled] = useState(localStorage.getItem('notificationsEnabled') === 'true');

  const fetchTimes = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=${calcMethod}&school=${asrMethod}`);
      const data = await res.json();
      setTimes(data.data.timings);
      const hijri = data.data.date.hijri;
      setHijriDate(`${hijri.day} ${hijri.month.en} ${hijri.year}`);
      setLocationName(data.data.meta.timezone);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchTimes(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Location error:", error);
          fetchTimes(22.5726, 88.3639);
          setLocationName("Kolkata (Fallback)");
        }
      );
    } else {
      fetchTimes(22.5726, 88.3639);
    }
  }, [calcMethod, asrMethod]); // Re-fetch when settings change

  const lastAdhanRef = useRef<string | null>(null);
  const lastHadithRef = useRef<string | null>(null);

  useEffect(() => {
    if (!times) return;

    const timer = setInterval(() => {
      const now = new Date();
      calculatePrayerStates(now, times);

      // --- Daily Hadith Notification ---
      if (notificationsEnabled) {
        if (now.getHours() === 9 && now.getMinutes() === 0) {
          const todayStr = format(now, 'yyyy-MM-dd');
          if (lastHadithRef.current !== todayStr) {
            lastHadithRef.current = todayStr;
            const randomHadith = HADITHS[Math.floor(Math.random() * HADITHS.length)];
            if ('Notification' in window && Notification.permission === 'granted') {
               new Notification("Daily Hadith via DeenFlow", {
                body: `"${randomHadith.text}" — ${randomHadith.source}`,
                icon: "/favicon.svg"
               });
            }
          }
        }
      }

      // --- Adhan & Prayer Notification ---
      const currentHM = format(now, 'HH:mm');
      const prayerOrder: string[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']; 
      for (const prayer of prayerOrder) {
        if (times[prayer] && times[prayer].substring(0, 5) === currentHM) {
          const trackKey = `${format(now, 'yyyy-MM-dd')}-${prayer}`;
          if (lastAdhanRef.current !== trackKey) {
            lastAdhanRef.current = trackKey;
            
            if (isAtheanOn) {
              playSound('adhan');
            }
            
            if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
               new Notification("Time for Prayer", {
                 body: `It's time for ${prayer} prayer.`,
                 icon: "/favicon.svg"
               });
            }
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [times, isAtheanOn, notificationsEnabled]);

  const calculatePrayerStates = (now: Date, timings: Record<string, string>) => {
    const prayerOrder: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    let current = 'Isha'; 
    let next: { name: string; date: Date } | null = null;

    const prayerDates = prayerOrder.map(name => ({
      name,
      date: parse(timings[name], 'HH:mm', now)
    }));

    for (let i = 0; i < prayerDates.length; i++) {
      if (isAfter(now, prayerDates[i].date)) {
        current = prayerDates[i].name;
      } else {
        next = prayerDates[i];
        break;
      }
    }

    if (!next) {
      next = {
        name: 'Fajr',
        date: addDays(prayerDates[0].date, 1)
      };
    }

    const diff = differenceInSeconds(next.date, now);
    const h = Math.floor(diff / 3600).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');

    setCurrentPrayer(current);
    setNextPrayer({
      name: next.name,
      time: timings[next.name] || format(next.date, 'HH:mm'),
      countdown: `${h}:${m}:${s}`
    });
  };

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      if (!('Notification' in window)) {
        console.warn("This browser does not support desktop notification");
        setNotificationsEnabled(true);
        localStorage.setItem('notificationsEnabled', 'true');
        playSound('success');
        return;
      }
      
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const randomHadith = HADITHS[Math.floor(Math.random() * HADITHS.length)];
          new Notification("DeenFlow: Notifications Enabled", {
            body: `"${randomHadith.text}" — ${randomHadith.source}`,
            icon: "/favicon.svg"
          });
          setNotificationsEnabled(true);
          localStorage.setItem('notificationsEnabled', 'true');
          playSound('success');
        } else {
          console.warn("Notification permission was denied.");
          // Still mock enable for visual/in-app logic if needed, but standard is to fail
          // the UI in a friendly way without alerting
        }
      } catch (error) {
        console.warn("Notification restricted by iframe or browser:", error);
        // Fallback to true so the user can test the UI state without actual native push
        setNotificationsEnabled(true);
        localStorage.setItem('notificationsEnabled', 'true');
        playSound('success');
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('notificationsEnabled', 'false');
      playSound('click');
    }
  };

  const saveSettings = (method: number, school: number) => {
    setCalcMethod(method);
    setAsrMethod(school);
    localStorage.setItem('calcMethod', method.toString());
    localStorage.setItem('asrMethod', school.toString());
    setShowSettings(false);
    playSound('success');
    setLoading(true); // Trigger re-fetch
  };

  if (loading && !times) return (
    <div className="h-[calc(100vh-200px)] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-brand-emerald" />
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold dark:text-white mb-1">Prayer Times</h1>
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-emerald" />
                <span className="truncate max-w-[200px] md:max-w-none">{locationName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-gold" />
                <span>{hijriDate}</span>
              </div>
            </div>
          </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setIsAtheanOn(!isAtheanOn); playSound('click'); }}
            className={cn(
              "p-3 rounded-2xl flex items-center gap-2 transition-all font-bold text-sm",
              isAtheanOn ? "bg-emerald-100 text-brand-emerald" : "bg-slate-100 dark:bg-zinc-800 text-slate-400"
            )}
          >
            {isAtheanOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            Athean {isAtheanOn ? 'ON' : 'OFF'}
          </button>
          <button 
            onClick={() => { setShowSettings(true); playSound('click'); }}
            className="p-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl dark:text-white hover:bg-slate-50 dark:hover:bg-zinc-750 transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-zinc-900 text-white rounded-[3rem] relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="relative z-10 text-center md:text-left">
          <p className="text-emerald-400 font-bold tracking-widest uppercase mb-2">Next Prayer: {nextPrayer?.name}</p>
          <h2 className="text-6xl md:text-7xl font-bold mb-4 tracking-tighter tabular-nums">{nextPrayer?.countdown}</h2>
          <p className="text-slate-400 font-medium italic">"Prayer is better than sleep."</p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4 w-full md:w-auto">
          <div className="p-4 glass rounded-2xl text-center">
            <p className="text-[10px] font-bold text-white/60 mb-1 tracking-widest uppercase">SUNRISE</p>
            <p className="font-bold text-lg">{times?.Sunrise ? format(parse(times.Sunrise, 'HH:mm', new Date()), 'h:mm a') : '--:--'}</p>
          </div>
          <div className="p-4 glass rounded-2xl text-center">
            <p className="text-[10px] font-bold text-white/60 mb-1 tracking-widest uppercase">SUNSET</p>
            <p className="font-bold text-lg">{times?.Maghrib ? format(parse(times.Maghrib, 'HH:mm', new Date()), 'h:mm a') : '--:--'}</p>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-emerald opacity-20 blur-[100px] -mr-32 -mt-32" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Object.entries(prayerMeta) as [PrayerName, any][]).map(([name, meta]) => {
          const time = times?.[name];
          const isCurrent = currentPrayer === name;
          return (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              key={name}
              className={cn(
                "p-6 rounded-[2rem] border transition-all duration-300",
                isCurrent 
                  ? "bg-brand-emerald text-white border-brand-emerald shadow-xl shadow-emerald-500/20" 
                  : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 dark:text-white"
              )}
            >
              <div className="flex items-center justify-between mb-8">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  isCurrent ? "bg-white/20" : "bg-slate-50 dark:bg-zinc-800"
                )}>
                  <meta.icon className={cn(
                    "w-6 h-6",
                    isCurrent ? "text-white" : `text-slate-400 dark:text-slate-500`
                  )} />
                </div>
                {isCurrent && <div className="px-2 py-1 bg-white/20 rounded-full text-[10px] font-bold tracking-widest uppercase">Ongoing</div>}
              </div>
              
              <div className="space-y-1">
                <h3 className="font-bold text-xl">{name}</h3>
                <p className={cn("text-3xl font-bold tabular-nums", isCurrent ? "text-white" : "text-slate-900 dark:text-white")}>
                  {time ? format(parse(time, 'HH:mm', new Date()), 'h:mm a') : '--:--'}
                </p>
              </div>
              
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-current opacity-10">
                <span className="text-xs font-bold uppercase tracking-widest">Notification</span>
                <ChevronRight className="w-4 h-4" />
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
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">Prayer Settings</h2>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">Customize your spiritual reminders</p>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-slate-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {/* Notifications */}
                <div id="prayer-notifications-setting" className="space-y-4">
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Global</h3>
                   <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-zinc-800/50 rounded-3xl border border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                      <div id="prayer-notifications-icon-container" className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                        notificationsEnabled ? "bg-emerald-100 text-brand-emerald" : "bg-slate-100 text-slate-400 dark:bg-zinc-800"
                      )}>
                        {notificationsEnabled ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-bold dark:text-white">Daily Notifications</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-500">Hadiths & Prayer alerts</p>
                      </div>
                    </div>
                    <button 
                      id="prayer-notifications-toggle-btn"
                      onClick={handleToggleNotifications}
                      className={cn(
                        "w-14 h-8 rounded-full relative transition-all duration-300",
                        notificationsEnabled ? "bg-brand-emerald" : "bg-slate-300 dark:bg-zinc-700"
                      )}
                    >
                      <motion.div 
                        id="prayer-notifications-toggle-knob"
                        animate={{ x: notificationsEnabled ? 28 : 4 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                      />
                    </button>
                   </div>
                </div>

                {/* Calculation Method */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Calculation Method</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {calcMethods.map(method => (
                      <button 
                        key={method.id}
                        onClick={() => saveSettings(method.id, asrMethod)}
                        className={cn(
                          "w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all border",
                          calcMethod === method.id 
                            ? "bg-emerald-50 border-emerald-200 text-brand-emerald dark:bg-emerald-950/20 dark:border-emerald-800"
                            : "bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
                        )}
                      >
                        <span className="font-medium">{method.name}</span>
                        {calcMethod === method.id && <Check className="w-5 h-5 text-brand-emerald" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Madhab */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Madhab (Asr)</h3>
                  <div className="flex gap-2">
                    {[
                      { id: 0, name: 'Standard (Shafi, Maliki, Hanbali)' },
                      { id: 1, name: 'Hanafi' }
                    ].map(school => (
                      <button 
                        key={school.id}
                        onClick={() => saveSettings(calcMethod, school.id)}
                        className={cn(
                          "flex-1 px-4 py-4 rounded-2xl text-sm font-bold transition-all border",
                          asrMethod === school.id
                            ? "bg-emerald-50 border-emerald-200 text-brand-emerald dark:bg-emerald-950/20 dark:border-emerald-800"
                            : "bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
                        )}
                      >
                        {school.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-100 dark:border-zinc-800">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full py-4 bg-brand-emerald text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/10 hover:scale-[1.02] transition-transform"
                >
                  Close Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

