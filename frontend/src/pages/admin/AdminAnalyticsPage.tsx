import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, PieChart, ShieldCheck, RefreshCw } from 'lucide-react';
import axios from 'axios';

export const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('agrisense_token');
      const res = await axios.get('/api/v1/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to load system analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 text-xs">
        <RefreshCw className="w-4 h-4 animate-spin mr-2 text-emerald-400" />
        <span>Loading system analytics...</span>
      </div>
    );
  }

  const crops = data?.most_searched_crops || [];
  const markets = data?.most_searched_markets || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <span>System Usage & Market Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real usage metrics, search distributions, feedback satisfaction rate, and RAG grounding performance.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Primary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total / Active Users</span>
          <div className="text-2xl font-black text-white">{data?.users} / {data?.active_users}</div>
          <div className="text-[11px] text-emerald-400 font-bold">100% Verified Accounts</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Disease Scans</span>
          <div className="text-2xl font-black text-emerald-400">{data?.disease_scans}</div>
          <div className="text-[11px] text-slate-400 font-bold">MobileNetV2 Inference Engine</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-xs font-semibold text-slate-400">Feedback Satisfaction</span>
          <div className="text-2xl font-black text-emerald-400">{data?.feedback_helpful_rate}%</div>
          <div className="text-[11px] text-emerald-400 font-bold">Helpful Rating Rate</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-xs font-semibold text-slate-400">RAG Safety Fallback Rate</span>
          <div className="text-2xl font-black text-amber-400">{data?.rag_fallback_rate}%</div>
          <div className="text-[11px] text-slate-400 font-bold">Non-grounded Fallback Safety</div>
        </div>
      </div>

      {/* Visual Chart Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Searched Crops */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <span>Most Searched Crops (सर्वाधिक विचारलेली पिके)</span>
          </h3>
          <div className="space-y-3">
            {crops.map((c: any, i: number) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-300">
                  <span>{c.crop}</span>
                  <span className="text-emerald-400">{c.share}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Searched Mandi Markets */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Most Searched APMC Markets (प्रमुख बाजार समित्या)</span>
          </h3>
          <div className="space-y-3">
            {markets.map((m: any, i: number) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-300">
                  <span>{m.market}</span>
                  <span className="text-amber-400">{m.share}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${m.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
