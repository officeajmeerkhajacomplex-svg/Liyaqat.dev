// Simple sound system for DeenFlow
const sounds: Record<string, string> = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  tap: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/3005/3005-preview.mp3',
  message: 'https://assets.mixkit.co/active_storage/sfx/2157/2157-preview.mp3',
  adhan: 'https://server11.mp3quran.net/adhan/Makkah.mp3',
  adhan_makkah: 'https://server11.mp3quran.net/adhan/Makkah.mp3',
  adhan_madinah: 'https://server11.mp3quran.net/adhan/Madinah.mp3',
  adhan_mishary: 'https://server8.mp3quran.net/mishary/001.mp3', // Placeholder, using Mishary Fatiha for now or actual adhan if found
};

export const playSound = (type: string, volume: number = 0.4) => {
  try {
    const url = sounds[type];
    if (!url) return;
    const audio = new Audio(url);
    audio.volume = volume;
    return audio.play().catch(e => {
      console.warn('Silent fallback, audio failed:', e);
    });
  } catch (err) {
    console.error('Failed to play sound:', err);
  }
};
