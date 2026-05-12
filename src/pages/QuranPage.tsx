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
    <div className="space-y-8">
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white mb-1">Holy Quran</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Read and reflect upon the words of Allah.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search Surah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-emerald/50 transition-all font-medium dark:text-white"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand-emerald" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurahs.map((surah) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={surah.number}
              onClick={() => navigate(`/quran/${surah.number}`)}
              className="group p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl cursor-pointer hover:border-brand-emerald/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 rounded-xl flex items-center justify-center font-bold text-sm group-hover:bg-brand-emerald group-hover:text-white transition-colors">
                  {surah.number}
                </div>
                <div>
                  <h3 className="font-bold dark:text-white group-hover:text-brand-emerald transition-colors">{surah.englishName}</h3>
                  <p className="text-xs text-slate-400 font-medium">{surah.englishNameTranslation} • {surah.numberOfAyahs} Ayahs</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xl font-arabic font-bold text-brand-emerald mb-1">{surah.name}</p>
                <div className="flex items-center gap-1 justify-end">
                  <Star className="w-3 h-3 text-brand-gold fill-current" />
                  <span className="text-[10px] font-bold text-slate-400">MAKKI</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
