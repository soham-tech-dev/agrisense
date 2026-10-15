import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  MapPin,
  Wifi,
  WifiOff,
  User as UserIcon,
  Mic,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Search,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { LanguageToggle } from '../common/LanguageToggle';
import { VoiceWidget } from '../advisor/VoiceWidget';

interface TopNavProps {
  onOpenMobileSidebar: () => void;
  isCollapsed: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenMobileSidebar, isCollapsed }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { isOnline } = useOnlineStatus();
  const location = useLocation();
  const navigate = useNavigate();
  const isMarathi = language === 'mr';
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // Derive current breadcrumb title from path
  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/dashboard')) return { title: isMarathi ? 'शेतकरी डॅशबोर्ड' : 'Farm Dashboard', section: isMarathi ? 'मुख्य' : 'Home' };
    if (pathname.startsWith('/disease/history')) return { title: isMarathi ? 'रोग स्कॅन इतिहास' : 'Scan History', section: isMarathi ? 'पीक आरोग्य' : 'Crop Health' };
    if (pathname.startsWith('/disease/result')) return { title: isMarathi ? 'रोग निदान निकाल' : 'Diagnosis Result', section: isMarathi ? 'पीक आरोग्य' : 'Crop Health' };
    if (pathname.startsWith('/disease') || pathname.startsWith('/crop-health')) return { title: isMarathi ? 'पीक आरोग्य व रोग स्कॅन' : 'Crop Health & Scan', section: isMarathi ? 'शेती' : 'Farm' };
    if (pathname.startsWith('/advisor')) return { title: isMarathi ? 'केव्हीके कृषी सल्लागार' : 'KVK AI Advisor', section: isMarathi ? 'सल्लागार' : 'Advisor' };
    if (pathname.startsWith('/weather')) return { title: isMarathi ? 'हवामान व फवारणी' : 'Weather & Spraying', section: isMarathi ? 'हवामान' : 'Climate' };
    if (pathname.startsWith('/market')) return { title: isMarathi ? 'बाजार भाव (APMC)' : 'Mandi Market Prices', section: isMarathi ? 'बाजार' : 'Market' };
    if (pathname.startsWith('/calendar')) return { title: isMarathi ? 'पीक दिनदर्शिका' : 'Crop Calendar', section: isMarathi ? 'नियोजन' : 'Planning' };
    if (pathname.startsWith('/saved-advice')) return { title: isMarathi ? 'सल्ला नोंद वही' : 'Saved Advice Notebook', section: isMarathi ? 'नोंदी' : 'Notebook' };
    if (pathname.startsWith('/resources')) return { title: isMarathi ? 'शासकीय योजना व KVK' : 'Govt Schemes & Resources', section: isMarathi ? 'योजना' : 'Schemes' };
    if (pathname.startsWith('/farm')) return { title: isMarathi ? 'माझी शेती व पिके' : 'My Farm & Plots', section: isMarathi ? 'शेती' : 'Farm' };
    if (pathname.startsWith('/profile')) return { title: isMarathi ? 'शेतकरी प्रोफाइल' : 'Farmer Profile', section: isMarathi ? 'खाते' : 'Account' };
    if (pathname.startsWith('/settings')) return { title: isMarathi ? 'अ‍ॅप सेटिंग्ज' : 'App Settings', section: isMarathi ? 'खाते' : 'Account' };
    return { title: 'AgriSense', section: '' };
  };

  const currentMeta = getPageTitle(location.pathname);
  const district = user?.district || 'Nashik';

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
        {/* Left: Mobile hamburger & breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 -ml-1 text-slate-600 hover:text-emerald-800 rounded-xl hover:bg-slate-100 md:hidden transition"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb Info */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold truncate">
            {currentMeta.section && (
              <>
                <span className="hidden sm:inline hover:text-slate-800 transition truncate">
                  {currentMeta.section}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline shrink-0" />
              </>
            )}
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate flex items-center gap-2">
              <span>{currentMeta.title}</span>
              <span className="hidden lg:inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                ICAR Grounded
              </span>
            </h1>
          </div>
        </div>

        {/* Center: Search Field (Desktop) */}
        <div className="hidden lg:flex items-center relative max-w-sm w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder={isMarathi ? 'पिके, रोग, बाजार भाव शोधा... (Enter)' : 'Search crops, diseases, mandi... (Enter)'}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/90 focus:border-emerald-600 rounded-full outline-none transition font-medium text-slate-800 placeholder:text-slate-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                navigate(`/advisor?query=${encodeURIComponent(e.currentTarget.value.trim())}`);
              }
            }}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Farm Location Pill */}
          <button
            onClick={() => navigate('/farm')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition border border-slate-200/70"
            title={isMarathi ? 'माझे गाव व जिल्हा बदला' : 'View farm location'}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate max-w-[120px]">{district}</span>
          </button>

          {/* Online/Offline Status Indicator */}
          <div
            className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
            }`}
            title={isOnline ? 'Online mode active' : 'Offline mode — using local storage'}
          >
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="hidden md:inline">{isMarathi ? 'ऑनलाइन' : 'Live'}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>{isMarathi ? 'ऑफलाइन' : 'Offline'}</span>
              </>
            )}
          </div>

          {/* Quick Voice Assistant Trigger */}
          <button
            onClick={() => setShowVoiceModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
            title={isMarathi ? 'बोलून प्रश्न विचारा (मायक्रोफोन)' : 'Ask with Voice (Microphone)'}
          >
            <Mic className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
            <span className="hidden sm:inline">{isMarathi ? 'बोलून विचारा' : 'Voice'}</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-600 hover:text-emerald-800 rounded-xl hover:bg-slate-100 transition relative"
            title={isMarathi ? 'सूचना (Alerts)' : 'Notifications'}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
          </button>

          {/* Language Switcher */}
          <LanguageToggle variant="pill" />

          {/* Farmer Profile Avatar */}
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-xl bg-forest-900 hover:bg-forest-950 text-white flex items-center justify-center font-bold text-xs transition border border-forest-800 shadow-xs"
            title={isMarathi ? 'प्रोफाइल' : 'Profile'}
            aria-label="Profile"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Voice Assistant Modal Overlay */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md">
            <VoiceWidget
              onSpeechResult={(text) => {
                navigate(`/advisor?query=${encodeURIComponent(text)}`);
                setShowVoiceModal(false);
              }}
              onSendImmediate={(text) => {
                navigate(`/advisor?query=${encodeURIComponent(text)}`);
                setShowVoiceModal(false);
              }}
              onClose={() => setShowVoiceModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};
