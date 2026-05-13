import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Search, 
  BookOpen, 
  Settings, 
  Star,
  ChevronRight,
  Flame,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function QuranPage() {
  const [surahs, setSurahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then(res => res.json())
      .then(data => {
        setSurahs(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredSurahs = surahs.filter(s => 
    s.englishName.toLowerCase().includes(search.toLowerCase()) || 
    s.name.includes(search)
  );

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold dark:text-white mb-0.5 tracking-tight">Holy Quran</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Read and reflect upon the words of Allah.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search Surah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-emerald/50 transition-all font-medium dark:text-white text-sm"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-emerald" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSurahs.map((surah) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={surah.number}
              onClick={() => navigate(`/quran/${surah.number}`)}
              className="group p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:border-brand-emerald/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 rounded-lg flex items-center justify-center font-bold text-xs group-hover:bg-brand-emerald group-hover:text-white transition-colors shrink-0">
                  {surah.number}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm md:text-base dark:text-white group-hover:text-brand-emerald transition-colors truncate">{surah.englishName}</h3>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{surah.englishNameTranslation} • {surah.numberOfAyahs} Ayahs</p>
                </div>
              </div>
              
              <div className="text-right shrink-0">
                <p className="text-lg font-arabic font-bold text-brand-emerald mb-0.5">{surah.name}</p>
                <div className="flex items-center gap-1 justify-end">
                  <Star className="w-2.5 h-2.5 text-brand-gold fill-current" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Makki</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
