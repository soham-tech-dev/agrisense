import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  ShieldCheck, LayoutDashboard, Users, Bug, BookOpen, 
  MessageSquare, Cpu, BarChart3, Settings, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const isMarathi = language === 'mr';

  const navItems = [
    { path: '/admin', label: isMarathi ? 'डॅशबोर्ड Overview' : 'Dashboard Overview', icon: LayoutDashboard },
    { path: '/admin/users', label: isMarathi ? 'वापरकर्ते Management' : 'User Management', icon: Users },
    { path: '/admin/disease', label: isMarathi ? 'रोग कॅटलॉग Catalog' : 'Disease Catalog', icon: Bug },
    { path: '/admin/knowledge', label: isMarathi ? 'KVK ज्ञान संग्रह' : 'Knowledge Base', icon: BookOpen },
    { path: '/admin/feedback', label: isMarathi ? 'अभिप्राय Feedback' : 'Feedback & Reviews', icon: MessageSquare },
    { path: '/admin/model', label: isMarathi ? 'AI मॉडेल ॲनालिटिक्स' : 'Model Performance', icon: Cpu },
    { path: '/admin/analytics', label: isMarathi ? 'सिस्टम ॲनालिटिक्स' : 'System Analytics', icon: BarChart3 },
    { path: '/admin/settings', label: isMarathi ? 'प्रशासकीय सेटिंग्ज' : 'Admin Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Admin Sidebar */}
      <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Header Branding */}
          <div className="p-5 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/60">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-950">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                <span>AgriSense</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-widest font-bold">
                  ADMIN
                </span>
              </h2>
              <p className="text-xs text-slate-400">Control & Analytics Hub</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2">
              Management Portal
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Back to App */}
        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950/40">
          <div className="flex items-center justify-between px-2 py-1.5 text-xs text-slate-400">
            <span className="truncate font-medium text-slate-300">Admin: {user?.name || user?.phone}</span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold">ACTIVE</span>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition"
          >
            <span>Return to Farmer View</span>
          </button>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
