import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, Language } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface LanguageToggleProps {
  className?: string;
  variant?: 'pill' | 'compact' | 'full';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '', variant = 'pill' }) => {
  const { language, setLanguage } = useLanguage();
  const { updateUserLanguage, isAuthenticated } = useAuth();

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    if (isAuthenticated) {
      updateUserLanguage(lang);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={() => handleSelectLanguage(language === 'mr' ? 'en' : 'mr')}
        className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[40px] rounded-xl bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-500/50 text-white text-xs font-bold transition-all active:scale-95 shadow-sm ${className}`}
        aria-label="Toggle language between Marathi and English"
      >
        <Globe className="w-4 h-4 text-emerald-300" />
        <span>{language === 'mr' ? 'English' : 'मराठी'}</span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-1 bg-emerald-950/80 border border-emerald-600/60 rounded-xl shadow-inner text-xs font-bold text-emerald-200 select-none ${className}`}
      role="group"
      aria-label="Language selection toggle"
    >
      <button
        type="button"
        onClick={() => handleSelectLanguage('mr')}
        className={`px-3 py-1.5 rounded-lg min-h-[36px] transition-all flex items-center gap-1 ${
          language === 'mr'
            ? 'bg-emerald-500 text-emerald-950 shadow font-extrabold scale-105'
            : 'text-emerald-300 hover:text-white hover:bg-emerald-900/60'
        }`}
      >
        <span>मराठी</span>
      </button>
      <span className="text-emerald-600 px-1 font-normal">|</span>
      <button
        type="button"
        onClick={() => handleSelectLanguage('en')}
        className={`px-3 py-1.5 rounded-lg min-h-[36px] transition-all flex items-center gap-1 ${
          language === 'en'
            ? 'bg-emerald-500 text-emerald-950 shadow font-extrabold scale-105'
            : 'text-emerald-300 hover:text-white hover:bg-emerald-900/60'
        }`}
      >
        <span>English</span>
      </button>
    </div>
  );
};
