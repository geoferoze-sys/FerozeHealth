import React, { useState } from 'react';
import {
  UserProfile,
  HealthReminder,
  FoodEntry,
  ActivityEntry,
  BloodPressureReading,
  BloodGlucoseReading,
  CholesterolReading,
  WeightReading,
  LabResult,
  Medication,
} from '../../types/health';
import { HealthStorage } from '../../utils/storage';
import {
  User,
  Settings,
  Bell,
  FileDown,
  Printer,
  Shield,
  Trash2,
  RefreshCw,
  Plus,
  Check,
  AlertTriangle,
  Heart,
  Droplets,
  Calendar,
  Lock,
  Download,
  Share2,
  Smile,
  Moon,
  Briefcase,
  Cigarette,
  Wine,
  Coffee,
} from 'lucide-react';

interface ProfileSettingsProps {
  profile: UserProfile;
  reminders: HealthReminder[];
  foodEntries: FoodEntry[];
  activityEntries: ActivityEntry[];
  bpReadings: BloodPressureReading[];
  glucoseReadings: BloodGlucoseReading[];
  cholesterolReadings: CholesterolReading[];
  weightReadings: WeightReading[];
  labResults: LabResult[];
  medications: Medication[];
  onRefresh: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  profile,
  reminders,
  foodEntries,
  activityEntries,
  bpReadings,
  glucoseReadings,
  cholesterolReadings,
  weightReadings,
  labResults,
  medications,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'lifestyle' | 'reminders' | 'reports' | 'privacy'>('profile');

  // Profile Form state
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState(profile.gender);
  const [heightCm, setHeightCm] = useState(profile.heightCm);
  const [weightKg, setWeightKg] = useState(profile.weightKg);
  const [glucoseUnit, setGlucoseUnit] = useState(profile.glucoseUnit);
  const [unitSystem, setUnitSystem] = useState(profile.unitSystem);
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(profile.dailyCalorieTarget);
  const [dailyStepTarget, setDailyStepTarget] = useState(profile.dailyStepTarget);
  const [primaryPhysician, setPrimaryPhysician] = useState(profile.primaryPhysician || '');
  const [emergencyContact, setEmergencyContact] = useState(profile.emergencyContactName || '');
  const [emergencyPhone, setEmergencyPhone] = useState(profile.emergencyContactPhone || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Lifestyle state
  const ls = profile.lifestyle || {
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
  const [sleepHours, setSleepHours] = useState<number>(ls.sleepHoursPerNight || 7.5);
  const [officeHours, setOfficeHours] = useState<number>(ls.officeWorkHoursPerDay || 8.0);
  const [leisureHours, setLeisureHours] = useState<number>(ls.leisureTimeHoursPerDay || 2.0);
  const [snacking, setSnacking] = useState<any>(ls.snackingHabits || 'mindful_healthy');
  const [smoking, setSmoking] = useState<any>(ls.smokingStatus || 'never');
  const [alcohol, setAlcohol] = useState<any>(ls.alcoholConsumption || 'light_1_2_weekly');
  const [stress, setStress] = useState<any>(ls.stressLevel || 'moderate');
  const [caffeine, setCaffeine] = useState<any>(ls.caffeineIntake || '1-2_cups');
  const [hydration, setHydration] = useState<number>(ls.hydrationGlasses || 8);
  const [lifestyleNotes, setLifestyleNotes] = useState<string>(ls.otherHabitsNotes || '');
  const [lifestyleSaved, setLifestyleSaved] = useState(false);

  // New Reminder Form state
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [remTitle, setRemTitle] = useState('');
  const [remCategory, setRemCategory] = useState<any>('vitals');
  const [remTime, setRemTime] = useState('09:00');
  const [remNotes, setRemNotes] = useState('');

  // Report Generation Config state
  const [reportRange, setReportRange] = useState<'7' | '30' | '90' | 'all'>('30');
  const [includeVitals, setIncludeVitals] = useState(true);
  const [includeDiet, setIncludeDiet] = useState(true);
  const [includeActivity, setIncludeActivity] = useState(true);
  const [includeLabs, setIncludeLabs] = useState(true);
  const [includeMeds, setIncludeMeds] = useState(true);
  const [doctorNotesInput, setDoctorNotesInput] = useState('');

  const handleSaveLifestyle = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedLs = {
      sleepHoursPerNight: Number(sleepHours),
      officeWorkHoursPerDay: Number(officeHours),
      leisureTimeHoursPerDay: Number(leisureHours),
      snackingHabits: snacking,
      smokingStatus: smoking,
      alcoholConsumption: alcohol,
      stressLevel: stress,
      caffeineIntake: caffeine,
      hydrationGlasses: Number(hydration),
      otherHabitsNotes: lifestyleNotes.trim() || undefined,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    HealthStorage.setProfile({
      ...profile,
      lifestyle: updatedLs,
    });
    setLifestyleSaved(true);
    setTimeout(() => setLifestyleSaved(false), 2500);
    onRefresh();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name,
      age: Number(age),
      gender,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      glucoseUnit,
      unitSystem,
      dailyCalorieTarget: Number(dailyCalorieTarget),
      dailyStepTarget: Number(dailyStepTarget),
      primaryPhysician: primaryPhysician.trim() || undefined,
      emergencyContactName: emergencyContact.trim() || undefined,
      emergencyContactPhone: emergencyPhone.trim() || undefined,
    };
    HealthStorage.setProfile(updated);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
    onRefresh();
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle.trim()) return;
    const newRem: HealthReminder = {
      id: `rem-${Date.now()}`,
      title: remTitle.trim(),
      category: remCategory,
      time: remTime,
      days: ['Daily'],
      enabled: true,
      notes: remNotes.trim() || undefined,
    };
    HealthStorage.addReminder(newRem);
    setShowAddReminderModal(false);
    setRemTitle('');
    onRefresh();
  };

  const handleToggleReminder = (id: string) => {
    HealthStorage.toggleReminder(id);
    onRefresh();
  };

  const handleDeleteReminder = (id: string) => {
    HealthStorage.deleteReminder(id);
    onRefresh();
  };

  // CSV Export
  const handleExportCsv = () => {
    const rows = [
      ['Date', 'Time', 'Systolic_mmHg', 'Diastolic_mmHg', 'Pulse_bpm', 'Context'],
      ...bpReadings.map((r) => [r.date, r.time, r.systolic, r.diastolic, r.pulse || '', r.context]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `my_health_bp_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF Clinical Summary
  const handlePrintPdfReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
              Settings & Clinical Reports
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">Privacy & Data Governance</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            User Profile, Reminders & Export
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Configure personalized targets, manage daily schedule reminders, generate clinical PDF reports for your doctor, and control offline local storage.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl shrink-0 overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'lifestyle', label: 'Lifestyle & Habits', icon: Smile },
            { id: 'reminders', label: 'Reminders', icon: Bell },
            { id: 'reports', label: 'Reports', icon: FileDown },
            { id: 'privacy', label: 'Privacy', icon: Shield },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-indigo-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs max-w-3xl no-print">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Personal Health Demographics & Goals</h3>
              <span className="text-xs text-slate-500">
                These values calibrate your daily caloric target, BMI calculation, and activity goals.
              </span>
            </div>
            {profileSaved && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Saved successfully</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other / Non-binary</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="50"
                  max="250"
                  required
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="350"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Daily Calorie Target (kcal)
                </label>
                <input
                  type="number"
                  min="1000"
                  max="6000"
                  step="50"
                  required
                  value={dailyCalorieTarget}
                  onChange={(e) => setDailyCalorieTarget(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Daily Step Goal
                </label>
                <input
                  type="number"
                  min="1000"
                  max="50000"
                  step="500"
                  required
                  value={dailyStepTarget}
                  onChange={(e) => setDailyStepTarget(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Blood Glucose Preferred Unit
                </label>
                <select
                  value={glucoseUnit}
                  onChange={(e) => setGlucoseUnit(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="mg/dL">mg/dL (Standard US)</option>
                  <option value="mmol/L">mmol/L (International / UK / Canada)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Primary Physician / Doctor
                </label>
                <input
                  type="text"
                  value={primaryPhysician}
                  onChange={(e) => setPrimaryPhysician(e.target.value)}
                  placeholder="e.g. Dr. Vance, MD"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="e.g. Taylor Morgan (Spouse)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 234-5678"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition-colors"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lifestyle Habits Tab */}
      {activeTab === 'lifestyle' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs max-w-3xl no-print">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Smile className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Daily Lifestyle, Routine & Habit Factors</h3>
              </div>
              <span className="text-xs text-slate-500">
                Log sleeping duration, office work hours, leisure balance, snacking habits, smoking status, and alcohol intake.
              </span>
            </div>
            {lifestyleSaved && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Saved successfully</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveLifestyle} className="space-y-5">
            {/* 1. Sleep Duration */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span>Sleeping Duration (Hours per Night) *</span>
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
                <span>4 hrs (Deficit)</span>
                <span className="font-semibold text-emerald-700">7–9 hrs (AHA Life's Essential Target)</span>
                <span>12 hrs</span>
              </div>
            </div>

            {/* 2. Office Work & Leisure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                  <Briefcase className="w-4 h-4 text-slate-600" />
                  <span>Office / Desk Work (Hours per Day) *</span>
                </label>
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    min="0"
                    max="18"
                    step="0.5"
                    value={officeHours}
                    onChange={(e) => setOfficeHours(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 text-sm font-extrabold text-slate-900 border border-slate-300 rounded-lg bg-white"
                  />
                  <span className="text-xs text-slate-500">hours/day</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Sedentary desk work and computer hours
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                  <Smile className="w-4 h-4 text-emerald-600" />
                  <span>Leisure Time (Hours per Day) *</span>
                </label>
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    min="0"
                    max="18"
                    step="0.5"
                    value={leisureHours}
                    onChange={(e) => setLeisureHours(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 text-sm font-extrabold text-slate-900 border border-slate-300 rounded-lg bg-white"
                  />
                  <span className="text-xs text-slate-500">hours/day</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Hobbies, outdoors, family, and relaxation
                </span>
              </div>
            </div>

            {/* 3. Snacking Habits */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-2">
                Snacking Habits & Diet Patterns *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'rarely', label: 'Rarely Snacks', desc: 'Strict meals only' },
                  { id: 'mindful_healthy', label: 'Mindful & Healthy', desc: 'Nuts, fruit, yogurt' },
                  { id: 'occasional_evening', label: 'Occasional Evening', desc: 'Late night cravings' },
                  { id: 'frequent_processed', label: 'Frequent Processed', desc: 'Sweets / chips' },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setSnacking(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      snacking === opt.id
                        ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold ring-1 ring-amber-400 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs">{opt.label}</span>
                    <span className="text-[10px] text-slate-500 font-normal">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Smoking & Alcohol Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                  <Cigarette className="w-4 h-4 text-rose-500" />
                  <span>Smoking / Nicotine Status *</span>
                </label>
                <select
                  value={smoking}
                  onChange={(e) => setSmoking(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-500 bg-white"
                >
                  <option value="never">Never Smoked</option>
                  <option value="former">Former Smoker (Quit)</option>
                  <option value="occasional">Occasional / Social User</option>
                  <option value="current">Current Regular Smoker / Vaper</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Vital cardiovascular risk factor for blood pressure calibration
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                  <Wine className="w-4 h-4 text-purple-600" />
                  <span>Alcohol Consumption *</span>
                </label>
                <select
                  value={alcohol}
                  onChange={(e) => setAlcohol(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-500 bg-white"
                >
                  <option value="none">None / Non-drinker</option>
                  <option value="light_1_2_weekly">Light (1–2 standard drinks/week)</option>
                  <option value="moderate_3_7_weekly">Moderate (3–7 drinks/week)</option>
                  <option value="frequent_daily">Frequent / Daily (8+ drinks/week)</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Affects resting heart rate, sleep architecture, and liver function
                </span>
              </div>
            </div>

            {/* 5. Hydration, Caffeine & Stress */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Water (Glasses/day)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={hydration}
                  onChange={(e) => setHydration(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Caffeine Intake
                </label>
                <select
                  value={caffeine}
                  onChange={(e) => setCaffeine(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                >
                  <option value="none">None</option>
                  <option value="1-2_cups">1–2 Cups Coffee/Tea</option>
                  <option value="3+_cups">3+ Cups (High)</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Perceived Stress
                </label>
                <select
                  value={stress}
                  onChange={(e) => setStress(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                >
                  <option value="low">Low (Manageable)</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High (Elevated cortisol)</option>
                </select>
              </div>
            </div>

            {/* 6. Other habits notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Other Daily Habits, Shift Work or Notes
              </label>
              <textarea
                rows={2}
                value={lifestyleNotes}
                onChange={(e) => setLifestyleNotes(e.target.value)}
                placeholder="e.g. Standing desk user, intermittent fasting, evening meditation, shift worker..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition-colors"
              >
                Save Lifestyle Factors
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Reminders Tab */}
      {activeTab === 'reminders' && (
        <div className="space-y-4 no-print">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Scheduled Reminders & Vitals Alerts</h3>
              <p className="text-xs text-slate-500">
                Receive visual reminders for medications, daily blood pressure, glucose, and activity sessions.
              </p>
            </div>
            <button
              onClick={() => setShowAddReminderModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reminder</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className={`p-4 rounded-3xl border transition-all ${
                  rem.enabled ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-50 border-slate-200/60 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{rem.title}</h4>
                      <span className="text-xs text-indigo-700 font-semibold">{rem.time} · {rem.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleReminder(rem.id)}
                      className={`text-xs px-2.5 py-1 rounded-xl font-semibold transition-colors cursor-pointer ${
                        rem.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {rem.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(rem.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {rem.notes && (
                  <p className="text-xs text-slate-500 mt-2 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                    {rem.notes}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Add Reminder Modal */}
          {showAddReminderModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-slate-900 text-base">New Reminder</h3>
                  <button onClick={() => setShowAddReminderModal(false)} className="text-slate-400 p-1">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddReminder} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Reminder Title *</label>
                    <input
                      type="text"
                      required
                      value={remTitle}
                      onChange={(e) => setRemTitle(e.target.value)}
                      placeholder="e.g. Evening BP Measurement"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                      <select
                        value={remCategory}
                        onChange={(e) => setRemCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                      >
                        <option value="vitals">Vitals Check</option>
                        <option value="medication">Medication</option>
                        <option value="activity">Physical Walk</option>
                        <option value="water">Hydration</option>
                        <option value="appointment">Clinic Visit</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Time</label>
                      <input
                        type="time"
                        required
                        value={remTime}
                        onChange={(e) => setRemTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Notes / Instructions</label>
                    <input
                      type="text"
                      value={remNotes}
                      onChange={(e) => setRemNotes(e.target.value)}
                      placeholder="e.g. Rest seated 5 mins before cuff measurement"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddReminderModal(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Save Reminder
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Reports & PDF Export Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Config card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs no-print">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Generate Clinical Health Report</h3>
                <p className="text-xs text-slate-500">
                  Select parameters and date range to produce a clean printable medical summary for doctor appointments.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                  title="Export raw CSV data"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handlePrintPdfReport}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs mb-4">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={includeVitals}
                  onChange={(e) => setIncludeVitals(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Blood Pressure & Vitals</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={includeDiet}
                  onChange={(e) => setIncludeDiet(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Nutrition & Diet Summary</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={includeActivity}
                  onChange={(e) => setIncludeActivity(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Activity & Steps</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={includeLabs}
                  onChange={(e) => setIncludeLabs(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Lab Test Results</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={includeMeds}
                  onChange={(e) => setIncludeMeds(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Current Medications</span>
              </label>
            </div>
          </div>

          {/* Printable Report View (Visible on screen as a preview, formatted for clean printing!) */}
          <div className="bg-white rounded-3xl p-8 border border-slate-300 shadow-sm space-y-6 print:shadow-none print:border-none print:p-0 print:m-0">
            {/* Report Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-800">
                  Clinical Wellness Summary Report
                </span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  My Health Companion
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Generated on {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })} · App Version 1.0.0
                </p>
              </div>

              <div className="text-right text-xs">
                <h3 className="font-bold text-slate-900 text-sm">{profile.name}</h3>
                <span className="text-slate-600 block">Age: {profile.age} · Gender: {profile.gender}</span>
                <span className="text-slate-600 block">Physician: {profile.primaryPhysician || 'Unassigned'}</span>
              </div>
            </div>

            {/* Vitals Summary Table */}
            {includeVitals && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  1. Cardiovascular & Metabolic Measurements
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Date & Time</th>
                        <th className="p-2.5">Measurement</th>
                        <th className="p-2.5">Result</th>
                        <th className="p-2.5">Clinical Classification</th>
                        <th className="p-2.5">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bpReadings.slice(0, 5).map((b) => (
                        <tr key={b.id}>
                          <td className="p-2.5">{b.date} {b.time}</td>
                          <td className="p-2.5 font-medium">Blood Pressure</td>
                          <td className="p-2.5 font-bold">{b.systolic}/{b.diastolic} mmHg (Pulse: {b.pulse || '--'})</td>
                          <td className="p-2.5">{b.systolic < 120 && b.diastolic < 80 ? 'Normal' : 'Elevated'}</td>
                          <td className="p-2.5 capitalize">{b.source}</td>
                        </tr>
                      ))}
                      {glucoseReadings.slice(0, 3).map((g) => (
                        <tr key={g.id}>
                          <td className="p-2.5">{g.date} {g.time}</td>
                          <td className="p-2.5 font-medium">Blood Glucose ({g.timing})</td>
                          <td className="p-2.5 font-bold">{g.value} mg/dL</td>
                          <td className="p-2.5">{g.value < 100 ? 'Normal Fasting' : 'Elevated'}</td>
                          <td className="p-2.5 capitalize">{g.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Cholesterol & Lipid Panel */}
            {cholesterolReadings.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  2. Lipid Profile Check
                </h3>
                <div className="grid grid-cols-4 gap-2 text-center text-xs border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <div>
                    <span className="text-slate-500 block">Total Cholesterol</span>
                    <strong className="text-sm">{cholesterolReadings[0].total} mg/dL</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">LDL Cholesterol</span>
                    <strong className="text-sm">{cholesterolReadings[0].ldl} mg/dL</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">HDL Cholesterol</span>
                    <strong className="text-sm">{cholesterolReadings[0].hdl} mg/dL</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Triglycerides</span>
                    <strong className="text-sm">{cholesterolReadings[0].triglycerides} mg/dL</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Active Medications */}
            {includeMeds && medications.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  3. Active Medications & Supplements
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Medication</th>
                        <th className="p-2.5">Dosage</th>
                        <th className="p-2.5">Frequency</th>
                        <th className="p-2.5">Clinical Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {medications.map((m) => (
                        <tr key={m.id}>
                          <td className="p-2.5 font-bold">{m.name}</td>
                          <td className="p-2.5">{m.dosage}</td>
                          <td className="p-2.5">{m.frequency}</td>
                          <td className="p-2.5">{m.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Clinical Disclaimer on Print */}
            <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 leading-relaxed">
              <strong>Medical Disclaimer:</strong> This document compiles user-entered and sensor-synchronized data collected via My Health Companion. It is intended to assist medical consultations and general wellness reviews. It does not replace professional diagnosis, clinical lab validation, or clinical judgment.
            </div>
          </div>
        </div>
      )}

      {/* 4. Privacy & Data Management Tab */}
      {activeTab === 'privacy' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs max-w-2xl no-print space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>Data Sovereignty & Local Privacy Controls</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Your health information is stored in your private local browser storage. No health data is sold or shared with advertisers.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Export Full Health Backup (JSON)</h4>
                <p className="text-[11px] text-slate-500">
                  Download an unencrypted raw JSON file of your entire history for backup or doctor sharing.
                </p>
              </div>
              <button
                onClick={() => HealthStorage.exportFullBackup()}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Export JSON
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-amber-900">Restore Demonstration Sample Data</h4>
                <p className="text-[11px] text-amber-700">
                  Resets your diary and vital records back to the verified sample dataset.
                </p>
              </div>
              <button
                onClick={() => {
                  HealthStorage.resetToSampleData();
                  onRefresh();
                  alert('Sample demonstration dataset restored successfully.');
                }}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Reset Sample Data
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-rose-900">Erase All Local Health Data</h4>
                <p className="text-[11px] text-rose-700">
                  Permanently deletes all logged meals, activities, vitals, and profile details from this device.
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all personal health records from your browser?')) {
                    HealthStorage.clearAllData();
                    onRefresh();
                    alert('All data has been cleared.');
                  }
                }}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Delete All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
