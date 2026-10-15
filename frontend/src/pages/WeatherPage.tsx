import React, { useState, useEffect } from 'react';
import { CloudSun, RefreshCw, Calendar, Droplets, Wind, ShieldCheck, Thermometer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { WeatherData, WeatherForecastResponse, WeatherAdvisoryResponse } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingState } from '../components/common/LoadingState';
import { WeatherWidget } from '../components/weather/WeatherWidget';
import { WeatherAdvisoryCard } from '../components/weather/WeatherAdvisoryCard';
import { offlineStorage } from '../services/offlineStorage';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { FeedbackWidget } from '../components/common/FeedbackWidget';

export const WeatherPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecastResponse | null>(null);
  const [advisory, setAdvisory] = useState<WeatherAdvisoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const district = user?.district || 'Nashik';
  const isMarathi = language === 'mr';

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const [curr, fc, adv] = await Promise.all([
        api.getWeatherCurrent(district),
        api.getWeatherForecast(district),
        api.getWeatherAdvisory(district)
      ]);
      setCurrentWeather(curr);
      setForecast(fc);
      setAdvisory(adv);
      
      const payload = { current: curr, forecast: fc, advisory: adv };
      offlineStorage.saveWeather(payload);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.warn('Failed to load live weather, checking cache:', err);
      const cached = offlineStorage.getWeather();
      if (cached.data) {
        setCurrentWeather(cached.data.current);
        setForecast(cached.data.forecast);
        setAdvisory(cached.data.advisory);
        setLastUpdated(cached.updatedAt);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [district]);

  if (loading) {
    return <LoadingState message={isMarathi ? 'हवामान माहिती लोड होत आहे...' : 'Loading weather data...'} />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-14 font-sans">
      <OfflineBanner lastUpdatedTimestamp={lastUpdated} onRefreshLive={fetchWeatherData} />

      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white p-6 sm:p-8 shadow-xl border border-forest-800/60">
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-botanical-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-forest-800/80 border border-botanical-500/30 rounded-full text-xs font-bold text-botanical-300">
              <CloudSun className="w-4 h-4 text-botanical-400" />
              <span>{isMarathi ? 'अ‍ॅग्रीसेन्स हवामान केंद्र • IMD डेटा' : 'AgriSense Weather Station • IMD Connected'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isMarathi ? `${district} हवामान व फवारणी सल्ला` : `${district} Weather & Spray Advisory`}
            </h1>
            <p className="text-forest-200 text-xs sm:text-sm leading-relaxed">
              {isMarathi
                ? 'कृषी हवामानशास्त्र, पर्जन्यमान अंदाज आणि शेती कामांचे अचूक नियोजन.'
                : 'Real-time agro-meteorological parameters and decision-support guidance for field work.'}
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="text-white border-forest-600/50 bg-forest-800/80 hover:bg-forest-700/80"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchWeatherData}
          >
            {isMarathi ? 'ताजे करा' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Advisory Section */}
      <div className="space-y-2">
        <WeatherAdvisoryCard advisory={advisory} isMarathi={isMarathi} />
        <FeedbackWidget feature="weather" referenceId={`weather_${district}`} className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs" />
      </div>

      {/* Current Weather Widget */}
      <WeatherWidget weather={currentWeather} isMarathi={isMarathi} onRefresh={fetchWeatherData} />

      {/* 5-Day Forecast Card */}
      <Card
        title={isMarathi ? '५-दिवसांचा हवामान अंदाज' : '5-Day Weather Forecast'}
        badge={<Badge variant="info">{isMarathi ? 'दैनिक अंदाज' : 'Daily Trend'}</Badge>}
      >
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {(Array.isArray(forecast?.forecast) ? forecast.forecast : []).map((fc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-surface-subtle border border-slate-200/80 text-center space-y-2.5 hover:border-botanical-300 hover:shadow-xs transition"
            >
              <span className="text-xs font-bold text-slate-700 uppercase block tracking-wider">
                {fc.day} <span className="text-[10px] text-slate-400 block font-medium">({fc.date})</span>
              </span>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {fc.temp_max}°
                <span className="text-xs font-semibold text-slate-400"> / {fc.temp_min}°</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-600 truncate">{fc.condition}</p>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-100/80 px-2.5 py-1 rounded-full border border-sky-200/60">
                <Droplets className="w-3 h-3 text-sky-600" />
                <span>{fc.rain_probability}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-right text-[11px] text-slate-400 mt-4 pt-2.5 border-t border-slate-100">
          {isMarathi ? 'अंदाज अपडेट वेळ:' : 'Forecast updated:'} {forecast?.last_updated}
        </div>
      </Card>
    </div>
  );
};

export default WeatherPage;
