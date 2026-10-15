import React from 'react';
import { AlertTriangle, Info, Sprout, CloudRain, Sun } from 'lucide-react';
import { WeatherAdvisoryResponse } from '../../types';
import { Card } from '../common/Card';

interface WeatherAdvisoryCardProps {
  advisory: WeatherAdvisoryResponse | null;
  isMarathi: boolean;
}

export const WeatherAdvisoryCard: React.FC<WeatherAdvisoryCardProps> = ({ advisory, isMarathi }) => {
  if (!advisory) {
    return null;
  }

  const advisoryText = isMarathi ? advisory.advisory_mr : advisory.advisory_en;
  const disclaimerText = isMarathi ? advisory.disclaimer_mr : advisory.disclaimer_en;

  return (
    <Card className="border-l-4 border-l-teal-600 bg-gradient-to-r from-teal-50/50 to-emerald-50/30">
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-2xl flex-shrink-0 ${
          advisory.rain_expected ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
        }`}>
          {advisory.rain_expected ? (
            <CloudRain className="w-6 h-6 text-amber-600" />
          ) : (
            <Sun className="w-6 h-6 text-teal-600" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800">
              <Sprout className="w-3 h-3 inline mr-1" />
              {isMarathi ? 'कृषी सल्ला (Decision Support)' : 'Farming Advisory'}
            </span>
            <span className="text-xs text-slate-400 font-medium">({advisory.category})</span>
          </div>

          <p className="text-sm font-semibold text-slate-800 leading-snug mt-1.5">
            "{advisoryText}"
          </p>

          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 bg-white/80 p-2 rounded-lg border border-slate-200/60">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="italic">{disclaimerText}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
