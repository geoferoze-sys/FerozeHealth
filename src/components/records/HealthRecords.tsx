import React, { useState } from 'react';
import {
  BloodPressureReading,
  BloodGlucoseReading,
  CholesterolReading,
  WeightReading,
  LabResult,
  Medication,
  MedicalCondition,
  Allergy,
  Appointment,
  UserProfile,
} from '../../types/health';
import { HealthStorage } from '../../utils/storage';
import {
  classifyBloodPressure,
  classifyBloodGlucose,
  classifyCholesterol,
  calculateBMI,
  mgdlToMmol,
  mmolToMgdl,
} from '../../utils/healthCalculators';
import {
  Heart,
  Droplets,
  ShieldCheck,
  Scale,
  FileText,
  Pill,
  Calendar,
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  Stethoscope,
  Activity,
} from 'lucide-react';

interface HealthRecordsProps {
  profile: UserProfile;
  bpReadings: BloodPressureReading[];
  glucoseReadings: BloodGlucoseReading[];
  cholesterolReadings: CholesterolReading[];
  weightReadings: WeightReading[];
  labResults: LabResult[];
  medications: Medication[];
  conditions: MedicalCondition[];
  allergies: Allergy[];
  appointments: Appointment[];
  onRefresh: () => void;
  initialSubTab?: string;
}

type RecordSubTab =
  | 'bp'
  | 'glucose'
  | 'cholesterol'
  | 'weight'
  | 'labs'
  | 'meds'
  | 'appointments';

export const HealthRecords: React.FC<HealthRecordsProps> = ({
  profile,
  bpReadings,
  glucoseReadings,
  cholesterolReadings,
  weightReadings,
  labResults,
  medications,
  conditions,
  allergies,
  appointments,
  onRefresh,
  initialSubTab = 'bp',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<RecordSubTab>(
    (initialSubTab as RecordSubTab) || 'bp'
  );

  // Modal visibility
  const [showModal, setShowModal] = useState<RecordSubTab | null>(null);

  // Forms
  // 1. BP Form
  const [bpSystolic, setBpSystolic] = useState<number>(120);
  const [bpDiastolic, setBpDiastolic] = useState<number>(80);
  const [bpPulse, setBpPulse] = useState<number>(72);
  const [bpContext, setBpContext] = useState<any>('resting');
  const [bpNotes, setBpNotes] = useState('');

  // 2. Glucose Form
  const [gluValue, setGluValue] = useState<number>(95);
  const [gluUnit, setGluUnit] = useState<'mg/dL' | 'mmol/L'>(profile.glucoseUnit || 'mg/dL');
  const [gluTiming, setGluTiming] = useState<any>('fasting');
  const [gluNotes, setGluNotes] = useState('');

  // 3. Cholesterol Form
  const [cholTotal, setCholTotal] = useState<number>(190);
  const [cholLdl, setCholLdl] = useState<number>(100);
  const [cholHdl, setCholHdl] = useState<number>(55);
  const [cholTri, setCholTri] = useState<number>(130);
  const [cholLab, setCholLab] = useState('Diagnostic Lab');
  const [cholNotes, setCholNotes] = useState('');

  // 4. Weight Form
  const [wtWeight, setWtWeight] = useState<number>(profile.weightKg || 70);
  const [wtHeight, setWtHeight] = useState<number>(profile.heightCm || 175);
  const [wtNotes, setWtNotes] = useState('');

  // 5. Lab Form
  const [labName, setLabName] = useState('Comprehensive Metabolic Panel');
  const [labValue, setLabValue] = useState('Normal');
  const [labUnit, setLabUnit] = useState('');
  const [labRef, setLabRef] = useState('Standard range');
  const [labStatus, setLabStatus] = useState<any>('normal');
  const [labDoctor, setLabDoctor] = useState(profile.primaryPhysician || '');
  const [labNotes, setLabNotes] = useState('');

  // 6. Medication / Condition Form
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFreq, setMedFreq] = useState('Once daily');
  const [medPurpose, setMedPurpose] = useState('');
  const [medReminder, setMedReminder] = useState('08:00');

  // 7. Appointment Form
  const [aptDoctor, setAptDoctor] = useState('Dr. Smith, MD');
  const [aptSpecialty, setAptSpecialty] = useState('Cardiology');
  const [aptClinic, setAptClinic] = useState('Downtown Health Clinic');
  const [aptDate, setAptDate] = useState(new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]);
  const [aptTime, setAptTime] = useState('10:00');
  const [aptNotes, setAptNotes] = useState('Follow-up review');

  // Generic record date/time
  const todayStr = new Date().toISOString().split('T')[0];
  const timeNow = new Date().toTimeString().slice(0, 5);

  // Form Submissions
  const handleSaveBp = (e: React.FormEvent) => {
    e.preventDefault();
    const reading: BloodPressureReading = {
      id: `bp-${Date.now()}`,
      systolic: Number(bpSystolic),
      diastolic: Number(bpDiastolic),
      pulse: bpPulse ? Number(bpPulse) : undefined,
      date: todayStr,
      time: timeNow,
      context: bpContext,
      notes: bpNotes.trim() || undefined,
      source: 'manual',
    };
    HealthStorage.addBpReading(reading);
    setShowModal(null);
    onRefresh();
  };

  const handleSaveGlucose = (e: React.FormEvent) => {
    e.preventDefault();
    // store normalized mg/dL if unit is mmol/L
    const normalizedValue = gluUnit === 'mmol/L' ? mmolToMgdl(gluValue) : Number(gluValue);
    const reading: BloodGlucoseReading = {
      id: `glu-${Date.now()}`,
      value: normalizedValue,
      unit: gluUnit,
      timing: gluTiming,
      date: todayStr,
      time: timeNow,
      notes: gluNotes.trim() || undefined,
      source: 'manual',
    };
    HealthStorage.addGlucoseReading(reading);
    setShowModal(null);
    onRefresh();
  };

  const handleSaveCholesterol = (e: React.FormEvent) => {
    e.preventDefault();
    const reading: CholesterolReading = {
      id: `chol-${Date.now()}`,
      total: Number(cholTotal),
      ldl: Number(cholLdl),
      hdl: Number(cholHdl),
      triglycerides: Number(cholTri),
      unit: 'mg/dL',
      date: todayStr,
      labName: cholLab.trim() || undefined,
      notes: cholNotes.trim() || undefined,
      source: 'lab',
    };
    HealthStorage.addCholesterolReading(reading);
    setShowModal(null);
    onRefresh();
  };

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const bmiVal = calculateBMI(Number(wtWeight), Number(wtHeight)).bmi;
    const reading: WeightReading = {
      id: `wt-${Date.now()}`,
      weightKg: Number(wtWeight),
      heightCm: Number(wtHeight),
      bmi: bmiVal,
      date: todayStr,
      time: timeNow,
      notes: wtNotes.trim() || undefined,
      source: 'scale',
    };
    HealthStorage.addWeightReading(reading);
    // also update profile current weight
    HealthStorage.setProfile({ ...profile, weightKg: Number(wtWeight), heightCm: Number(wtHeight) });
    setShowModal(null);
    onRefresh();
  };

  const handleSaveLab = (e: React.FormEvent) => {
    e.preventDefault();
    const lab: LabResult = {
      id: `lab-${Date.now()}`,
      testName: labName.trim(),
      resultValue: labValue.trim(),
      unit: labUnit.trim(),
      referenceRange: labRef.trim(),
      status: labStatus,
      date: todayStr,
      physician: labDoctor.trim() || undefined,
      notes: labNotes.trim() || undefined,
    };
    HealthStorage.addLabResult(lab);
    setShowModal(null);
    onRefresh();
  };

  const handleSaveMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;
    const med: Medication = {
      id: `med-${Date.now()}`,
      name: medName.trim(),
      dosage: medDosage.trim(),
      frequency: medFreq.trim(),
      purpose: medPurpose.trim(),
      startDate: todayStr,
      reminderTime: medReminder || undefined,
      active: true,
    };
    HealthStorage.addMedication(med);
    setShowModal(null);
    onRefresh();
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const apt: Appointment = {
      id: `apt-${Date.now()}`,
      doctorName: aptDoctor.trim(),
      specialty: aptSpecialty.trim(),
      clinic: aptClinic.trim(),
      date: aptDate,
      time: aptTime,
      notes: aptNotes.trim() || undefined,
      status: 'upcoming',
      reminderSet: true,
    };
    HealthStorage.addAppointment(apt);
    setShowModal(null);
    onRefresh();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
              Clinical Vitals & Medical Records
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">Longitudinal History</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Health Measurements & Medical File
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Record blood pressure, glucose, lipids, body metrics, laboratory checkups, active medications, and upcoming clinic appointments.
          </p>
        </div>

        <button
          onClick={() => setShowModal(activeSubTab)}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span>New Record</span>
        </button>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
        {[
          { id: 'bp', label: 'Blood Pressure', icon: Heart },
          { id: 'glucose', label: 'Blood Glucose', icon: Droplets },
          { id: 'cholesterol', label: 'Lipid Panel', icon: ShieldCheck },
          { id: 'weight', label: 'Weight & BMI', icon: Scale },
          { id: 'labs', label: 'Lab Reports', icon: FileText },
          { id: 'meds', label: 'Medications', icon: Pill },
          { id: 'appointments', label: 'Doctor Visits', icon: Calendar },
        ].map((sub) => {
          const Icon = sub.icon;
          const isActive = activeSubTab === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id as RecordSubTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-rose-50 text-rose-800 shadow-xs border border-rose-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-600' : 'text-slate-400'}`} />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Blood Pressure Section */}
      {activeSubTab === 'bp' && (
        <div className="space-y-4">
          {/* Clinical Benchmark Guidelines Banner */}
          <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-orange-50 rounded-3xl p-4 border border-rose-200/70 text-xs">
            <div className="flex items-center gap-2 font-bold text-rose-900 mb-1">
              <Heart className="w-4 h-4 text-rose-600" />
              <span>AHA / ACC Blood Pressure Classification Standard</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-[11px]">
              <div className="p-2 bg-white/80 rounded-xl border border-emerald-200">
                <span className="font-bold text-emerald-800 block">Normal</span>
                <span className="text-slate-600">&lt; 120 and &lt; 80 mmHg</span>
              </div>
              <div className="p-2 bg-white/80 rounded-xl border border-blue-200">
                <span className="font-bold text-blue-800 block">Elevated</span>
                <span className="text-slate-600">120–129 and &lt; 80 mmHg</span>
              </div>
              <div className="p-2 bg-white/80 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-800 block">Stage 1 HTN</span>
                <span className="text-slate-600">130–139 or 80–89 mmHg</span>
              </div>
              <div className="p-2 bg-white/80 rounded-xl border border-rose-200">
                <span className="font-bold text-rose-800 block">Stage 2 HTN</span>
                <span className="text-slate-600">≥ 140 or ≥ 90 mmHg</span>
              </div>
            </div>
          </div>

          {/* History List */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Blood Pressure Measurement History</h3>
              <span className="text-xs text-slate-400">({bpReadings.length} readings)</span>
            </div>

            {bpReadings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No blood pressure measurements recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {bpReadings.map((reading) => {
                  const category = classifyBloodPressure(reading.systolic, reading.diastolic);
                  return (
                    <div
                      key={reading.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-2xl px-2 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                          <Heart className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-extrabold text-slate-900">
                              {reading.systolic} / {reading.diastolic}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">mmHg</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${category.badgeColor}`}>
                              {category.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="font-medium text-slate-700 capitalize">{reading.context}</span>
                            <span>·</span>
                            <span>{reading.date} at {reading.time}</span>
                            {reading.pulse ? (
                              <>
                                <span>·</span>
                                <span>Pulse: {reading.pulse} bpm</span>
                              </>
                            ) : null}
                            <span>·</span>
                            <span className="capitalize">Source: {reading.source}</span>
                          </div>

                          {reading.notes && (
                            <p className="text-xs text-slate-600 mt-1 italic">{reading.notes}</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          HealthStorage.deleteBpReading(reading.id);
                          onRefresh();
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer self-end sm:self-center"
                        title="Delete reading"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Blood Glucose Section */}
      {activeSubTab === 'glucose' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-blue-50 rounded-3xl p-4 border border-indigo-200/70 text-xs">
            <div className="flex items-center gap-2 font-bold text-indigo-900 mb-1">
              <Droplets className="w-4 h-4 text-indigo-600" />
              <span>ADA Blood Glucose Diagnostic Benchmarks</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-[11px]">
              <div className="p-2 bg-white/80 rounded-xl border border-emerald-200">
                <span className="font-bold text-emerald-800 block">Normal Fasting</span>
                <span className="text-slate-600">70 – 99 mg/dL (3.9 – 5.5 mmol/L)</span>
              </div>
              <div className="p-2 bg-white/80 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-800 block">Impaired Fasting</span>
                <span className="text-slate-600">100 – 125 mg/dL (5.6 – 6.9 mmol/L)</span>
              </div>
              <div className="p-2 bg-white/80 rounded-xl border border-rose-200">
                <span className="font-bold text-rose-800 block">High / Diabetes Threshold</span>
                <span className="text-slate-600">≥ 126 mg/dL Fasting (≥ 7.0 mmol/L)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Blood Glucose History</h3>
              <span className="text-xs text-slate-400">({glucoseReadings.length} readings)</span>
            </div>

            {glucoseReadings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No blood glucose measurements recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {glucoseReadings.map((reading) => {
                  const category = classifyBloodGlucose(reading.value, reading.timing);
                  const displayVal =
                    profile.glucoseUnit === 'mmol/L'
                      ? mgdlToMmol(reading.value)
                      : reading.value;

                  return (
                    <div
                      key={reading.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-2xl px-2 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <Droplets className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-extrabold text-slate-900">
                              {displayVal}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">
                              {profile.glucoseUnit}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${category.badgeColor}`}>
                              {category.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="font-medium text-slate-700 capitalize">
                              {reading.timing.replace('_', ' ')}
                            </span>
                            <span>·</span>
                            <span>{reading.date} at {reading.time}</span>
                            <span>·</span>
                            <span className="capitalize">Source: {reading.source}</span>
                          </div>

                          {reading.notes && (
                            <p className="text-xs text-slate-600 mt-1 italic">{reading.notes}</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          HealthStorage.deleteGlucoseReading(reading.id);
                          onRefresh();
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer self-end sm:self-center"
                        title="Delete reading"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Cholesterol & Lipid Profile */}
      {activeSubTab === 'cholesterol' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Lipid Profile & Cholesterol Panels</h3>
              <span className="text-xs text-slate-400">({cholesterolReadings.length} records)</span>
            </div>

            {cholesterolReadings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No cholesterol panels logged.
              </div>
            ) : (
              <div className="space-y-4">
                {cholesterolReadings.map((reading) => {
                  const classification = classifyCholesterol(
                    reading.total,
                    reading.ldl,
                    reading.hdl,
                    reading.triglycerides
                  );
                  return (
                    <div
                      key={reading.id}
                      className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-emerald-200 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-xs font-bold text-slate-900">
                            {reading.labName || 'Standard Lipid Panel'}
                          </span>
                          <span className="text-xs text-slate-400 block">{reading.date}</span>
                        </div>
                        <button
                          onClick={() => {
                            HealthStorage.deleteCholesterolReading(reading.id);
                            onRefresh();
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/60">
                          <span className="text-[11px] text-slate-500 block">Total Cholesterol</span>
                          <span className="text-lg font-extrabold text-slate-900">{reading.total} mg/dL</span>
                          <span className="text-[10px] text-slate-600 block mt-0.5">{classification.totalStatus}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/60">
                          <span className="text-[11px] text-slate-500 block">LDL (Bad)</span>
                          <span className="text-lg font-extrabold text-rose-600">{reading.ldl} mg/dL</span>
                          <span className="text-[10px] text-slate-600 block mt-0.5">{classification.ldlStatus}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/60">
                          <span className="text-[11px] text-slate-500 block">HDL (Good)</span>
                          <span className="text-lg font-extrabold text-emerald-600">{reading.hdl} mg/dL</span>
                          <span className="text-[10px] text-slate-600 block mt-0.5">{classification.hdlStatus}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/60">
                          <span className="text-[11px] text-slate-500 block">Triglycerides</span>
                          <span className="text-lg font-extrabold text-slate-900">{reading.triglycerides} mg/dL</span>
                          <span className="text-[10px] text-slate-600 block mt-0.5">{classification.triStatus}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                        <span>Total/HDL Ratio: <strong>{classification.ratio}</strong> ({classification.ratioNote})</span>
                        {reading.notes && <span className="italic text-slate-500">{reading.notes}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Weight & BMI Section */}
      {activeSubTab === 'weight' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Body Weight & BMI History</h3>
              <span className="text-xs text-slate-400">({weightReadings.length} entries)</span>
            </div>

            {weightReadings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No weight readings recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {weightReadings.map((w) => {
                  const bmiInfo = calculateBMI(w.weightKg, w.heightCm);
                  return (
                    <div
                      key={w.id}
                      className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 rounded-2xl px-2 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                          <Scale className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-extrabold text-slate-900">{w.weightKg} kg</span>
                            <span className="text-xs text-slate-500">· BMI {bmiInfo.bmi}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${bmiInfo.badgeColor}`}>
                              {bmiInfo.category}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">{w.date} at {w.time} · Height {w.heightCm} cm</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          HealthStorage.deleteWeightReading(w.id);
                          onRefresh();
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Medical Check-ups & Lab Results */}
      {activeSubTab === 'labs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Laboratory Diagnostic Results</h3>
              <span className="text-xs text-slate-400">({labResults.length} reports)</span>
            </div>

            {labResults.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No laboratory results recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {labResults.map((lab) => (
                  <div
                    key={lab.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-2xl px-2 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{lab.testName}</h4>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase ${
                            lab.status === 'normal'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {lab.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-extrabold text-slate-900">
                          {lab.resultValue} {lab.unit}
                        </span>
                        <span>· Reference: {lab.referenceRange}</span>
                        <span>· {lab.date}</span>
                        {lab.physician && <span>· Ordered by {lab.physician}</span>}
                      </div>
                      {lab.notes && <p className="text-xs text-slate-600 mt-1 italic">{lab.notes}</p>}
                    </div>

                    <button
                      onClick={() => {
                        HealthStorage.deleteLabResult(lab.id);
                        onRefresh();
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer self-end sm:self-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Medications & Medical Conditions */}
      {activeSubTab === 'meds' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Medications */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span>Current Medications & Supplements</span>
                </h3>
                <span className="text-xs text-slate-400">({medications.length})</span>
              </div>

              <div className="divide-y divide-slate-100">
                {medications.map((med) => (
                  <div key={med.id} className="py-3 flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{med.name}</h4>
                      <span className="text-xs font-semibold text-emerald-800">{med.dosage}</span>
                      <span className="text-xs text-slate-500 block">Frequency: {med.frequency}</span>
                      <span className="text-[11px] text-slate-400 block">Indication: {med.purpose}</span>
                    </div>
                    <button
                      onClick={() => {
                        HealthStorage.deleteMedication(med.id);
                        onRefresh();
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Conditions & Allergies */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span>Medical Conditions History</span>
                </h3>
                <div className="space-y-2">
                  {conditions.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{c.name}</span>
                        <span className="text-[11px] text-slate-500">Diagnosed {c.diagnosedYear} · {c.status}</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 capitalize">
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3 text-rose-700">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Known Allergies & Adverse Reactions</span>
                </h3>
                <div className="space-y-2">
                  {allergies.map((a) => (
                    <div key={a.id} className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-rose-950 block">{a.allergen}</span>
                        <span className="text-[11px] text-rose-700">Reaction: {a.reaction}</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-200/80 text-rose-900 capitalize">
                        {a.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Doctor Visits & Appointments */}
      {activeSubTab === 'appointments' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Doctor Visits & Upcoming Appointments</h3>
              <span className="text-xs text-slate-400">({appointments.length} recorded)</span>
            </div>

            {appointments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No clinic appointments recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-2xl px-2 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{apt.doctorName}</h4>
                          <span className="text-xs text-slate-500">({apt.specialty})</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 capitalize">
                            {apt.status}
                          </span>
                        </div>
                        <span className="text-xs text-slate-600 block mt-0.5">
                          {apt.clinic} · {apt.date} at {apt.time}
                        </span>
                        {apt.notes && <p className="text-xs text-slate-500 mt-1 italic">{apt.notes}</p>}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        HealthStorage.deleteAppointment(apt.id);
                        onRefresh();
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer self-end sm:self-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. BP Modal */}
      {showModal === 'bp' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-base">Log Blood Pressure</h3>
              </div>
              <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Systolic (mmHg) *</label>
                  <input
                    type="number"
                    min="60"
                    max="260"
                    required
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Diastolic (mmHg) *</label>
                  <input
                    type="number"
                    min="40"
                    max="160"
                    required
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pulse / Heart Rate (bpm)</label>
                <input
                  type="number"
                  min="30"
                  max="220"
                  value={bpPulse}
                  onChange={(e) => setBpPulse(Number(e.target.value))}
                  placeholder="e.g. 72"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Context / Timing</label>
                <select
                  value={bpContext}
                  onChange={(e) => setBpContext(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="morning">Morning (Waking)</option>
                  <option value="resting">Resting (Midday)</option>
                  <option value="evening">Evening (Bedtime)</option>
                  <option value="post-exercise">Post-Exercise</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={bpNotes}
                  onChange={(e) => setBpNotes(e.target.value)}
                  placeholder="e.g. Seated 5 mins, quiet room"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Glucose Modal */}
      {showModal === 'glucose' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Log Blood Glucose</h3>
              </div>
              <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGlucose} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Reading *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="600"
                    required
                    value={gluValue}
                    onChange={(e) => setGluValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Unit</label>
                  <select
                    value={gluUnit}
                    onChange={(e) => setGluUnit(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="mg/dL">mg/dL</option>
                    <option value="mmol/L">mmol/L</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Measurement Timing</label>
                <select
                  value={gluTiming}
                  onChange={(e) => setGluTiming(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="fasting">Fasting (Morning Before Food)</option>
                  <option value="before_meal">Before Meal</option>
                  <option value="after_meal">2 Hours Post-Meal</option>
                  <option value="bedtime">Bedtime</option>
                  <option value="random">Random / As-Needed</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={gluNotes}
                  onChange={(e) => setGluNotes(e.target.value)}
                  placeholder="e.g. 2 hrs after oatmeal lunch"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Cholesterol Modal */}
      {showModal === 'cholesterol' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Record Lipid Panel</h3>
              </div>
              <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCholesterol} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Total (mg/dL)</label>
                  <input
                    type="number"
                    required
                    value={cholTotal}
                    onChange={(e) => setCholTotal(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">LDL (Bad)</label>
                  <input
                    type="number"
                    required
                    value={cholLdl}
                    onChange={(e) => setCholLdl(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">HDL (Good)</label>
                  <input
                    type="number"
                    required
                    value={cholHdl}
                    onChange={(e) => setCholHdl(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Triglycerides</label>
                  <input
                    type="number"
                    required
                    value={cholTri}
                    onChange={(e) => setCholTri(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Lab / Provider Name</label>
                <input
                  type="text"
                  value={cholLab}
                  onChange={(e) => setCholLab(e.target.value)}
                  placeholder="e.g. Quest Diagnostics"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Panel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Weight Modal */}
      {showModal === 'weight' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">Record Weight & BMI</h3>
              </div>
              <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWeight} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={wtWeight}
                  onChange={(e) => setWtWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Height (cm) *</label>
                <input
                  type="number"
                  required
                  value={wtHeight}
                  onChange={(e) => setWtHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Weight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Labs Modal */}
      {showModal === 'labs' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">Record Lab Test</h3>
              </div>
              <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLab} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Test Name *</label>
                <input
                  type="text"
                  required
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  placeholder="e.g. Hemoglobin A1c, Vitamin D"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Result Value *</label>
                  <input
                    type="text"
                    required
                    value={labValue}
                    onChange={(e) => setLabValue(e.target.value)}
                    placeholder="e.g. 5.3"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={labUnit}
                    onChange={(e) => setLabUnit(e.target.value)}
                    placeholder="e.g. %, ng/mL"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Clinical Status</label>
                <select
                  value={labStatus}
                  onChange={(e) => setLabStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Lab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Medication Modal */}
      {showModal === 'meds' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Add Medication</h3>
              </div>
              <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMedication} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Medication Name *</label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Omega-3 Fish Oil, Metformin"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Dosage</label>
                  <input
                    type="text"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    placeholder="e.g. 1000mg, 1 tablet"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Frequency</label>
                  <input
                    type="text"
                    value={medFreq}
                    onChange={(e) => setMedFreq(e.target.value)}
                    placeholder="e.g. Once daily"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Indication / Purpose</label>
                <input
                  type="text"
                  value={medPurpose}
                  onChange={(e) => setMedPurpose(e.target.value)}
                  placeholder="e.g. Blood pressure support, cholesterol"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Add Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Appointment Modal */}
      {showModal === 'appointments' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Schedule Doctor Visit</h3>
              </div>
              <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAppointment} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Physician Name *</label>
                <input
                  type="text"
                  required
                  value={aptDoctor}
                  onChange={(e) => setAptDoctor(e.target.value)}
                  placeholder="e.g. Dr. Vance, MD"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Specialty</label>
                  <input
                    type="text"
                    value={aptSpecialty}
                    onChange={(e) => setAptSpecialty(e.target.value)}
                    placeholder="e.g. Primary Care"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Clinic</label>
                  <input
                    type="text"
                    value={aptClinic}
                    onChange={(e) => setAptClinic(e.target.value)}
                    placeholder="e.g. City Health"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={aptDate}
                    onChange={(e) => setAptDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={aptTime}
                    onChange={(e) => setAptTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
