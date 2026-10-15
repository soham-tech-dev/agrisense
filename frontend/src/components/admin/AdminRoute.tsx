import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const AdminRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role?.toUpperCase() !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Denied (प्रवेश नाकारला)</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Admin privileges are required to access the AgriSense Management System. Your current account role is <span className="text-amber-400 font-bold uppercase">{user.role || 'FARMER'}</span>.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-950"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Farmer Dashboard</span>
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
