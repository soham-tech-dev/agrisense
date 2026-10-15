import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Stethoscope,
  MessageSquare,
  CloudSun,
  TrendingUp,
  Calendar,
  Bookmark,
  BookOpen,
  Tractor,
  User as UserIcon,
  Settings,
  ShieldCheck,
  PhoneCall,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMarathi = language === 'mr';

  const navGroups = [
    {
      groupTitle: isMarathi ? 'मुख्य शेती' : 'Core Farm',
      items: [
        {
          to: '/dashboard',
          label: isMarathi ? 'डॅशबोर्ड' : 'Dashboard',
          subLabel: isMarathi ? 'शेती विहंगावलोकन' : 'Farm Overview',
          icon: <Home className="w-4 h-4 shrink-0" />,
        },
        {
          to: '/disease',
          label: isMarathi ? 'पीक आरोग्य' : 'Crop Health',
          subLabel: isMarathi ? 'रोग निदान कॅमेरा' : 'AI Leaf Scan',
          icon: <Stethoscope className="w-4 h-4 shrink-0" />,
        },
        {
          to: '/advisor',
          label: isMarathi ? 'केव्हीके सल्लागार' : 'Ask AI Advisor',
          subLabel: isMarathi ? 'संभाषण व सल्ला' : 'KVK Grounded',
          icon: <MessageSquare className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      groupTitle: isMarathi ? 'हवामान व बाजार' : 'Climate & Market',
      items: [
        {
          to: '/weather',
          label: isMarathi ? 'हवामान अंदाज' : 'Weather & Spray',
          subLabel: isMarathi ? 'फवारणी सूचना' : '5-Day Forecast',
          icon: <CloudSun className="w-4 h-4 shrink-0" />,
        },
        {
          to: '/market',
          label: isMarathi ? 'बाजार भाव' : 'Mandi Rates',
          subLabel: isMarathi ? 'APMC बाजार समिती' : 'Live Prices',
          icon: <TrendingUp className="w-4 h-4 shrink-0" />,
        },
        {
          to: '/calendar',
          label: isMarathi ? 'पीक दिनदर्शिका' : 'Crop Calendar',
          subLabel: isMarathi ? 'हंगाम वेळापत्रक' : 'Growth Schedule',
          icon: <Calendar className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      groupTitle: isMarathi ? 'शेतकरी साधने' : 'Farmer Toolkit',
      items: [
        {
          to: '/saved-advice',
          label: isMarathi ? 'सल्ला नोंद वही' : 'Saved Advice',
          subLabel: isMarathi ? 'जतन केलेल्या नोंदी' : 'Notebook',
          icon: <Bookmark className="w-4 h-4 shrink-0" />,
        },
        {
          to: '/resources',
          label: isMarathi ? 'शासकीय योजना' : 'Schemes & KVK',
          subLabel: isMarathi ? 'अनुदान व मार्गदर्शक' : 'Govt Resources',
          icon: <BookOpen className="w-4 h-4 shrink-0" />,
        },
        {
          to: '/farm',
          label: isMarathi ? 'माझी शेती' : 'My Farm Plots',
          subLabel: isMarathi ? 'जमीन व पिके' : 'Land & Acreage',
          icon: <Tractor className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      groupTitle: isMarathi ? 'खाते व सेटिंग्ज' : 'Account',
      items: [
        {
          to: '/profile',
          label: isMarathi ? 'शेतकरी प्रोफाइल' : 'Farmer Profile',
          subLabel: isMarathi ? 'पत्ता व माहिती' : 'Personal Details',
          icon: <UserIcon className="w-4 h-4 shrink-0" />,
        },
        {
          to: '/settings',
          label: isMarathi ? 'सेटिंग्ज' : 'Settings',
          subLabel: isMarathi ? 'अ‍ॅप प्राधान्ये' : 'App Preferences',
          icon: <Settings className="w-4 h-4 shrink-0" />,
        },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs md:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#062415] text-forest-100 border-r border-emerald-950/80 transition-all duration-300 ease-in-out select-none shadow-2xl ${
          // Mobile responsive slide-over drawer
          isOpenMobile ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${
          // Desktop collapse width
          isCollapsed ? 'md:w-20' : 'md:w-72'
        }`}
        aria-label="Application Sidebar"
      >
        {/* Brand Header — Exact Match to User Reference */}
        <div className="h-[74px] px-4 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#052013]/95 backdrop-blur-xl relative">
          <div
            onClick={() => {
              navigate('/dashboard');
              onCloseMobile();
            }}
            className="flex items-center gap-3 cursor-pointer overflow-hidden group py-1"
          >
            {/* Standalone Duo-Leaf Motif — Larger & More Prominent */}
            <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-10.5 h-10.5 sm:w-11 sm:h-11 drop-shadow-[0_2px_10px_rgba(52,211,153,0.45)]"
              >
                {/* Small Left Leaflet */}
                <path
                  d="M6.2 21.8C5.2 18.2 6.6 15 9.8 14.2C10.5 17.2 9.6 20.4 6.2 21.8Z"
                  fill="#86efac"
                />
                {/* Main Upward-Right Leaf */}
                <path
                  d="M9.8 23.8C8.8 17.2 12.2 10.2 25.2 6.8C25.8 14.8 20.8 23.8 9.8 23.8Z"
                  fill="#bbf7d0"
                />
                {/* Central Curved Vein */}
                <path
                  d="M10.8 22.8C13.8 18.2 17.4 13.8 23.4 9.2"
                  stroke="#065f46"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {(!isCollapsed || isOpenMobile) && (
              <div className="animate-fade-in flex items-center">
                <span className="font-black text-[23px] sm:text-[24px] tracking-tight leading-none select-none group-hover:opacity-95 transition-opacity">
                  <span className="text-white">Agri</span>
                  <span className="text-[#34d399] font-black drop-shadow-[0_0_14px_rgba(52,211,153,0.5)]">
                    Sense
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="p-2 text-emerald-300/70 hover:text-white rounded-xl hover:bg-white/10 md:hidden transition"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Tactile Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-200 items-center justify-center shadow-xs active:scale-95 group/collapse shrink-0"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 group-hover/collapse:translate-x-0.5 transition-transform" />
            ) : (
              <ChevronLeft className="w-4 h-4 group-hover/collapse:-translate-x-0.5 transition-transform" />
            )}
          </button>
        </div>

        {/* Scrollable Navigation Groups with bespoke dark scrollbar */}
        <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-5 sidebar-scrollbar">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className={`space-y-1 ${gIdx > 0 ? 'pt-3 border-t border-emerald-950/70' : ''}`}>
              {(!isCollapsed || isOpenMobile) && (
                <div className="px-3 pb-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-400/70 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500/60" />
                  <span>{group.groupTitle}</span>
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    location.pathname === item.to ||
                    (item.to !== '/dashboard' && location.pathname.startsWith(item.to));

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onCloseMobile}
                      title={isCollapsed ? item.label : undefined}
                      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-200 ease-out cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 text-white font-black shadow-md shadow-emerald-950/60 border border-emerald-400/35'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border hover:border-white/[0.08] font-bold'
                      } ${isCollapsed && !isOpenMobile ? 'justify-center px-2 py-3' : ''}`}
                    >
                      {/* Icon container with refined hover micro-interaction */}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                          isActive
                            ? 'bg-white/20 text-white shadow-inner'
                            : 'bg-emerald-950/60 text-emerald-400/80 group-hover:bg-emerald-800/40 group-hover:text-emerald-300 group-hover:scale-110'
                        }`}
                      >
                        {item.icon}
                      </div>

                      {(!isCollapsed || isOpenMobile) && (
                        <div className="flex-1 min-w-0 transition-transform duration-200 group-hover:translate-x-0.5">
                          <div className="flex items-center justify-between">
                            <span
                              className={`block truncate text-xs sm:text-[13px] tracking-tight ${
                                isActive ? 'text-white font-black' : 'text-slate-200 group-hover:text-white font-bold'
                              }`}
                            >
                              {item.label}
                            </span>
                            {/* Active indicator dot or hover arrow */}
                            {isActive ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs shadow-white shrink-0 ml-2 animate-pulse-subtle" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-emerald-400/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 shrink-0 ml-2" />
                            )}
                          </div>
                          <span
                            className={`block text-[10.5px] truncate leading-tight mt-0.5 ${
                              isActive
                                ? 'text-emerald-100/90 font-medium'
                                : 'text-slate-400/70 font-normal group-hover:text-emerald-200/80'
                            }`}
                          >
                            {item.subLabel}
                          </span>
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Farmer Helpline Support Card */}
          {(!isCollapsed || isOpenMobile) && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-[#072c1a] to-[#041a0e] border border-emerald-500/25 text-xs space-y-2.5 mt-4 shadow-lg">
              <div className="flex items-center gap-2 text-emerald-300 font-extrabold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse-subtle" />
                <span>{isMarathi ? 'केव्हीके शेतकरी मदत' : 'ICAR / KVK Helpline'}</span>
              </div>
              <p className="text-[11px] text-emerald-100/80 leading-relaxed font-medium">
                {isMarathi
                  ? 'संकटकालीन पीक सल्ला किंवा तज्ज्ञांशी थेट बोला:'
                  : 'Emergency crop guidance and direct scientist support:'}
              </p>
              <a
                href="tel:18001801551"
                className="flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl font-black text-xs transition-all active:scale-95 shadow-md shadow-emerald-950/50"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>1800-180-1551 (Toll Free)</span>
              </a>
            </div>
          )}
        </div>

        {/* User Profile & Account Footer */}
        <div className="p-3 border-t border-emerald-950/90 bg-[#062415]/95 backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div
              onClick={() => {
                navigate('/profile');
                onCloseMobile();
              }}
              className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer hover:bg-white/[0.06] transition-colors p-1.5 rounded-xl group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 border border-emerald-400/40 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm relative group-hover:scale-105 transition-transform">
                {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#062415]" />
              </div>
              {(!isCollapsed || isOpenMobile) && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-emerald-200 transition-colors">
                    {user?.name || (isMarathi ? 'शेतकरी मित्र' : 'Farmer')}
                  </p>
                  <p className="text-[10px] text-emerald-300/70 truncate leading-tight mt-0.5 font-medium">
                    {user?.phone || user?.district || 'AgriSense User'}
                  </p>
                </div>
              )}
            </div>

            {(!isCollapsed || isOpenMobile) && (
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border hover:border-rose-500/20 rounded-xl transition-all duration-200 shrink-0"
                title={isMarathi ? 'लॉगआउट' : 'Sign Out'}
                aria-label={isMarathi ? 'लॉगआउट' : 'Sign Out'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
