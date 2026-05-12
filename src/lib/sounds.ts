// Simple sound system for DeenFlow
const sounds = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  tap: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/2596/2596-preview.mp3',
  message: 'https://assets.mixkit.co/active_storage/sfx/2157/2157-preview.mp3',
};

export const playSound = (type: keyof typeof sounds) => {
  try {
    const audio = new Audio(sounds[type]);
    audio.volume = 0.4;
    audio.play();
  } catch (err) {
    console.error('Failed to play sound:', err);
  }
};
