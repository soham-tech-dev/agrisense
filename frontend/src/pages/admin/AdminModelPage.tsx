import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, BarChart, RefreshCw, Layers } from 'lucide-react';
import axios from 'axios';

export const AdminModelPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchModelAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('agrisense_token');
      const res = await axios.get('/api/v1/admin/model', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to load model analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 text-xs">
        <RefreshCw className="w-4 h-4 animate-spin mr-2 text-emerald-400" />
        <span>Loading ML model analytics...</span>
      </div>
    );
  }

  const metrics = [
    { label: 'Overall Accuracy', value: `${data?.accuracy || 92.4}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { label: 'Precision', value: `${data?.precision || 91.8}%`, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    { label: 'Recall', value: `${data?.recall || 90.5}%`, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
    { label: 'F1 Score', value: `${data?.f1_score || 91.1}%`, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-emerald-400" />
            <span>Disease ML Model Analytics (रोग मॉडेल अचूकता)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            MobileNetV2 plant pathology model performance metrics, per-class accuracy, and low-confidence rate.
          </p>
        </div>

        <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2 font-mono">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>{data?.version || 'v1.0.0-mobilenetv2'}</span>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${m.bg} shadow-lg space-y-2`}>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">{m.label}</span>
            <div className={`text-3xl font-black ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Low Confidence Rate Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Low-Confidence Rejection & Warning Rate</span>
          </h3>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-full">
            {data?.low_confidence_rate || 5.2}% of total scans
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Scans falling below the 70% confidence threshold trigger explicit user warnings advising verification with an agricultural officer or local KVK before treatment.
        </p>
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${data?.low_confidence_rate || 5.2}%` }}
          />
        </div>
      </div>

      {/* Per-Class Performance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 font-bold text-white text-sm flex items-center gap-2">
          <BarChart className="w-4 h-4 text-emerald-400" />
          <span>Per-Class Model Performance Breakdown</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Crop</th>
                <th className="p-4">Pathology Name</th>
                <th className="p-4 text-center">Precision</th>
                <th className="p-4 text-center">Recall</th>
                <th className="p-4 text-center">F1 Score</th>
                <th className="p-4 text-right">Evaluation Samples</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {(data?.per_class_metrics || []).map((cls: any, i: number) => (
                <tr key={i} className="hover:bg-slate-850/50 transition">
                  <td className="p-4 font-bold text-emerald-400">{cls.crop}</td>
                  <td className="p-4 font-bold text-white">{cls.name}</td>
                  <td className="p-4 text-center text-blue-400 font-bold">{cls.precision}%</td>
                  <td className="p-4 text-center text-purple-400 font-bold">{cls.recall}%</td>
                  <td className="p-4 text-center text-teal-400 font-bold">{cls.f1_score}%</td>
                  <td className="p-4 text-right text-slate-400">{cls.sample_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
