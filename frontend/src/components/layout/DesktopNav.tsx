import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Stethoscope, MessageSquare, CloudSun, TrendingUp, Tractor, User, Settings, Calendar, Bookmark, BookOpen } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const DesktopNav: React.FC = () => {
  const { t, language } = useLanguage();
  const isMarathi = language === 'mr';

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard', 'Home'), icon: <Home className="w-4 h-4" /> },
    { to: '/disease', label: t('nav.disease', 'Crop Health'), icon: <Stethoscope className="w-4 h-4" /> },
    { to: '/advisor', label: t('nav.advisor', 'Ask AgriSense'), icon: <MessageSquare className="w-4 h-4" /> },
    { to: '/weather', label: t('nav.weather', 'Weather'), icon: <CloudSun className="w-4 h-4" /> },
    { to: '/market', label: t('nav.market', 'Market Prices'), icon: <TrendingUp className="w-4 h-4" /> },
    { to: '/calendar', label: isMarathi ? 'वेळापत्रक' : 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { to: '/saved-advice', label: isMarathi ? 'सल्ला वही' : 'Notebook', icon: <Bookmark className="w-4 h-4" /> },
    { to: '/resources', label: isMarathi ? 'शासकीय योजना' : 'Schemes', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/farm', label: t('nav.farm', 'My Farm'), icon: <Tractor className="w-4 h-4" /> },
    { to: '/profile', label: t('nav.profile', 'Profile'), icon: <User className="w-4 h-4" /> },
  ];

  return (
    <nav className="hidden md:block bg-emerald-900 border-b border-emerald-800 text-emerald-100">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-sm font-bold'
                  : 'hover:bg-emerald-800 text-emerald-200'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
