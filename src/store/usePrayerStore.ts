import { create } from 'zustand';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { format, parse, isAfter, addDays, differenceInSeconds } from 'date-fns';
import { playSound } from '../lib/sounds';

export type AdhanVoice = 'makkah' | 'madinah' | 'mishary' | 'custom';

export interface PrayerSettings {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  sunrise: boolean;
  preReminderMinutes: number;
  adhanVoice: AdhanVoice;
  calculationMethod: number;
  asrMethod: number; // 0: Standard, 1: Hanafi
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  volume: number;
  vibrationEnabled: boolean;
  jumuahReminders: boolean;
  ramadanMode: boolean;
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

interface PrayerState {
  settings: PrayerSettings;
  times: PrayerTimes | null;
  hijriDate: string | null;
  loading: boolean;
  location: { lat: number; lon: number; name: string } | null;
  nextPrayer: { name: string; time: string; countdown: string } | null;
  currentPrayer: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  updateSettings: (updates: Partial<PrayerSettings>) => Promise<void>;
  fetchPrayerTimes: (lat: number, lon: number) => Promise<void>;
  detectLocation: () => Promise<void>;
  calculateNextPrayer: () => void;
  checkNotifications: () => void;
}

const DEFAULT_SETTINGS: PrayerSettings = {
  fajr: true,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
  sunrise: false,
  preReminderMinutes: 10,
  adhanVoice: 'makkah',
  calculationMethod: 12, // Karachi/Kerala
  asrMethod: 1, // Hanafi
  soundEnabled: true,
  notificationsEnabled: true,
  volume: 0.8,
  vibrationEnabled: true,
  jumuahReminders: true,
  ramadanMode: false,
};

const lastTriggeredRef = {
  adhan: '',
  preReminder: '',
  ramadan: ''
};

export const usePrayerStore = create<PrayerState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  times: null,
  hijriDate: null,
  loading: true,
  location: null,
  nextPrayer: null,
  currentPrayer: null,

  initialize: async () => {
    set({ loading: true });
    
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const settingsRef = doc(db, 'users', user.uid, 'prayer_settings', 'main');
        const snap = await getDoc(settingsRef);
        if (snap.exists()) {
          set({ settings: { ...DEFAULT_SETTINGS, ...snap.data() } });
        } else {
          await setDoc(settingsRef, DEFAULT_SETTINGS);
        }
        
        onSnapshot(settingsRef, (doc) => {
          if (doc.exists()) {
            set({ settings: { ...DEFAULT_SETTINGS, ...doc.data() } });
          }
        });
      } else {
        const local = localStorage.getItem('prayer_settings');
        if (local) {
          set({ settings: { ...DEFAULT_SETTINGS, ...JSON.parse(local) } });
        }
      }
      
      await get().detectLocation();
    });
  },

  updateSettings: async (updates) => {
    const newSettings = { ...get().settings, ...updates };
    set({ settings: newSettings });
    
    const user = auth.currentUser;
    if (user) {
      const settingsRef = doc(db, 'users', user.uid, 'prayer_settings', 'main');
      await setDoc(settingsRef, newSettings, { merge: true });
    } else {
      localStorage.setItem('prayer_settings', JSON.stringify(newSettings));
    }

    if ('calculationMethod' in updates || 'asrMethod' in updates) {
      const loc = get().location;
      if (loc) await get().fetchPrayerTimes(loc.lat, loc.lon);
    }
  },

  detectLocation: async () => {
    return new Promise<void>((resolve) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await get().fetchPrayerTimes(latitude, longitude);
            resolve();
          },
          async (error) => {
            console.error("Location error:", error);
            await get().fetchPrayerTimes(21.4225, 39.8262); 
            resolve();
          }
        );
      } else {
        get().fetchPrayerTimes(21.4225, 39.8262).then(() => {
          resolve();
        });
      }
    });
  },

  fetchPrayerTimes: async (lat, lon) => {
    const { calculationMethod, asrMethod } = get().settings;
    try {
      const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=${calculationMethod}&school=${asrMethod}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.code === 200) {
        const timings = data.data.timings;
        const hijri = data.data.date.hijri;
        
        set({ 
          times: timings, 
          hijriDate: `${hijri.day} ${hijri.month.en} ${hijri.year}`,
          location: { lat, lon, name: data.data.meta.timezone },
          loading: false 
        });
        
        get().calculateNextPrayer();
      }
    } catch (err) {
      console.error("Prayer fetch error:", err);
      set({ loading: false });
    }
  },

  calculateNextPrayer: () => {
    const { times } = get();
    if (!times) return;

    const now = new Date();
    const prayerOrder: (keyof PrayerTimes)[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    let current = 'Isha';
    let next: { name: string; date: Date } | null = null;

    const prayerDates = prayerOrder.map(name => ({
      name,
      date: parse(times[name], 'HH:mm', now)
    }));

    for (let i = 0; i < prayerDates.length; i++) {
      if (isAfter(now, prayerDates[i].date)) {
        current = prayerDates[i].name;
      } else {
        next = prayerDates[i];
        break;
      }
    }

    if (!next) {
      next = {
        name: 'Fajr',
        date: addDays(prayerDates[0].date, 1)
      };
    }

    const diff = differenceInSeconds(next.date, now);
    const h = Math.floor(diff / 3600).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');

    set({
      currentPrayer: current,
      nextPrayer: {
        name: next.name,
        time: times[next.name as keyof PrayerTimes] || format(next.date, 'HH:mm'),
        countdown: `${h}:${m}:${s}`
      }
    });
    
    get().checkNotifications();
  },

  checkNotifications: () => {
    const { times, settings } = get();
    if (!times || !settings.notificationsEnabled) return;

    const now = new Date();
    const currentHM = format(now, 'HH:mm');
    const dayStr = format(now, 'yyyy-MM-dd');
    
    const prayers: (keyof PrayerTimes)[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    prayers.forEach(p => {
      if (!settings[p as keyof PrayerSettings]) return;
      
      const pTimeStr = times[p];
      if (!pTimeStr) return;

      // 1. Adhan Notification
      if (pTimeStr === currentHM) {
        const key = `${dayStr}-${p}-adhan`;
        if (lastTriggeredRef.adhan !== key) {
          lastTriggeredRef.adhan = key;
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${p} Adhan`, {
              body: `It is now time for ${p} prayer.`,
              icon: '/favicon.svg',
              tag: 'adhan'
            });
          }

          if (settings.soundEnabled) {
            playSound(`adhan_${settings.adhanVoice}`, settings.volume);
          }
        }
      }

      // 2. Pre-Adhan Reminder
      if (settings.preReminderMinutes > 0) {
        const pDate = parse(pTimeStr, 'HH:mm', now);
        const diffMins = Math.floor(differenceInSeconds(pDate, now) / 60);
        
        if (diffMins === settings.preReminderMinutes) {
          const key = `${dayStr}-${p}-pre`;
          if (lastTriggeredRef.preReminder !== key) {
            lastTriggeredRef.preReminder = key;
            
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`Prayer Reminder`, {
                body: `${p} begins in ${settings.preReminderMinutes} minutes.`,
                icon: '/favicon.svg',
                tag: 'pre-adhan'
              });
            }
          }
        }
      }
    });

    if (settings.jumuahReminders && now.getDay() === 5) {
      if (currentHM === '09:00' && lastTriggeredRef.ramadan !== `${dayStr}-jumuah`) {
        lastTriggeredRef.ramadan = `${dayStr}-jumuah`;
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Blessed Jumuah`, {
            body: `Don't forget to read Surah Kahf and send blessings upon the Prophet (PBUH).`,
            icon: '/favicon.svg'
          });
        }
      }
    }
  }
}));
