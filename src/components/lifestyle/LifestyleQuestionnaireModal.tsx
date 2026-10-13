import React, { useState } from 'react';
import { LifestyleFactors, UserProfile } from '../../types/health';
import { HealthStorage } from '../../utils/storage';
import {
  Moon,
  Briefcase,
  Coffee,
  Wine,
  Cigarette,
  Heart,
  Smile,
  X,
  Check,
  Info,
  Clock,
  Sparkles,
  Droplets,
} from 'lucide-react';

interface LifestyleQuestionnaireModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const LifestyleQuestionnaireModal: React.FC<LifestyleQuestionnaireModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSaved,
}) => {
  const current = profile.lifestyle || {
    sleepHoursPerNight: 7.5,
    officeWorkHoursPerDay: 8.0,
    leisureTimeHoursPerDay: 2.0,
    snackingHabits: 'mindful_healthy',
    smokingStatus: 'never',
    alcoholConsumption: 'light_1_2_weekly',
    stressLevel: 'moderate',
    caffeineIntake: '1-2_cups',
    hydrationGlasses: 8,
    otherHabitsNotes: '',
  };

  const [sleepHours, setSleepHours] = useState<number>(current.sleepHoursPerNight || 7.5);
  const [officeHours, setOfficeHours] = useState<number>(current.officeWorkHoursPerDay || 8.0);
  const [leisureHours, setLeisureHours] = useState<number>(current.leisureTimeHoursPerDay || 2.0);
  const [snacking, setSnacking] = useState<any>(current.snackingHabits || 'mindful_healthy');
  const [smoking, setSmoking] = useState<any>(current.smokingStatus || 'never');
  const [alcohol, setAlcohol] = useState<any>(current.alcoholConsumption || 'light_1_2_weekly');
  const [stress, setStress] = useState<any>(current.stressLevel || 'moderate');
  const [caffeine, setCaffeine] = useState<any>(current.caffeineIntake || '1-2_cups');
  const [hydration, setHydration] = useState<number>(current.hydrationGlasses || 8);
  const [notes, setNotes] = useState<string>(current.otherHabitsNotes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedLifestyle: LifestyleFactors = {
      sleepHoursPerNight: Number(sleepHours),
      officeWorkHoursPerDay: Number(officeHours),
      leisureTimeHoursPerDay: Number(leisureHours),
      snackingHabits: snacking,
      smokingStatus: smoking,
      alcoholConsumption: alcohol,
      stressLevel: stress,
      caffeineIntake: caffeine,
      hydrationGlasses: Number(hydration),
      otherHabitsNotes: notes.trim() || undefined,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    HealthStorage.setProfile({
      ...profile,
      lifestyle: updatedLifestyle,
    });

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Daily Lifestyle & Routine Assessment
              </h3>
              <p className="text-xs text-slate-500">
                Help My Health Companion tailor wellness tips, sleep insights, and energy targets.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Sleep Duration */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>Sleeping Duration (Hours per Night)</span>
              </label>
              <span className="text-sm font-extrabold text-indigo-700">{sleepHours} hrs</span>
            </div>
            <input
              type="range"
              min="4"
              max="12"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>4 hrs (Severe deficit)</span>
              <span className="font-semibold text-emerald-700">7–9 hrs (Optimal adult range)</span>
              <span>12 hrs</span>
            </div>
          </div>

          {/* 2. Office Work & Leisure Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                <Briefcase className="w-4 h-4 text-slate-600" />
                <span>Office / Desk Work</span>
              </label>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  min="0"
                  max="16"
                  step="0.5"
                  value={officeHours}
                  onChange={(e) => setOfficeHours(Number(e.target.value))}
                  className="w-20 px-2 py-1 text-sm font-extrabold text-slate-900 border border-slate-300 rounded-lg bg-white"
                />
                <span className="text-xs text-slate-500">hours/day</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Sedentary screen or office time
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                <Smile className="w-4 h-4 text-emerald-600" />
                <span>Daily Leisure Time</span>
              </label>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  min="0"
                  max="16"
                  step="0.5"
                  value={leisureHours}
                  onChange={(e) => setLeisureHours(Number(e.target.value))}
                  className="w-20 px-2 py-1 text-sm font-extrabold text-slate-900 border border-slate-300 rounded-lg bg-white"
                />
                <span className="text-xs text-slate-500">hours/day</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Relaxation, outdoors, reading, hobbies
              </span>
            </div>
          </div>

          {/* 3. Snacking Habits */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2">
              Snacking Habits & Patterns
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'rarely', label: 'Rarely Snacks', desc: 'Meals only' },
                { id: 'mindful_healthy', label: 'Mindful & Healthy', desc: 'Nuts, fruits, yogurt' },
                { id: 'occasional_evening', label: 'Occasional Evening', desc: 'Post-dinner snacks' },
                { id: 'frequent_processed', label: 'Frequent Processed', desc: 'Sugary / salty snacks' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setSnacking(opt.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    snacking === opt.id
                      ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold ring-1 ring-amber-400'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-xs font-bold">{opt.label}</span>
                  <span className="text-[10px] text-slate-500">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Smoking & Alcohol */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                <Cigarette className="w-4 h-4 text-rose-500" />
                <span>Smoking / Nicotine Status</span>
              </label>
              <select
                value={smoking}
                onChange={(e) => setSmoking(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-500 bg-white"
              >
                <option value="never">Never Smoked</option>
                <option value="former">Former Smoker (Quit)</option>
                <option value="occasional">Occasional / Social</option>
                <option value="current">Current Regular Smoker</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                <Wine className="w-4 h-4 text-purple-600" />
                <span>Alcohol Consumption</span>
              </label>
              <select
                value={alcohol}
                onChange={(e) => setAlcohol(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-500 bg-white"
              >
                <option value="none">None / Non-drinker</option>
                <option value="light_1_2_weekly">Light (1–2 drinks/week)</option>
                <option value="moderate_3_7_weekly">Moderate (3–7 drinks/week)</option>
                <option value="frequent_daily">Frequent (8+ drinks/week)</option>
              </select>
            </div>
          </div>

          {/* 5. Hydration & Caffeine & Stress */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span>Water (Glasses)</span>
              </label>
              <input
                type="number"
                min="1"
                max="25"
                value={hydration}
                onChange={(e) => setHydration(Number(e.target.value))}
                className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-white"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
                <Coffee className="w-3.5 h-3.5 text-amber-700" />
                <span>Caffeine</span>
              </label>
              <select
                value={caffeine}
                onChange={(e) => setCaffeine(e.target.value)}
                className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs bg-white"
              >
                <option value="none">None</option>
                <option value="1-2_cups">1–2 Cups</option>
                <option value="3+_cups">3+ Cups</option>
              </select>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Stress Level</span>
              </label>
              <select
                value={stress}
                onChange={(e) => setStress(e.target.value)}
                className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs bg-white"
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* 6. Other Habits Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Other Habits, Routines or Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Takes hourly standing breaks, night shift worker, evening screen curfew..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              Save Lifestyle Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
