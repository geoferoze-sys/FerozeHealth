/**
 * Clinical reference thresholds and unit converters based on:
 * - AHA / ACC 2017 Guidelines for High Blood Pressure in Adults
 * - ADA 2024 Standards of Care in Diabetes
 * - NCEP ATP III Adult Treatment Panel Guidelines for Cholesterol
 * - WHO Adult BMI Classifications
 */

export interface BloodPressureCategory {
  label: string;
  badgeColor: string; // Tailwind color classes
  description: string;
  urgency: 'normal' | 'caution' | 'warning' | 'alert' | 'emergency';
  clinicalGuidance: string;
}

export function classifyBloodPressure(systolic: number, diastolic: number): BloodPressureCategory {
  if (systolic > 180 || diastolic > 120) {
    return {
      label: 'Hypertensive Crisis',
      badgeColor: 'text-rose-700 bg-rose-50 border border-rose-200',
      description: 'Critical elevation requiring immediate attention',
      urgency: 'emergency',
      clinicalGuidance: 'Wait 5 minutes and test again. If readings stay above 180 and/or 120 mmHg, or if experiencing chest pain, shortness of breath, or numbness, seek emergency medical care immediately.'
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      label: 'Stage 2 Hypertension',
      badgeColor: 'text-orange-700 bg-orange-50 border border-orange-200',
      description: 'Significantly elevated blood pressure',
      urgency: 'alert',
      clinicalGuidance: 'Consistent readings in this stage warrant evaluation with your healthcare provider for lifestyle interventions and potential medication management.'
    };
  }
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      label: 'Stage 1 Hypertension',
      badgeColor: 'text-amber-700 bg-amber-50 border border-amber-200',
      description: 'Mildly elevated blood pressure',
      urgency: 'warning',
      clinicalGuidance: 'Adopting a heart-healthy diet (such as DASH), reducing dietary sodium, and increasing regular aerobic walking can help return pressure toward target.'
    };
  }
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      label: 'Elevated Pressure',
      badgeColor: 'text-blue-700 bg-blue-50 border border-blue-200',
      description: 'Slightly above optimal baseline',
      urgency: 'caution',
      clinicalGuidance: 'Systolic pressure is slightly higher than ideal. Focus on routine physical activity and stress management to prevent progression.'
    };
  }
  if (systolic < 90 || diastolic < 60) {
    return {
      label: 'Low Blood Pressure (Hypotension)',
      badgeColor: 'text-indigo-700 bg-indigo-50 border border-indigo-200',
      description: 'Below typical baseline',
      urgency: 'caution',
      clinicalGuidance: 'If accompanied by dizziness, lightheadedness, or fatigue, sit down, drink fluids, and discuss with your clinician.'
    };
  }
  return {
    label: 'Normal / Optimal',
    badgeColor: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    description: 'Within ideal cardiovascular benchmark',
    urgency: 'normal',
    clinicalGuidance: 'Excellent reading! Continue your balanced nutrition, regular exercise, and restorative sleep habits.'
  };
}

// Glucose unit conversions: 1 mmol/L = 18.018 mg/dL
export function mgdlToMmol(mgdl: number): number {
  return parseFloat((mgdl / 18.018).toFixed(1));
}

export function mmolToMgdl(mmol: number): number {
  return Math.round(mmol * 18.018);
}

export interface GlucoseCategory {
  label: string;
  badgeColor: string;
  clinicalGuidance: string;
}

export function classifyBloodGlucose(
  valueMgdl: number,
  timing: 'fasting' | 'before_meal' | 'after_meal' | 'bedtime' | 'random'
): GlucoseCategory {
  if (valueMgdl < 70) {
    return {
      label: 'Hypoglycemia (Low)',
      badgeColor: 'text-rose-700 bg-rose-50 border border-rose-200',
      clinicalGuidance: 'Blood glucose is low. Follow the clinical "Rule of 15": consume 15 grams of fast-acting carbs (e.g. 4 oz juice or 3-4 glucose tabs) and re-check in 15 minutes.'
    };
  }

  if (timing === 'fasting' || timing === 'before_meal') {
    if (valueMgdl <= 99) {
      return {
        label: 'Normal Fasting',
        badgeColor: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
        clinicalGuidance: 'Optimal fasting glucose reading according to standard ADA guidelines (70–99 mg/dL).'
      };
    }
    if (valueMgdl <= 125) {
      return {
        label: 'Elevated / Impaired Fasting',
        badgeColor: 'text-amber-700 bg-amber-50 border border-amber-200',
        clinicalGuidance: 'Fasting glucose is mildly elevated (100–125 mg/dL). Discuss proactive dietary fiber and activity strategies with your doctor.'
      };
    }
    return {
      label: 'High Fasting',
      badgeColor: 'text-rose-700 bg-rose-50 border border-rose-200',
      clinicalGuidance: 'Fasting glucose is above 126 mg/dL. Schedule a clinical review to test HbA1c and explore personalized management.'
    };
  }

  // Post-meal / random
  if (valueMgdl < 140) {
    return {
      label: 'Normal Post-Meal',
      badgeColor: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
      clinicalGuidance: 'Optimal 2-hour postprandial glucose (<140 mg/dL).'
    };
  }
  if (valueMgdl < 200) {
    return {
      label: 'Elevated Post-Meal',
      badgeColor: 'text-amber-700 bg-amber-50 border border-amber-200',
      clinicalGuidance: 'Post-meal glucose is moderately elevated (140–199 mg/dL). A post-meal 15-minute gentle walk assists glucose uptake.'
    };
  }
  return {
    label: 'High Glucose',
    badgeColor: 'text-rose-700 bg-rose-50 border border-rose-200',
    clinicalGuidance: 'Reading is ≥200 mg/dL. Monitor for symptoms like excessive thirst or fatigue, and notify your healthcare professional.'
  };
}

// Cholesterol classification (mg/dL)
export function classifyCholesterol(total: number, ldl: number, hdl: number, triglycerides: number) {
  const totalStatus = total < 200 ? 'Desirable (<200)' : total < 240 ? 'Borderline High (200-239)' : 'High (≥240)';
  const ldlStatus = ldl < 100 ? 'Optimal (<100)' : ldl < 130 ? 'Near Optimal (100-129)' : ldl < 160 ? 'Borderline High (130-159)' : 'High (≥160)';
  const hdlStatus = hdl >= 50 ? 'Protective / High (≥50)' : hdl >= 40 ? 'Acceptable (40-49)' : 'Low (<40)';
  const triStatus = triglycerides < 150 ? 'Normal (<150)' : triglycerides < 200 ? 'Borderline High (150-199)' : 'High (≥200)';
  const ratio = (total / (hdl || 1)).toFixed(1);

  return {
    totalStatus,
    ldlStatus,
    hdlStatus,
    triStatus,
    ratio,
    ratioNote: parseFloat(ratio) <= 4.0 ? 'Favorable total-to-HDL ratio (<4.0)' : 'Elevated total-to-HDL ratio',
  };
}

// BMI calculation
export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string; badgeColor: string } {
  if (!weightKg || !heightCm || heightCm <= 0) return { bmi: 0, category: 'Unknown', badgeColor: 'text-slate-600 bg-slate-100' };
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  if (bmi < 18.5) {
    return { bmi, category: 'Underweight', badgeColor: 'text-blue-700 bg-blue-50 border border-blue-200' };
  }
  if (bmi < 25.0) {
    return { bmi, category: 'Normal Weight', badgeColor: 'text-emerald-700 bg-emerald-50 border border-emerald-200' };
  }
  if (bmi < 30.0) {
    return { bmi, category: 'Overweight', badgeColor: 'text-amber-700 bg-amber-50 border border-amber-200' };
  }
  return { bmi, category: 'Obesity', badgeColor: 'text-rose-700 bg-rose-50 border border-rose-200' };
}

// MET values for estimating calories burned: Calories = MET * weightKg * (durationMinutes / 60)
export const EXERCISE_METS: Record<string, { label: string; met: number; icon: string }> = {
  walking: { label: 'Brisk Walking (5 km/h)', met: 3.5, icon: 'Footprints' },
  running: { label: 'Running / Jogging (8 km/h)', met: 8.3, icon: 'Zap' },
  cycling: { label: 'Cycling (Moderate, 16-19 km/h)', met: 6.8, icon: 'Bike' },
  swimming: { label: 'Swimming (Moderate laps)', met: 6.0, icon: 'Waves' },
  yoga: { label: 'Yoga / Hatha Stretch', met: 2.5, icon: 'Activity' },
  strength: { label: 'Strength / Resistance Training', met: 5.0, icon: 'Dumbbell' },
  hiit: { label: 'HIIT / High-Intensity Interval', met: 8.0, icon: 'Flame' },
  pilates: { label: 'Pilates / Core Conditioning', met: 3.8, icon: 'Sparkles' },
  other: { label: 'General Physical Activity', met: 4.0, icon: 'Clock' },
};

export function estimateCaloriesBurned(exerciseType: string, durationMinutes: number, userWeightKg: number = 70): number {
  const met = EXERCISE_METS[exerciseType]?.met || 3.5;
  const hours = durationMinutes / 60;
  return Math.round(met * userWeightKg * hours);
}
