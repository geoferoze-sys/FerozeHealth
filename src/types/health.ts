export type TabType = 'home' | 'food' | 'activity' | 'records' | 'profile';

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodEntry {
  id: string;
  name: string;
  category: MealCategory;
  servingSize: string;
  calories: number;
  carbs: number; // grams
  protein: number; // grams
  fat: number; // grams
  saturatedFat?: number; // grams
  fiber?: number; // grams
  sodium?: number; // mg
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  imageUrl?: string;
  notes?: string;
  isAiEstimated?: boolean;
  isSample?: boolean;
}

export type ExerciseType =
  | 'walking'
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'yoga'
  | 'strength'
  | 'hiit'
  | 'pilates'
  | 'other';

export interface ActivityEntry {
  id: string;
  type: ExerciseType;
  title: string;
  durationMinutes: number;
  steps?: number;
  distanceKm?: number;
  caloriesBurned: number;
  intensity: 'low' | 'moderate' | 'vigorous';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  source: 'manual' | 'healthkit' | 'health_connect' | 'simulated';
  notes?: string;
  isSample?: boolean;
}

export interface BloodPressureReading {
  id: string;
  systolic: number; // mmHg
  diastolic: number; // mmHg
  pulse?: number; // bpm
  date: string;
  time: string;
  context: 'resting' | 'morning' | 'evening' | 'post-exercise';
  notes?: string;
  source: 'manual' | 'device';
  isSample?: boolean;
}

export interface BloodGlucoseReading {
  id: string;
  value: number; // mg/dL internally
  unit: 'mg/dL' | 'mmol/L';
  timing: 'fasting' | 'before_meal' | 'after_meal' | 'bedtime' | 'random';
  date: string;
  time: string;
  notes?: string;
  source: 'manual' | 'device';
  isSample?: boolean;
}

export interface CholesterolReading {
  id: string;
  total: number; // mg/dL
  ldl: number; // mg/dL
  hdl: number; // mg/dL
  triglycerides: number; // mg/dL
  unit: 'mg/dL' | 'mmol/L';
  date: string;
  notes?: string;
  labName?: string;
  source: 'manual' | 'lab';
  isSample?: boolean;
}

export interface WeightReading {
  id: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  date: string;
  time: string;
  notes?: string;
  source: 'manual' | 'scale';
  isSample?: boolean;
}

export interface LabResult {
  id: string;
  testName: string;
  resultValue: string;
  unit: string;
  referenceRange: string;
  date: string;
  status: 'normal' | 'high' | 'low' | 'pending';
  physician?: string;
  notes?: string;
  isSample?: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  purpose: string;
  startDate: string;
  reminderTime?: string;
  active: boolean;
  notes?: string;
  isSample?: boolean;
}

export interface MedicalCondition {
  id: string;
  name: string;
  diagnosedYear: string;
  status: 'active' | 'managed' | 'resolved';
  notes?: string;
  isSample?: boolean;
}

export interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  isSample?: boolean;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  notes?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  reminderSet: boolean;
  isSample?: boolean;
}

export interface HealthReminder {
  id: string;
  title: string;
  category: 'medication' | 'vitals' | 'activity' | 'water' | 'appointment';
  time: string; // HH:mm
  days: string[]; // ['Mon', 'Tue', ...] or ['Daily']
  enabled: boolean;
  lastDoneDate?: string;
  notes?: string;
}

export interface LifestyleFactors {
  sleepHoursPerNight: number; // e.g. 7.5
  officeWorkHoursPerDay: number; // e.g. 8
  leisureTimeHoursPerDay: number; // e.g. 2
  snackingHabits: 'rarely' | 'mindful_healthy' | 'occasional_evening' | 'frequent_processed';
  smokingStatus: 'never' | 'former' | 'occasional' | 'current';
  alcoholConsumption: 'none' | 'light_1_2_weekly' | 'moderate_3_7_weekly' | 'frequent_daily';
  stressLevel?: 'low' | 'moderate' | 'high';
  caffeineIntake?: 'none' | '1-2_cups' | '3+_cups';
  hydrationGlasses?: number;
  otherHabitsNotes?: string;
  lastUpdated?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: 'female' | 'male' | 'other' | 'prefer_not_to_say';
  heightCm: number;
  weightKg: number;
  unitSystem: 'metric' | 'imperial';
  glucoseUnit: 'mg/dL' | 'mmol/L';
  cholesterolUnit: 'mg/dL' | 'mmol/L';
  dailyCalorieTarget: number;
  dailyStepTarget: number;
  dailyWaterTargetMl: number;
  dailyActiveMinutesTarget: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  primaryPhysician?: string;
  bloodType?: string;
  lifestyle?: LifestyleFactors;
}

export interface HealthInsight {
  category: string;
  observation: string;
  actionableTip: string;
  type: 'positive' | 'attention' | 'info';
}

export interface PersonalizedReport {
  headline: string;
  statusLevel: 'positive' | 'attention' | 'neutral';
  insights: HealthInsight[];
  weeklyAchievements: string[];
  areasToImprove: string[];
  clinicalDisclaimer: string;
  lastGenerated: string;
}
