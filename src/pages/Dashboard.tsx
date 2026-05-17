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
  Calendar,
  MapPin,
  Users
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { usePrayerStore } from '../store/usePrayerStore';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import UpcomingIslamicDaysWidget from '../components/UpcomingIslamicDaysWidget';
import { PrayerCountdownCard } from '../components/PrayerCountdownCard';

const AVATAR_ICONS = {
  User, Star, Heart, Compass, Flower, Zap, Cloud, Music, Moon, Sun
};

export default function Dashboard() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [verse, setVerse] = useState<any>(null);
  const [loadingVerse, setLoadingVerse] = useState(true);
  const { hijriDate } = usePrayerStore();

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

    fetchVerse();
  }, []);


  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header / Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-4">
           <Link to="/profile" className="relative group shrink-0">
              <div 
                style={{ backgroundColor: profile?.avatarColor || '#10B981' }}
                className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform"
              >
                <IconComponent size={24} className="md:w-7 md:h-7" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-brand-gold text-white rounded-lg border-2 border-slate-50 dark:border-brand-black flex items-center justify-center shadow-md">
                <Heart size={8} className="md:w-2.5 md:h-2.5 fill-current" />
              </div>
           </Link>
            <div className="min-w-0">
              <h1 className="text-xl md:text-3xl font-bold dark:text-white leading-tight truncate">
                As-salamu alaykum, <span className="text-brand-emerald">{profile?.displayName || 'Seeker'}</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm mt-0.5">May your day be filled with barakah.</p>
            </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{hijriDate || 'Loading...'}</span>
          </div>
          <Link to="/profile" className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-sm md:hidden">
            <User className="w-4 h-4 text-slate-500" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Verse of the Day Card - Small & Top */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-5 bg-brand-emerald text-white rounded-xl md:rounded-2xl relative overflow-hidden shadow-lg shadow-emerald-500/10"
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 md:-mr-24 md:-mt-24" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 md:mb-4 bg-white/20 w-max px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold tracking-wider uppercase">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Verse of the Day</span>
              </div>

              {loadingVerse ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-white/20 rounded w-3/4" />
                  <div className="h-3 bg-white/20 rounded w-1/2" />
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  <p className="text-lg md:text-2xl font-arabic text-right leading-relaxed">
                    {verse?.arabic}
                  </p>
                  <p className="text-xs md:text-sm text-emerald-50 font-serif italic leading-relaxed">
                    "{verse?.translation}"
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-[10px] md:text-xs font-semibold">{verse?.surah} {verse?.number}</span>
                    <button className="p-1 md:p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                      <Bookmark className="w-3.5 md:w-4 h-3.5 md:h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Featured Sections Grid - Now below Verse */}
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            <ActionCard 
              to="/chat"
              icon={MessageSquare}
              title="Deen AI"
              desc="Ask DeenFlow"
              color="gold"
            />
            <ActionCard 
              to="/quran"
              icon={BookOpen}
              title="Quran"
              desc="Read & Listen"
              color="emerald"
            />
            <ActionCard 
              to="/masjids"
              icon={MapPin}
              title="Masjids"
              desc="Nearby Masjids"
              color="gold"
            />
            <ActionCard 
              to="/qibla"
              icon={Compass}
              title="Qibla"
              desc="Facing Kaaba"
              color="emerald"
            />
            <ActionCard 
              to="/tasbeeh"
              icon={Zap}
              title="Tasbeeh"
              desc="Digital Dhikr"
              color="gold"
            />
            <ActionCard 
              to="/messages"
              icon={Users}
              title="Social"
              desc="Spiritual Circle"
              color="emerald"
            />
          </div>

          {/* Prayer Card - Moved below grid */}
          <PrayerCountdownCard onSettingsClick={() => navigate('/prayer-times')} />
        </div>
        <div className="space-y-8">
          {/* Upcoming Islamic Days Widget */}
          <UpcomingIslamicDaysWidget />
          
          {/* Daily Reminder */}
          <div className="p-5 md:p-6 bg-slate-900 text-white rounded-2xl md:rounded-[2rem] relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold mb-1.5 md:mb-2 text-sm md:text-base">Remind yourself</h4>
              <p className="text-xs md:text-sm text-slate-400 mb-3 md:mb-4 leading-relaxed font-serif italic">"The best of people are those that bring most benefit to others."</p>
              <button className="text-[10px] md:text-xs font-bold text-brand-emerald flex items-center gap-1 hover:underline uppercase tracking-wider">
                View all reminders <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="absolute bottom-0 right-0 p-2 opacity-10">
              <Sparkles className="w-10 md:w-12 h-10 md:h-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ to, icon: Icon, title, desc, color, className }: any) {
  return (
    <Link to={to} className={className}>
      <motion.div 
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
        className="p-4 md:p-6 bg-white dark:bg-zinc-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-zinc-700 shadow-sm group hover:border-brand-emerald/50 transition-all flex flex-col items-center md:items-start text-center md:text-left h-full"
      >
        <div className={cn(
          "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 transition-transform group-hover:scale-110 shrink-0",
          color === 'emerald' ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600" : "bg-amber-100 dark:bg-amber-950/50 text-amber-600"
        )}>
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div>
          <h3 className="font-bold text-base md:text-xl mb-0.5 md:mb-1 dark:text-white leading-tight">{title}</h3>
          <p className="text-[10px] md:text-sm text-slate-500 dark:text-slate-400 font-medium">{desc}</p>
        </div>
      </motion.div>
    </Link>
  );
}
