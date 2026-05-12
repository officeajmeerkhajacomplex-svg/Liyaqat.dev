export interface CollectionItem {
  id: string;
  title: string;
  category: string;
  arabic?: string;
  transliteration?: string;
  translation?: string;
  content?: string; // For long texts like Moulids
  isPro?: boolean;
}

export const COLLECTIONS_CATEGORIES = [
  { id: 'dikr', title: 'Dikr Collections', icon: 'Sparkles' },
  { id: 'swalath', title: 'Swalath Collections', icon: 'Heart' },
  { id: 'moulids', title: 'Moulids Collections', icon: 'Moon' },
];

export const COLLECTIONS: Record<string, CollectionItem[]> = {
  dikr: [
    { 
      id: 'haddad', 
      title: 'Ratheeb Al-Haddad', 
      category: 'dikr',
      isPro: true,
      content: `
        <div class="space-y-12">
          <div class="text-center space-y-4">
            <h2 class="text-3xl font-bold dark:text-white">Ratheeb Al-Haddad</h2>
            <p class="text-slate-500 italic">Compiled by Imam Abdullah ibn Alawi al-Haddad</p>
          </div>

          <div class="space-y-8">
            <!-- 1. Al Fatihah -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. الرَّحْمَنِ الرَّحِيمِ. مَالِكِ يَوْمِ الدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ. صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ.
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">1. Al-Fatihah</p>
                 <p class="text-slate-500 text-sm">In the name of Allah, Most Gracious, Most Merciful...</p>
               </div>
            </div>

            <!-- 2. Ayat Al Kursi -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">2. Ayat Al-Kursi</p>
                 <p class="text-slate-500 text-sm">Allah! There is no god but He, the Living, the Eternal...</p>
               </div>
            </div>

            <!-- 3. Amanar Rasul -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-2xl font-arabic text-right leading-[2.2] mb-6 dark:text-white">
                 آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ وَقَالُوا سَمِعْنَا وَأَطَعْنَا غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ. لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ.
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">3. Al-Baqarah (285-286)</p>
                 <p class="text-slate-500 text-sm">The Messenger believes in what has been sent down to him from his Lord...</p>
               </div>
            </div>

            <!-- 4. Tahlil -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">4. Tahlil (3x)</p>
                 <p class="text-slate-400 italic text-xs mb-1">La ilaha illallahu wahdahu la sharika lahu...</p>
                 <p class="text-slate-500 text-sm">There is no god but Allah, alone, He has no partner...</p>
               </div>
            </div>

            <!-- 5. Tasbih -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">5. Tasbih (3x)</p>
                 <p class="text-slate-400 italic text-xs mb-1">Subhanallahi walhamdulillah...</p>
                 <p class="text-slate-500 text-sm">Glory be to Allah, and all praise is to Allah...</p>
               </div>
            </div>

            <!-- 6. Tasbih II -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">6. Tasbih II (3x)</p>
                 <p class="text-slate-400 italic text-xs mb-1">Subhanallahi wa bihamdihi...</p>
                 <p class="text-slate-500 text-sm">Glory be to Allah and by His praise, glory be to Allah the Almighty.</p>
               </div>
            </div>

            <!-- 7. Istighfar -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 رَبَّنَا اغْفِرْ لَنَا وَتُبْ عَلَيْنَا إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">7. Istighfar (3x)</p>
                 <p class="text-slate-400 italic text-xs mb-1">Rabbanaghfir lana wa tub alayna...</p>
                 <p class="text-slate-500 text-sm">Our Lord, forgive us and accept our repentance...</p>
               </div>
            </div>

            <!-- 8. Salawat -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ، اللَّهُمَّ صَلِّ عَلَيْهِ وَسَلِّمْ
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">8. Salawat (3x)</p>
                 <p class="text-slate-400 italic text-xs mb-1">Allahumma salli ala Muhammad...</p>
                 <p class="text-slate-500 text-sm">O Allah, bless Muhammad; O Allah, bless him and grant him peace.</p>
               </div>
            </div>

            <!-- 9. Protection -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">9. Protection (3x)</p>
                 <p class="text-slate-400 italic text-xs mb-1">A'udhu bi kalimatillahit tammati...</p>
                 <p class="text-slate-500 text-sm">I seek refuge in the perfect words of Allah from the evil of what He has created.</p>
               </div>
            </div>

            <!-- 10. Bismillah -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">10. Bismillah (3x)</p>
                 <p class="text-slate-400 italic text-xs mb-1">Bismillahilladhi la yadurru...</p>
                 <p class="text-slate-500 text-sm">In the name of Allah, with Whose name nothing can cause harm...</p>
               </div>
            </div>

            <!-- 11. Radiyna -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 رَضِينَا بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">11. Contentment (3x)</p>
                 <p class="text-slate-400 italic text-xs mb-1">Radiyna billahi rabban...</p>
                 <p class="text-slate-500 text-sm">We are content with Allah as our Lord, Islam as our religion, and Muhammad as our Prophet.</p>
               </div>
            </div>

            <!-- 12. Bismillahi wal hamdu lillah -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 بِسْمِ اللَّهِ وَالْحَمْدُ لِلَّهِ، وَالْخَيْرُ وَالشَّرُّ بِمَشِيئَةِ اللَّهِ
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">12. Divine Will (3x)</p>
                 <p class="text-slate-400 italic text-xs mb-1">Bismillahi walhamdulillahi...</p>
                 <p class="text-slate-500 text-sm">In the name of Allah, all praise is for Allah, and good and evil are by the will of Allah.</p>
               </div>
            </div>

            <!-- 13. Amanna -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 آمَنَّا بِاللَّهِ وَالْيَوْمِ الْآخِرِ، تُبْنَا إِلَى اللَّهِ بَاطِنًا وَظَاهِرًا
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">13. Faith & Repentance (3x)</p>
                 <p class="text-slate-400 italic text-xs mb-1">Amanna billahi wal yawmil akhir...</p>
                 <p class="text-slate-500 text-sm">We believe in Allah and the Last Day, we turn to Allah inwardly and outwardly.</p>
               </div>
            </div>

            <!-- 14. Ya Rabbana -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 يَا رَبَّنَا وَاعْفُ عَنَّا وَامْحُ الَّذِي كَانَ مِنَّا
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">14. Pardon (3x)</p>
                 <p class="text-slate-400 italic text-xs mb-1">Ya Rabbana wa'fu anna...</p>
                 <p class="text-slate-500 text-sm">O our Lord, pardon us and wipe away whatever sins were from us.</p>
               </div>
            </div>

            <!-- 15. Ya Dhal Jalali -->
            <div class="p-8 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-[2.5rem] shadow-sm">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 يَا ذَا الْجَلَالِ وَالْإِكْرَامِ، مِتْنَا عَلَى دِينِ الْإِسْلَامِ
               </p>
               <div class="space-y-2 pt-6 border-t border-emerald-200 dark:border-emerald-800/50">
                 <p class="text-brand-emerald font-bold">15. Majesty (7x)</p>
                 <p class="text-slate-400 italic text-xs mb-1">Ya Dhal Jalali wal Ikram...</p>
                 <p class="text-slate-500 text-sm">O Possessor of Majesty and Honor, let us die in the religion of Islam.</p>
               </div>
            </div>

            <!-- 16. Ya Qawiyyu -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 يَا قَوِيُّ يَا مَتِينُ، اكْفِ شَرَّ الظَّالِمِينَ
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">16. Strength (3x)</p>
                 <p class="text-slate-400 italic text-xs mb-1">Ya Qawiyyu Ya Matin...</p>
                 <p class="text-slate-500 text-sm">O Strong One, O Firm One, suffice us against the evil of the wrongdoers.</p>
               </div>
            </div>

            <!-- 17. Aslaha Allahu -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 أَصْلَحَ اللَّهُ أُمُورَ الْمُسْلِمِينَ، صَرَفَ اللَّهُ شَرَّ الْمُؤْذِينَ
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">17. Muslim Affairs (3x)</p>
                 <p class="text-slate-400 italic text-xs mb-1">Aslaha Allahu umural muslimin...</p>
                 <p class="text-slate-500 text-sm">May Allah rectify the affairs of the Muslims, may Allah turn away the evil of the harmful.</p>
               </div>
            </div>

            <!-- 18. Ya Aliyyu -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-2xl font-arabic text-right leading-[2.2] mb-6 dark:text-white">
                 يَا عَلِيُّ يَا كَبِيرُ، يَا عَلِيمُ يَا قَدِيرُ، يَا سَمِيعُ يَا بَصِيرُ، يَا لَطِيفُ يَا خَبِيرُ
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">18. Divine Attributes (3x)</p>
                 <p class="text-slate-400 italic text-xs mb-1">Ya Aliyyu Ya Kabir...</p>
                 <p class="text-slate-500 text-sm">O Most High, O Most Great, O All-Knowing, O All-Powerful, O All-Hearing, O All-Seeing, O Kind, O Aware.</p>
               </div>
            </div>

            <!-- 19. Ya Farijal ham -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 يَا فَارِجَ الْهَمِّ، يَا كَاشِفَ الْغَمِّ، يَا مَنْ لِعَبْدِهِ يَغْفِرُ وَيَرْحَمُ
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">19. Dispeller of Grief (3x)</p>
                 <p class="text-slate-400 italic text-xs mb-1">Ya Farijal ham...</p>
                 <p class="text-slate-500 text-sm">O Dispeller of anxiety, O Remover of grief, O He who forgives and has mercy on His servant.</p>
               </div>
            </div>

            <!-- 20. Astaghfirullah -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 أَسْتَغْفِرُ اللَّهَ رَبَّ الْبَرَايَا، أَسْتَغْفِرُ اللَّهَ مِنَ الْخَطَايَا
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">20. Forgiveness (4x)</p>
                 <p class="text-slate-400 italic text-xs mb-1">Astaghfirullah Rabbal baraya...</p>
                 <p class="text-slate-500 text-sm">I seek forgiveness from Allah, Lord of creation, I seek forgiveness from Allah for all my sins.</p>
               </div>
            </div>

            <!-- 21. Tahlil Long -->
            <div class="p-8 bg-brand-emerald/5 dark:bg-brand-emerald/10 border border-brand-emerald/20 rounded-[2.5rem] text-center">
               <p class="text-5xl font-arabic leading-[2.5] mb-6 dark:text-white">لَا إِلَهَ إِلَّا اللَّهُ</p>
               <div class="pt-6 border-t border-brand-emerald/10">
                 <p class="text-brand-emerald font-bold">21. Tahlil (50-100x)</p>
               </div>
            </div>

            <!-- 22. Muhammadur Rasulullah -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-2xl font-arabic text-right leading-[2.2] mb-6 dark:text-white">
                 مُحَمَّدٌ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَآلِهِ وَسَلَّمَ، وَشَرَّفَ وَكَرَّمَ وَمَجَّدَ وَعَظَّمَ، وَرَضِيَ اللَّهُ تَعَالَى عَنْ آلِ بَيْتِهِ الطَّيِّبِينَ الطَّاهِرِينَ، وَأَصْحَابِهِ أَكْرَمِينَ، وَالتَّابِعِينَ لَهُمْ بِإِحْسَانٍ إِلَى يَوْمِ الدِّينِ.
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">22. Closing Salutation</p>
                 <p class="text-slate-500 text-sm">Muhammad is the Messenger of Allah, peace and blessings be upon him and his family...</p>
               </div>
            </div>
          </div>
        </div>
      `
    },
    { 
      id: 'attas', 
      title: 'Ratheeb Al-Attas', 
      category: 'dikr',
      isPro: true,
      content: `
        <div class="space-y-10">
          <div class="text-center space-y-2">
            <h2 class="text-3xl font-bold dark:text-white">Ratheeb Al-Attas</h2>
            <p class="text-slate-500 italic">Compiled by Habib Umar bin Abdurrahman al-Attas</p>
          </div>

          <div class="space-y-8">
            <div class="p-8 bg-slate-50 dark:bg-zinc-800/50 rounded-[2rem] border border-slate-100 dark:border-zinc-800">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 أَعُوذُ بِاللَّهِ السَّمِيعِ الْعَلِيمِ مِنَ الشَّيْطَانِ الرَّجِيمِ (٣ مرات)
               </p>
               <div class="border-t border-slate-200 dark:border-zinc-700 pt-6">
                 <p class="text-brand-emerald font-bold mb-2">1. Seek Refuge</p>
                 <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Recite 3 Times</p>
               </div>
            </div>

            <div class="p-8 bg-emerald-50 dark:bg-emerald-950/20 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/50">
               <p class="text-2xl font-arabic text-right leading-[2.2] mb-6 dark:text-white">
                 لَوْ أَنْزَلْنَا هَذَا الْقُرْآنَ عَلَى جَبَلٍ لَرَأَيْتَهُ خَاشِعًا مُتَصَدِّعًا مِنْ خَشْيَةِ اللَّهِ وَتِلْكَ الْأَمْثَالُ نَضْرِبُهَا لِلنَّاسِ لَعَلَّهُمْ يَتَفَكَّرُونَ. هُوَ اللَّهُ الَّذِي لَا إِلَهَ إِلَّا هُوَ عَالِمُ الْغَيْبِ وَالشَّهَادَةِ هُوَ الرَّحْمَنُ الرَّحِيمُ. هُوَ اللَّهُ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ سُبْحَانَ اللَّهِ عَمَّا يُشْرِكُونَ. هُوَ اللَّهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ لَهُ الْأَسْمَاءُ الْحُسْنَى يُسَبِّحُ لَهُ مَا فِي السَّمَاوَاتِ وَالْأَرْضِ وَهُوَ الْعَزِيزُ الْحَكِيمُ.
               </p>
               <div class="border-t border-emerald-200 dark:border-emerald-800/50 pt-6">
                 <p class="text-brand-emerald font-bold mb-2">2. Surah Al-Hashr (21-24)</p>
               </div>
            </div>

            <div class="p-8 bg-slate-50 dark:bg-zinc-800/50 rounded-[2rem] border border-slate-100 dark:border-zinc-800">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ (٣ مرات)
               </p>
               <div class="border-t border-slate-200 dark:border-zinc-700 pt-6">
                 <p class="text-brand-emerald font-bold mb-1">3. Protection</p>
               </div>
            </div>
          </div>
        </div>
      `
    },
    { 
      id: 'dalail', 
      title: 'Dalailul Khairat', 
      category: 'dikr',
      isPro: true,
      content: `
        <div class="space-y-12">
          <div class="text-center space-y-4">
            <h2 class="text-3xl font-bold dark:text-white">Dala'il al-Khayrat</h2>
            <p class="text-slate-500 italic">Compiled by Imam al-Jazuli</p>
          </div>

          <div class="space-y-8">
            <!-- 1. Niyyah -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-2xl font-arabic text-right leading-[2.2] mb-6 dark:text-white">
                 اللَّهُمَّ إِنِّي نَوَيْتُ بِالصَّلاةِ عَلَى النَّبِيِّ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، امْتِثَالاً لِأَمْرِكَ وَتَصْدِيقاً لِنَبِيِّكَ سَيِّدِنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَمَحَبَّةً فِيهِ وَشَوْقاً إِلَيْهِ، وَتَعْظِيماً لِقَدْرِهِ، وَلِكَوْنِهِ أَهْلاً لِذَلِكَ.
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">1. Niyyah (The Intent)</p>
                 <p class="text-slate-500 text-sm">O Allah, I intend by my prayer upon the Prophet (SAW) to follow Your command and believe in Your Prophet Muhammad (SAW)...</p>
               </div>
            </div>

            <!-- 2. Opening Prayer -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <p class="text-2xl font-arabic text-right leading-[2.2] mb-6 dark:text-white">
                 الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ، حَسْبِيَ اللَّهُ وَنِعْمَ الْوَكِيلُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ. اللَّهُمَّ إِنِّي أَبْرَأُ مِنْ حَوْلِي وَقُوَّتِي إِلَى حَوْلِكَ وَقُوَّتِكَ، اللَّهُمَّ إِنِّي أَتَقَرَّبُ إِلَيْكَ بِالصَّلَاةِ عَلَى سَيِّدِنَا مُحَمَّدٍ عَبْدِكَ وَنَبِيِّكَ وَرَسُولِكَ سَيِّدِ الْمُرْسَلِينَ.
               </p>
               <div class="space-y-2 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-brand-emerald font-bold">2. Du'a al-Iftitah (Opening Prayer)</p>
                 <p class="text-slate-400 italic text-xs mb-1">Alhamdu lillahi Rabbil 'Alamin, Hasbiyallahu wa ni'mal wakil...</p>
                 <p class="text-slate-500 text-sm">Praise be to Allah, Lord of the Worlds. Allah is sufficient for me and He is the best Disposer of affairs...</p>
               </div>
            </div>

            <!-- 3. Names of the Prophet -->
            <div class="p-8 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-[2.5rem] shadow-sm">
               <h3 class="text-xl font-bold text-brand-emerald mb-6 text-center">3. Asma'un Nabiyy (Names of the Prophet)</h3>
               <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div class="p-4 bg-white/80 dark:bg-zinc-800/80 rounded-2xl text-center shadow-sm">
                   <p class="text-2xl font-arabic dark:text-white">مُحَمَّدٌ</p>
                   <p class="text-xs text-slate-500 font-bold">Muhammad</p>
                 </div>
                 <div class="p-4 bg-white/80 dark:bg-zinc-800/80 rounded-2xl text-center shadow-sm">
                   <p class="text-2xl font-arabic dark:text-white">أَحْمَدُ</p>
                   <p class="text-xs text-slate-500 font-bold">Ahmad</p>
                 </div>
                 <div class="p-4 bg-white/80 dark:bg-zinc-800/80 rounded-2xl text-center shadow-sm">
                   <p class="text-2xl font-arabic dark:text-white">حَامِدٌ</p>
                   <p class="text-xs text-slate-500 font-bold">Hamid</p>
                 </div>
                 <div class="p-4 bg-white/80 dark:bg-zinc-800/80 rounded-2xl text-center shadow-sm">
                   <p class="text-2xl font-arabic dark:text-white">مَحْمُودٌ</p>
                   <p class="text-xs text-slate-500 font-bold">Mahmud</p>
                 </div>
                 <div class="p-4 bg-white/80 dark:bg-zinc-800/80 rounded-2xl text-center shadow-sm">
                   <p class="text-2xl font-arabic dark:text-white">أَحِيْدٌ</p>
                   <p class="text-xs text-slate-500 font-bold">Ahid</p>
                 </div>
                 <div class="p-4 bg-white/80 dark:bg-zinc-800/80 rounded-2xl text-center shadow-sm">
                   <p class="text-2xl font-arabic dark:text-white">وَحِيْدٌ</p>
                   <p class="text-xs text-slate-500 font-bold">Wahid</p>
                 </div>
                 <div class="p-4 bg-white/80 dark:bg-zinc-800/80 rounded-2xl text-center shadow-sm">
                   <p class="text-2xl font-arabic dark:text-white">مَاحٍ</p>
                   <p class="text-xs text-slate-500 font-bold">Mahin</p>
                 </div>
                 <div class="p-4 bg-white/80 dark:bg-zinc-800/80 rounded-2xl text-center shadow-sm">
                   <p class="text-2xl font-arabic dark:text-white">حَاشِرٌ</p>
                   <p class="text-xs text-slate-500 font-bold">Hashir</p>
                 </div>
               </div>
               <div class="mt-8 pt-6 border-t border-emerald-100 dark:border-emerald-900/50 text-center">
                 <p class="text-slate-500 text-sm italic">Reciting the 201 beautiful names of the Prophet (SAW) brings immense blessings and proximity to him.</p>
               </div>
            </div>

            <!-- 4. Monday Hizb -->
            <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
               <div class="flex items-center justify-between mb-6">
                 <p class="text-brand-emerald font-bold italic">The First Hizb (Monday)</p>
                 <span class="px-3 py-1 bg-brand-emerald/10 text-brand-emerald text-xs font-bold rounded-full">Monday Part I</span>
               </div>
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-8 dark:text-white">
                 اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى سَيِّدِنَا إِبْرَاهِيمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيمَ، فِي الْعَالَمِينَ إِنَّكَ حَمِيدٌ مَجِيدٌ.
               </p>
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-8 dark:text-white">
                 اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ عَبْدِكَ وَرَسُولِكَ النَّبِيِّ الْأُمِّيِّ وَعَلَى آلِ مُحَمَّدٍ. اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ صَلَاةً تَكُونُ لَكَ رِضَاءً وَلَهُ جَزَاءً وَلِحَقِّهِ أَدَاءً.
               </p>
               <div class="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-700">
                 <p class="text-slate-500 text-sm">O Allah, bless our master Muhammad and his family as You blessed our master Ibrahim and his family. In all the worlds, You are Praiseworthy and Glorious.</p>
               </div>
            </div>

            <!-- Sunday Closing -->
            <div class="p-8 bg-brand-emerald text-white rounded-[2.5rem] shadow-lg shadow-brand-emerald/20 text-center">
               <p class="text-2xl font-arabic leading-[2.2] mb-6">
                 اللَّهُمَّ اغْفِرْ لِي ذُنُوبِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ، وَارْحَمْنَا إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ.
               </p>
               <p class="text-sm font-bold opacity-80">Collection Completed • Part of the Daily Recitation</p>
            </div>
          </div>
        </div>
      `
    },
    { 
      id: 'hizbul-bahr', 
      title: 'Hizbul Bahr', 
      category: 'dikr',
      isPro: true,
      content: `
        <div class="space-y-12">
          <div class="text-center">
            <h2 class="text-3xl font-bold dark:text-white">Hizb al-Bahr</h2>
            <p class="text-slate-500 italic">Litany of the Sea by Imam Abu’l Hasan ash-Shadhili</p>
          </div>
          <div class="space-y-10">
            <div class="p-8 bg-slate-50 dark:bg-zinc-800/50 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800">
               <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
                 يا عليُّ يا عظيمُ يا حليمُ يا عليمُ، أنت ربِّي وعلمُكَ حسبي، فَنِعْمَ الرَّبُّ رَبِّي، وَنِعْمَ الحَسْبُ حَسْبِي، تَنْصُرُ مَنْ تَشَاءُ وأنت العزيزُ الرحيمُ
               </p>
            </div>
          </div>
        </div>
      `
    },
    { 
      id: 'latheef', 
      title: 'Wirdul Latheef', 
      category: 'dikr',
      isPro: true,
      content: `
        <div class="space-y-12">
          <div class="text-center"><h2 class="text-3xl font-bold dark:text-white">Al-Wird Al-Latheef</h2></div>
          <div class="p-8 bg-slate-50 dark:bg-zinc-800/50 rounded-[2rem] border border-slate-100 dark:border-zinc-800 text-right">
             <p class="text-3xl font-arabic dark:text-white">قُلْ هُوَ اللَّهُ أَحَدٌ. اللَّهُ الصَّمَدُ. لَمْ يَلِدْ وَلَمْ يُولَدْ. وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ</p>
          </div>
        </div>
      `
    },
    { 
      id: 'asmaul-husna', 
      title: 'Asmaul Husna', 
      category: 'dikr',
      isPro: true,
      content: `
        <div class="space-y-8">
          <div class="text-center mb-10">
            <h2 class="text-3xl font-bold dark:text-white mb-2">99 Names of Allah</h2>
            <p class="text-slate-500 font-serif lowercase italic tracking-widest">The Most Beautiful Names</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${[
              { ar: 'الله', en: 'Allah', m: 'The One and Only God' },
              { ar: 'الرحمن', en: 'Ar-Rahman', m: 'The Most Merciful' },
              { ar: 'الرحيم', en: 'Ar-Raheem', m: 'The Especially Merciful' },
              { ar: 'الملك', en: 'Al-Malik', m: 'The Sovereign Lord' },
              { ar: 'القدوس', en: 'Al-Quddus', m: 'The Holy' },
              { ar: 'السلام', en: 'As-Salam', m: 'The Source of Peace' },
              { ar: 'المؤمن', en: 'Al-Mu’min', m: 'The Guardian of Faith' },
              { ar: 'المهيمن', en: 'Al-Muhaymin', m: 'The Protector' },
              { ar: 'العزيز', en: 'Al-Aziz', m: 'The Almighty' },
              { ar: 'الجبار', en: 'Al-Jabbar', m: 'The Compeller' },
              { ar: 'المتكبر', en: 'Al-Mutakabbir', m: 'The Majestic' },
              { ar: 'الخالق', en: 'Al-Khaliq', m: 'The Creator' },
              { ar: 'البارئ', en: 'Al-Bari’', m: 'The Evolver' },
              { ar: 'المصور', en: 'Al-Musawwir', m: 'The Fashioner' },
              { ar: 'الغفار', en: 'Al-Ghaffar', m: 'The Forgiver' },
              { ar: 'القهار', en: 'Al-Qahhar', m: 'The Subduer' },
              { ar: 'الوهاب', en: 'Al-Wahhab', m: 'The Bestower' },
              { ar: 'الرزاق', en: 'Ar-Razzaq', m: 'The Provider' },
              { ar: 'الفتاح', en: 'Al-Fattah', m: 'The Opener' },
              { ar: 'العليم', en: 'Al-Alim', m: 'The All-Knowing' },
              { ar: 'القابض', en: 'Al-Qabid', m: 'The Withholder' },
              { ar: 'الباسط', en: 'Al-Basit', m: 'The Expander' },
              { ar: 'الخافض', en: 'Al-Khafid', m: 'The Abaser' },
              { ar: 'الرافع', en: 'Ar-Rafi', m: 'The Exalter' },
              { ar: 'المعز', en: 'Al-Mu’izz', m: 'The Bestower of Honors' },
              { ar: 'المذل', en: 'Al-Mudhill', m: 'The Humiliator' },
              { ar: 'السميع', en: 'As-Sami’', m: 'The All-Hearing' },
              { ar: 'البصير', en: 'Al-Basir', m: 'The All-Seeing' },
              { ar: 'الحكم', en: 'Al-Hakam', m: 'The Judge' },
              { ar: 'العدل', en: 'Al-Adl', m: 'The Just' },
              { ar: 'اللطيف', en: 'Al-Latif', m: 'The Subtle One' },
              { ar: 'الخبير', en: 'Al-Khabir', m: 'The All-Aware' },
              { ar: 'الحليم', en: 'Al-Halim', m: 'The Forbearing' },
              { ar: 'العظيم', en: 'Al-Azim', m: 'The Magnificent' },
              { ar: 'الغفور', en: 'Al-Ghafur', m: 'The Forgiving' },
              { ar: 'الشكور', en: 'Ash-Shakur', m: 'The Appreciative' },
              { ar: 'العلي', en: 'Al-Ali', m: 'The Most High' },
              { ar: 'الكبير', en: 'Al-Kabir', m: 'The Great One' },
              { ar: 'الحفيظ', en: 'Al-Hafiz', m: 'The Preserver' },
              { ar: 'المقيت', en: 'Al-Muqit', m: 'The Sustainer' },
              { ar: 'الحسيب', en: 'Al-Hasib', m: 'The Reckoner' },
              { ar: 'الجليل', en: 'Al-Jalil', m: 'The Majestic' },
              { ar: 'الكريم', en: 'Al-Karim', m: 'The Generous One' },
              { ar: 'الرقيب', en: 'Ar-Raqib', m: 'The Watchful' },
              { ar: 'المجيب', en: 'Al-Mujib', m: 'The Responsive' },
              { ar: 'الواسع', en: 'Al-Wasi’', m: 'The All-Pervading' },
              { ar: 'الحكيم', en: 'Al-Hakim', m: 'The Wise' },
              { ar: 'الودود', en: 'Al-Wadud', m: 'The Loving' },
              { ar: 'المجيد', en: 'Al-Majid', m: 'The Most Glorious' },
              { ar: 'الباعث', en: 'Al-Ba’ith', m: 'The Resurrector' },
              { ar: 'الشهيد', en: 'Ash-Shahid', m: 'The Witness' },
              { ar: 'الحق', en: 'Al-Haqq', m: 'The Truth' },
              { ar: 'الوكيل', en: 'Al-Wakil', m: 'The Trustee' },
              { ar: 'القوي', en: 'Al-Qawiyyu', m: 'The Most Strong' },
              { ar: 'المتين', en: 'Al-Matin', m: 'The Firm One' },
              { ar: 'الولي', en: 'Al-Waliyy', m: 'The Protecting Friend' },
              { ar: 'الحميد', en: 'Al-Hamid', m: 'The Praiseworthy' },
              { ar: 'المحصي', en: 'Al-Muhsi', m: 'The Accounter' },
              { ar: 'المبدئ', en: 'Al-Mubdi’', m: 'The Originator' },
              { ar: 'المعيد', en: 'Al-Mu’id', m: 'The Restorer' },
              { ar: 'المحيي', en: 'Al-Muhyi', m: 'The Giver of Life' },
              { ar: 'المميت', en: 'Al-Mumit', m: 'The Creator of Death' },
              { ar: 'الحي', en: 'Al-Hayy', m: 'The Alive' },
              { ar: 'القيوم', en: 'Al-Qayyum', m: 'The Self-Subsisting' },
              { ar: 'الواجد', en: 'Al-Wajid', m: 'The Perceiver' },
              { ar: 'الماجد', en: 'Al-Majid', m: 'The Noble' },
              { ar: 'الواحد', en: 'Al-Wahid', m: 'The Unique' },
              { ar: 'الأحد', en: 'Al-Ahad', m: 'The One' },
              { ar: 'الصمد', en: 'As-Samad', m: 'The Eternal' },
              { ar: 'القادر', en: 'Al-Qadir', m: 'The Able' },
              { ar: 'المقتدر', en: 'Al-Muqtadir', m: 'The Powerful' },
              { ar: 'المقدم', en: 'Al-Muqaddim', m: 'The Expediter' },
              { ar: 'المؤخر', en: 'Al-Mu’akhkhir', m: 'The Delayer' },
              { ar: 'الأول', en: 'Al-Awwal', m: 'The First' },
              { ar: 'الأخر', en: 'Al-Akhir', m: 'The Last' },
              { ar: 'الظاهر', en: 'Az-Zahir', m: 'The Manifest' },
              { ar: 'الباطن', en: 'Al-Batin', m: 'The Hidden' },
              { ar: 'الوالي', en: 'Al-Wali', m: 'The Governor' },
              { ar: 'المتعالي', en: 'Al-Muta’ali', m: 'The Most Exalted' },
              { ar: 'البر', en: 'Al-Barr', m: 'The Source of All Good' },
              { ar: 'التواب', en: 'At-Tawwab', m: 'The Acceptor of Repentance' },
              { ar: 'المنتقم', en: 'Al-Muntaqim', m: 'The Avenger' },
              { ar: 'العفو', en: 'Al-Afuww', m: 'The Pardoner' },
              { ar: 'الرؤوف', en: 'Ar-Ra’uf', m: 'The Compassionate' },
              { ar: 'مالك الملك', en: 'Malik-ul-Mulk', m: 'The Owner of All' },
              { ar: 'ذو الجلال والإكرام', en: 'Dhul-Jalali Wal-Ikram', m: 'The Lord of Majesty and Bounty' },
              { ar: 'المقسط', en: 'Al-Muqsit', m: 'The Equitable' },
              { ar: 'الجامع', en: 'Al-Jami’', m: 'The Gatherer' },
              { ar: 'الغني', en: 'Al-Ghaniyy', m: 'The Self-Sufficient' },
              { ar: 'المغني', en: 'Al-Mughni', m: 'The Enricher' },
              { ar: 'المانع', en: 'Al-Mani’', m: 'The Preventer' },
              { ar: 'الضار', en: 'Ad-Darr', m: 'The Distresser' },
              { ar: 'النافع', en: 'An-Nafi’', m: 'The Propitious' },
              { ar: 'النور', en: 'An-Nur', m: 'The Light' },
              { ar: 'الهادي', en: 'Al-Hadi', m: 'The Guide' },
              { ar: 'البديع', en: 'Al-Badi’', m: 'The Incomparable' },
              { ar: 'الباقي', en: 'Al-Baqi', m: 'The Everlasting' },
              { ar: 'الوارث', en: 'Al-Warith', m: 'The Supreme Inheritor' },
              { ar: 'الرشيد', en: 'Ar-Rashid', m: 'The Guide to Right Path' },
              { ar: 'الصبور', en: 'As-Sabur', m: 'The Patient' }
            ].map(name => `
              <div class="p-6 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-3xl group hover:border-brand-emerald/50 transition-colors shadow-sm">
                <div class="flex items-center justify-between mb-4">
                  <p class="text-xs font-bold text-brand-emerald uppercase tracking-widest">${name.en}</p>
                  <p class="text-2xl font-arabic dark:text-white">${name.ar}</p>
                </div>
                <p class="text-sm font-medium dark:text-zinc-400">${name.m}</p>
              </div>
            `).join('')}
          </div>

          <div class="text-center py-12">
            <div class="inline-flex items-center px-4 py-2 bg-brand-emerald/10 text-brand-emerald rounded-full text-sm font-bold">
              Full Collection of 99 Names
            </div>
          </div>
        </div>
      `
    },
  ],
  swalath: [
    { 
      id: 'badriyyah', 
      title: 'Swalath Badriyyah', 
      isPro: true,
      category: 'swalath',
      content: `
        <div class="space-y-12">
          <div class="text-center">
            <h2 class="text-2xl font-bold dark:text-white">Swalath Badriyyah</h2>
            <p class="text-slate-500 italic">Invocation of the People of Badr</p>
          </div>
          <div class="p-8 bg-slate-50 dark:bg-zinc-800/50 rounded-[2rem] border border-slate-100 dark:border-zinc-800">
             <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
               صَلَاةُ اللَّهِ سَلَامُ اللَّهِ، عَلَى طه رَسُولِ اللَّهِ<br>
               صَلَاةُ اللَّهِ سَلَامُ اللَّهِ، عَلَى يس حَبِيبِ اللَّهِ
             </p>
             <p class="text-3xl font-arabic text-right leading-[2.5] mb-6 dark:text-white">
               تَوَسَّلْنَا بِبِسْمِ اللَّهِ، وَبِالْهَادِي رَسُولِ اللَّهِ<br>
               وَكُلِّ مُجَاهِدٍ لِلَّهِ، بِأَهْلِ الْبَدْرِ يَا اللَّه
             </p>
          </div>
        </div>
      `
    },
    { 
      id: 'nariyah', 
      title: 'Swalath Nariyah', 
      isPro: true,
      category: 'swalath',
      content: `
        <div class="space-y-12">
          <div class="p-8 bg-emerald-50 dark:bg-emerald-950/20 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/50">
             <p class="text-4xl font-arabic text-right leading-[2.5] mb-8 dark:text-white">
               اللَّهُمَّ صَلِّ صَلَاةً كَامِلَةً وَسَلِّمْ سَلَامًا تَامًّا عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ الْعُقَدُ، وَتَنْفَرِجُ بِهِ الْكُرَبُ، وَتُقْضَى بِهِ الْحَوَائِجُ، وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الْخَوَاتِيمِ، وَيُسْتَسْقَى الْغَمَامُ بِوَجْهِهِ الْكَرِيمِ، وَعَلَى آلِهِ وَصَحْبِهِ فِي كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعْلُومٍ لَكَ
             </p>
             <div class="border-t border-emerald-200 dark:border-emerald-800/50 pt-6">
               <p class="text-brand-emerald font-bold mb-4">Transliteration</p>
               <p class="text-slate-600 dark:text-zinc-400 font-serif italic mb-6 leading-relaxed">
                 Allahumma salli salatan kamilatan wa sallim salaman tamman 'ala sayyidina Muhammadinil ladhi tanhallu bihil 'uqad, wa tanfariju bihil kurab, wa tuqdah bihil hawa'ij, wa tunalu bihir ragha'ib wa husnul khawatim, wa yustasqal ghamamu bi-wajhihil karim, wa 'ala alihi wa sahbihi fi kulli lamhatin wa nafasin bi-'adadi kulli ma'lumin lak.
               </p>
             </div>
          </div>
        </div>
      `
    },
    { 
      id: 'fatih', 
      title: 'Swalath Fatih', 
      isPro: true,
      category: 'swalath',
      content: `
        <div class="space-y-12">
          <div class="p-8 bg-amber-50 dark:bg-amber-950/20 rounded-[2rem] border border-amber-100 dark:border-amber-900/50">
             <p class="text-4xl font-arabic text-right leading-[2.5] mb-8 dark:text-white">
               اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ الْفَاتِحِ لِمَا أُغْلِقَ، وَالْخَاتِمِ لِمَا سَبَقَ، نَاصِرِ الْحَقِّ بِالْحَقِّ، وَالْهَادِي إِلَى صِرَاطِكَ الْمُسْتَقِيمِ، وَعَلَى آلِهِ حَقَّ قَدْرِهِ وَمِقْدَارِهِ الْعَظِيمِ
             </p>
             <div class="border-t border-amber-200 dark:border-amber-800/50 pt-6">
               <p class="text-amber-600 font-bold mb-4">Transliteration</p>
               <p class="text-slate-600 dark:text-zinc-400 font-serif italic mb-6 leading-relaxed">
                 Allahumma salli 'ala sayyidina Muhammadinil fatihi lima ughliqa, wal khatimi lima sabaqa, nasiril haqqi bil haqqi, wal hadi ila siratikal mustaqim, wa 'ala alihi haqqa qadrihi wa miqdarihil 'azim.
               </p>
             </div>
          </div>
        </div>
      `
    },
    { 
      id: 'thibbil-quloob', 
      title: 'Swalath Thibbil Quloob', 
      isPro: true,
      category: 'swalath',
      content: `
        <div class="space-y-12">
          <div class="p-8 bg-teal-50 dark:bg-teal-950/20 rounded-[2rem] border border-teal-100 dark:border-teal-900/50">
             <p class="text-4xl font-arabic text-right leading-[2.5] mb-8 dark:text-white">
               اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ طِبِّ الْقُلُوبِ وَدَوَائِهَا، وَعَافِيَةِ الْأَبْدَانِ وَشِفَائِهَا، وَنُورِ الْأَبْصَارِ وَضِيَائِهَا، وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ
             </p>
             <div class="border-t border-teal-200 dark:border-teal-800/50 pt-6">
               <p class="text-teal-600 font-bold mb-4">Transliteration</p>
               <p class="text-slate-600 dark:text-zinc-400 font-serif italic mb-6 leading-relaxed">
                 Allahumma salli 'ala sayyidina Muhammadin tibbil qulubi wa dawa'iha, wa 'afiyatil abdani wa shifa'iha, wa nuril absari wa dhiya'iha, wa 'ala alihi wa sahbihi wa sallim.
               </p>
             </div>
          </div>
        </div>
      `
    },
    { 
      id: 'burdah', 
      title: 'Qaseedathul Burdah', 
      category: 'swalath',
      isPro: true,
      content: `
        <div class="space-y-12">
          <div class="text-center">
            <h2 class="text-3xl font-bold dark:text-white">Qaseeda Al-Burdah</h2>
            <p class="text-slate-500 italic">By Imam Al-Busiri</p>
          </div>

          <div class="space-y-10">
            <div class="p-8 bg-brand-emerald text-white rounded-[2rem] shadow-xl shadow-brand-emerald/20 text-center">
               <p class="text-xs uppercase font-bold tracking-[0.2em] mb-4 opacity-80">The Poem of the Mantle</p>
               <p class="text-3xl font-arabic leading-[2.5]">
                 مَوْلَايَ صَلِّ وَسَلِّمْ دَائِمًا أَبَدًا، عَلَى حَبِيبِكَ خَيْرِ الْخَلْقِ كُلِّهِمِ
               </p>
            </div>

            <div class="space-y-8">
              <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
                <p class="text-2xl font-arabic text-right leading-[2.5] dark:text-white">أَمِنْ تَذَكُّرِ جِيْرَانٍ بِذِيْ سَلَمِ، مَزَجْتَ دَمْعًا جَرَى مِنْ مُقْلَةٍ بِدَمِ</p>
              </div>
            </div>
          </div>
        </div>
      `
    },
    { 
      id: 'munjiyah', 
      title: 'Swalath Munjiyah', 
      category: 'swalath',
      isPro: true,
      content: `
        <div class="space-y-12">
          <div class="p-10 bg-gradient-to-br from-brand-emerald/10 to-teal-500/10 dark:from-brand-emerald/20 dark:to-teal-500/20 rounded-[3rem] border border-brand-emerald/20 shadow-2xl shadow-brand-emerald/5 text-center">
            <h2 class="text-3xl font-bold dark:text-white mb-8">Salat al-Munjiyah</h2>
            <p class="text-4xl font-arabic leading-[2.5] mb-8 dark:text-white">
              اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُنْجِينَا بِهَا مِنْ جَمِيعِ الْأَهْوَالِ وَالْآفَاتِ، وَتَقْضِي لَنَا بِهَا جَمِيعَ الْحَاجَاتِ، وَتُطَهِّرُنَا بِهَا مِنْ جَمِيعِ السَّيِّئَاتِ، وَتَرْفَعُنَا بِهَا عِنْدَكَ أَعْلَى الدَّرَجَاتِ، وَتُبَلِّغُنَا بِهَا أَقْصَى الْغَايَاتِ مِنْ جَمِيعِ الْخَيْرَاتِ فِي الْحَيَاةِ وَبَعْدَ الْمَمَاتِ
            </p>
            <div class="border-t border-brand-emerald/10 pt-8">
              <p class="text-slate-600 dark:text-zinc-400 font-serif italic mb-2 leading-relaxed">
                The Prayer of Rescue - Often recited in times of distress and for the fulfillment of all needs.
              </p>
            </div>
          </div>
        </div>
      `
    },
    { 
      id: 'tafreejiyah', 
      title: 'Swalath Tafreejiyah', 
      category: 'swalath',
      isPro: true,
      content: `
        <div class="space-y-12">
          <div class="p-10 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 rounded-[3rem] border border-amber-200 dark:border-amber-900/50 shadow-2xl shadow-amber-500/5 text-center">
            <h2 class="text-3xl font-bold dark:text-white mb-8">Salat al-Nariyah / Tafreejiyah</h2>
            <p class="text-4xl font-arabic leading-[2.5] mb-8 dark:text-white">
              اللَّهُمَّ صَلِّ صَلَاةً كَامِلَةً وَسَلِّمْ سَلَامًا تَامًّا عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ الْعُقَدُ، وَتَنْفَرِجُ بِهِ الْكُرَبُ، وَتُقْضَى بِهِ الْحَوَائِجُ، وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الْخَوَاتِيمِ، وَيُسْتَسْقَى الْغَمَامُ بِوَجْهِهِ الْكَرِيمِ، وَعَلَى آلِهِ وَصَحْبِهِ فِي كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعْلُومٍ لَكَ
            </p>
            <div class="border-t border-amber-500/10 pt-8">
              <p class="text-slate-600 dark:text-zinc-400 font-serif italic mb-2 leading-relaxed">
                The Prayer of Relief - Known for relieving difficulties and opening doors by Allah's will.
              </p>
            </div>
          </div>
        </div>
      `
    },
    { 
      id: 'muhammadiyah', 
      title: 'Qaseedah Muhammadiyah', 
      category: 'swalath',
      isPro: true,
      content: `
        <div class="space-y-12">
          <div class="text-center">
            <h2 class="text-3xl font-bold dark:text-white">Qaseeda Muhammadiyah</h2>
            <p class="text-slate-500 italic">By Imam Al-Busiri</p>
          </div>
          <div class="space-y-6">
            ${[
              { ar1: 'مُحَمَّدٌ أَشْرَفُ الأَعْرَابِ وَالْعَجَمِ', ar2: 'مُحَمَّدٌ خَيْرُ مَنْ يَمْشِي عَلَى قَدَمِ' },
              { ar1: 'مُحَمَّدٌ بَاسِطُ الْمَعْرُوفِ جَامِعُهُ', ar2: 'مُحَمَّدٌ صَاحِبُ الإِحْسَانِ وَالْكَرَمِ' },
              { ar1: 'مُحَمَّدٌ ثَابِتُ الْمِيثَاقِ حَافِظُهُ', ar2: 'مُحَمَّدٌ طَيِّبُ الأَخْلَاقِ وَالشِّيَمِ' }
            ].map(v => `
              <div class="p-6 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 shadow-sm rounded-3xl flex flex-col items-end gap-3">
                <p class="text-2xl font-arabic leading-[2.2] dark:text-white">${v.ar1}</p>
                <p class="text-2xl font-arabic leading-[2.2] dark:text-white">${v.ar2}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `
    },
  ],
  moulids: [
    { 
      id: 'manqoos', 
      title: 'Manqoos Moulid', 
      category: 'moulids',
      isPro: true,
      content: `
        <div class="space-y-12">
          <div class="text-center space-y-4">
            <h2 class="text-3xl font-bold dark:text-white font-serif">Mawlid Al-Manqoos</h2>
            <p class="text-slate-500 italic">Compiled by Sheikh Zainuddin Makhdoom (R.A)</p>
          </div>

          <div class="space-y-10">
            <div class="p-8 bg-slate-50 dark:bg-zinc-800/50 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800">
               <p class="text-4xl font-arabic text-right leading-[3] mb-8 dark:text-white">
                 يَا رَبِّ صَلِّ عَلَى مُحَمَّدُ، يَا رَبِّ صَلِّ عَلَيْهِ وَسَلِّمْ
               </p>
               <div class="border-t border-slate-200 dark:border-zinc-700 pt-6">
                 <p class="text-brand-emerald font-bold italic">Opening Invocation</p>
               </div>
            </div>

            <div class="space-y-8">
               <div class="p-8 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-[2.5rem] shadow-sm">
                 <p class="text-2xl font-arabic text-right leading-[2.5] dark:text-white mb-6">
                   بَدَأْتُ بِبِسْمِ اللَّهِ فِي أَوَّلِ السَّطْرِ، وَأَحْمَدُهُ حَمْدًا كَثِيراً عَلَى الشُّكْرِ<br>
                   وَأَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ، شَهَادَةَ حَقٍّ لَا تُزَعْزِعُ بِالدَّهْرِ
                 </p>
               </div>
            </div>
          </div>
        </div>
      `
    },
    { 
      id: 'barzanji', 
      title: 'Mawlid Al-Barzanji', 
      category: 'moulids',
      isPro: true,
      content: `
        <div class="space-y-12">
          <div class="text-center space-y-2">
            <h2 class="text-3xl font-bold dark:text-white font-serif tracking-tight">Mawlid Al-Barzanji</h2>
            <p class="text-slate-500 italic">Compiled by Imam Ja'far bin Hassan al-Barzanji</p>
          </div>
          <div class="p-8 bg-slate-50 dark:bg-zinc-800/50 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-inner text-right">
             <p class="text-3xl font-arabic leading-[3] mb-8 dark:text-white">أَبْتَدِئُ الإِمْلَاءَ بِاسْمِ الذَّاتِ الْعَلِيَّةِ...</p>
          </div>
        </div>
      `
    },
    { 
      id: 'sharafal-anam', 
      title: 'Sharafal Anam', 
      category: 'moulids',
      isPro: true,
      content: `
        <div class="space-y-12">
          <div class="text-center space-y-2"><h2 class="text-3xl font-bold dark:text-white font-serif">Sharafal Anam</h2></div>
          <div class="p-8 bg-slate-50 dark:bg-zinc-800/50 rounded-[2.5rem] border text-right">
             <p class="text-3xl font-arabic dark:text-white">صَلَاةُ اللَّهِ مَا لَاحَتْ كَوَاكِبْ...</p>
          </div>
        </div>
      `
    },
  ],
};
