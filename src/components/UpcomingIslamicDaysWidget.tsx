import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Moon, 
  Star, 
  Sparkles, 
  ChevronRight,
  Clock,
  MapPin,
  Heart,
  Cloud
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format, addDays, differenceInDays } from 'date-fns';

interface IslamicEvent {
  name: string;
  hijriDay: number;
  hijriMonth: number; // 1-indexed
  icon: any;
  color: string;
}

const ISLAMIC_EVENTS: IslamicEvent[] = [
  { name: 'Islamic New Year', hijriMonth: 1, hijriDay: 1, icon: Moon, color: 'emerald' },
  { name: 'Ashura', hijriMonth: 1, hijriDay: 10, icon: Star, color: 'blue' },
  { name: 'Mawlid al-Nabi', hijriMonth: 3, hijriDay: 12, icon: Heart, color: 'gold' },
  { name: 'Isra\' and Mi\'raj', hijriMonth: 7, hijriDay: 27, icon: Sparkles, color: 'indigo' },
  { name: 'Nisfu Sha\'ban', hijriMonth: 8, hijriDay: 15, icon: Moon, color: 'rose' },
  { name: 'Ramadan Begins', hijriMonth: 9, hijriDay: 1, icon: Moon, color: 'emerald' },
  { name: 'Laylatul Qadr', hijriMonth: 9, hijriDay: 27, icon: Sparkles, color: 'amber' },
  { name: 'Eid al-Fitr', hijriMonth: 10, hijriDay: 1, icon: Star, color: 'emerald' },
  { name: 'Day of Arafah', hijriMonth: 12, hijriDay: 9, icon: Cloud, color: 'blue' },
  { name: 'Eid al-Adha', hijriMonth: 12, hijriDay: 10, icon: Moon, color: 'gold' },
];

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
  'Jumada al-ula', 'Jumada al-akhira', 'Rajab', 'Sha\'ban',
  'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
];

export default function UpcomingIslamicDaysWidget() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hijriDate, setHijriDate] = useState<any>(null);
  const [location, setLocation] = useState<string>('Detecting...');

  useEffect(() => {
    const fetchIslamicData = async (lat: number, lon: number) => {
      try {
        // Fetch current Hijri date to get current year and month
        const today = new Date();
        const dateStr = format(today, 'dd-MM-yyyy');
        
        // Use Kerala/India friendly calculation methods
        // Method 2: ISNA, Method 3: MWL (usually good for India)
        const res = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lon}&method=2`);
        const data = await res.json();
        
        const currentHijri = data.data.date.hijri;
        setHijriDate(currentHijri);
        setLocation(data.data.meta.timezone);

        // Fetch Hijri calendar for current year to get G-dates for events
        const hYear = parseInt(currentHijri.year);
        
        // Calculate upcoming events
        const upcoming = ISLAMIC_EVENTS.map(event => {
          // This is an approximation since we don't have a direct "event to gregorian" API for all events
          // We calculate based on the current Hijri date
          let eventYear = hYear;
          
          // If the event month has passed this year, it's next year
          if (event.hijriMonth < parseInt(currentHijri.month.number) || 
              (event.hijriMonth === parseInt(currentHijri.month.number) && event.hijriDay < parseInt(currentHijri.day))) {
            eventYear += 1;
          }

          // Fetch Gregorian date for this specific Hijri date
          // Endpoint: /hToG/:date
          return {
            ...event,
            hYear: eventYear
          };
        });

        // Fetch Gregorian dates for the upcoming events
        const eventDates = await Promise.all(upcoming.map(async (ev) => {
          try {
            const hDate = `${ev.hijriDay}-${ev.hijriMonth}-${ev.hYear}`;
            const gRes = await fetch(`https://api.aladhan.com/v1/hToG/${hDate}`);
            const gData = await gRes.json();
            
            const gDate = new Date(
              parseInt(gData.data.gregorian.year),
              parseInt(gData.data.gregorian.month.number) - 1,
              parseInt(gData.data.gregorian.day)
            );

            const daysLeft = differenceInDays(gDate, today);
            
            return {
              ...ev,
              gDate,
              daysLeft,
              gDateStr: gData.data.gregorian.date,
              hMonthName: HIJRI_MONTHS[ev.hijriMonth - 1]
            };
          } catch (e) {
            return null;
          }
        }));

        const filtered = eventDates
          .filter(e => e !== null && e.daysLeft >= 0)
          .sort((a, b) => a!.daysLeft - b!.daysLeft)
          .slice(0, 4);

        setEvents(filtered);
      } catch (err) {
        console.error('Error fetching Islamic events:', err);
      } finally {
        setLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchIslamicData(pos.coords.latitude, pos.coords.longitude),
        () => fetchIslamicData(22.5726, 88.3639) // Fallback to India
      );
    } else {
      fetchIslamicData(22.5726, 88.3639);
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded w-1/3" />
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-zinc-800/50 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-emerald" />
          <h3 className="font-bold text-lg dark:text-white">Upcoming Days</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-zinc-800/50 px-3 py-1 rounded-full">
          <MapPin className="w-3 h-3" />
          {location.split('/')[1] || location}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <AnimatePresence mode="popLayout">
          {events.map((event, idx) => (
            <motion.div
              key={event.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] shadow-sm hover:border-brand-emerald/50 transition-all overflow-hidden"
            >
              {/* Glow Effect */}
              <div className={cn(
                "absolute -top-12 -right-12 w-24 h-24 blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
                event.color === 'emerald' ? "bg-emerald-500" : 
                event.color === 'gold' ? "bg-amber-500" :
                event.color === 'blue' ? "bg-blue-500" : "bg-indigo-500"
              )} />

              <div className="flex items-center gap-4 relative z-10">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                  event.color === 'emerald' ? "bg-brand-emerald shadow-emerald-500/20" : 
                  event.color === 'gold' ? "bg-brand-gold shadow-amber-500/20" :
                  event.color === 'blue' ? "bg-blue-500 shadow-blue-500/20" : 
                  "bg-indigo-500 shadow-indigo-500/20"
                )}>
                  <event.icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold dark:text-white truncate">{event.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    <span>{event.hijriDay} {event.hMonthName}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span>{format(event.gDate, 'dd MMM yyyy')}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight",
                    event.daysLeft === 0 ? "bg-brand-emerald text-white shadow-lg shadow-emerald-500/20" :
                    event.daysLeft === 1 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
                    "bg-slate-50 dark:bg-zinc-800 text-slate-500 border border-slate-100 dark:border-zinc-700"
                  )}>
                    {event.daysLeft === 0 ? 'Tonight' : 
                     event.daysLeft === 1 ? 'Tomorrow' : 
                     `In ${event.daysLeft} days`}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button className="w-full py-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand-emerald transition-colors">
        View Calendar
      </button>
    </div>
  );
}
