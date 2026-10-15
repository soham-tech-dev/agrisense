import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'pills' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  className = '',
}) => {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none ${
        variant === 'underline'
          ? 'border-b border-slate-200'
          : 'bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60'
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm font-bold transition-all px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-1 select-none ${
              variant === 'underline'
                ? isActive
                  ? 'border-b-2 border-emerald-700 text-emerald-900 rounded-b-none'
                  : 'text-slate-500 hover:text-slate-800'
                : isActive
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
