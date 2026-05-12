import { motion } from 'motion/react';
import { Bell, Sparkles } from 'lucide-react';

const reminders = [
  "The best of people are those that bring most benefit to others.",
  "Kindness is a mark of faith, and whoever is not kind has no faith.",
  "A good word is a form of charity.",
  "The strongest man is the one who, when he gets angry, forgets his anger.",
  "He who does not show mercy to others, will not be shown mercy by Allah."
];

export default function ReminderCard() {
  const reminder = reminders[Math.floor(Math.random() * reminders.length)];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 bg-brand-emerald/10 dark:bg-brand-emerald/5 rounded-[2rem] border border-brand-emerald/20 relative overflow-hidden"
    >
      <div className="relative z-10 flex gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-brand-emerald text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-brand-emerald mb-1 flex items-center gap-2">
            Daily Wisdom
            <Sparkles className="w-3 h-3" />
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed leading-relaxed font-serif italic">
            "{reminder}"
          </p>
        </div>
      </div>
    </motion.div>
  );
}
