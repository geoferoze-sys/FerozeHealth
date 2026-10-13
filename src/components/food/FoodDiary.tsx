import React, { useState, useRef } from 'react';
import { FoodEntry, MealCategory } from '../../types/health';
import { HealthStorage } from '../../utils/storage';
import {
  Camera,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Info,
  Calendar,
  Clock,
  Check,
  X,
  AlertTriangle,
  ChevronRight,
  Flame,
  PieChart,
} from 'lucide-react';

interface FoodDiaryProps {
  entries: FoodEntry[];
  dailyCalorieTarget: number;
  onRefresh: () => void;
  openAddModalInitially?: boolean;
}

// Preset meal sample images with clean realistic food base64 / illustrations
const SAMPLE_MEAL_PRESETS = [
  {
    name: 'Avocado Salmon Quinoa Bowl',
    category: 'lunch' as MealCategory,
    calories: 520,
    carbs: 45,
    protein: 36,
    fat: 20,
    saturatedFat: 3.2,
    fiber: 8,
    sodium: 430,
    servingSize: '1 bowl (400g)',
    emoji: '🥗',
    description: 'Fresh grilled salmon fillet over red quinoa, sliced Haas avocado, and cherry tomatoes.',
  },
  {
    name: 'Greek Yogurt with Wild Berries & Honey',
    category: 'breakfast' as MealCategory,
    calories: 280,
    carbs: 32,
    protein: 22,
    fat: 6,
    saturatedFat: 1.5,
    fiber: 5,
    sodium: 80,
    servingSize: '1 cup (220g)',
    emoji: '🫐',
    description: 'Creamy high-protein Greek yogurt with organic blueberries, raspberries, and crushed walnuts.',
  },
  {
    name: 'Rosemary Roasted Chicken & Asparagus',
    category: 'dinner' as MealCategory,
    calories: 460,
    carbs: 12,
    protein: 48,
    fat: 16,
    saturatedFat: 3.5,
    fiber: 6,
    sodium: 480,
    servingSize: '1 plate (380g)',
    emoji: '🍗',
    description: 'Pan-seared herb chicken breast alongside oven-roasted tender green asparagus in olive oil.',
  },
  {
    name: 'Mediterranean Hummus & Whole Grain Pita',
    category: 'snack' as MealCategory,
    calories: 240,
    carbs: 34,
    protein: 9,
    fat: 8,
    saturatedFat: 1.1,
    fiber: 6,
    sodium: 360,
    servingSize: '4 tbsp hummus + 1 pita',
    emoji: '🥙',
    description: 'Tahini-blended chickpea hummus garnished with paprika and accompanied by warm pita wedges.',
  },
];

export const FoodDiary: React.FC<FoodDiaryProps> = ({
  entries,
  dailyCalorieTarget,
  onRefresh,
  openAddModalInitially = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(openAddModalInitially);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Form states for adding or editing
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState<MealCategory>('lunch');
  const [servingSize, setServingSize] = useState('1 serving');
  const [calories, setCalories] = useState<number>(400);
  const [carbs, setCarbs] = useState<number>(45);
  const [protein, setProtein] = useState<number>(25);
  const [fat, setFat] = useState<number>(14);
  const [saturatedFat, setSaturatedFat] = useState<number>(2.5);
  const [fiber, setFiber] = useState<number>(6);
  const [sodium, setSodium] = useState<number>(420);
  const [notes, setNotes] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isAiEstimated, setIsAiEstimated] = useState(false);
  const [aiTips, setAiTips] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Filter entries for selected date
  const filteredEntries = entries.filter((e) => {
    const matchesDate = e.date === selectedDate;
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesDate && matchesCategory;
  });

  // Calculate day totals
  const dayEntries = entries.filter((e) => e.date === selectedDate);
  const totalCals = dayEntries.reduce((sum, e) => sum + e.calories, 0);
  const totalCarbs = dayEntries.reduce((sum, e) => sum + e.carbs, 0);
  const totalProtein = dayEntries.reduce((sum, e) => sum + e.protein, 0);
  const totalFat = dayEntries.reduce((sum, e) => sum + e.fat, 0);
  const totalSatFat = dayEntries.reduce((sum, e) => sum + (e.saturatedFat || 0), 0);
  const totalFiber = dayEntries.reduce((sum, e) => sum + (e.fiber || 0), 0);
  const totalSodium = dayEntries.reduce((sum, e) => sum + (e.sodium || 0), 0);

  // Reset modal state
  const resetForm = () => {
    setEditingEntryId(null);
    setFoodName('');
    setCategory('lunch');
    setServingSize('1 portion');
    setCalories(400);
    setCarbs(40);
    setProtein(25);
    setFat(12);
    setSaturatedFat(2);
    setFiber(5);
    setSodium(400);
    setNotes('');
    setPreviewImage(null);
    setIsAiEstimated(false);
    setAiTips([]);
    setAnalysisError(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditEntry = (entry: FoodEntry) => {
    setEditingEntryId(entry.id);
    setFoodName(entry.name);
    setCategory(entry.category);
    setServingSize(entry.servingSize);
    setCalories(entry.calories);
    setCarbs(entry.carbs);
    setProtein(entry.protein);
    setFat(entry.fat);
    setSaturatedFat(entry.saturatedFat || 0);
    setFiber(entry.fiber || 0);
    setSodium(entry.sodium || 0);
    setNotes(entry.notes || '');
    setPreviewImage(entry.imageUrl || null);
    setIsAiEstimated(!!entry.isAiEstimated);
    setShowAddModal(true);
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('Delete this food log entry?')) {
      HealthStorage.deleteFoodEntry(id);
      onRefresh();
    }
  };

  // Process uploaded or captured image
  const handleImageFile = async (file: File) => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        setPreviewImage(base64Data);

        try {
          const res = await fetch('/api/analyze-food', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type || 'image/jpeg',
            }),
          });

          if (!res.ok) {
            throw new Error(`Server returned status ${res.status}`);
          }

          const data = await res.json();
          setFoodName(data.foodName || 'Identified Dish');
          setCategory((data.mealCategory as MealCategory) || 'lunch');
          setServingSize(data.servingSize || '1 portion');
          setCalories(Number(data.calories) || 450);
          setCarbs(Number(data.carbs) || 35);
          setProtein(Number(data.protein) || 30);
          setFat(Number(data.fat) || 18);
          setSaturatedFat(Number(data.saturatedFat) || 3);
          setFiber(Number(data.fiber) || 6);
          setSodium(Number(data.sodium) || 450);
          setNotes(data.description || '');
          setIsAiEstimated(true);
          setAiTips(data.healthTips || []);
        } catch (err: any) {
          console.error('AI food analysis error:', err);
          setAnalysisError('AI recognition could not connect to server. You can enter details manually.');
          setFoodName('Custom Meal');
          setIsAiEstimated(false);
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsAnalyzing(false);
      setAnalysisError('Failed to read image file.');
    }
  };

  // Use a preset sample meal
  const handleSelectPreset = (preset: (typeof SAMPLE_MEAL_PRESETS)[0]) => {
    setFoodName(preset.name);
    setCategory(preset.category);
    setServingSize(preset.servingSize);
    setCalories(preset.calories);
    setCarbs(preset.carbs);
    setProtein(preset.protein);
    setFat(preset.fat);
    setSaturatedFat(preset.saturatedFat);
    setFiber(preset.fiber);
    setSodium(preset.sodium);
    setNotes(preset.description);
    setIsAiEstimated(true);
    setAiTips([
      'Rich in essential micronutrients and lean proteins',
      'Balanced glycemic impact supporting sustained energy',
    ]);
    setShowAddModal(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    const timeNow = new Date().toTimeString().slice(0, 5);

    if (editingEntryId) {
      const updated: FoodEntry = {
        id: editingEntryId,
        name: foodName,
        category,
        servingSize,
        calories: Number(calories) || 0,
        carbs: Number(carbs) || 0,
        protein: Number(protein) || 0,
        fat: Number(fat) || 0,
        saturatedFat: Number(saturatedFat) || 0,
        fiber: Number(fiber) || 0,
        sodium: Number(sodium) || 0,
        date: selectedDate,
        time: timeNow,
        imageUrl: previewImage || undefined,
        notes: notes.trim() || undefined,
        isAiEstimated,
      };
      HealthStorage.updateFoodEntry(updated);
    } else {
      const newEntry: FoodEntry = {
        id: `food-${Date.now()}`,
        name: foodName,
        category,
        servingSize,
        calories: Number(calories) || 0,
        carbs: Number(carbs) || 0,
        protein: Number(protein) || 0,
        fat: Number(fat) || 0,
        saturatedFat: Number(saturatedFat) || 0,
        fiber: Number(fiber) || 0,
        sodium: Number(sodium) || 0,
        date: selectedDate,
        time: timeNow,
        imageUrl: previewImage || undefined,
        notes: notes.trim() || undefined,
        isAiEstimated,
      };
      HealthStorage.addFoodEntry(newEntry);
    }

    setShowAddModal(false);
    resetForm();
    onRefresh();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Title & Quick Add Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
              AI Food Diary
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">Gemini Vision Nutritionist</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Meal Photography & Nutrition Diary
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Photograph your meal or upload an image. AI recognizes likely foods, portion sizes, calories, and macros for easy editing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Camera Button */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Camera className="w-4 h-4 stroke-[2.2]" />
            <span>Camera Photo</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Photo</span>
          </button>

          {/* Manual Add Button */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-2xl text-xs sm:text-sm font-medium transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Manual</span>
          </button>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageFile(file);
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageFile(file);
          }}
        />
      </div>

      {/* Quick Test Preset Meals (for seamless instant testing) */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50/60 to-yellow-50 rounded-3xl p-4 border border-amber-200/70">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Instant Demo: Try Sample Meal Recognition</span>
          </div>
          <span className="text-[11px] text-amber-700">1-click AI food inspection</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_MEAL_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(p)}
              className="bg-white/90 hover:bg-white p-2.5 rounded-2xl border border-amber-200/60 text-left transition-all hover:shadow-xs group cursor-pointer"
            >
              <div className="text-xl mb-1">{p.emoji}</div>
              <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-700">
                {p.name}
              </h4>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                <span>{p.calories} kcal</span>
                <span className="capitalize">{p.category}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Nutrition Summary Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Daily Nutrition Breakdown</h3>
              <span className="text-xs text-slate-500">
                Macronutrient distribution & dietary limits
              </span>
            </div>
          </div>

          {/* Date Selector */}
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

        {/* Primary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 block">Total Energy</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900">{totalCals}</span>
              <span className="text-xs text-slate-500">/ {dailyCalorieTarget} kcal</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 block">Carbohydrates</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900">{totalCarbs}</span>
              <span className="text-xs text-slate-500">g</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 block">Lean Protein</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900">{totalProtein}</span>
              <span className="text-xs text-slate-500">g</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 block">Total Fat</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900">{totalFat}</span>
              <span className="text-xs text-slate-500">g</span>
            </div>
          </div>
        </div>

        {/* Dietary Health Indicators: Fiber & Sodium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div>
              <span className="text-xs font-semibold text-emerald-900">Dietary Fiber</span>
              <p className="text-[11px] text-emerald-700">Supports heart health & glycemic control</p>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-emerald-900">{totalFiber}g</span>
              <span className="text-[10px] text-emerald-700 block">Target: ≥ 28g</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div>
              <span className="text-xs font-semibold text-blue-900">Estimated Sodium</span>
              <p className="text-[11px] text-blue-700">Heart-healthy daily limit guide</p>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-blue-900">{totalSodium}mg</span>
              <span className="text-[10px] text-blue-700 block">Guideline: &lt; 2,300mg</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Photo-based nutritional estimates are approximate and calculated based on standard food database averages. You can modify names and portion sizes at any time.</span>
        </div>
      </div>

      {/* Food Diary Entries List */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">Meal Log History</h3>
            <span className="text-xs text-slate-400">({filteredEntries.length} entries)</span>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors capitalize cursor-pointer shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-sm font-medium">No meals logged for {selectedDate}.</p>
            <p className="text-xs mt-1">Take a photo or choose a sample meal above to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-2xl px-2 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {entry.imageUrl ? (
                    <img
                      src={entry.imageUrl}
                      alt={entry.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg shrink-0">
                      {entry.category === 'breakfast' && '🍳'}
                      {entry.category === 'lunch' && '🥗'}
                      {entry.category === 'dinner' && '🍲'}
                      {entry.category === 'snack' && '🍎'}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{entry.name}</h4>
                      {entry.isAiEstimated && (
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          AI Estimated
                        </span>
                      )}
                      {entry.isSample && (
                        <span className="text-[10px] text-slate-400">Sample</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="capitalize font-medium text-slate-700">{entry.category}</span>
                      <span>·</span>
                      <span>{entry.servingSize}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {entry.time}
                      </span>
                    </div>

                    {entry.notes && (
                      <p className="text-xs text-slate-600 mt-1 italic">{entry.notes}</p>
                    )}

                    {/* Macro details */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span>Carbs: <strong className="text-slate-800">{entry.carbs}g</strong></span>
                      <span>Protein: <strong className="text-slate-800">{entry.protein}g</strong></span>
                      <span>Fat: <strong className="text-slate-800">{entry.fat}g</strong></span>
                      {entry.fiber ? (
                        <span>Fiber: <strong className="text-slate-800">{entry.fiber}g</strong></span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-lg font-extrabold text-slate-900">{entry.calories}</span>
                    <span className="text-xs text-slate-500 ml-1">kcal</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditEntry(entry)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Entry"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Food Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingEntryId ? 'Edit Food Diary Entry' : 'Log Food & Nutrition'}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Review and adjust portion sizes or nutrition estimates
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scanning indicator */}
            {isAnalyzing && (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 mb-4 flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Gemini Vision is analyzing meal...</h4>
                  <p className="text-[11px] text-amber-700">Identifying food items, ingredients, portion sizes, and nutrient estimates.</p>
                </div>
              </div>
            )}

            {analysisError && (
              <div className="bg-rose-50 rounded-2xl p-3 border border-rose-200 text-rose-800 text-xs mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            {previewImage && (
              <div className="mb-4 relative rounded-2xl overflow-hidden border border-slate-200 max-h-48 bg-slate-100 flex items-center justify-center">
                <img
                  src={previewImage}
                  alt="Meal preview"
                  className="w-full h-44 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-2 right-2 bg-slate-900/70 text-white p-1 rounded-full text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {aiTips.length > 0 && (
              <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 mb-4 text-xs space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Nutrition Highlights</span>
                </div>
                {aiTips.map((tip, i) => (
                  <p key={i} className="text-emerald-800 text-[11px]">· {tip}</p>
                ))}
              </div>
            )}

            <form onSubmit={handleSaveEntry} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Food or Dish Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Avocado Toast with Poached Egg"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Meal Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MealCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500 bg-white"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Portion / Serving Size
                  </label>
                  <input
                    type="text"
                    value={servingSize}
                    onChange={(e) => setServingSize(e.target.value)}
                    placeholder="e.g. 1 bowl, 250g, 2 slices"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500"
                  />
                </div>
              </div>

              {/* Calories & Macros Grid */}
              <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={carbs}
                    onChange={(e) => setCarbs(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={protein}
                    onChange={(e) => setProtein(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Total Fat (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={fat}
                    onChange={(e) => setFat(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Saturated Fat (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={saturatedFat}
                    onChange={(e) => setSaturatedFat(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Dietary Fiber (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={fiber}
                    onChange={(e) => setFiber(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Sodium (mg)
                </label>
                <input
                  type="number"
                  min="0"
                  value={sodium}
                  onChange={(e) => setSodium(Number(e.target.value))}
                  placeholder="Estimated sodium in milligrams"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Notes & Ingredients
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Extra olive oil, whole grains, cooked with garlic..."
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {editingEntryId ? 'Save Changes' : 'Add to Food Diary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
