import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Play, 
  Bookmark, 
  Share2,
  Settings,
  Star,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/useAuthStore';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function SurahPage() {
  const { surahId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [surahData, setSurahData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [fontSize, setFontSize] = useState(24);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLoading(true);
    fetch(`https://api.alquran.cloud/v1/surah/${surahId}/editions/quran-uthmani,en.sahih`)
      .then(res => res.json())
      .then(data => {
        setSurahData({
          info: data.data[0],
          arabic: data.data[0].ayahs,
          translation: data.data[1].ayahs
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Fetch existing bookmarks
    if (user) {
      const q = query(
        collection(db, 'users', user.uid, 'bookmarks'),
        where('surahNumber', '==', Number(surahId))
      );
      getDocs(q).then(snapshot => {
        const set = new Set<number>();
        snapshot.docs.forEach(doc => set.add(doc.data().ayahNumber));
        setBookmarks(set);
      });
    }
  }, [surahId, user]);

  const toggleBookmark = async (ayah: any, index: number) => {
    if (!user) return;
    const ayahNumber = ayah.numberInSurah;

    if (bookmarks.has(ayahNumber)) {
      // Logic for deleting would require the doc ID, simplified for now
      setBookmarks(prev => {
        const next = new Set(prev);
        next.delete(ayahNumber);
        return next;
      });
    } else {
      try {
        await addDoc(collection(db, 'users', user.uid, 'bookmarks'), {
          userId: user.uid,
          surahNumber: Number(surahId),
          ayahNumber: ayahNumber,
          surahName: surahData.info.englishName,
          text: ayah.text,
          translation: surahData.translation[index].text,
          createdAt: serverTimestamp(),
        });
        setBookmarks(prev => new Set(prev).add(ayahNumber));
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-brand-emerald" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header Sticky */}
      <div className="sticky top-0 z-40 bg-zinc-50/80 dark:bg-brand-black/80 backdrop-blur-md py-4 mb-8">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/quran')}
            className="p-2 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-xl transition-all"
          >
            <ArrowLeft className="w-6 h-6 dark:text-white" />
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold dark:text-white">{surahData.info.englishName}</h1>
            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">
              {surahData.info.revelationType} • {surahData.info.numberOfAyahs} AYAS
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowTranslation(!showTranslation)}
              className={cn(
                "p-2 rounded-xl transition-all",
                showTranslation ? "bg-brand-emerald/10 text-brand-emerald" : "text-slate-400"
              )}
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Surah Header Banner */}
      <div className="p-10 bg-brand-emerald text-white rounded-[3rem] text-center mb-12 relative overflow-hidden shadow-2xl shadow-emerald-500/10">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <BookOpen className="w-full h-full scale-[3]" />
        </div>
        <div className="relative z-10">
          <p className="text-5xl font-arabic mb-6">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
          <p className="text-sm font-serif italic text-emerald-100 italic">In the name of Allah, the Entirely Merciful, the Especially Merciful.</p>
        </div>
      </div>

      {/* Ayahs */}
      <div className="space-y-12">
        {surahData.arabic.map((ayah: any, index: number) => (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            key={ayah.number}
            className="group relative"
          >
            {/* Ayah Meta */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-brand-emerald text-white font-bold rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                {ayah.numberInSurah}
              </div>
              <div className="h-[1px] flex-1 bg-slate-100 dark:bg-zinc-800" />
              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => toggleBookmark(ayah, index)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    bookmarks.has(ayah.numberInSurah) ? "text-brand-gold" : "text-slate-400 hover:text-brand-emerald"
                  )}
                >
                  <Bookmark className={cn("w-5 h-5", bookmarks.has(ayah.numberInSurah) && "fill-current")} />
                </button>
                <button className="p-2 text-slate-400 hover:text-brand-emerald transition-colors">
                  <Play className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-brand-emerald transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Ayah Text */}
            <div className="space-y-6">
              <p 
                className="text-right font-arabic leading-[2.5] dark:text-white"
                style={{ fontSize: `${fontSize}px` }}
              >
                {ayah.text}
              </p>
              {showTranslation && (
                <p className="text-lg text-slate-600 dark:text-slate-400 font-serif leading-relaxed">
                  {surahData.translation[index].text}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Nav Simulation for Surah Navigation */}
      <div className="mt-20 flex items-center justify-between gap-4">
        {Number(surahId) > 1 && (
          <button 
            onClick={() => navigate(`/quran/${Number(surahId) - 1}`)}
            className="flex-1 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 font-bold flex items-center justify-center gap-2 hover:border-brand-emerald/50 dark:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" /> Previous Surah
          </button>
        )}
        {Number(surahId) < 114 && (
          <button 
            onClick={() => navigate(`/quran/${Number(surahId) + 1}`)}
            className="flex-1 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 font-bold flex items-center justify-center gap-2 hover:border-brand-emerald/50 dark:text-white transition-all"
          >
            Next Surah <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
