import React, { useState } from 'react';
import { HeartHandshake, Plus, Bell, RefreshCw, ChevronDown, Utensils, Footprints, Heart, Droplets } from 'lucide-react';
import { TabType } from '../types/health';
import { HealthStorage } from '../utils/storage';

interface HeaderProps {
  onQuickLog: (tab: TabType, modalTarget?: string) => void;
  hasSampleData: boolean;
  onRefreshData: () => void;
  pendingRemindersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onQuickLog,
  hasSampleData,
  onRefreshData,
  pendingRemindersCount,
}) => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showDataMenu, setShowDataMenu] = useState(false);

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const handleResetSample = () => {
    HealthStorage.resetToSampleData();
    onRefreshData();
    setShowDataMenu(false);
  };

  const handleClearData = () => {
    if (window.confirm('Clear all local health records? This will erase entries from your browser.')) {
      HealthStorage.clearAllData();
      onRefreshData();
      setShowDataMenu(false);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 no-print">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <HeartHandshake className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                My Health Companion
              </h1>
              {hasSampleData && (
                <div className="relative">
                  <button
                    onClick={() => setShowDataMenu(!showDataMenu)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                    title="Click to manage demo data"
                  >
                    <span>Sample Data Active</span>
                    <ChevronDown className="w-3 h-3 text-amber-600" />
                  </button>

                  {showDataMenu && (
                    <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-50 text-xs">
                      <div className="px-2 py-1 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                        Data Management
                      </div>
                      <button
                        onClick={handleResetSample}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reset to Sample Data</span>
                      </button>
                      <button
                        onClick={handleClearData}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <span>Start Fresh (Clear All)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Daily Diet, Activity & Vitals Wellness Companion · {formattedDate}
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Reminders Pill Button */}
          <button
            onClick={() => onQuickLog('profile')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            title="View Active Reminders"
          >
            <Bell className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reminders</span>
            {pendingRemindersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingRemindersCount}
              </span>
            )}
          </button>

          {/* Quick Action Button */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Log</span>
            </button>

            {showQuickMenu && (
              <div
                className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1"
                onClick={() => setShowQuickMenu(false)}
              >
                <div className="px-2.5 py-1 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Quick Health Log
                </div>
                <button
                  onClick={() => onQuickLog('food', 'add')}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2.5 cursor-pointer font-medium"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                    <Utensils className="w-3.5 h-3.5" />
                  </div>
                  <span>Log Meal or Snack</span>
                </button>
                <button
                  onClick={() => onQuickLog('activity', 'add')}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-slate-700 hover:bg-sky-50 hover:text-sky-900 flex items-center gap-2.5 cursor-pointer font-medium"
                >
                  <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
                    <Footprints className="w-3.5 h-3.5" />
                  </div>
                  <span>Log Walk or Workout</span>
                </button>
                <button
                  onClick={() => onQuickLog('records', 'bp')}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-slate-700 hover:bg-rose-50 hover:text-rose-900 flex items-center gap-2.5 cursor-pointer font-medium"
                >
                  <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
                    <Heart className="w-3.5 h-3.5" />
                  </div>
                  <span>Log Blood Pressure</span>
                </button>
                <button
                  onClick={() => onQuickLog('records', 'glucose')}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 flex items-center gap-2.5 cursor-pointer font-medium"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                    <Droplets className="w-3.5 h-3.5" />
                  </div>
                  <span>Log Blood Glucose</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
