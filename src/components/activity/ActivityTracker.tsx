import React, { useState } from 'react';
import { ActivityEntry, ExerciseType, UserProfile } from '../../types/health';
import { HealthStorage } from '../../utils/storage';
import { EXERCISE_METS, estimateCaloriesBurned } from '../../utils/healthCalculators';
import {
  Footprints,
  Flame,
  Clock,
  Navigation,
  Plus,
  Trash2,
  Calendar,
  Smartphone,
  ShieldCheck,
  TrendingUp,
  Award,
  CheckCircle2,
  X,
  Target,
  RefreshCw,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActivityTrackerProps {
  entries: ActivityEntry[];
  profile: UserProfile;
  onRefresh: () => void;
  openAddModalInitially?: boolean;
}

export const ActivityTracker: React.FC<ActivityTrackerProps> = ({
  entries,
  profile,
  onRefresh,
  openAddModalInitially = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [showAddModal, setShowAddModal] = useState(openAddModalInitially);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [isSyncingDevice, setIsSyncingDevice] = useState(false);
  const [deviceSyncMessage, setDeviceSyncMessage] = useState<string | null>(null);

  // Form states
  const [exerciseType, setExerciseType] = useState<ExerciseType>('walking');
  const [activityTitle, setActivityTitle] = useState('Brisk Outdoor Walk');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [steps, setSteps] = useState<number>(3500);
  const [distanceKm, setDistanceKm] = useState<number>(2.4);
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'vigorous'>('moderate');
  const [activityNotes, setActivityNotes] = useState('');

  // Personal goals form state
  const [goalSteps, setGoalSteps] = useState(profile.dailyStepTarget);
  const [goalActiveMins, setGoalActiveMins] = useState(profile.dailyActiveMinutesTarget);

  // Auto-calculated estimated calories in form
  const estimatedCals = estimateCaloriesBurned(
    exerciseType,
    durationMinutes,
    profile.weightKg || 70
  );

  // Day calculations
  const dayEntries = entries.filter((e) => e.date === selectedDate);
  const totalSteps = dayEntries.reduce((sum, e) => sum + (e.steps || 0), 0);
  const totalDuration = dayEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
  const totalCaloriesBurned = dayEntries.reduce((sum, e) => sum + e.caloriesBurned, 0);
  const totalDistance = dayEntries.reduce((sum, e) => sum + (e.distanceKm || 0), 0);

  const stepProgress = Math.min(100, Math.round((totalSteps / profile.dailyStepTarget) * 100));
  const activeMinProgress = Math.min(100, Math.round((totalDuration / profile.dailyActiveMinutesTarget) * 100));

  // Trigger celebration if goal reached
  const checkGoalCelebration = (newTotalSteps: number) => {
    if (newTotalSteps >= profile.dailyStepTarget) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch {
        // ignore if blocked
      }
    }
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const timeNow = new Date().toTimeString().slice(0, 5);

    const newEntry: ActivityEntry = {
      id: `act-${Date.now()}`,
      type: exerciseType,
      title: activityTitle.trim() || EXERCISE_METS[exerciseType]?.label || 'Physical Activity',
      durationMinutes: Number(durationMinutes) || 15,
      steps: exerciseType === 'walking' || exerciseType === 'running' ? Number(steps) || undefined : undefined,
      distanceKm: distanceKm ? Number(distanceKm) : undefined,
      caloriesBurned: estimatedCals,
      intensity,
      date: selectedDate,
      time: timeNow,
      source: 'manual',
      notes: activityNotes.trim() || undefined,
    };

    HealthStorage.addActivityEntry(newEntry);
    checkGoalCelebration(totalSteps + (newEntry.steps || 0));
    setShowAddModal(false);
    resetForm();
    onRefresh();
  };

  const resetForm = () => {
    setExerciseType('walking');
    setActivityTitle('Brisk Outdoor Walk');
    setDurationMinutes(30);
    setSteps(3500);
    setDistanceKm(2.4);
    setIntensity('moderate');
    setActivityNotes('');
  };

  const handleDeleteActivity = (id: string) => {
    if (window.confirm('Delete this activity entry?')) {
      HealthStorage.deleteActivityEntry(id);
      onRefresh();
    }
  };

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...profile,
      dailyStepTarget: Number(goalSteps) || 8000,
      dailyActiveMinutesTarget: Number(goalActiveMins) || 30,
    };
    HealthStorage.setProfile(updated);
    setShowGoalModal(false);
    onRefresh();
  };

  // Simulate Device Health Sync (Apple HealthKit / Android Health Connect)
  const handleSimulateDeviceSync = () => {
    setIsSyncingDevice(true);
    setDeviceSyncMessage(null);

    setTimeout(() => {
      const simulatedSteps = Math.floor(Math.random() * 2500) + 2000;
      const simulatedDistance = parseFloat((simulatedSteps * 0.00075).toFixed(2));
      const simulatedDuration = Math.round(simulatedSteps / 110);
      const simulatedCals = Math.round(simulatedDuration * 4.2);

      const deviceEntry: ActivityEntry = {
        id: `act-sync-${Date.now()}`,
        type: 'walking',
        title: 'Device Pedometer Sync (HealthKit / Health Connect)',
        durationMinutes: simulatedDuration,
        steps: simulatedSteps,
        distanceKm: simulatedDistance,
        caloriesBurned: simulatedCals,
        intensity: 'moderate',
        date: selectedDate,
        time: new Date().toTimeString().slice(0, 5),
        source: 'simulated',
        notes: 'Synchronized via Simulated Mobile Health Bridge',
      };

      HealthStorage.addActivityEntry(deviceEntry);
      checkGoalCelebration(totalSteps + simulatedSteps);
      setIsSyncingDevice(false);
      setDeviceSyncMessage(`Successfully synchronized ${simulatedSteps.toLocaleString()} steps (${simulatedDistance} km) from simulated device.`);
      onRefresh();
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/60">
              Activity Tracker
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">Cardiorespiratory & Energy Monitoring</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Daily Movement, Steps & Workouts
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Monitor daily steps, walking duration, and physical exercise sessions. Real-time calorie burn estimates powered by clinically grounded MET standards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-2xl text-xs sm:text-sm font-medium transition-all cursor-pointer"
          >
            <Target className="w-4 h-4 text-sky-600" />
            <span>Set Goals</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            <span>Log Activity</span>
          </button>
        </div>
      </div>

      {/* Daily Progress Big Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Steps Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Footprints className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">Daily Steps</span>
            </div>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200/60">
              {stepProgress}% Goal
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalSteps.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">/ {profile.dailyStepTarget.toLocaleString()}</span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${stepProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Distance: <strong className="text-slate-800">{totalDistance.toFixed(2)} km</strong></span>
            <span>{totalSteps >= profile.dailyStepTarget ? 'Goal Achieved! 🎉' : `${(profile.dailyStepTarget - totalSteps).toLocaleString()} to go`}</span>
          </div>
        </div>

        {/* Active Minutes Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">Active Minutes</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
              {activeMinProgress}%
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalDuration}
            </span>
            <span className="text-xs text-slate-500">/ {profile.dailyActiveMinutesTarget} mins</span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full transition-all duration-500"
              style={{ width: `${activeMinProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Aerobic & Resistance Sessions</span>
            <span>{dayEntries.length} logged today</span>
          </div>
        </div>

        {/* Estimated Energy Expenditure Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">Estimated Burn</span>
            </div>
            <span className="text-xs font-medium text-orange-700 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200/60">
              MET-Formula
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalCaloriesBurned}
            </span>
            <span className="text-xs text-slate-500">active kcal</span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalCaloriesBurned / 450) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>User body weight: {profile.weightKg} kg</span>
            <span className="text-[11px] text-slate-400">Approx. expenditure</span>
          </div>
        </div>
      </div>

      {/* Device Integration Bridge: Apple HealthKit & Health Connect */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-5 shadow-xs border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 text-sky-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>Device Health Integration Bridge</span>
                <span className="text-[10px] font-medium bg-sky-900/60 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full">
                  HealthKit & Health Connect
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                PWA Web Runtime. Simulated bridge enables testing pedometer synchronization.
              </p>
            </div>
          </div>

          <button
            onClick={handleSimulateDeviceSync}
            disabled={isSyncingDevice}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDevice ? 'animate-spin' : ''}`} />
            <span>{isSyncingDevice ? 'Syncing Device...' : 'Simulate Device Sync'}</span>
          </button>
        </div>

        {deviceSyncMessage && (
          <div className="bg-sky-900/50 border border-sky-400/30 rounded-2xl p-3 text-xs text-sky-200 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{deviceSyncMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-2 border-t border-white/10">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Platform Notice:</strong> Native Apple HealthKit and Android Health Connect APIs require packaged mobile app bridges with explicit runtime permissions. In web browsers, data can be entered manually or synced via the simulated bridge above.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>
              <strong>Clinical Transparency:</strong> All recorded entries are stamped with their source (<span className="text-white font-mono text-[10px]">manual</span> vs <span className="text-white font-mono text-[10px]">device</span>) so healthcare providers can distinguish sensor measurements from user estimates.
            </span>
          </div>
        </div>
      </div>

      {/* Activity Log History Table */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">Physical Activity Log</h3>
            <span className="text-xs text-slate-400">({dayEntries.length} sessions for selected date)</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {dayEntries.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-sm font-medium">No activity sessions logged for {selectedDate}.</p>
            <p className="text-xs mt-1">Click "Log Activity" or "Simulate Device Sync" to add a session.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {dayEntries.map((act) => (
              <div
                key={act.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-2xl px-2 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-lg shrink-0">
                    {act.type === 'walking' && '🚶'}
                    {act.type === 'running' && '🏃'}
                    {act.type === 'cycling' && '🚴'}
                    {act.type === 'swimming' && '🏊'}
                    {act.type === 'yoga' && '🧘'}
                    {act.type === 'strength' && '🏋️'}
                    {act.type === 'hiit' && '⚡'}
                    {act.type === 'pilates' && '🤸'}
                    {act.type === 'other' && '⏱️'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{act.title}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize">
                        {act.intensity} intensity
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        Source: {act.source.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="capitalize font-medium text-slate-700">{act.type}</span>
                      <span>·</span>
                      <span>{act.durationMinutes} minutes</span>
                      {act.steps ? (
                        <>
                          <span>·</span>
                          <span>{act.steps.toLocaleString()} steps</span>
                        </>
                      ) : null}
                      {act.distanceKm ? (
                        <>
                          <span>·</span>
                          <span>{act.distanceKm} km</span>
                        </>
                      ) : null}
                      <span>·</span>
                      <span>{act.time}</span>
                    </div>

                    {act.notes && (
                      <p className="text-xs text-slate-600 mt-1 italic">{act.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-lg font-extrabold text-orange-600">{act.caloriesBurned}</span>
                    <span className="text-xs text-slate-500 ml-1">kcal</span>
                  </div>

                  <button
                    onClick={() => handleDeleteActivity(act.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Footprints className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Log Physical Activity</h3>
                  <span className="text-xs text-slate-500">Record workout sessions and energy expenditure</span>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Activity Type</label>
                <select
                  value={exerciseType}
                  onChange={(e) => {
                    const newType = e.target.value as ExerciseType;
                    setExerciseType(newType);
                    setActivityTitle(EXERCISE_METS[newType]?.label || 'Exercise Session');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500 bg-white"
                >
                  {Object.entries(EXERCISE_METS).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label} (MET: {item.met})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Activity Title / Name</label>
                <input
                  type="text"
                  required
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="e.g. Morning Neighborhood Walk, Sunset Bike Ride"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Intensity Level
                  </label>
                  <select
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500 bg-white"
                  >
                    <option value="low">Low (Light breathing)</option>
                    <option value="moderate">Moderate (Elevated HR)</option>
                    <option value="vigorous">Vigorous (High exertion)</option>
                  </select>
                </div>
              </div>

              {(exerciseType === 'walking' || exerciseType === 'running') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Step Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={steps}
                      onChange={(e) => setSteps(Number(e.target.value))}
                      placeholder="e.g. 3500"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Distance (km)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(Number(e.target.value))}
                      placeholder="e.g. 2.4"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Estimated Energy Burn Display */}
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-orange-950 block">Estimated Energy Burned</span>
                  <span className="text-[11px] text-orange-800">Calculated with MET & your weight ({profile.weightKg} kg)</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-orange-600">{estimatedCals}</span>
                  <span className="text-xs text-orange-950 ml-1">kcal</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Session Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={activityNotes}
                  onChange={(e) => setActivityNotes(e.target.value)}
                  placeholder="e.g. Sunny day, felt energized, brisk pace with inclines"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Goal Settings Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">Personal Activity Goals</h3>
              </div>
              <button
                onClick={() => setShowGoalModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoals} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Daily Step Goal
                </label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  required
                  value={goalSteps}
                  onChange={(e) => setGoalSteps(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  AHA recommends 7,000–10,000 steps daily for cardiovascular health
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Daily Active Minutes Goal
                </label>
                <input
                  type="number"
                  min="10"
                  step="5"
                  required
                  value={goalActiveMins}
                  onChange={(e) => setGoalActiveMins(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  WHO recommends 150 minutes of moderate activity weekly (approx. 20–30 mins/day)
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Goals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
