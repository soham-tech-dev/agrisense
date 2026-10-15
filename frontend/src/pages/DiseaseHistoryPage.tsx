import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { History, ArrowLeft, Calendar, ArrowRight, PlusCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DiseaseScan } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { offlineStorage } from '../services/offlineStorage';
import { DiseaseHistoryModal } from '../components/disease/DiseaseHistoryModal';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const DiseaseHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const lang = user?.language || 'mr';
  const isMarathi = lang === 'mr';

  const [scans, setScans] = useState<DiseaseScan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScanModal, setSelectedScanModal] = useState<any | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [lang]);

  const fetchHistory = () => {
    setIsLoading(true);
    api.getDiseaseHistory()
      .then((data) => {
        setScans(data);
        offlineStorage.saveDiseaseScans(data);
        setLastUpdated(new Date().toISOString());
        setError(null);
      })
      .catch((err) => {
        console.warn("Failed to load live history, loading from offline cache:", err);
        const cached = offlineStorage.getDiseaseScans();
        if (cached.data && cached.data.length > 0) {
          setScans(cached.data);
          setLastUpdated(cached.updatedAt);
        } else {
          setError(lang === 'mr' ? "स्कॅन इतिहास लोड करता आला नाही." : "Failed to load scan history.");
        }
      })
      .finally(() => setIsLoading(false));
  };

  if (isLoading) {
    return <LoadingState message={lang === 'mr' ? 'स्कॅन इतिहास लोड होत आहे...' : 'Loading scan history...'} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-14 font-sans">
      <OfflineBanner lastUpdatedTimestamp={lastUpdated} onRefreshLive={fetchHistory} />

      {/* Navigation Header */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => navigate('/disease')}
          className="flex items-center gap-2 text-forest-800 hover:text-botanical-600 font-bold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-botanical-600" />
          <span>{lang === 'mr' ? 'नवीन स्कॅन करा' : 'New Scan'}</span>
        </button>

        <Button
          variant="forest"
          size="sm"
          onClick={() => navigate('/disease')}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          <span>{lang === 'mr' ? 'फोटो काढा / अपलोड करा' : 'Scan Crop Leaf'}</span>
        </Button>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white p-6 sm:p-8 shadow-xl border border-forest-800/60">
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-botanical-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-forest-800/80 border border-botanical-500/30 rounded-full text-xs font-bold text-botanical-300">
              <History className="w-4 h-4 text-botanical-400" />
              <span>{lang === 'mr' ? 'स्कॅन इतिहास नोंदी' : 'Pathology Records'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {lang === 'mr' ? 'माझे जुने पिक रोग स्कॅन' : 'My Crop Disease Scans'}
            </h1>
            <p className="text-forest-200 text-xs sm:text-sm">
              {lang === 'mr'
                ? 'तुम्ही पूर्वी केलेल्या सर्व पिक रोग निदानांची व दिलेल्या सल्ल्यांची संपूर्ण यादी.'
                : 'Record of all previous crop leaf scans and AI diagnoses.'}
            </p>
          </div>

          <div className="bg-forest-900/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-forest-700/60 text-center shrink-0">
            <span className="text-2xl font-black text-white">{scans.length}</span>
            <span className="text-[11px] font-bold text-forest-300 block">{lang === 'mr' ? 'एकूण स्कॅन' : 'Total Scans'}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-300 p-4 rounded-2xl text-rose-800 text-sm font-medium">
          {error}
        </div>
      )}

      {/* History Grid / List */}
      {scans.length === 0 ? (
        <Card variant="flat" className="p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-forest-50 text-forest-700 mx-auto flex items-center justify-center">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {lang === 'mr' ? 'कोणतेही जुने स्कॅन सापडले नाहीत' : 'No scans found yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {lang === 'mr'
              ? 'पिकाच्या पानाचा फोटो काढून पहिले AI रोग निदान करा.'
              : 'Take a crop leaf photograph to perform your first AI disease diagnosis.'}
          </p>
          <Button
            variant="forest"
            onClick={() => navigate('/disease')}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            <span>{lang === 'mr' ? 'पहिले स्कॅन करा' : 'Start First Scan'}</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scans.map((item) => {
            const confidencePct = Math.round(item.confidence * 100);
            const disease = item.disease_info;
            const title = disease ? (lang === 'mr' ? disease.name_mr : disease.name_en) : item.prediction;

            return (
              <Card
                key={item.id}
                hoverable
                onClick={() => setSelectedScanModal(item)}
                padding="sm"
                className="cursor-pointer group flex gap-4 transition-all"
              >
                {/* Thumbnail */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative">
                  <img
                    src={item.image_url}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <Badge
                        variant={confidencePct >= 75 ? 'success' : confidencePct >= 60 ? 'warning' : 'danger'}
                        size="sm"
                      >
                        {confidencePct}%
                      </Badge>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 truncate group-hover:text-forest-800 transition-colors">
                      {title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {disease ? (lang === 'mr' ? disease.symptoms_mr : disease.symptoms_en) : ''}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                    <span className="text-[10px] text-slate-400 font-medium">{item.model_version}</span>
                    <span className="text-xs font-bold text-forest-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>{lang === 'mr' ? 'उघडा' : 'Open Details'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-botanical-600" />
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal for detailed inspection */}
      {selectedScanModal && (
        <DiseaseHistoryModal
          scan={selectedScanModal}
          onClose={() => setSelectedScanModal(null)}
        />
      )}
    </div>
  );
};

export default DiseaseHistoryPage;
