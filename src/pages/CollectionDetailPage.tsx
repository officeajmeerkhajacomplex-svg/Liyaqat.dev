import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  BookOpen, 
  Heart, 
  Share2, 
  Bookmark,
  Volume2,
  Settings,
  Type,
  Sparkles
} from 'lucide-react';
import { COLLECTIONS } from '../constants/collections';
import { playSound } from '../lib/sounds';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function CollectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fontSize, setFontSize] = useState(24);
  const [showSettings, setShowSettings] = useState(false);

  const item = Object.values(COLLECTIONS).flat().find(c => c.id === id);

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold dark:text-white mb-2">Collection Not Found</h1>
        <button 
          onClick={() => navigate('/collections')}
          className="text-brand-emerald font-bold flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Library
        </button>
      </div>
    );
  }

  // Placeholder content if not fully populated
  const content = item.content || `
    <div class="space-y-12">
      <div class="text-center space-y-4">
        <p class="text-2xl font-arabic leading-[3] dark:text-white" style="font-size: ${fontSize}px">
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </p>
        <p class="text-slate-500 italic">In the name of Allah, the Most Gracious, the Most Merciful.</p>
      </div>

      <div class="space-y-8">
        <div class="p-8 bg-slate-50 dark:bg-zinc-800/50 rounded-[2rem] border border-slate-100 dark:border-zinc-800">
           <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white" style="font-size: ${fontSize}px">
             الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ (١) الرَّحْمَنِ الرَّحِيمِ (٢) مَالِكِ يَوْمِ الدِّينِ (٣) إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ (٤) اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ (٥) صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ (٦)
           </p>
           <div class="border-t border-slate-200 dark:border-zinc-700 pt-6">
             <p class="text-brand-emerald font-medium mb-2">Al-Fatihah</p>
             <p class="text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
               [All] praise is [due] to Allah, Lord of the worlds - The Entirely Merciful, the Especially Merciful, Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path - The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.
             </p>
           </div>
        </div>
      </div>
    </div>
  `;

  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-3 md:top-4 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-2.5 md:p-4 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-200/10 mx-1 md:mx-0">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <button 
            onClick={() => { navigate('/collections'); playSound('tap'); }}
            className="p-1.5 md:p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg md:rounded-xl transition-colors text-slate-500 flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div className="truncate">
            <h1 className="font-bold dark:text-white leading-none mb-1 text-sm md:text-base truncate">{item.title}</h1>
            <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70 truncate">{item.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <button 
            onClick={() => { setShowSettings(!showSettings); playSound('click'); }}
            className={cn(
              "p-1.5 md:p-2 rounded-lg md:rounded-xl transition-colors",
              showSettings ? "bg-brand-emerald text-white" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
            )}
          >
            <Settings className="w-4.5 h-4.5 md:w-5 md:h-5" />
          </button>
          <button className="hidden sm:block p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <motion.div
        animate={{ height: showSettings ? 'auto' : 0, opacity: showSettings ? 1 : 0 }}
        className="overflow-hidden bg-slate-50 dark:bg-zinc-800/50 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-zinc-800 mx-1 md:mx-0"
      >
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm md:text-base dark:text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-brand-emerald" /> Font Size
            </span>
            <div className="flex items-center gap-3 md:gap-4">
              <button onClick={() => setFontSize(Math.max(16, fontSize - 2))} className="w-8 h-8 md:w-10 md:h-10 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 font-bold text-sm">-</button>
              <span className="font-mono font-bold dark:text-white text-sm md:text-base">{fontSize}px</span>
              <button onClick={() => setFontSize(Math.min(48, fontSize + 2))} className="w-8 h-8 md:w-10 md:h-10 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 font-bold text-sm">+</button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hero Icon */}
      <div className="flex flex-col items-center justify-center p-6 md:p-12 text-center">
        <div className="w-16 h-16 md:w-24 md:h-24 bg-brand-emerald/10 text-brand-emerald rounded-2xl md:rounded-[2.5rem] flex items-center justify-center mb-4 md:mb-6">
           <BookOpen className="w-8 h-8 md:w-12 md:h-12" />
        </div>
        <h2 className="text-xl md:text-3xl font-bold dark:text-white font-serif mb-1 md:mb-2">{item.title}</h2>
        <div className="flex items-center gap-2 md:gap-3">
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800/50 text-slate-500 rounded-full text-[9px] md:text-xs font-bold uppercase tracking-widest">{item.category}</span>
        </div>
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 collection-content"
        style={{ 
          ['--content-font-size' as any]: `${fontSize}px`,
          ['--content-arabic-font-size' as any]: `${fontSize * 1.5}px` 
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
