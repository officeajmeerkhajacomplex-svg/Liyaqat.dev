import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  BookOpen, 
  Clock, 
  Sparkles,
  ChevronRight,
  Heart,
  Bookmark,
  Library,
  User,
  Star,
  Compass,
  Flower,
  Zap,
  Cloud,
  Music,
  Moon,
  Sun,
  Calendar
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { format, differenceInSeconds, parse, isAfter, addDays } from 'date-fns';
import UpcomingIslamicDaysWidget from '../components/UpcomingIslamicDaysWidget';

const AVATAR_ICONS = {
  User, Star, Heart, Compass, Flower, Zap, Cloud, Music, Moon, Sun
};

export default function Dashboard() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [verse, setVerse] = useState<any>(null);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [hijriDate, setHijriDate] = useState<string>('');
  const [loadingVerse, setLoadingVerse] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<any>(null);
  const [currentPrayer, setCurrentPrayer] = useState<string>('');

  const IconComponent = (AVATAR_ICONS as any)[profile?.avatarIcon || 'User'] || User;

  useEffect(() => {
    // Fetch Random Verse
    const fetchVerse = async () => {
      try {
        const randomAyah = Math.floor(Math.random() * 6236) + 1;
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${randomAyah}/editions/quran-uthmani,en.sahih`);
        const data = await res.json();
        setVerse({
          arabic: data.data[0].text,
          translation: data.data[1].text,
          surah: data.data[0].surah.englishName,
          number: data.data[0].numberInSurah
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingVerse(false);
      }
    };

    const fetchPrayerTimes = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`);
        const data = await res.json();
        setPrayerTimes(data.data.timings);
        const hijri = data.data.date.hijri;
        setHijriDate(`${hijri.day} ${hijri.month.en} ${hijri.year}`);
      } catch (err) {
        console.error(err);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude),
        () => fetchPrayerTimes(22.5726, 88.3639)
      );
    } else {
      fetchPrayerTimes(22.5726, 88.3639);
    }

    fetchVerse();
  }, []);

  useEffect(() => {
    if (!prayerTimes) return;

    const timer = setInterval(() => {
      const now = new Date();
      const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      
      let current = 'Isha';
      let next: any = null;

      const prayerDates = prayerOrder.map(name => ({
        name,
        date: parse(prayerTimes[name], 'HH:mm', now)
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
        next = { name: 'Fajr', date: addDays(prayerDates[0].date, 1) };
      }

      const diff = differenceInSeconds(next.date, now);
      const h = Math.floor(diff / 3600).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');

      setCurrentPrayer(current);
      setNextPrayer({
        name: next.name,
        countdown: `${h}:${m}:${s}`
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [prayerTimes]);


  return (
    <div className="space-y-8">
      {/* Header / Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-5">
           <Link to="/profile" className="relative group">
              <div 
                style={{ backgroundColor: profile?.avatarColor || '#10B981' }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform"
              >
                <IconComponent size={28} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-gold text-white rounded-lg border-2 border-slate-50 dark:border-brand-black flex items-center justify-center shadow-md">
                <Heart size={10} className="fill-current" />
              </div>
           </Link>
           <div>
              <h1 className="text-3xl font-bold dark:text-white leading-tight">
                As-salamu alaykum, <span className="text-brand-emerald">{profile?.displayName?.split(' ')[0] || 'Seeker'}</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">May your day be filled with barakah.</p>
           </div>
        </div>
        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 shadow-sm">
            <Clock className="w-4 h-4 text-brand-gold" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{hijriDate || 'Loading...'}</span>
          </div>
          <Link to="/profile" className="p-2.5 bg-white dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 shadow-sm md:hidden">
            <User className="w-5 h-5 text-slate-500" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Verse of the Day Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-brand-emerald text-white rounded-[2rem] relative overflow-hidden shadow-2xl shadow-emerald-500/20"
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8 bg-white/20 w-max px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3 h-3" />
                <span>Verse of the Day</span>
              </div>

              {loadingVerse ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-white/20 rounded w-3/4" />
                  <div className="h-4 bg-white/20 rounded w-1/2" />
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-3xl md:text-4xl font-arabic text-right leading-relaxed mb-6">
                    {verse?.arabic}
                  </p>
                  <p className="text-lg md:text-xl text-emerald-50 font-serif italic italic leading-relaxed">
                    "{verse?.translation}"
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <span className="font-semibold">{verse?.surah} {verse?.number}</span>
                    <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Featured Sections Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ActionCard 
              to="/collections"
              icon={Library}
              title="Spiritual Library"
              desc="Dhikr, Swalath & Moulid collections."
              color="emerald"
            />
            <ActionCard 
              to="/chat"
              icon={MessageSquare}
              title="DeenFlow AI"
              desc="Ask questions about Islam and get citations."
              color="gold"
            />
            <ActionCard 
              to="/quran"
              icon={BookOpen}
              title="Quran Reader"
              desc="Read, listen and understand the Quran."
              color="emerald"
            />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Prayer Times Widget */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 bg-white dark:bg-zinc-800 rounded-[2rem] border border-slate-200 dark:border-zinc-700 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg dark:text-white">Prayer Times</h3>
              <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-brand-emerald text-xs font-bold rounded-full">
                Nearby
              </div>
            </div>

            <div className="space-y-3">
              {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((name) => {
                const time = prayerTimes?.[name];
                const isCurrent = currentPrayer === name;
                return (
                  <div 
                    key={name} 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl transition-colors",
                      isCurrent ? "bg-brand-emerald text-white" : "bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    <span className={cn("font-semibold", isCurrent ? "text-white" : "text-slate-900 dark:text-white")}>{name}</span>
                    <span className="font-bold tabular-nums">
                      {time ? format(parse(time, 'HH:mm', new Date()), 'h:mm a') : '--:--'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-4 bg-brand-gold/10 dark:bg-brand-gold/5 rounded-2xl border border-brand-gold/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-brand-gold uppercase tracking-wider mb-1">Next: {nextPrayer?.name || '...'}</p>
                <p className="text-xl font-bold dark:text-white tabular-nums">{nextPrayer?.countdown || '--:--:--'}</p>
              </div>
              <Heart className="w-8 h-8 text-brand-gold fill-current opacity-20" />
            </div>
          </motion.div>
          
          {/* Upcoming Islamic Days Widget */}
          <UpcomingIslamicDaysWidget />
          
          {/* Daily Reminder */}
          <div className="p-6 bg-slate-900 text-white rounded-[2rem] relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold mb-2">Remind yourself</h4>
              <p className="text-sm text-slate-400 mb-4">"The best of people are those that bring most benefit to others."</p>
              <button className="text-xs font-bold text-brand-emerald flex items-center gap-1 hover:underline">
                View all reminders <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="absolute bottom-0 right-0 p-2 opacity-10">
              <Sparkles className="w-12 h-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ to, icon: Icon, title, desc, color }: any) {
  return (
    <Link to={to}>
      <motion.div 
        whileHover={{ y: -5 }}
        className="p-6 bg-white dark:bg-zinc-800 rounded-3xl border border-slate-200 dark:border-zinc-700 shadow-sm group hover:border-brand-emerald/50 transition-all"
      >
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
          color === 'emerald' ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600" : "bg-amber-100 dark:bg-amber-950/50 text-amber-600"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-xl mb-1 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
      </motion.div>
    </Link>
  );
}
