import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Heart, 
  Moon, 
  Sun, 
  ChevronRight, 
  Search,
  BookOpen,
  Library
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { COLLECTIONS_CATEGORIES, COLLECTIONS } from '../constants/collections';
import { playSound } from '../lib/sounds';

const iconMap: Record<string, any> = {
  Sparkles,
  Heart,
  Moon,
  Sun
};

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCollections = activeCategory 
    ? COLLECTIONS[activeCategory].filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : Object.values(COLLECTIONS).flat().filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="space-y-4 md:space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold dark:text-white mb-0.5 md:mb-1">Spiritual Library</h1>
          <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 font-medium font-serif opacity-80">Explore Dhikr, Swalath, and Moulid collections.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 group-focus-within:text-brand-emerald transition-colors" />
        <input 
          type="text"
          placeholder="Search collections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 dark:text-white font-medium shadow-sm transition-all text-sm md:text-base"
        />
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        <button 
          onClick={() => { setActiveCategory(null); playSound('tap'); }}
          className={cn(
            "px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all border",
            activeCategory === null 
              ? "bg-brand-emerald text-white border-brand-emerald shadow-lg shadow-emerald-500/10" 
              : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-brand-emerald/50"
          )}
        >
          All
        </button>
        {COLLECTIONS_CATEGORIES.map(cat => {
          const Icon = iconMap[cat.icon];
          return (
            <button 
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); playSound('tap'); }}
              className={cn(
                "px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm whitespace-nowrap flex items-center gap-2 transition-all border",
                activeCategory === cat.id 
                  ? "bg-brand-emerald text-white border-brand-emerald shadow-lg shadow-emerald-500/10" 
                  : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-brand-emerald/50"
              )}
            >
              <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {cat.title}
            </button>
          );
        })}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <AnimatePresence mode="popLayout">
          {filteredCollections.map((item, idx) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
            >
              <Link 
                to={`/collections/${item.id}`}
                onClick={() => playSound('click')}
                className="block p-4 md:p-5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl md:rounded-3xl group hover:border-brand-emerald/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all"
              >
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 dark:bg-zinc-900 rounded-xl md:rounded-2xl flex items-center justify-center text-brand-emerald group-hover:bg-brand-emerald group-hover:text-white transition-colors duration-300">
                    <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 md:py-1 bg-slate-50 dark:bg-zinc-900 rounded-md md:rounded-lg border border-slate-100 dark:border-zinc-700">
                      <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-base md:text-lg font-bold dark:text-white mb-0.5 md:mb-1 group-hover:text-brand-emerald transition-colors">{item.title}</h3>
                <div className="flex items-center gap-1 text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium opacity-70">
                  <span>View Details</span>
                  <ChevronRight className="w-2.5 h-2.5 md:w-3 md:h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredCollections.length === 0 && (
        <div className="text-center py-20">
          <Library className="w-16 h-16 text-slate-200 dark:text-zinc-800 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-wider">No results found</h3>
          <p className="text-slate-400 dark:text-zinc-600">Try searching for something else or browse categories.</p>
        </div>
      )}
    </div>
  );
}
