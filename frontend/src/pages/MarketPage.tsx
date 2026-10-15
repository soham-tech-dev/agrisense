import React, { useState, useEffect } from 'react';
import { TrendingUp, Filter, RefreshCw, BarChart3, ArrowUpRight, Scale } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { MandiPrice, MandiHistoryResponse } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingState } from '../components/common/LoadingState';
import { MandiPricesWidget } from '../components/mandi/MandiPricesWidget';
import { MarketComparisonModal } from '../components/mandi/MarketComparisonModal';
import { offlineStorage } from '../services/offlineStorage';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { FeedbackWidget } from '../components/common/FeedbackWidget';

export const MarketPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [cropsList, setCropsList] = useState<any[]>([]);
  const [marketsList, setMarketsList] = useState<any[]>([]);
  const [history, setHistory] = useState<MandiHistoryResponse | null>(null);
  
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [selectedMarket, setSelectedMarket] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const district = user?.district || 'Nashik';
  const isMarathi = language === 'mr';

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const [pricesData, crops, markets, hist] = await Promise.all([
        api.getMandiPrices(selectedCrop || undefined, selectedMarket || undefined, district),
        api.getMandiCrops(),
        api.getMandiMarkets(),
        api.getMandiHistory(selectedCrop || 'Onion', selectedMarket || 'Lasalgaon', 7)
      ]);
      setPrices(pricesData);
      setCropsList(crops);
      setMarketsList(markets);
      setHistory(hist);
      
      const payload = { prices: pricesData, crops, markets, history: hist };
      offlineStorage.saveMandi(payload);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.warn('Failed to load live mandi data, checking cache:', err);
      const cached = offlineStorage.getMandi();
      if (cached.data) {
        setPrices(cached.data.prices || []);
        setCropsList(cached.data.crops || []);
        setMarketsList(cached.data.markets || []);
        setHistory(cached.data.history || null);
        setLastUpdated(cached.updatedAt);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData();
  }, [selectedCrop, selectedMarket, district]);

  if (loading) {
    return <LoadingState message={isMarathi ? 'बाजार भाव माहिती लोड होत आहे...' : 'Loading mandi prices...'} />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-14 font-sans">
      <OfflineBanner lastUpdatedTimestamp={lastUpdated} onRefreshLive={loadMarketData} />

      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white p-6 sm:p-8 shadow-xl border border-forest-800/60">
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-forest-800/80 border border-amber-400/30 rounded-full text-xs font-bold text-amber-300">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>{isMarathi ? 'अ‍ॅग्रीसेन्स APMC बाजार समिती नेटवर्क • Agmarknet' : 'AgriSense APMC Mandi Network • Agmarknet Live'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isMarathi ? `${district} कृषी बाजार भाव` : `${district} Mandi Prices`}
            </h1>
            <p className="text-forest-200 text-xs sm:text-sm leading-relaxed">
              {isMarathi
                ? 'महाराष्ट्रातील प्रमुख बाजार समित्यांमधील दैनिक बाजार भाव, आवक व बाजार तुलना.'
                : 'Daily commodity market rates, arrival volumes, and multi-APMC price comparisons.'}
            </p>
          </div>

          <Button
            variant="forest"
            size="md"
            className="bg-amber-500 hover:bg-amber-400 text-forest-950 font-black border-none shadow-md"
            leftIcon={<Scale className="w-4 h-4 text-forest-950" />}
            onClick={() => setIsCompareOpen(true)}
          >
            {isMarathi ? 'बाजार तुलना (Compare)' : 'Compare Markets'}
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card variant="flat" padding="sm" className="border-slate-200/80">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 whitespace-nowrap">
            <Filter className="w-4 h-4 text-forest-700" />
            <span>{isMarathi ? 'फिल्टर करा:' : 'Filter:'}</span>
          </div>

          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-800 focus:ring-2 focus:ring-botanical-500 outline-none shadow-2xs"
          >
            <option value="">{isMarathi ? 'सर्व पिके (All Crops)' : 'All Crops'}</option>
            {cropsList.map((c, i) => (
              <option key={i} value={c.name_en}>
                {isMarathi ? c.name_mr : c.name_en}
              </option>
            ))}
          </select>

          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-800 focus:ring-2 focus:ring-botanical-500 outline-none shadow-2xs"
          >
            <option value="">{isMarathi ? 'सर्व बाजार समित्या (All APMCs)' : 'All APMCs'}</option>
            {marketsList.map((m, i) => (
              <option key={i} value={m.market}>
                {isMarathi ? m.market_mr : m.market} ({m.district})
              </option>
            ))}
          </select>

          <div className="ml-auto flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={loadMarketData}
            >
              {isMarathi ? 'ताजे करा' : 'Refresh'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Live Mandi Prices Widget */}
      <div className="space-y-2">
        <MandiPricesWidget
          prices={prices}
          isMarathi={isMarathi}
          onOpenCompare={() => setIsCompareOpen(true)}
          onRefresh={loadMarketData}
        />
        <FeedbackWidget feature="mandi" referenceId={`mandi_${district}`} className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs" />
      </div>

      {/* Historical Trend */}
      {history && (
        <Card
          title={isMarathi ? '७-दिवसांचा भाव प्रवाह (Price Trend)' : '7-Day Price History Trend'}
          badge={<Badge variant="forest">{history.crop} • {history.market}</Badge>}
        >
          <div className="space-y-3 pt-1">
            <div className="flex justify-between text-xs text-slate-500 font-semibold border-b border-slate-100 pb-2">
              <span>{isMarathi ? 'पिक व बाजार:' : 'Crop & APMC:'} {history.crop} ({history.market})</span>
              <span>{isMarathi ? 'सर्वसाधारण भाव (₹/क्विंटल)' : 'Modal Price (₹/qtl)'}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5">
              {(Array.isArray(history?.history) ? history.history : []).map((pt, idx) => (
                <div key={idx} className="p-3 bg-surface-subtle border border-slate-200/80 rounded-2xl text-center hover:border-botanical-300 transition">
                  <span className="text-[11px] font-bold text-slate-500 block">{pt.date}</span>
                  <span className="text-sm font-black text-forest-800 mt-1 block">₹{pt.modal_price}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Market Comparison Modal */}
      <MarketComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        isMarathi={isMarathi}
        initialCrop={selectedCrop || 'Onion'}
      />
    </div>
  );
};

export default MarketPage;
