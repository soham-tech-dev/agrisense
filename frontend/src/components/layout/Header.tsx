import React from 'react';
import { Sprout, User as UserIcon, Mic } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { LanguageToggle } from '../common/LanguageToggle';

export const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const isMarathi = language === 'mr';

  return (
    <header className="sticky top-0 z-40 bg-emerald-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard')}
          aria-label={t('nav.dashboard', 'Home')}
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-700 border border-emerald-500/50 flex items-center justify-center shadow-inner">
            <Sprout className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{t('app.name', 'AgriSense')}</span>
              <span className="text-[10px] bg-emerald-700/80 px-2.5 py-0.5 rounded-full text-emerald-200 uppercase tracking-wider border border-emerald-600/50 font-bold">
                {isMarathi ? 'शेतकरी मित्र' : 'Farmer AI'}
              </span>
            </h1>
            <p className="text-[11px] text-emerald-200 font-medium leading-none">
              {t('app.tagline', 'AgriSense Digital Farmer Partner')}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Prominent Language Switcher */}
          <LanguageToggle variant="pill" />

          {/* User Profile Icon or Login button */}
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-2xl bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 flex items-center justify-center text-emerald-100 transition-colors active:scale-95 shadow-sm"
              title={t('nav.profile', 'Profile')}
              aria-label={t('nav.profile', 'Profile')}
            >
              <UserIcon className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 min-h-[44px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs transition-colors shadow"
            >
              {t('nav.login', 'Login')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
