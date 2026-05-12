import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format, differenceInSeconds, parse, isAfter, addDays } from 'date-fns';

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
  const [times, setTimes] = useState<Record<string, string> | null>(null);
  const [hijriDate, setHijriDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState('Detecting location...');
  const [isAtheanOn, setIsAtheanOn] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; countdown: string } | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<string>('');

  useEffect(() => {
    const fetchTimes = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`);
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
  }, []);

  useEffect(() => {
    if (!times) return;

    const timer = setInterval(() => {
      const now = new Date();
      calculatePrayerStates(now, times);
    }, 1000);

    return () => clearInterval(timer);
  }, [times]);

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

  if (loading) return (
    <div className="h-[calc(100vh-200px)] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-brand-emerald" />
    </div>
  );

  return (
    <div className="space-y-8">
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
            onClick={() => setIsAtheanOn(!isAtheanOn)}
            className={cn(
              "p-3 rounded-2xl flex items-center gap-2 transition-all font-bold text-sm",
              isAtheanOn ? "bg-emerald-100 text-brand-emerald" : "bg-slate-100 dark:bg-zinc-800 text-slate-400"
            )}
          >
            {isAtheanOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            Athean {isAtheanOn ? 'ON' : 'OFF'}
          </button>
          <button className="p-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl dark:text-white">
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
            <p className="font-bold text-lg">{times?.Sunrise}</p>
          </div>
          <div className="p-4 glass rounded-2xl text-center">
            <p className="text-[10px] font-bold text-white/60 mb-1 tracking-widest uppercase">SUNSET</p>
            <p className="font-bold text-lg">{times?.Maghrib}</p>
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
                <p className={cn("text-3xl font-bold tabular-nums", isCurrent ? "text-white" : "text-slate-900 dark:text-white")}>{time}</p>
              </div>
              
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-current opacity-10">
                <span className="text-xs font-bold uppercase tracking-widest">Notification</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

