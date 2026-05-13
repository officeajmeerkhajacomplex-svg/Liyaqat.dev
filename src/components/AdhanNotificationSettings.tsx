import React from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  BellOff, 
  Check, 
  Volume2, 
  Volume1, 
  Volume, 
  VolumeX,
  Music,
  Clock,
  Globe,
  Activity
} from 'lucide-react';
import { usePrayerStore, AdhanVoice } from '../store/usePrayerStore';
import { cn } from '../lib/utils';
import { playSound } from '../lib/sounds';

const CALC_METHODS = [
  { id: 2, name: 'ISNA (North America)' },
  { id: 3, name: 'Muslim World League' },
  { id: 1, name: 'Karachi (PT)' },
  { id: 4, name: 'Umm al-Qura' },
  { id: 5, name: 'Egyptian' },
  { id: 12, name: 'Kerala/India (Karachi)' },
  { id: 13, name: 'Turkey (Diyanet)' },
  { id: 99, name: 'Custom / Automatic' },
];

const ADHAN_VOICES: { id: AdhanVoice; name: string }[] = [
  { id: 'makkah', name: 'Makkah Al-Mukarramah' },
  { id: 'madinah', name: 'Madinah Al-Munawwarah' },
  { id: 'mishary', name: 'Mishary Rashid Alafasy' }
];

export const AdhanNotificationSettings: React.FC = () => {
  const { settings, updateSettings } = usePrayerStore();

  const handleToggle = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
    playSound('click');
  };

  const handleVoicePreview = (voice: AdhanVoice) => {
    playSound(`adhan_${voice}`, settings.volume);
  };

  return (
    <div className="space-y-10">
      {/* Notifications Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-brand-emerald">
            <Bell className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold dark:text-white">Notification Times</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map((p) => {
            const enabled = (settings as any)[p];
            return (
              <button
                key={p}
                onClick={() => handleToggle(p as any)}
                className={cn(
                  "flex items-center justify-between p-5 rounded-[1.5rem] border transition-all text-left",
                  enabled 
                    ? "bg-white dark:bg-zinc-800 border-brand-emerald/30 shadow-md" 
                    : "bg-slate-50 dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 opacity-60"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    enabled ? "bg-emerald-100 dark:bg-emerald-900/50 text-brand-emerald" : "bg-slate-200 dark:bg-zinc-700 text-slate-400"
                  )}>
                    {enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                  </div>
                  <span className="font-bold capitalize dark:text-white">{p}</span>
                </div>
                {enabled && <Check className="w-5 h-5 text-brand-emerald" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Adhan Voice Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600">
            <Music className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold dark:text-white">Adhan Voice</h3>
        </div>

        <div className="space-y-3">
          {ADHAN_VOICES.map((voice) => (
            <div 
              key={voice.id}
              className={cn(
                "flex items-center justify-between p-5 rounded-[1.5rem] border transition-all",
                settings.adhanVoice === voice.id
                  ? "bg-white dark:bg-zinc-800 border-brand-emerald/30 shadow-md"
                  : "bg-slate-50 dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
              )}
            >
              <button 
                onClick={() => updateSettings({ adhanVoice: voice.id })}
                className="flex-1 text-left flex items-center gap-4"
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  settings.adhanVoice === voice.id ? "bg-brand-emerald text-white" : "bg-slate-200 dark:bg-zinc-700 text-slate-400"
                )}>
                  <Volume2 className="w-5 h-5" />
                </div>
                <span className="font-bold dark:text-white">{voice.name}</span>
              </button>
              
              <button 
                onClick={() => handleVoicePreview(voice.id)}
                className="p-3 hover:bg-slate-100 dark:hover:bg-zinc-750 rounded-full transition-colors text-brand-emerald font-bold text-sm"
              >
                Preview
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Volume & Reminders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold dark:text-white">Pre-Adhan Reminder</h3>
          </div>
          
          <div className="p-6 bg-slate-50 dark:bg-zinc-900 rounded-[2rem] space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Minutes before adhan</p>
            <div className="flex items-center gap-4">
              {[0, 5, 10, 15, 30].map(mins => (
                <button
                  key={mins}
                  onClick={() => updateSettings({ preReminderMinutes: mins })}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-sm transition-all border",
                    settings.preReminderMinutes === mins
                      ? "bg-brand-emerald text-white border-brand-emerald shadow-md"
                      : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-zinc-800"
                  )}
                >
                  {mins === 0 ? 'Off' : `${mins}m`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold dark:text-white">Volume</h3>
          </div>
          
          <div className="p-6 bg-slate-50 dark:bg-zinc-900 rounded-[2rem] flex items-center gap-4">
            {settings.volume === 0 ? <VolumeX className="w-6 h-6 text-slate-400" /> : <Volume2 className="w-6 h-6 text-brand-emerald" />}
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={settings.volume} 
              onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
              className="flex-1 accent-brand-emerald h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Calculation Method */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold dark:text-white">Calculation Method</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CALC_METHODS.map(method => (
            <button
              key={method.id}
              onClick={() => updateSettings({ calculationMethod: method.id })}
              className={cn(
                "flex items-center justify-between px-6 py-4 rounded-2xl transition-all border text-sm font-bold",
                settings.calculationMethod === method.id
                  ? "bg-white dark:bg-zinc-800 border-brand-emerald shadow-sm text-brand-emerald"
                  : "bg-slate-50 dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 text-slate-600 dark:text-slate-400"
              )}
            >
              <span>{method.name}</span>
              {settings.calculationMethod === method.id && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Special Reminders */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold dark:text-white">Extra Alerts</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleToggle('jumuahReminders')}
            className={cn(
              "flex items-center justify-between p-6 rounded-3xl border transition-all",
              settings.jumuahReminders ? "bg-white dark:bg-zinc-800 border-brand-emerald shadow-md" : "bg-slate-50 dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
            )}
          >
            <div>
              <p className="font-bold dark:text-white text-left">Jumuah Reminders</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 text-left">Ghusl, Surah Kahf, Salawat</p>
            </div>
            <div className={cn(
              "w-12 h-6 rounded-full relative transition-colors",
              settings.jumuahReminders ? "bg-brand-emerald" : "bg-slate-300 dark:bg-zinc-700"
            )}>
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                settings.jumuahReminders ? "left-7" : "left-1"
              )} />
            </div>
          </button>

          <button
            onClick={() => handleToggle('ramadanMode')}
            className={cn(
              "flex items-center justify-between p-6 rounded-3xl border transition-all",
              settings.ramadanMode ? "bg-white dark:bg-zinc-800 border-brand-emerald shadow-md" : "bg-slate-50 dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
            )}
          >
            <div>
              <p className="font-bold dark:text-white text-left">Ramadan Mode</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 text-left">Suhoor & Iftar specific alerts</p>
            </div>
            <div className={cn(
              "w-12 h-6 rounded-full relative transition-colors",
              settings.ramadanMode ? "bg-brand-emerald" : "bg-slate-300 dark:bg-zinc-700"
            )}>
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                settings.ramadanMode ? "left-7" : "left-1"
              )} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
