import React, { useState } from 'react';
import { ShieldAlert, X, Info } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-1.5 flex items-center justify-between text-xs text-slate-600 no-print">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>My Health Companion is for personal wellness tracking. Not a medical diagnostic device.</span>
        </div>
        <button
          onClick={() => setDismissed(false)}
          className="text-emerald-700 hover:text-emerald-800 font-medium underline cursor-pointer"
        >
          View Notice
        </button>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex items-start justify-between gap-3 no-print">
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Medical Safety & Privacy Notice: </span>
          <span>
            This application is designed for personal health tracking and general wellness support. It does not provide medical diagnoses, emergency alerts, or clinical treatment advice. If you experience acute symptoms or a medical emergency, contact your local emergency services or healthcare provider immediately.
          </span>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-700 hover:text-amber-900 p-0.5 rounded transition-colors shrink-0 cursor-pointer"
        aria-label="Dismiss notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
