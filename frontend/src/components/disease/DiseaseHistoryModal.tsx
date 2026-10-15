import React from 'react';
import { X, Calendar, ShieldCheck, AlertTriangle, BookOpen, HeartPulse, ExternalLink } from 'lucide-react';
import { FeedbackWidget } from '../common/FeedbackWidget';

interface ScanItem {
  id: string | any;
  crop_id?: string;
  image_url: string;
  prediction: string;
  confidence: number;
  model_version: string;
  created_at: string;
  disease_info?: {
    name_en: string;
    name_mr: string;
    crop: string;
    symptoms_en: string;
    symptoms_mr: string;
    advisory_en: string;
    advisory_mr: string;
    prevention_en?: string;
    prevention_mr?: string;
    source?: string;
  };
}

interface DiseaseHistoryModalProps {
  scan: ScanItem | null;
  onClose: () => void;
}

export const DiseaseHistoryModal: React.FC<DiseaseHistoryModalProps> = ({ scan, onClose }) => {
  if (!scan) return null;

  const isLowConfidence = scan.confidence < 0.70;
  const formattedDate = new Date(scan.created_at).toLocaleString('mr-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-emerald-100 flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-emerald-800 text-white p-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-lg">रोग निदान तपशील (Disease Scan Details)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-emerald-700 text-emerald-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Image & Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 aspect-video md:aspect-square">
              <img
                src={scan.image_url.startsWith('http') || scan.image_url.startsWith('/') ? scan.image_url : `/static/scans/${scan.image_url}`}
                alt={scan.prediction}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>निदान तारीख: {formattedDate}</span>
              </div>

              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                  पिक: {scan.disease_info?.crop || 'Crop'}
                </span>
                <h4 className="text-xl font-bold text-slate-900 mt-1">
                  {scan.disease_info?.name_mr || scan.prediction}
                </h4>
                {scan.disease_info?.name_en && (
                  <p className="text-sm text-slate-500 italic">{scan.disease_info.name_en}</p>
                )}
              </div>

              {/* Confidence & Trust Badges */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">मॉडेल अचूकता (Model Confidence):</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                    isLowConfidence ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {(scan.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex justify-between border-t border-slate-200 pt-2">
                  <span>AI मॉडेल आवृत्ती: {scan.model_version}</span>
                  <span>स्रोत: {scan.disease_info?.source || 'PlantVillage / ICAR'}</span>
                </div>

                {isLowConfidence && (
                  <div className="flex items-start space-x-2 bg-amber-50 text-amber-800 text-xs p-2 rounded border border-amber-200 mt-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>कमी अचूकता इशारा: उपचारापूर्वी कृषी विज्ञान केंद्रातील (KVK) तज्ज्ञांचा सल्ला घ्या.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Symptoms */}
          {scan.disease_info?.symptoms_mr && (
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 space-y-2">
              <h5 className="font-bold text-emerald-900 flex items-center text-sm">
                <BookOpen className="w-4 h-4 mr-1.5 text-emerald-700" />
                लक्षणे (Symptoms)
              </h5>
              <p className="text-sm text-slate-700">{scan.disease_info.symptoms_mr}</p>
              {scan.disease_info.symptoms_en && (
                <p className="text-xs text-slate-500 italic">{scan.disease_info.symptoms_en}</p>
              )}
            </div>
          )}

          {/* Advisory & Remedies */}
          {scan.disease_info?.advisory_mr && (
            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-2">
              <h5 className="font-bold text-blue-900 flex items-center text-sm">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-700" />
                शिफारस केलेले उपचार (Recommended Advisory & Remedies)
              </h5>
              <p className="text-sm text-slate-700">{scan.disease_info.advisory_mr}</p>
              {scan.disease_info.advisory_en && (
                <p className="text-xs text-slate-500 italic">{scan.disease_info.advisory_en}</p>
              )}
            </div>
          )}

          {/* Prevention */}
          {scan.disease_info?.prevention_mr && (
            <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 space-y-2">
              <h5 className="font-bold text-purple-900 flex items-center text-sm">
                प्रतिबंधात्मक उपाय (Prevention Measures)
              </h5>
              <p className="text-sm text-slate-700">{scan.disease_info.prevention_mr}</p>
            </div>
          )}

          {/* Feedback section */}
          <div className="border-t border-slate-200 pt-4">
            <FeedbackWidget feature="disease" referenceId={scan.id} />
          </div>
        </div>
      </div>
    </div>
  );
};
