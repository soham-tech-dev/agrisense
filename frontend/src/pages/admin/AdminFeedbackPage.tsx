import React, { useEffect, useState } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, AlertCircle, RefreshCw, Filter } from 'lucide-react';
import axios from 'axios';

interface FeedbackItem {
  id: string;
  user_id?: string;
  feature: string;
  reference_id?: string;
  rating: string;
  reason?: string;
  comment?: string;
  created_at: string;
}

export const AdminFeedbackPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [featureFilter, setFeatureFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('agrisense_token');
      const res = await axios.get('/api/v1/admin/feedback', {
        params: { feature: featureFilter || undefined },
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [featureFilter]);

  const items: FeedbackItem[] = data?.items || [];
  const summary = data?.summary || { positive: 0, negative: 0, needs_review: 0, total: 0 };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            <span>Feedback & User Reviews (अभिप्राय पुनरावलोकन)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review thumbs up / down ratings, reason categories, and farmer comments across all AI features.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={featureFilter}
            onChange={(e) => setFeatureFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="">All Features (सर्व वैशिष्ट्ये)</option>
            <option value="disease">Disease Scan (रोग स्कॅन)</option>
            <option value="chat">AI Chat Advisor (सल्लागार)</option>
            <option value="weather">Weather Advisory (हवामान)</option>
            <option value="mandi">Mandi Prices (बाजार भाव)</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400">Positive Feedback (उपयुक्त)</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{summary.positive}</div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ThumbsUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400">Negative Feedback (अनुपयुक्त)</div>
            <div className="text-2xl font-black text-rose-400 mt-1">{summary.negative}</div>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <ThumbsDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400">Needs Review (पुनरावलोकन आवश्यक)</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{summary.needs_review}</div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Feedback Items Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center">
            <RefreshCw className="w-4 h-4 animate-spin mr-2 text-emerald-400" />
            <span>Loading user feedback...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No feedback entries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Feature</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Reason Category</th>
                  <th className="p-4">Comment</th>
                  <th className="p-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {items.map((fb) => (
                  <tr key={fb.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-4">
                      <span className="font-bold text-white uppercase">{fb.feature}</span>
                      {fb.reference_id && (
                        <div className="text-[10px] text-slate-500 font-mono">Ref: {fb.reference_id}</div>
                      )}
                    </td>
                    <td className="p-4">
                      {fb.rating === 'helpful' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                          <ThumbsUp className="w-3 h-3" /> Helpful
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2.5 py-1 rounded-full border border-rose-500/30">
                          <ThumbsDown className="w-3 h-3" /> Not Helpful
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-slate-300 capitalize">
                      {fb.reason ? fb.reason.replace('_', ' ') : '—'}
                    </td>
                    <td className="p-4 text-slate-200 italic max-w-xs truncate">
                      {fb.comment || 'No comment text provided'}
                    </td>
                    <td className="p-4 text-right text-slate-500 text-[11px]">
                      {new Date(fb.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
