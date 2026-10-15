import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import enTranslations from '../i18n/en.json';
import mrTranslations from '../i18n/mr.json';

export type Language = 'mr' | 'en';

const translations: Record<Language, any> = {
  en: enTranslations,
  mr: mrTranslations,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('agrisense_language');
    if (saved === 'mr' || saved === 'en') {
      return saved;
    }
    return 'mr'; // Default Marathi as farmer-first requirement
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('agrisense_language', lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === 'mr' ? 'en' : 'mr';
      localStorage.setItem('agrisense_language', next);
      return next;
    });
  }, []);

  // Translation helper function supporting nested key resolution (e.g. "voice.errors.permission_denied")
  const t = useCallback(
    (key: string, defaultText?: string, vars?: Record<string, string | number>): string => {
      const keys = key.split('.');
      let current: any = translations[language] || translations['mr'];

      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          current = undefined;
          break;
        }
      }

      // Fallback to English dictionary if key missing in Marathi dictionary
      if (current === undefined && language !== 'en') {
        let fallbackCurrent: any = translations['en'];
        for (const k of keys) {
          if (fallbackCurrent && typeof fallbackCurrent === 'object' && k in fallbackCurrent) {
            fallbackCurrent = fallbackCurrent[k];
          } else {
            fallbackCurrent = undefined;
            break;
          }
        }
        if (fallbackCurrent !== undefined && typeof fallbackCurrent === 'string') {
          current = fallbackCurrent;
        }
      }

      let result = typeof current === 'string' ? current : defaultText || key;

      if (vars && typeof result === 'string') {
        Object.entries(vars).forEach(([varKey, varVal]) => {
          result = result.replace(new RegExp(`{\\s*${varKey}\\s*}`, 'g'), String(varVal));
        });
      }

      return result;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
