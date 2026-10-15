import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Stethoscope, MessageSquare, CloudSun, TrendingUp, Grid } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface MobileNavProps {
  onOpenDrawer?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenDrawer }) => {
  const { language } = useLanguage();
  const isMarathi = language === 'mr';

  const navItems = [
    {
      to: '/dashboard',
      label: isMarathi ? 'मुख्य' : 'Home',
      icon: <Home className="w-5 h-5" />,
    },
    {
      to: '/disease',
      label: isMarathi ? 'रोग स्कॅन' : 'Scan',
      icon: <Stethoscope className="w-5 h-5" />,
    },
    {
      to: '/advisor',
      label: isMarathi ? 'सल्लागार' : 'Ask AI',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      to: '/weather',
      label: isMarathi ? 'हवामान' : 'Weather',
      icon: <CloudSun className="w-5 h-5" />,
    },
    {
      to: '/market',
      label: isMarathi ? 'बाजार' : 'Prices',
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl px-1.5 py-1 flex items-center justify-around safe-area-bottom select-none"
      aria-label="Mobile Navigation Bar"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-1 rounded-xl min-w-[54px] min-h-[50px] transition-all active:scale-95 ${
              isActive
                ? 'text-emerald-900 bg-emerald-100 font-extrabold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`
          }
        >
          {item.icon}
          <span className="text-[10px] mt-0.5 leading-none tracking-tight">
            {item.label}
          </span>
        </NavLink>
      ))}

      {/* More / Menu Drawer Trigger */}
      {onOpenDrawer && (
        <button
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl min-w-[54px] min-h-[50px] text-slate-600 hover:text-emerald-900 active:scale-95 font-semibold transition"
          aria-label="Open all navigation options"
        >
          <Grid className="w-5 h-5 text-slate-500" />
          <span className="text-[10px] mt-0.5 leading-none tracking-tight">
            {isMarathi ? 'अधिक' : 'More'}
          </span>
        </button>
      )}
    </nav>
  );
};
