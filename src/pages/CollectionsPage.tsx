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
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white mb-1">Spiritual Library</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium font-serif">Explore Dhikr, Swalath, and Moulid collections.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-emerald transition-colors" />
        <input 
          type="text"
          placeholder="Search for a specific Dhikr or Swalath..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 dark:text-white font-medium shadow-sm transition-all"
        />
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
        <button 
          onClick={() => { setActiveCategory(null); playSound('tap'); }}
          className={cn(
            "px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all border",
            activeCategory === null 
              ? "bg-brand-emerald text-white border-brand-emerald shadow-lg shadow-emerald-500/20" 
              : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-brand-emerald/50"
          )}
        >
          All Collections
        </button>
        {COLLECTIONS_CATEGORIES.map(cat => {
          const Icon = iconMap[cat.icon];
          return (
            <button 
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); playSound('tap'); }}
              className={cn(
                "px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap flex items-center gap-2 transition-all border",
                activeCategory === cat.id 
                  ? "bg-brand-emerald text-white border-brand-emerald shadow-lg shadow-emerald-500/20" 
                  : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-brand-emerald/50"
              )}
            >
              <Icon className="w-4 h-4" />
              {cat.title}
            </button>
          );
        })}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className="block p-5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-3xl group hover:border-brand-emerald/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-brand-emerald group-hover:bg-brand-emerald group-hover:text-white transition-colors duration-300">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-zinc-900 rounded-lg border border-slate-100 dark:border-zinc-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold dark:text-white mb-1 group-hover:text-brand-emerald transition-colors">{item.title}</h3>
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>Read Collection</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
