import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Tractor,
  Sprout,
  Stethoscope,
  MessageSquare,
  CloudSun,
  TrendingUp,
  MapPin,
  RefreshCw,
  ChevronRight,
  History,
  Mic,
  Calendar,
  Sparkles,
  AlertCircle,
  Bookmark,
  BookOpen,
  Droplets,
  ShieldCheck,
  ArrowUpRight,
  Wind,
  Leaf
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingState } from '../components/common/LoadingState';
import { api } from '../services/api';
import { UserCrop, Farm, WeatherData, WeatherAdvisoryResponse, MandiPrice } from '../types';

import { WeatherWidget } from '../components/weather/WeatherWidget';
import { WeatherAdvisoryCard } from '../components/weather/WeatherAdvisoryCard';
import { MandiPricesWidget } from '../components/mandi/MandiPricesWidget';
import { MarketComparisonModal } from '../components/mandi/MarketComparisonModal';
import { DashboardAlerts } from '../components/dashboard/DashboardAlerts';
import { VoiceWidget } from '../components/advisor/VoiceWidget';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [crops, setCrops] = useState<UserCrop[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [advisory, setAdvisory] = useState<WeatherAdvisoryResponse | null>(null);
  const [mandiPrices, setMandiPrices] = useState<MandiPrice[]>([]);

  const [loading, setLoading] = useState(true);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMarathi = language === 'mr';
  const district = user?.district || 'Nashik';

  const loadDashboardData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [cropsData, farmsData, weatherData, advisoryData, mandiData] = await Promise.all([
        api.getFarmerCrops().catch(() => []),
        api.getFarms().catch(() => []),
        api.getWeatherCurrent(district).catch(() => null),
        api.getWeatherAdvisory(district).catch(() => null),
        api.getMandiPrices(undefined, undefined, district).catch(() => [])
      ]);

      setCrops(cropsData);
      setFarms(farmsData);
      setWeather(weatherData);
      setAdvisory(advisoryData);
      setMandiPrices(mandiData.slice(0, 4));
    } catch (err: any) {
      console.error('Failed to load dashboard items:', err);
      setErrorMessage(isMarathi ? 'काही माहिती लोड करताना अडचण आली.' : 'Failed to load some dashboard items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [district]);

  if (loading) {
    return (
      <LoadingState
        message={isMarathi ? 'शेतकरी डॅशबोर्ड लोड होत आहे...' : 'Loading Farmer Dashboard...'}
      />
    );
  }

  const farmerLocationText = `${user?.village || (isMarathi ? 'निफाड' : 'Niphad')}, ${user?.taluka || (isMarathi ? 'नाशिक' : 'Nashik')}, ${district}`;
  const totalAcreage = farms.reduce((sum, f) => sum + (f.land_size || 0), 0) || 5.0;
  const topMandi = mandiPrices[0];

  return (
    <div className="space-y-6 pb-14 font-sans max-w-7xl mx-auto">
      
      {/* 1. HERO BANNER: Deep Forest Aesthetic with Rich Accents */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white p-6 sm:p-8 shadow-xl border border-forest-800/60">
        {/* Glow blur ornaments */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-botanical-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-forest-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800/80 border border-botanical-500/30 text-botanical-300 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-botanical-400" />
              <span>{isMarathi ? 'अ‍ॅग्रीसेन्स • अधिकृत कृषी सहाय्यक (KVK व्हेरिफाईड)' : 'AgriSense • Official Farming Assistant (KVK Verified)'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              {isMarathi ? `रामराम, ${user?.name || 'शेतकरी मित्र'}!` : `Namaskar, ${user?.name || 'Farmer Friend'}!`}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-forest-200">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-botanical-400 shrink-0" />
                <span>{farmerLocationText}</span>
              </span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-forest-600" />
              <span className="flex items-center gap-1.5 text-botanical-200">
                <Sparkles className="w-4 h-4 text-botanical-400" />
                <span>{isMarathi ? 'आजचा शेती सल्ला अद्ययावत' : 'Daily Advisory Up-to-date'}</span>
              </span>
            </div>

            {/* Contextual Farm / Plot Selector */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-forest-300 font-medium">{isMarathi ? 'शेत निवडा:' : 'Active Plot:'}</span>
              <select
                aria-label={isMarathi ? 'शेत निवडा' : 'Select Farm Plot'}
                className="bg-forest-800/90 hover:bg-forest-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-forest-600/70 focus:outline-none focus:border-botanical-400 cursor-pointer transition shadow-2xs"
                defaultValue="plot1"
                onChange={(e) => {
                  if (e.target.value === 'new') navigate('/farm');
                }}
              >
                <option value="plot1">{isMarathi ? 'प्लॉट १: नाशिक मुख्य शेत (५.० एकर)' : 'Plot 1: Nashik Main Farm (5.0 Acres)'}</option>
                <option value="plot2">{isMarathi ? 'प्लॉट २: निफाड बागायत (७.५ एकर)' : 'Plot 2: Niphad Orchard (7.5 Acres)'}</option>
                <option value="new">{isMarathi ? '+ नवीन शेत नोंदवा' : '+ Register New Plot'}</option>
              </select>
            </div>
          </div>

          {/* Quick Farm & Profile CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap w-full lg:w-auto">
            <button
              onClick={() => navigate('/farm')}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-botanical-500 hover:bg-botanical-400 text-forest-950 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-md active:scale-95"
            >
              <Tractor className="w-4 h-4 text-forest-950" />
              <span>{isMarathi ? 'माझी शेती' : 'My Farm'}</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2.5 bg-forest-800/80 hover:bg-forest-700/80 text-forest-100 border border-forest-600/50 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition active:scale-95"
            >
              <UserIcon className="w-4 h-4 text-botanical-400" />
              <span>{isMarathi ? 'प्रोफाईल' : 'Profile'}</span>
            </button>
            <button
              onClick={loadDashboardData}
              className="p-2.5 rounded-xl bg-forest-800/60 hover:bg-forest-700/60 text-forest-200 hover:text-white border border-forest-700/40 transition shrink-0"
              title={isMarathi ? 'रिफ्रेश करा' : 'Refresh'}
              aria-label="Refresh Dashboard"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 EXACT SUMMARY CARDS: Farm Area, Active Crops, Soil Health, Next Irrigation */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-forest-800/80">
          {/* Card 1: Farm Area */}
          <div className="bg-forest-900/60 backdrop-blur-sm rounded-2xl p-3 border border-forest-700/40">
            <div className="text-[11px] font-medium text-forest-300 uppercase tracking-wider">{isMarathi ? 'शेती क्षेत्र' : 'Farm Area'}</div>
            <div className="text-lg sm:text-xl font-black text-white mt-0.5">{totalAcreage} <span className="text-xs font-semibold text-botanical-400">{isMarathi ? 'एकर' : 'Acres'}</span></div>
          </div>

          {/* Card 2: Active Crops */}
          <div className="bg-forest-900/60 backdrop-blur-sm rounded-2xl p-3 border border-forest-700/40">
            <div className="text-[11px] font-medium text-forest-300 uppercase tracking-wider">{isMarathi ? 'सक्रिय पिके' : 'Active Crops'}</div>
            <div className="text-lg sm:text-xl font-black text-white mt-0.5">{crops.length || 5} <span className="text-xs font-semibold text-botanical-400">{isMarathi ? 'पिके' : 'Crops'}</span></div>
          </div>

          {/* Card 3: Soil Health */}
          <div className="bg-forest-900/60 backdrop-blur-sm rounded-2xl p-3 border border-forest-700/40">
            <div className="text-[11px] font-medium text-forest-300 uppercase tracking-wider">{isMarathi ? 'माती आरोग्य' : 'Soil Health'}</div>
            <div className="text-sm sm:text-base font-black text-botanical-300 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-botanical-400" />
              <span>{isMarathi ? 'उत्कृष्ट (pH ६.८)' : 'Optimal (pH 6.8)'}</span>
            </div>
            <div className="text-[10px] text-forest-300 font-medium mt-0.5">{isMarathi ? 'काळी कसदार • मध्यम पोत' : 'Rich Loamy • High Nitrogen'}</div>
          </div>

          {/* Card 4: Next Irrigation */}
          <div className="bg-forest-900/60 backdrop-blur-sm rounded-2xl p-3 border border-forest-700/40">
            <div className="text-[11px] font-medium text-forest-300 uppercase tracking-wider">{isMarathi ? 'पुढील सिंचन' : 'Next Irrigation'}</div>
            <div className="text-sm sm:text-base font-black text-amber-300 mt-1 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>{isMarathi ? 'उद्या स. ६:००' : 'Tomorrow 6:00 AM'}</span>
            </div>
            <div className="text-[10px] text-forest-300 font-medium mt-0.5">{isMarathi ? 'ठिबक फेरा • ४५ मिनिटे' : 'Drip Cycle • 45 min'}</div>
          </div>
        </div>
      </div>

      {/* 2. PROMINENT VOICE-ASSISTANT ENTRY CARD */}
      <div className="bg-gradient-to-r from-botanical-800 via-forest-900 to-forest-950 rounded-3xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-5 border border-botanical-700/40">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="relative w-14 h-14 rounded-2xl bg-botanical-500/20 border border-botanical-400/40 flex items-center justify-center shrink-0 shadow-inner">
            <Mic className="w-7 h-7 text-botanical-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-botanical-400 rounded-full border-2 border-forest-950" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-botanical-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'मराठी व्हॉईस असिस्टंट' : 'Marathi Voice Assistant'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
              {isMarathi ? 'मायक्रोफोनवर टॅप करून प्रश्न विचारा' : 'Speak Your Agricultural Query'}
            </h3>
            <p className="text-xs sm:text-sm text-forest-200 mt-1 max-w-xl">
              {isMarathi
                ? 'कीड, रोग, खते किंवा हवामानाविषयी बोला. कृषी विज्ञान केंद्राने पडताळलेले अचूक मार्गदर्शन ऐका.'
                : 'Ask in Marathi or English about pests, fertilizer doses, or rainfall. Grounded in KVK manuals.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowVoiceModal(true)}
          className="w-full md:w-auto px-6 py-3.5 bg-botanical-500 hover:bg-botanical-400 text-forest-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-botanical-900/30 transition transform active:scale-95 shrink-0"
        >
          <Mic className="w-5 h-5 text-forest-950" />
          <span>{isMarathi ? 'आताच बोला' : 'Speak Now'}</span>
        </button>
      </div>

      {/* VOICE MODAL OVERLAY */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md">
            <VoiceWidget
              onSpeechResult={(transcribed) => {
                navigate(`/advisor?query=${encodeURIComponent(transcribed)}`);
              }}
              onSendImmediate={(textToSend) => {
                navigate(`/advisor?query=${encodeURIComponent(textToSend)}`);
              }}
              onClose={() => setShowVoiceModal(false)}
            />
          </div>
        </div>
      )}

      {/* ERROR NOTICE IF ANY */}
      {errorMessage && (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="text-amber-800 font-bold hover:underline shrink-0"
          >
            {isMarathi ? 'पुन्हा प्रयत्न' : 'Retry'}
          </button>
        </div>
      )}

      {/* 3. DASHBOARD ALERTS & AGRO-CLIMATIC NOTICE */}
      <DashboardAlerts
        rainExpected={advisory?.rain_expected ?? false}
        isMarathi={isMarathi}
        topCropName={crops[0]?.crop ? (isMarathi ? crops[0].crop.name_mr : crops[0].crop.name_en) : (isMarathi ? 'कांदा' : 'Onion')}
        topCropPrice={mandiPrices[0]?.modal_price || 1980}
      />

      {/* 4. CORE 6 ACTION CARDS FOR FARMERS */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {isMarathi ? 'शेतकरी मुख्य सेवा' : 'Core Farmer Services'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isMarathi ? 'पिक व्यवस्थापनासाठी महत्त्वाचे १-क्लिक पर्याय' : 'Essential 1-click tools for crop health & farm profit'}
            </p>
          </div>
          <Badge variant="forest">
            {isMarathi ? '६ मुख्य सेवा' : '6 Services'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Check Crop Disease */}
          <Card
            hoverable
            onClick={() => navigate('/disease')}
            className="cursor-pointer border border-emerald-100 hover:border-botanical-400 group transition-all"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:bg-botanical-500 group-hover:text-white transition">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <Badge variant="success">
                    {isMarathi ? 'AI तपासणी' : 'AI Scan'}
                  </Badge>
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-forest-800 transition">
                  {isMarathi ? '१. पिक रोग निदान' : '1. Check Crop Disease'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {isMarathi
                    ? 'पानाचा फोटो काढून सेकंदात रोगाचे नाव आणि रासायनिक व सेंद्रिय उपाय मिळवा.'
                    : 'Capture or upload a leaf photo to diagnose diseases and see verified treatments.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-forest-700">
                <span>{isMarathi ? 'फोटो स्कॅन करा' : 'Scan Leaf Photo'}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 text-botanical-600 transition" />
              </div>
            </div>
          </Card>

          {/* Card 2: Ask Farming Assistant */}
          <Card
            hoverable
            onClick={() => navigate('/advisor')}
            className="cursor-pointer border border-teal-100 hover:border-teal-400 group transition-all"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold group-hover:bg-teal-600 group-hover:text-white transition">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <Badge variant="kvk">
                    {isMarathi ? 'KVK सल्लागार' : 'KVK Advisor'}
                  </Badge>
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-800 transition">
                  {isMarathi ? '२. कृषी सल्लागार' : '2. Ask Farming Assistant'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {isMarathi
                    ? 'खते, कीटकनाशक, फवारणी किंवा पाणी नियोजनाबाबत मराठीत आवाज किंवा मजकुरात विचारा.'
                    : 'Ask any question by speaking or typing. Answers strictly grounded in KVK manuals.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                <span>{isMarathi ? 'सल्ला विचारा' : 'Ask AI Advisor'}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 text-teal-600 transition" />
              </div>
            </div>
          </Card>

          {/* Card 3: Weather */}
          <Card
            hoverable
            onClick={() => navigate('/weather')}
            className="cursor-pointer border border-sky-100 hover:border-sky-400 group transition-all"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold group-hover:bg-sky-600 group-hover:text-white transition">
                    <CloudSun className="w-6 h-6" />
                  </div>
                  <Badge variant="info">
                    {weather ? `${weather.temperature}°C` : (isMarathi ? 'हवामान' : 'Weather')}
                  </Badge>
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-sky-800 transition">
                  {isMarathi ? '३. हवामान व फवारणी' : '3. Weather & Spraying'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {isMarathi
                    ? `पावसाची शक्यता ${weather?.rain_probability || 30}% • फवारणी करावी की नाही याचे मार्गदर्शन.`
                    : `Rain probability ${weather?.rain_probability || 30}% • Real-time advisory on spraying and irrigation.`}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-700">
                <span>{isMarathi ? '५ दिवसांचा अंदाज' : '5-Day Forecast'}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 text-sky-600 transition" />
              </div>
            </div>
          </Card>

          {/* Card 4: Mandi Prices */}
          <Card
            hoverable
            onClick={() => navigate('/market')}
            className="cursor-pointer border border-amber-100 hover:border-amber-400 group transition-all"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold group-hover:bg-amber-600 group-hover:text-white transition">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <Badge variant="warning">
                    APMC Mandi
                  </Badge>
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-800 transition">
                  {isMarathi ? '४. आजचे बाजार भाव' : '4. Mandi Market Prices'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {isMarathi
                    ? 'लासलगाव, पिंपळगाव, नाशिक व इतर बाजार समित्यांमधील ताज्या दरांची तुलना करा.'
                    : 'Track and compare daily market rates across major Maharashtra APMC mandis.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
                <span>{isMarathi ? 'भाव तपासा' : 'Check Prices'}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 text-amber-600 transition" />
              </div>
            </div>
          </Card>

          {/* Card 5: My Crops / Farm */}
          <Card
            hoverable
            onClick={() => navigate('/farm')}
            className="cursor-pointer border border-emerald-100 hover:border-botanical-400 group transition-all"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:bg-botanical-600 group-hover:text-white transition">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <Badge variant="forest">
                    {crops.length} {isMarathi ? 'पिके' : 'Crops'}
                  </Badge>
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-forest-800 transition">
                  {isMarathi ? '५. माझी पिके व शेत' : '5. My Crops & Farm'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {isMarathi
                    ? 'तुमच्या जमिनीचा प्रकार, लागवड केलेली पिके आणि सिंचन माहिती व्यवस्थापित करा.'
                    : 'Manage registered plots, active crops, acreage, and irrigation details.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-forest-700">
                <span>{isMarathi ? 'शेती व्यवस्थापन' : 'Manage Farm'}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 text-botanical-600 transition" />
              </div>
            </div>
          </Card>

          {/* Card 6: My History */}
          <Card
            hoverable
            onClick={() => navigate('/disease/history')}
            className="cursor-pointer border border-indigo-100 hover:border-indigo-400 group transition-all"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition">
                    <History className="w-6 h-6" />
                  </div>
                  <Badge variant="neutral">
                    {isMarathi ? 'स्कॅन इतिहास' : 'Records'}
                  </Badge>
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-800 transition">
                  {isMarathi ? '६. माझे जुने स्कॅन' : '6. My Scan History'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {isMarathi
                    ? 'यापूर्वी तपासलेल्या पिकांचे फोटो, रोगांचे निदान आणि दिलेले सल्ले पुन्हा पहा.'
                    : 'Revisit past leaf scans, diagnoses, and recommended treatment histories.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
                <span>{isMarathi ? 'इतिहास उघडा' : 'View History'}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 text-indigo-600 transition" />
              </div>
            </div>
          </Card>

        </div>

        {/* 5. SMART FARMER TOOLS: CALENDAR, NOTEBOOK, RESOURCES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
          <button
            type="button"
            onClick={() => navigate('/calendar')}
            className="p-4 bg-white hover:bg-forest-50/60 border border-slate-200/80 hover:border-botanical-300 rounded-2xl flex items-center justify-between text-left transition shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-800 text-botanical-300 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-forest-800">
                  {isMarathi ? 'पिक वेळापत्रक व स्मरणपत्रे' : 'Crop Calendar & Tasks'}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {isMarathi ? 'पेरणी, फवारणी व खत नियोजन' : 'Sowing & spray timeline'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-forest-700 group-hover:translate-x-0.5 transition shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/saved-advice')}
            className="p-4 bg-white hover:bg-amber-50/50 border border-slate-200/80 hover:border-amber-300 rounded-2xl flex items-center justify-between text-left transition shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center shrink-0">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-amber-800">
                  {isMarathi ? 'जतन केलेली सल्ला वही' : 'Saved Advisory Notebook'}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {isMarathi ? 'महत्त्वाचे सल्ले व शेती नोंदी' : 'Bookmarked AI advice'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-700 group-hover:translate-x-0.5 transition shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/resources')}
            className="p-4 bg-white hover:bg-sky-50/50 border border-slate-200/80 hover:border-sky-300 rounded-2xl flex items-center justify-between text-left transition shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-700 text-white flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-sky-800">
                  {isMarathi ? 'शासकीय योजना व हेल्पलाइन' : 'Govt Schemes & KVK'}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {isMarathi ? 'महाडीबीटी व १८००-१८०-१५५१' : 'MahaDBT & 1800-180-1551'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-sky-700 group-hover:translate-x-0.5 transition shrink-0" />
          </button>
        </div>
      </div>

      {/* 6. WEATHER & ADVISORY SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WeatherWidget weather={weather} isMarathi={isMarathi} onRefresh={loadDashboardData} />
        <WeatherAdvisoryCard advisory={advisory} isMarathi={isMarathi} />
      </div>

      {/* 7. MANDI PRICES SUMMARY */}
      <MandiPricesWidget
        prices={mandiPrices}
        isMarathi={isMarathi}
        onOpenCompare={() => setIsCompareOpen(true)}
        onRefresh={loadDashboardData}
      />

      {/* 8. REGISTERED CROPS SUMMARY */}
      <Card
        title={isMarathi ? 'माझी पिके (नोंदणीकृत)' : 'My Registered Crops'}
        headerAction={
          <button onClick={() => navigate('/farm')} className="text-xs font-bold text-forest-700 hover:text-botanical-600 transition flex items-center gap-1">
            <span>{isMarathi ? 'पिके व्यवस्थापित करा' : 'Manage Crops'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        {crops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {crops.map((uc) => (
              <div
                key={uc.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-subtle/70 border border-slate-200/80 hover:border-botanical-300 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-forest-800 text-botanical-300 flex items-center justify-center font-bold shrink-0">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">
                      {isMarathi ? (uc.crop?.name_mr || 'पीक') : (uc.crop?.name_en || 'Crop')}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {uc.acres_allocated || 1} {isMarathi ? 'एकर' : 'Acres'} • {uc.season || 'खरीप'}
                    </p>
                  </div>
                </div>
                <Badge variant="forest" size="sm">
                  {isMarathi ? 'लागवड' : 'Active'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-700 mx-auto flex items-center justify-center">
              <Sprout className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isMarathi ? 'अद्याप पिके नोंदवलेली नाहीत. अचूक सल्ल्यासाठी आपली पिके जोडा.' : 'No crops registered yet. Add your crops to get tailored agronomic advice.'}
            </p>
            <Button size="sm" variant="forest" onClick={() => navigate('/farm')}>
              {isMarathi ? '+ पिक जोडा' : '+ Add Crop'}
            </Button>
          </div>
        )}
      </Card>

      {/* 9. RECENT FARM ACTIVITIES & RECENT AI ADVISOR CONVERSATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Farm Activities Timeline */}
        <Card
          title={isMarathi ? 'शेतातील नुकत्याच झालेल्या नोंदी' : 'Recent Farm Activities'}
          headerAction={
            <button onClick={() => navigate('/calendar')} className="text-xs font-bold text-forest-700 hover:text-botanical-600 transition flex items-center gap-1">
              <span>{isMarathi ? 'सर्व नोंदी' : 'All Tasks'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          <div className="space-y-3.5 pt-1">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-subtle/70 border border-slate-200/80">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                <Droplets className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="truncate">{isMarathi ? 'कांदा प्लॉट #१ सिंचन पूर्ण' : 'Onion Plot #1 Drip Completed'}</span>
                  <span className="text-[10px] text-slate-500 font-medium shrink-0">{isMarathi ? 'आज स. ७:३०' : 'Today 7:30 AM'}</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  {isMarathi ? '४५ मिनिटे ठिबक सिंचन, पाण्याचा दाब सामान्य.' : '45 min drip cycle, pressure normal at 1.8 bar.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-subtle/70 border border-slate-200/80">
              <div className="w-9 h-9 rounded-xl bg-botanical-100 text-botanical-800 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="truncate">{isMarathi ? 'टोमॅटो फवारणी नोंद' : 'Tomato Spray Logged'}</span>
                  <span className="text-[10px] text-slate-500 font-medium shrink-0">{isMarathi ? 'काल संध्या.' : 'Yesterday'}</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  {isMarathi ? 'मँकोझेब ७५ डब्ल्यूपी (२.५ ग्रॅम/लिटर) करपा प्रतिबंधक.' : 'Mancozeb 75 WP (2.5g/L) preventive spray completed.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-subtle/70 border border-slate-200/80">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="truncate">{isMarathi ? 'माती नमुना तपासणी अहवाल' : 'Soil Health Report KVK'}</span>
                  <span className="text-[10px] text-slate-500 font-medium shrink-0">{isMarathi ? '३ दिवसांपूर्वी' : '3 days ago'}</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  {isMarathi ? 'pH ६.८ (उत्कृष्ट), सेंद्रिय कर्ब ०.६८%, नत्र मध्यम.' : 'pH 6.8 (Optimal), OC 0.68%, available nitrogen medium.'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent AI Advisor Conversations */}
        <Card
          title={isMarathi ? 'कृषी सल्लागाराशी चर्चा' : 'Recent AI Advisor Chats'}
          headerAction={
            <button onClick={() => navigate('/advisor')} className="text-xs font-bold text-forest-700 hover:text-botanical-600 transition flex items-center gap-1">
              <span>{isMarathi ? 'नवीन प्रश्न विचारा' : 'Ask Advisor'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          <div className="space-y-3 pt-1">
            <div
              onClick={() => navigate('/advisor?query=' + encodeURIComponent(isMarathi ? 'कांद्यावरील जांभळा करपा नियंत्रण' : 'Purple blotch control in onion'))}
              className="p-3 rounded-2xl bg-surface-subtle/70 border border-slate-200/80 hover:border-botanical-400 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-forest-800 text-botanical-300 flex items-center justify-center text-xs font-bold">
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-forest-800 transition">
                    {isMarathi ? 'कांद्यावरील जांभळा करपा नियंत्रण' : 'Purple blotch control in onion'}
                  </h4>
                </div>
                <Badge variant="kvk" size="sm">
                  KVK Verified
                </Badge>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-2 line-clamp-2">
                {isMarathi
                  ? 'मँकोझेब २.५ ग्रॅम किंवा प्रोपिकोनॅझोल १ मिली प्रति लिटर स्टिकरसह फवारणीची शिफारस...'
                  : 'Recommended Mancozeb 2.5g or Propiconazole 1ml/L with spreader sticker...'}
              </p>
            </div>

            <div
              onClick={() => navigate('/advisor?query=' + encodeURIComponent(isMarathi ? 'सोयाबीन खोडमाशी सेंद्रिय उपाय' : 'Stem fly organic control in soybean'))}
              className="p-3 rounded-2xl bg-surface-subtle/70 border border-slate-200/80 hover:border-botanical-400 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-800 text-teal-200 flex items-center justify-center text-xs font-bold">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-teal-800 transition">
                    {isMarathi ? 'सोयाबीन खोडमाशी सेंद्रिय उपाय' : 'Soybean stem fly organic control'}
                  </h4>
                </div>
                <Badge variant="forest" size="sm">
                  ICAR
                </Badge>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-2 line-clamp-2">
                {isMarathi
                  ? 'निंबोळी अर्क ५% किंवा निम तेल १५०० पीपीएम ५ मिली प्रति लिटर पाण्यात मिसळून फवारावे...'
                  : 'Neem seed kernel extract 5% or Azadirachtin 1500 ppm at 5ml/L water...'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Market Comparison Modal */}
      <MarketComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        isMarathi={isMarathi}
        initialCrop={crops[0]?.crop ? crops[0].crop.name_en : 'Onion'}
      />
    </div>
  );
};
