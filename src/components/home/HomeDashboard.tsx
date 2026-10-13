import React, { useState } from 'react';
import {
  UserProfile,
  FoodEntry,
  ActivityEntry,
  BloodPressureReading,
  BloodGlucoseReading,
  CholesterolReading,
  WeightReading,
  HealthReminder,
  PersonalizedReport,
  TabType,
} from '../../types/health';
import {
  classifyBloodPressure,
  classifyBloodGlucose,
  calculateBMI,
  mgdlToMmol,
} from '../../utils/healthCalculators';
import { HealthStorage } from '../../utils/storage';
import {
  Flame,
  Footprints,
  Heart,
  Droplets,
  Scale,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Plus,
  ShieldCheck,
  Calendar,
  Moon,
  Briefcase,
  Cigarette,
  Wine,
  Coffee,
  Smile,
} from 'lucide-react';

interface HomeDashboardProps {
  profile: UserProfile;
  foodEntries: FoodEntry[];
  activityEntries: ActivityEntry[];
  bpReadings: BloodPressureReading[];
  glucoseReadings: BloodGlucoseReading[];
  cholesterolReadings: CholesterolReading[];
  weightReadings: WeightReading[];
  reminders: HealthReminder[];
  report: PersonalizedReport;
  onNavigateTab: (tab: TabType, targetModal?: string) => void;
  onRefreshInsights: () => void;
  isGeneratingInsights: boolean;
  onOpenLifestyleModal: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  foodEntries,
  activityEntries,
  bpReadings,
  glucoseReadings,
  cholesterolReadings,
  weightReadings,
  reminders,
  report,
  onNavigateTab,
  onRefreshInsights,
  isGeneratingInsights,
  onOpenLifestyleModal,
}) => {
  const [chartView, setChartView] = useState<'calories' | 'steps' | 'bp' | 'glucose' | 'weight'>('calories');
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [completedReminders, setCompletedReminders] = useState<Record<string, boolean>>({});

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate today's food metrics
  const todaysFood = foodEntries.filter((f) => f.date === todayStr);
  const totalCaloriesIn = todaysFood.reduce((sum, f) => sum + f.calories, 0);
  const totalCarbs = todaysFood.reduce((sum, f) => sum + f.carbs, 0);
  const totalProtein = todaysFood.reduce((sum, f) => sum + f.protein, 0);
  const totalFat = todaysFood.reduce((sum, f) => sum + f.fat, 0);

  // Calculate today's activity metrics
  const todaysActivities = activityEntries.filter((a) => a.date === todayStr);
  const totalCaloriesBurned = todaysActivities.reduce((sum, a) => sum + a.caloriesBurned, 0);
  const totalSteps = todaysActivities.reduce((sum, a) => sum + (a.steps || 0), 0);
  const totalDurationMinutes = todaysActivities.reduce((sum, a) => sum + a.durationMinutes, 0);

  // Latest vitals
  const latestBp = bpReadings[0];
  const bpCategory = latestBp ? classifyBloodPressure(latestBp.systolic, latestBp.diastolic) : null;

  const latestGlucose = glucoseReadings[0];
  const glucoseCategory = latestGlucose
    ? classifyBloodGlucose(latestGlucose.value, latestGlucose.timing)
    : null;

  const latestCholesterol = cholesterolReadings[0];
  const latestWeight = weightReadings[0];
  const currentBmi = latestWeight
    ? calculateBMI(latestWeight.weightKg, latestWeight.heightCm)
    : calculateBMI(profile.weightKg, profile.heightCm);

  // Calorie percentages
  const caloriePercent = Math.min(100, Math.round((totalCaloriesIn / (profile.dailyCalorieTarget || 2000)) * 100));
  const stepPercent = Math.min(100, Math.round((totalSteps / (profile.dailyStepTarget || 8000)) * 100));

  const toggleReminderCheck = (id: string) => {
    setCompletedReminders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Generate 7-day trend data for charts
  const daysArray = Array.from({ length: timeRange === 'week' ? 7 : 14 }, (_, i) => {
    const d = new Date(Date.now() - (timeRange === 'week' ? 6 - i : 13 - i) * 86400000);
    const dateKey = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    const dayFood = foodEntries.filter((f) => f.date === dateKey);
    const dayCalIn = dayFood.reduce((acc, f) => acc + f.calories, 0);
    const dayAct = activityEntries.filter((a) => a.date === dateKey);
    const dayCalBurn = dayAct.reduce((acc, a) => acc + a.caloriesBurned, 0);
    const daySteps = dayAct.reduce((acc, a) => acc + (a.steps || 0), 0);
    const dayBp = bpReadings.find((b) => b.date === dateKey);
    const dayGlucose = glucoseReadings.find((g) => g.date === dateKey);
    const dayWeight = weightReadings.find((w) => w.date === dateKey);

    return {
      dateKey,
      label,
      calIn: dayCalIn,
      calBurn: dayCalBurn,
      steps: daySteps,
      systolic: dayBp?.systolic || null,
      diastolic: dayBp?.diastolic || null,
      glucose: dayGlucose?.value || null,
      weight: dayWeight?.weightKg || null,
    };
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white p-5 sm:p-7 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-100 text-xs sm:text-sm font-medium mb-1">
              <span>{profile.name ? `Welcome back, ${profile.name}` : 'Welcome back'}</span>
              <span>·</span>
              <span>Daily Health Overview</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {report?.headline || 'Your Daily Wellness Overview'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl mt-1 leading-relaxed">
              Track nutrition, movement, and vital signs in one place. Keep an eye on trends rather than single isolated readings.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('food', 'add')}
              className="bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Log Meal</span>
            </button>
            <button
              onClick={() => onNavigateTab('activity', 'add')}
              className="bg-emerald-700/80 hover:bg-emerald-700 text-white border border-emerald-400/40 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Footprints className="w-4 h-4" />
              <span>Log Walk</span>
            </button>
          </div>
        </div>

        {/* Decorative soft glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Top Cards Grid: Energy & Daily Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nutrition Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Energy Intake (Diet)</h3>
                <span className="text-xs text-slate-500">Today's Nutrition Summary</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('food')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View Food Diary</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalCaloriesIn}</span>
              <span className="text-xs text-slate-500 ml-1.5">/ {profile.dailyCalorieTarget} kcal</span>
            </div>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
              {caloriePercent}% Target
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>

          {/* Macro Breakdown */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[11px] text-slate-500 block">Carbs</span>
              <span className="font-bold text-slate-800 text-sm">{totalCarbs}g</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[11px] text-slate-500 block">Protein</span>
              <span className="font-bold text-slate-800 text-sm">{totalProtein}g</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[11px] text-slate-500 block">Fat</span>
              <span className="font-bold text-slate-800 text-sm">{totalFat}g</span>
            </div>
          </div>
        </div>

        {/* Activity Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Physical Activity</h3>
                <span className="text-xs text-slate-500">Steps & Active Energy</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('activity')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Activity Tracker</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalSteps.toLocaleString()}</span>
              <span className="text-xs text-slate-500 ml-1.5">/ {profile.dailyStepTarget.toLocaleString()} steps</span>
            </div>
            <span className="text-xs font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200/60">
              {stepPercent}% Goal
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${stepPercent}%` }}
            />
          </div>

          {/* Activity Breakdown */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[11px] text-slate-500 block">Est. Burned Energy</span>
              <span className="font-bold text-slate-800 text-sm">{totalCaloriesBurned} kcal</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[11px] text-slate-500 block">Active Duration</span>
              <span className="font-bold text-slate-800 text-sm">{totalDurationMinutes} mins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Vitals Snapshot Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Latest Health Measurements & Vitals</span>
          </h3>
          <button
            onClick={() => onNavigateTab('records')}
            className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
          >
            <span>All Records</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Blood Pressure */}
          <div
            onClick={() => onNavigateTab('records', 'bp')}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-rose-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Blood Pressure</span>
              <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-3.5 h-3.5" />
              </div>
            </div>
            {latestBp ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-900">{latestBp.systolic}</span>
                  <span className="text-slate-400 font-semibold">/</span>
                  <span className="text-xl font-bold text-slate-800">{latestBp.diastolic}</span>
                  <span className="text-[11px] text-slate-400 ml-1">mmHg</span>
                </div>
                <div className="mt-2 text-[11px] font-medium text-slate-600 flex items-center justify-between">
                  <span>Pulse: {latestBp.pulse ? `${latestBp.pulse} bpm` : '--'}</span>
                  {bpCategory && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${bpCategory.badgeColor}`}>
                      {bpCategory.label.split(' ')[0]}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="py-2 text-xs text-slate-400">No readings logged</div>
            )}
          </div>

          {/* Blood Glucose */}
          <div
            onClick={() => onNavigateTab('records', 'glucose')}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Blood Glucose</span>
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Droplets className="w-3.5 h-3.5" />
              </div>
            </div>
            {latestGlucose ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {profile.glucoseUnit === 'mmol/L'
                      ? mgdlToMmol(latestGlucose.value)
                      : latestGlucose.value}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-1">{profile.glucoseUnit}</span>
                </div>
                <div className="mt-2 text-[11px] font-medium text-slate-600 flex items-center justify-between">
                  <span className="capitalize">{latestGlucose.timing.replace('_', ' ')}</span>
                  {glucoseCategory && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${glucoseCategory.badgeColor}`}>
                      {glucoseCategory.label.split(' ')[0]}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="py-2 text-xs text-slate-400">No readings logged</div>
            )}
          </div>

          {/* Cholesterol / Lipid */}
          <div
            onClick={() => onNavigateTab('records', 'cholesterol')}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Cholesterol</span>
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            {latestCholesterol ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-900">{latestCholesterol.total}</span>
                  <span className="text-[11px] text-slate-400 ml-1">{latestCholesterol.unit}</span>
                </div>
                <div className="mt-2 text-[11px] font-medium text-slate-600 flex items-center justify-between">
                  <span>LDL: {latestCholesterol.ldl}</span>
                  <span>HDL: {latestCholesterol.hdl}</span>
                </div>
              </>
            ) : (
              <div className="py-2 text-xs text-slate-400">No lipid panel logged</div>
            )}
          </div>

          {/* Weight & BMI */}
          <div
            onClick={() => onNavigateTab('records', 'weight')}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-teal-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Weight & BMI</span>
              <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Scale className="w-3.5 h-3.5" />
              </div>
            </div>
            {latestWeight ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-900">{latestWeight.weightKg}</span>
                  <span className="text-[11px] text-slate-400 ml-1">kg</span>
                </div>
                <div className="mt-2 text-[11px] font-medium text-slate-600 flex items-center justify-between">
                  <span>BMI: {currentBmi.bmi}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${currentBmi.badgeColor}`}>
                    {currentBmi.category}
                  </span>
                </div>
              </>
            ) : (
              <div className="py-2 text-xs text-slate-400">No weight record</div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Trend Charts */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Health Trends & Progress Over Time</span>
            </h3>
            <span className="text-xs text-slate-500">
              Interactive timeline comparing daily measurements against your targets
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Metric Selector Buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setChartView('calories')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  chartView === 'calories' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Calories
              </button>
              <button
                onClick={() => setChartView('steps')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  chartView === 'steps' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Steps
              </button>
              <button
                onClick={() => setChartView('bp')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  chartView === 'bp' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Blood Pressure
              </button>
              <button
                onClick={() => setChartView('glucose')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  chartView === 'glucose' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Glucose
              </button>
            </div>

            {/* Range Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setTimeRange('week')}
                className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  timeRange === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  timeRange === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                14D
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Chart Display */}
        <div className="h-56 w-full pt-4">
          {chartView === 'calories' && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-400" />
                  <span>Diet Intake (kcal)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-sky-500" />
                  <span>Burned Exercise (kcal)</span>
                </div>
              </div>

              {/* Bars container */}
              <div className="flex-1 flex items-end justify-between gap-2 border-b border-slate-200 pb-2">
                {daysArray.map((day, idx) => {
                  const maxCal = 2500;
                  const inHeight = Math.min(100, Math.round((day.calIn / maxCal) * 100));
                  const burnHeight = Math.min(100, Math.round((day.calBurn / maxCal) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1 h-36">
                        <div
                          className="w-2.5 sm:w-4 bg-amber-400 group-hover:bg-amber-500 rounded-t-md transition-all relative"
                          style={{ height: `${Math.max(6, inHeight)}%` }}
                          title={`${day.label}: Intake ${day.calIn} kcal`}
                        />
                        <div
                          className="w-2.5 sm:w-4 bg-sky-400 group-hover:bg-sky-500 rounded-t-md transition-all relative"
                          style={{ height: `${Math.max(6, burnHeight)}%` }}
                          title={`${day.label}: Burned ${day.calBurn} kcal`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 truncate max-w-[36px]">
                        {day.label.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {chartView === 'steps' && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                  <span>Daily Steps</span>
                </div>
                <span>Goal Target: {profile.dailyStepTarget.toLocaleString()} steps/day</span>
              </div>

              <div className="flex-1 flex items-end justify-between gap-2 border-b border-slate-200 pb-2">
                {daysArray.map((day, idx) => {
                  const maxSteps = 12000;
                  const height = Math.min(100, Math.round((day.steps / maxSteps) * 100));
                  const isMet = day.steps >= profile.dailyStepTarget;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                      <div
                        className={`w-4 sm:w-7 rounded-t-lg transition-all ${
                          isMet ? 'bg-emerald-500 group-hover:bg-emerald-600' : 'bg-slate-300 group-hover:bg-slate-400'
                        }`}
                        style={{ height: `${Math.max(8, height)}%` }}
                        title={`${day.label}: ${day.steps.toLocaleString()} steps`}
                      />
                      <span className="text-[10px] text-slate-400 truncate max-w-[36px]">
                        {day.label.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {chartView === 'bp' && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Systolic (Target &lt; 120 mmHg)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Diastolic (Target &lt; 80 mmHg)</span>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                {daysArray.map((day, idx) => {
                  const sys = day.systolic;
                  const dia = day.diastolic;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                      <div className="h-36 flex flex-col items-center justify-center relative w-full">
                        {sys && dia ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-bold text-rose-600">{sys}</span>
                            <div className="w-1.5 h-12 bg-slate-200 rounded-full flex flex-col justify-between items-center py-0.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            </div>
                            <span className="text-[10px] font-bold text-blue-600">{dia}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-300">--</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 truncate max-w-[36px]">
                        {day.label.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {chartView === 'glucose' && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-500" />
                  <span>Fasting Glucose (mg/dL)</span>
                </div>
                <span className="text-slate-400">Normal Range: 70–99 mg/dL</span>
              </div>

              <div className="flex-1 flex items-end justify-between gap-2 border-b border-slate-200 pb-2">
                {daysArray.map((day, idx) => {
                  const val = day.glucose || 0;
                  const height = Math.min(100, Math.round((val / 160) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                      {val > 0 ? (
                        <>
                          <span className="text-[9px] font-semibold text-indigo-700 hidden sm:block">{val}</span>
                          <div
                            className="w-3.5 sm:w-6 bg-indigo-500 group-hover:bg-indigo-600 rounded-t-lg transition-all"
                            style={{ height: `${Math.max(10, height)}%` }}
                            title={`${day.label}: ${val} mg/dL`}
                          />
                        </>
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-slate-200 mb-2" />
                      )}
                      <span className="text-[10px] text-slate-400 truncate max-w-[36px]">
                        {day.label.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Reminders & Alerts Section */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Today's Reminders & Scheduled Tasks</h3>
          </div>
          <button
            onClick={() => onNavigateTab('profile')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            Manage Reminders
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {reminders.filter((r) => r.enabled).map((rem) => {
            const isDone = !!completedReminders[rem.id];
            return (
              <div
                key={rem.id}
                onClick={() => toggleReminderCheck(rem.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  isDone
                    ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-900'
                    : 'bg-slate-50/80 hover:bg-slate-50 border-slate-200/70 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isDone ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-semibold ${isDone ? 'line-through text-emerald-800' : 'text-slate-900'}`}>
                      {rem.title}
                    </h4>
                    <span className="text-[11px] text-slate-500">{rem.time} · {rem.category}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {isDone ? 'Completed' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lifestyle Routine & Habits Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Smile className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Daily Routine & Lifestyle Factors</h3>
                <span className="text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200/60 px-2 py-0.5 rounded-md">
                  Holistic Health
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sleep, sedentary desk hours, leisure balance, snacking habits, smoking, and alcohol intake
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLifestyleModal}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <span>Update Lifestyle Details</span>
          </button>
        </div>

        {profile.lifestyle ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Sleep Duration</span>
              </div>
              <span className="text-base font-extrabold text-slate-900 block">
                {profile.lifestyle.sleepHoursPerNight} hrs / night
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">
                {profile.lifestyle.sleepHoursPerNight >= 7 && profile.lifestyle.sleepHoursPerNight <= 9 ? 'Optimal Sleep' : 'Monitor Fatigue'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-600" />
                <span>Desk / Office Time</span>
              </div>
              <span className="text-base font-extrabold text-slate-900 block">
                {profile.lifestyle.officeWorkHoursPerDay} hrs / day
              </span>
              <span className="text-[10px] text-slate-500">
                Leisure: {profile.lifestyle.leisureTimeHoursPerDay} hrs
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Snacking Habits</span>
              </div>
              <span className="text-xs font-bold text-slate-900 capitalize block truncate">
                {profile.lifestyle.snackingHabits.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] text-slate-500">
                Water: {profile.lifestyle.hydrationGlasses || 8} glasses
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Habits & Status</span>
              </div>
              <span className="text-xs font-bold text-slate-900 capitalize block">
                Smoking: {profile.lifestyle.smokingStatus}
              </span>
              <span className="text-[10px] text-slate-500 capitalize">
                Alcohol: {profile.lifestyle.alcoholConsumption.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 text-center text-xs">
            <p className="font-semibold text-teal-900">Lifestyle assessment has not been entered yet.</p>
            <p className="text-[11px] text-teal-700 mt-0.5">Click "Update Lifestyle Details" above to input sleep, office work, snacking, and habits.</p>
          </div>
        )}
      </div>

      {/* AI Personalized Wellness Insights */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">AI Personalized Health Trends</h3>
              <span className="text-xs text-slate-300">
                Pattern analysis from your diet, activity, and vital signs
              </span>
            </div>
          </div>

          <button
            onClick={onRefreshInsights}
            disabled={isGeneratingInsights}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingInsights ? 'animate-spin' : ''}`} />
            <span>{isGeneratingInsights ? 'Analyzing Trends...' : 'Refresh with Gemini'}</span>
          </button>
        </div>

        {/* Headline */}
        <div className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-4">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-300 block mb-1">
            Weekly Trend Summary
          </span>
          <p className="text-sm sm:text-base font-semibold text-white leading-snug">
            "{report?.headline || 'Cardiovascular vitals remain steady with well-balanced daily fiber and walking activity.'}"
          </p>
        </div>

        {/* Insights list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {report?.insights?.map((item, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{item.category}</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">{item.observation}</p>
              <div className="pt-1.5 border-t border-white/10 text-slate-200 text-[11px]">
                <span className="font-semibold text-emerald-200">Tip: </span>
                <span>{item.actionableTip}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Achievements & Improvements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
          <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-3.5">
            <span className="font-bold text-emerald-300 mb-1.5 block">Recent Achievements</span>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              {report?.weeklyAchievements?.map((a, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400">✓</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-3.5">
            <span className="font-bold text-slate-200 mb-1.5 block">Areas to Improve</span>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              {report?.areasToImprove?.map((imp, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400">→</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Clinical Disclaimer */}
        <div className="text-[11px] text-slate-400 bg-white/5 rounded-xl p-3 border border-white/5 leading-relaxed flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            {report?.clinicalDisclaimer ||
              'These observations highlight general wellness trends and lifestyle patterns. They do not constitute medical diagnoses or prescriptive treatment. Always consult your personal physician regarding specific diagnostic thresholds or medication adjustments.'}
          </span>
        </div>
      </div>
    </div>
  );
};
