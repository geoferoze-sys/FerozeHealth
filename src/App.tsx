import React, { useState, useEffect, useCallback } from 'react';
import { TabType, UserProfile, PersonalizedReport } from './types/health';
import { HealthStorage } from './utils/storage';
import { DisclaimerBanner } from './components/common/DisclaimerBanner';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeDashboard } from './components/home/HomeDashboard';
import { FoodDiary } from './components/food/FoodDiary';
import { ActivityTracker } from './components/activity/ActivityTracker';
import { HealthRecords } from './components/records/HealthRecords';
import { ProfileSettings } from './components/profile/ProfileSettings';
import { LifestyleQuestionnaireModal } from './components/lifestyle/LifestyleQuestionnaireModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [subTabTarget, setSubTabTarget] = useState<string | undefined>(undefined);
  const [openAddModalOnLoad, setOpenAddModalOnLoad] = useState<boolean>(false);
  const [showLifestyleModal, setShowLifestyleModal] = useState<boolean>(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false);

  // Core state from storage
  const [profile, setProfile] = useState<UserProfile>(HealthStorage.getProfile());
  const [foodEntries, setFoodEntries] = useState(HealthStorage.getFoodEntries());
  const [activityEntries, setActivityEntries] = useState(HealthStorage.getActivityEntries());
  const [bpReadings, setBpReadings] = useState(HealthStorage.getBpReadings());
  const [glucoseReadings, setGlucoseReadings] = useState(HealthStorage.getGlucoseReadings());
  const [cholesterolReadings, setCholesterolReadings] = useState(HealthStorage.getCholesterolReadings());
  const [weightReadings, setWeightReadings] = useState(HealthStorage.getWeightReadings());
  const [labResults, setLabResults] = useState(HealthStorage.getLabResults());
  const [medications, setMedications] = useState(HealthStorage.getMedications());
  const [conditions, setConditions] = useState(HealthStorage.getConditions());
  const [allergies, setAllergies] = useState(HealthStorage.getAllergies());
  const [appointments, setAppointments] = useState(HealthStorage.getAppointments());
  const [reminders, setReminders] = useState(HealthStorage.getReminders());
  const [report, setReport] = useState<PersonalizedReport>(HealthStorage.getReport());

  // Reload all state from storage
  const refreshAllState = useCallback(() => {
    setProfile(HealthStorage.getProfile());
    setFoodEntries(HealthStorage.getFoodEntries());
    setActivityEntries(HealthStorage.getActivityEntries());
    setBpReadings(HealthStorage.getBpReadings());
    setGlucoseReadings(HealthStorage.getGlucoseReadings());
    setCholesterolReadings(HealthStorage.getCholesterolReadings());
    setWeightReadings(HealthStorage.getWeightReadings());
    setLabResults(HealthStorage.getLabResults());
    setMedications(HealthStorage.getMedications());
    setConditions(HealthStorage.getConditions());
    setAllergies(HealthStorage.getAllergies());
    setAppointments(HealthStorage.getAppointments());
    setReminders(HealthStorage.getReminders());
    setReport(HealthStorage.getReport());
  }, []);

  // Sync when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      refreshAllState();
    };
    window.addEventListener('mhc_data_changed', handleStorageChange);
    return () => window.removeEventListener('mhc_data_changed', handleStorageChange);
  }, [refreshAllState]);

  // Check if sample data is currently active
  const hasSampleData =
    foodEntries.some((f) => f.isSample) ||
    activityEntries.some((a) => a.isSample) ||
    bpReadings.some((b) => b.isSample);

  // Active reminders count
  const pendingRemindersCount = reminders.filter((r) => r.enabled).length;

  // Handle Quick Log from header
  const handleQuickLog = (tab: TabType, modalTarget?: string) => {
    setActiveTab(tab);
    setSubTabTarget(modalTarget);
    if (modalTarget === 'add') {
      setOpenAddModalOnLoad(true);
    } else {
      setOpenAddModalOnLoad(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Refresh AI insights with server Gemini API
  const handleRefreshInsights = async () => {
    try {
      setIsGeneratingInsights(true);

      const payload = {
        profile,
        vitals: {
          latestBp: bpReadings[0] || null,
          latestGlucose: glucoseReadings[0] || null,
          latestCholesterol: cholesterolReadings[0] || null,
          latestWeight: weightReadings[0] || null,
        },
        nutritionSummary: {
          totalEntriesLogged: foodEntries.length,
          recentFoods: foodEntries.slice(0, 5).map((f) => f.name),
        },
        activitySummary: {
          totalSessionsLogged: activityEntries.length,
          recentActivities: activityEntries.slice(0, 5).map((a) => `${a.type} (${a.durationMinutes}m)`),
        },
      };

      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Server returned error status');
      }

      const newReportData = await response.json();
      const updatedReport: PersonalizedReport = {
        ...newReportData,
        lastGenerated: new Date().toISOString().split('T')[0],
      };

      HealthStorage.setReport(updatedReport);
      setReport(updatedReport);
    } catch (err) {
      console.error('Failed to refresh insights:', err);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Medical Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main App Header */}
      <Header
        onQuickLog={handleQuickLog}
        hasSampleData={hasSampleData}
        onRefreshData={refreshAllState}
        pendingRemindersCount={pendingRemindersCount}
      />

      {/* Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 sm:py-6">
        {/* Desktop Navigation Placement */}
        <div className="hidden md:flex justify-end mb-4">
          <Navigation
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setSubTabTarget(undefined);
              setOpenAddModalOnLoad(false);
            }}
            pendingRemindersCount={pendingRemindersCount}
          />
        </div>

        {/* Tab 1: Home Dashboard */}
        {activeTab === 'home' && (
          <HomeDashboard
            profile={profile}
            foodEntries={foodEntries}
            activityEntries={activityEntries}
            bpReadings={bpReadings}
            glucoseReadings={glucoseReadings}
            cholesterolReadings={cholesterolReadings}
            weightReadings={weightReadings}
            reminders={reminders}
            report={report}
            onNavigateTab={handleQuickLog}
            onRefreshInsights={handleRefreshInsights}
            isGeneratingInsights={isGeneratingInsights}
            onOpenLifestyleModal={() => setShowLifestyleModal(true)}
          />
        )}

        {/* Tab 2: AI Food Diary */}
        {activeTab === 'food' && (
          <FoodDiary
            entries={foodEntries}
            dailyCalorieTarget={profile.dailyCalorieTarget}
            onRefresh={refreshAllState}
            openAddModalInitially={openAddModalOnLoad}
          />
        )}

        {/* Tab 3: Activity Tracker */}
        {activeTab === 'activity' && (
          <ActivityTracker
            entries={activityEntries}
            profile={profile}
            onRefresh={refreshAllState}
            openAddModalInitially={openAddModalOnLoad}
          />
        )}

        {/* Tab 4: Health Records */}
        {activeTab === 'records' && (
          <HealthRecords
            profile={profile}
            bpReadings={bpReadings}
            glucoseReadings={glucoseReadings}
            cholesterolReadings={cholesterolReadings}
            weightReadings={weightReadings}
            labResults={labResults}
            medications={medications}
            conditions={conditions}
            allergies={allergies}
            appointments={appointments}
            onRefresh={refreshAllState}
            initialSubTab={subTabTarget}
          />
        )}

        {/* Tab 5: Profile & Settings */}
        {activeTab === 'profile' && (
          <ProfileSettings
            profile={profile}
            reminders={reminders}
            foodEntries={foodEntries}
            activityEntries={activityEntries}
            bpReadings={bpReadings}
            glucoseReadings={glucoseReadings}
            cholesterolReadings={cholesterolReadings}
            weightReadings={weightReadings}
            labResults={labResults}
            medications={medications}
            onRefresh={refreshAllState}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSubTabTarget(undefined);
          setOpenAddModalOnLoad(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        pendingRemindersCount={pendingRemindersCount}
      />

      {/* Lifestyle Questionnaire Assessment Modal */}
      <LifestyleQuestionnaireModal
        profile={profile}
        isOpen={showLifestyleModal}
        onClose={() => setShowLifestyleModal(false)}
        onSaved={refreshAllState}
      />
    </div>
  );
}
