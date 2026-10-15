import React from 'react';
import { CloudRain, Wind, Droplets, Thermometer, RefreshCw } from 'lucide-react';
import { WeatherData } from '../../types';
import { Card } from '../common/Card';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  isMarathi: boolean;
  onRefresh?: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, isMarathi, onRefresh }) => {
  if (!weather) {
    return (
      <Card className="animate-pulse">
        <div className="h-24 bg-slate-100 rounded-xl" />
      </Card>
    );
  }

  return (
    <Card
      title={isMarathi ? 'सध्याचे हवामान' : 'Current Weather'}
      headerAction={
        <div className="flex items-center gap-2">
          {weather.cached && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-300">
              {isMarathi ? 'कॅश डेटा' : 'Cached Data'}
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-500 hover:text-emerald-700 transition"
              title={isMarathi ? 'रिफ्रेश करा' : 'Refresh'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Primary weather row */}
        <div className="flex items-center justify-between bg-gradient-to-r from-sky-50 to-emerald-50 p-4 rounded-2xl border border-sky-100">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-sky-100 text-sky-600">
              <Thermometer className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {weather.temperature}°C
              </div>
              <p className="text-xs font-semibold text-slate-500">
                {isMarathi ? 'जाणवणारे तापमान' : 'Feels like'}: {weather.feels_like}°C • {weather.condition}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 bg-sky-100 px-3 py-1.5 rounded-full">
              <CloudRain className="w-4 h-4 text-sky-600" />
              <span>{weather.rain_probability}% {isMarathi ? 'पाऊस' : 'Rain'}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {weather.location_name || weather.district}
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <Droplets className="w-4 h-4 text-teal-600" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{isMarathi ? 'आर्द्रता' : 'Humidity'}</span>
              <span className="font-bold text-slate-800">{weather.humidity}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <Wind className="w-4 h-4 text-sky-600" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{isMarathi ? 'वाऱ्याचा वेग' : 'Wind Speed'}</span>
              <span className="font-bold text-slate-800">{weather.wind_speed} km/h</span>
            </div>
          </div>
        </div>

        {/* Last updated timestamp */}
        <div className="flex justify-between items-center pt-1 text-[11px] text-slate-400 border-t border-slate-100">
          <span>{isMarathi ? 'हवामान स्थान:' : 'Location:'} {weather.district}</span>
          <span>
            {isMarathi ? 'शेवटचे अपडेट:' : 'Last updated:'} {weather.last_updated}
          </span>
        </div>
      </div>
    </Card>
  );
};
