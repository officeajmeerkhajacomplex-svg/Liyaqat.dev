// Simple sound system for DeenFlow
const sounds = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  tap: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/3005/3005-preview.mp3',
  message: 'https://assets.mixkit.co/active_storage/sfx/2157/2157-preview.mp3',
  adhan: 'https://server11.mp3quran.net/adhan/Makkah.mp3',
};

export const playSound = (type: keyof typeof sounds) => {
  try {
    const audio = new Audio(sounds[type]);
    audio.volume = 0.4;
    audio.play().catch(e => {
      // Ignore audio playback errors (e.g. no supported source or user interaction required)
      console.warn('Silent fallback, audio failed:', e);
    });
  } catch (err) {
    console.error('Failed to play sound:', err);
  }
};
