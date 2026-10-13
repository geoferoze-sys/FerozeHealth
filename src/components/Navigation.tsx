import React from 'react';
import { TabType } from '../types/health';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Activity,
  FileHeart,
  UserCheck,
} from 'lucide-react';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingRemindersCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingRemindersCount = 0,
}) => {
  const navItems: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    activeColor: string;
    activeBg: string;
  }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: LayoutDashboard,
      activeColor: 'text-emerald-700',
      activeBg: 'bg-emerald-50',
    },
    {
      id: 'food',
      label: 'Food',
      icon: UtensilsCrossed,
      activeColor: 'text-amber-700',
      activeBg: 'bg-amber-50',
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: Activity,
      activeColor: 'text-sky-700',
      activeBg: 'bg-sky-50',
    },
    {
      id: 'records',
      label: 'Health Records',
      icon: FileHeart,
      activeColor: 'text-rose-700',
      activeBg: 'bg-rose-50',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: UserCheck,
      activeColor: 'text-indigo-700',
      activeBg: 'bg-indigo-50',
    },
  ];

  return (
    <>
      {/* Desktop / Tablet Top Navigation Header */}
      <nav className="hidden md:flex items-center gap-1 bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200/80 shadow-xs no-print">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? `${item.activeBg} ${item.activeColor} shadow-xs font-semibold`
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? item.activeColor : 'text-slate-500'}`} />
              <span>{item.label}</span>
              {item.id === 'profile' && pendingRemindersCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 z-40 px-2 py-1.5 safe-area-pb no-print shadow-lg">
        <div className="grid grid-cols-5 items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] ${
                  isActive ? `${item.activeBg} ${item.activeColor}` : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'scale-110' : 'scale-100'
                    }`}
                  />
                  {item.id === 'profile' && pendingRemindersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 font-medium tracking-tight truncate max-w-[64px] ${
                    isActive ? 'font-bold' : ''
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
