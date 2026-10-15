import React, { useState, useEffect } from 'react';
import { X, Award, AlertCircle, TrendingUp, ChevronRight } from 'lucide-react';
import { MarketComparisonResponse } from '../../types';
import { api } from '../../services/api';
import { Button } from '../common/Button';

interface MarketComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMarathi: boolean;
  initialCrop?: string;
}

export const MarketComparisonModal: React.FC<MarketComparisonModalProps> = ({
  isOpen,
  onClose,
  isMarathi,
  initialCrop = 'Onion'
}) => {
  const [selectedCrop, setSelectedCrop] = useState(initialCrop);
  const [comparison, setComparison] = useState<MarketComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const availableCrops = [
    { en: 'Onion', mr: 'कांदा' },
    { en: 'Tomato', mr: 'टोमॅटो' },
    { en: 'Soybean', mr: 'सोयाबीन' },
    { en: 'Grapes', mr: 'द्राक्षे' },
    { en: 'Pomegranate', mr: 'डाळिंब' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadComparison(selectedCrop);
    }
  }, [isOpen, selectedCrop]);

  const loadComparison = async (crop: string) => {
    setLoading(true);
    try {
      const res = await api.getMarketComparison(crop);
      setComparison(res);
    } catch (err) {
      console.error('Failed to load market comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              {isMarathi ? 'बाजार समिती तुलना' : 'APMC Market Comparison'}
            </span>
            <h3 className="text-xl font-black">
              {isMarathi ? 'विभिन्न बाजारांमधील भाव' : 'Compare Commodity Rates'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Selector Chips */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-2 overflow-x-auto">
          {availableCrops.map((c) => (
            <button
              key={c.en}
              onClick={() => setSelectedCrop(c.en)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
                selectedCrop === c.en
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {isMarathi ? c.mr : c.en}
            </button>
          ))}
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm animate-pulse">
              {isMarathi ? 'बाजार समिती डेटा लोड होत आहे...' : 'Loading market comparison data...'}
            </div>
          ) : comparison ? (
            <>
              {(Array.isArray(comparison?.comparison) ? comparison.comparison : []).map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition relative ${
                    item.is_highest
                      ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  {item.is_highest && (
                    <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Award className="w-3 h-3" />
                      {isMarathi ? 'सर्वोच्च भाव' : 'Highest Price'}
                    </div>
                  )}

                  <div className="pr-20">
                    <h4 className="font-extrabold text-slate-900 text-base">
                      {isMarathi ? item.market_mr || item.market : item.market}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isMarathi ? 'जिल्हा:' : 'District:'} {item.district}
                    </p>
                  </div>

                  <div className="mt-3 flex justify-between items-baseline border-t border-slate-200/60 pt-2">
                    <div>
                      <span className="text-xs text-slate-500 block">
                        {isMarathi ? 'सर्वसाधारण भाव' : 'Modal Price'}
                      </span>
                      <span className="text-xl font-black text-slate-900">
                        ₹{item.modal_price.toLocaleString('en-IN')}
                        <span className="text-xs text-slate-500 font-normal"> / {isMarathi ? 'क्विंटल' : 'qtl'}</span>
                      </span>
                    </div>

                    {!item.is_highest && (
                      <span className="text-xs font-bold text-slate-500">
                        {item.variance_from_highest} {isMarathi ? 'रुपये कमी' : 'lower'}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Explicit Disclaimer (Part E requirement) */}
              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">{isMarathi ? 'महत्त्वाची सूचना:' : 'Notice:'}</span>
                  <p className="text-[11px] leading-relaxed">
                    {isMarathi ? comparison.disclaimer_mr : comparison.disclaimer_en}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">
              {isMarathi ? 'डेटा उपलब्ध नाही.' : 'No comparison data found.'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            {isMarathi ? 'बंद करा' : 'Close'}
          </Button>
        </div>
      </div>
    </div>
  );
};
