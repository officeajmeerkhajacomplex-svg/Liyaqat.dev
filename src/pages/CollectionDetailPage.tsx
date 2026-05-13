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
    <div className="max-w-3xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-4 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-200/20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { navigate('/collections'); playSound('tap'); }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-slate-500"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-bold dark:text-white leading-none mb-1">{item.title}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setShowSettings(!showSettings); playSound('click'); }}
            className={cn(
              "p-2 rounded-xl transition-colors",
              showSettings ? "bg-brand-emerald text-white" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
            )}
          >
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <motion.div
        animate={{ height: showSettings ? 'auto' : 0, opacity: showSettings ? 1 : 0 }}
        className="overflow-hidden bg-slate-50 dark:bg-zinc-800/50 rounded-3xl border border-slate-200 dark:border-zinc-800"
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-bold dark:text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-brand-emerald" /> Text Size
            </span>
            <div className="flex items-center gap-4">
              <button onClick={() => setFontSize(Math.max(16, fontSize - 4))} className="p-2 px-4 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 font-bold">-</button>
              <span className="font-mono font-bold dark:text-white">{fontSize}px</span>
              <button onClick={() => setFontSize(Math.min(48, fontSize + 4))} className="p-2 px-4 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 font-bold">+</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold dark:text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-brand-emerald" /> Audio Recitation
            </span>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Coming Soon</span>
          </div>
        </div>
      </motion.div>

      {/* Hero Icon */}
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-24 h-24 bg-brand-emerald/10 text-brand-emerald rounded-[2.5rem] flex items-center justify-center mb-6 animate-pulse">
           <BookOpen className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold dark:text-white font-serif mb-2">{item.title}</h2>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-slate-100 dark:bg-zinc-800/50 text-slate-500 rounded-full text-xs font-bold uppercase tracking-widest">{item.category}</span>
          <div className="flex items-center gap-1 text-slate-400">
            <Heart className="w-4 h-4 fill-brand-emerald text-brand-emerald opacity-20" />
            <span className="text-xs font-medium">Favorite of many</span>
          </div>
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
