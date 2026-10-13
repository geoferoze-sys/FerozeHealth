import {
  UserProfile,
  FoodEntry,
  ActivityEntry,
  BloodPressureReading,
  BloodGlucoseReading,
  CholesterolReading,
  WeightReading,
  LabResult,
  Medication,
  MedicalCondition,
  Allergy,
  Appointment,
  HealthReminder,
  PersonalizedReport,
} from '../types/health';
import {
  INITIAL_USER_PROFILE,
  INITIAL_FOOD_ENTRIES,
  INITIAL_ACTIVITY_ENTRIES,
  INITIAL_BP_READINGS,
  INITIAL_GLUCOSE_READINGS,
  INITIAL_CHOLESTEROL_READINGS,
  INITIAL_WEIGHT_READINGS,
  INITIAL_LAB_RESULTS,
  INITIAL_MEDICATIONS,
  INITIAL_CONDITIONS,
  INITIAL_ALLERGIES,
  INITIAL_APPOINTMENTS,
  INITIAL_REMINDERS,
  INITIAL_REPORT,
} from '../data/sampleData';

const KEYS = {
  PROFILE: 'mhc_profile',
  FOOD: 'mhc_food_entries',
  ACTIVITY: 'mhc_activity_entries',
  BP: 'mhc_bp_readings',
  GLUCOSE: 'mhc_glucose_readings',
  CHOLESTEROL: 'mhc_cholesterol_readings',
  WEIGHT: 'mhc_weight_readings',
  LABS: 'mhc_lab_results',
  MEDICATIONS: 'mhc_medications',
  CONDITIONS: 'mhc_conditions',
  ALLERGIES: 'mhc_allergies',
  APPOINTMENTS: 'mhc_appointments',
  REMINDERS: 'mhc_reminders',
  REPORT: 'mhc_report',
  HEALTH_SYNC: 'mhc_device_sync_status',
};

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('mhc_data_changed', { detail: { key } }));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export const HealthStorage = {
  getProfile: (): UserProfile => safeGet(KEYS.PROFILE, INITIAL_USER_PROFILE),
  setProfile: (profile: UserProfile) => safeSet(KEYS.PROFILE, profile),

  getFoodEntries: (): FoodEntry[] => safeGet(KEYS.FOOD, INITIAL_FOOD_ENTRIES),
  setFoodEntries: (entries: FoodEntry[]) => safeSet(KEYS.FOOD, entries),
  addFoodEntry: (entry: FoodEntry) => {
    const current = HealthStorage.getFoodEntries();
    HealthStorage.setFoodEntries([entry, ...current]);
  },
  deleteFoodEntry: (id: string) => {
    const current = HealthStorage.getFoodEntries();
    HealthStorage.setFoodEntries(current.filter((e) => e.id !== id));
  },
  updateFoodEntry: (entry: FoodEntry) => {
    const current = HealthStorage.getFoodEntries();
    HealthStorage.setFoodEntries(current.map((e) => (e.id === entry.id ? entry : e)));
  },

  getActivityEntries: (): ActivityEntry[] => safeGet(KEYS.ACTIVITY, INITIAL_ACTIVITY_ENTRIES),
  setActivityEntries: (entries: ActivityEntry[]) => safeSet(KEYS.ACTIVITY, entries),
  addActivityEntry: (entry: ActivityEntry) => {
    const current = HealthStorage.getActivityEntries();
    HealthStorage.setActivityEntries([entry, ...current]);
  },
  deleteActivityEntry: (id: string) => {
    const current = HealthStorage.getActivityEntries();
    HealthStorage.setActivityEntries(current.filter((e) => e.id !== id));
  },

  getBpReadings: (): BloodPressureReading[] => safeGet(KEYS.BP, INITIAL_BP_READINGS),
  setBpReadings: (readings: BloodPressureReading[]) => safeSet(KEYS.BP, readings),
  addBpReading: (reading: BloodPressureReading) => {
    const current = HealthStorage.getBpReadings();
    HealthStorage.setBpReadings([reading, ...current]);
  },
  deleteBpReading: (id: string) => {
    const current = HealthStorage.getBpReadings();
    HealthStorage.setBpReadings(current.filter((r) => r.id !== id));
  },

  getGlucoseReadings: (): BloodGlucoseReading[] => safeGet(KEYS.GLUCOSE, INITIAL_GLUCOSE_READINGS),
  setGlucoseReadings: (readings: BloodGlucoseReading[]) => safeSet(KEYS.GLUCOSE, readings),
  addGlucoseReading: (reading: BloodGlucoseReading) => {
    const current = HealthStorage.getGlucoseReadings();
    HealthStorage.setGlucoseReadings([reading, ...current]);
  },
  deleteGlucoseReading: (id: string) => {
    const current = HealthStorage.getGlucoseReadings();
    HealthStorage.setGlucoseReadings(current.filter((r) => r.id !== id));
  },

  getCholesterolReadings: (): CholesterolReading[] => safeGet(KEYS.CHOLESTEROL, INITIAL_CHOLESTEROL_READINGS),
  setCholesterolReadings: (readings: CholesterolReading[]) => safeSet(KEYS.CHOLESTEROL, readings),
  addCholesterolReading: (reading: CholesterolReading) => {
    const current = HealthStorage.getCholesterolReadings();
    HealthStorage.setCholesterolReadings([reading, ...current]);
  },
  deleteCholesterolReading: (id: string) => {
    const current = HealthStorage.getCholesterolReadings();
    HealthStorage.setCholesterolReadings(current.filter((r) => r.id !== id));
  },

  getWeightReadings: (): WeightReading[] => safeGet(KEYS.WEIGHT, INITIAL_WEIGHT_READINGS),
  setWeightReadings: (readings: WeightReading[]) => safeSet(KEYS.WEIGHT, readings),
  addWeightReading: (reading: WeightReading) => {
    const current = HealthStorage.getWeightReadings();
    HealthStorage.setWeightReadings([reading, ...current]);
  },
  deleteWeightReading: (id: string) => {
    const current = HealthStorage.getWeightReadings();
    HealthStorage.setWeightReadings(current.filter((r) => r.id !== id));
  },

  getLabResults: (): LabResult[] => safeGet(KEYS.LABS, INITIAL_LAB_RESULTS),
  setLabResults: (labs: LabResult[]) => safeSet(KEYS.LABS, labs),
  addLabResult: (lab: LabResult) => {
    const current = HealthStorage.getLabResults();
    HealthStorage.setLabResults([lab, ...current]);
  },
  deleteLabResult: (id: string) => {
    const current = HealthStorage.getLabResults();
    HealthStorage.setLabResults(current.filter((l) => l.id !== id));
  },

  getMedications: (): Medication[] => safeGet(KEYS.MEDICATIONS, INITIAL_MEDICATIONS),
  setMedications: (meds: Medication[]) => safeSet(KEYS.MEDICATIONS, meds),
  addMedication: (med: Medication) => {
    const current = HealthStorage.getMedications();
    HealthStorage.setMedications([med, ...current]);
  },
  deleteMedication: (id: string) => {
    const current = HealthStorage.getMedications();
    HealthStorage.setMedications(current.filter((m) => m.id !== id));
  },

  getConditions: (): MedicalCondition[] => safeGet(KEYS.CONDITIONS, INITIAL_CONDITIONS),
  setConditions: (conds: MedicalCondition[]) => safeSet(KEYS.CONDITIONS, conds),
  addCondition: (c: MedicalCondition) => {
    const current = HealthStorage.getConditions();
    HealthStorage.setConditions([c, ...current]);
  },
  deleteCondition: (id: string) => {
    const current = HealthStorage.getConditions();
    HealthStorage.setConditions(current.filter((c) => c.id !== id));
  },

  getAllergies: (): Allergy[] => safeGet(KEYS.ALLERGIES, INITIAL_ALLERGIES),
  setAllergies: (allergies: Allergy[]) => safeSet(KEYS.ALLERGIES, allergies),
  addAllergy: (a: Allergy) => {
    const current = HealthStorage.getAllergies();
    HealthStorage.setAllergies([a, ...current]);
  },
  deleteAllergy: (id: string) => {
    const current = HealthStorage.getAllergies();
    HealthStorage.setAllergies(current.filter((a) => a.id !== id));
  },

  getAppointments: (): Appointment[] => safeGet(KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS),
  setAppointments: (apts: Appointment[]) => safeSet(KEYS.APPOINTMENTS, apts),
  addAppointment: (a: Appointment) => {
    const current = HealthStorage.getAppointments();
    HealthStorage.setAppointments([a, ...current]);
  },
  deleteAppointment: (id: string) => {
    const current = HealthStorage.getAppointments();
    HealthStorage.setAppointments(current.filter((a) => a.id !== id));
  },

  getReminders: (): HealthReminder[] => safeGet(KEYS.REMINDERS, INITIAL_REMINDERS),
  setReminders: (rems: HealthReminder[]) => safeSet(KEYS.REMINDERS, rems),
  toggleReminder: (id: string) => {
    const current = HealthStorage.getReminders();
    HealthStorage.setReminders(
      current.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  },
  addReminder: (r: HealthReminder) => {
    const current = HealthStorage.getReminders();
    HealthStorage.setReminders([r, ...current]);
  },
  deleteReminder: (id: string) => {
    const current = HealthStorage.getReminders();
    HealthStorage.setReminders(current.filter((r) => r.id !== id));
  },

  getReport: (): PersonalizedReport => safeGet(KEYS.REPORT, INITIAL_REPORT),
  setReport: (rep: PersonalizedReport) => safeSet(KEYS.REPORT, rep),

  // Reset to sample data
  resetToSampleData: () => {
    HealthStorage.setProfile(INITIAL_USER_PROFILE);
    HealthStorage.setFoodEntries(INITIAL_FOOD_ENTRIES);
    HealthStorage.setActivityEntries(INITIAL_ACTIVITY_ENTRIES);
    HealthStorage.setBpReadings(INITIAL_BP_READINGS);
    HealthStorage.setGlucoseReadings(INITIAL_GLUCOSE_READINGS);
    HealthStorage.setCholesterolReadings(INITIAL_CHOLESTEROL_READINGS);
    HealthStorage.setWeightReadings(INITIAL_WEIGHT_READINGS);
    HealthStorage.setLabResults(INITIAL_LAB_RESULTS);
    HealthStorage.setMedications(INITIAL_MEDICATIONS);
    HealthStorage.setConditions(INITIAL_CONDITIONS);
    HealthStorage.setAllergies(INITIAL_ALLERGIES);
    HealthStorage.setAppointments(INITIAL_APPOINTMENTS);
    HealthStorage.setReminders(INITIAL_REMINDERS);
    HealthStorage.setReport(INITIAL_REPORT);
  },

  // Clear all data (blank slate)
  clearAllData: () => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent('mhc_data_changed', { detail: { key: 'all' } }));
  },

  // Export full JSON backup
  exportFullBackup: () => {
    const backup = {
      profile: HealthStorage.getProfile(),
      foodEntries: HealthStorage.getFoodEntries(),
      activityEntries: HealthStorage.getActivityEntries(),
      bpReadings: HealthStorage.getBpReadings(),
      glucoseReadings: HealthStorage.getGlucoseReadings(),
      cholesterolReadings: HealthStorage.getCholesterolReadings(),
      weightReadings: HealthStorage.getWeightReadings(),
      labResults: HealthStorage.getLabResults(),
      medications: HealthStorage.getMedications(),
      conditions: HealthStorage.getConditions(),
      allergies: HealthStorage.getAllergies(),
      appointments: HealthStorage.getAppointments(),
      reminders: HealthStorage.getReminders(),
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0',
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_health_companion_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
