import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ArrowLeft,
  ShieldAlert,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Send,
  Leaf,
  FlaskConical,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { DiseaseScan } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Tabs } from '../components/common/Tabs';

export const DiseaseResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const lang = language || user?.language || 'mr';
  const isMarathi = lang === 'mr';

  const [scan, setScan] = useState<DiseaseScan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'treatment' | 'organic' | 'symptoms'>('treatment');

  // Feedback states
  const [feedbackAccurate, setFeedbackAccurate] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSubmittedMsg, setFeedbackSubmittedMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api.getDiseaseScan(id)
      .then((data) => {
        setScan(data);
        if (data.feedback_accurate !== undefined && data.feedback_accurate !== null) {
          setFeedbackAccurate(data.feedback_accurate);
          setFeedbackText(data.feedback_text || '');
        }
      })
      .catch((err) => {
        console.error("Failed to load scan:", err);
        setError(isMarathi ? "स्कॅन तपशील लोड करता आले नाहीत." : "Failed to load scan details.");
      })
      .finally(() => setIsLoading(false));
  }, [id, isMarathi]);

  const handleFeedbackSubmit = async (accurate: boolean) => {
    if (!scan) return;
    setFeedbackAccurate(accurate);
    setIsSubmittingFeedback(true);
    try {
      const res = await api.submitDiseaseFeedback(scan.id, accurate, feedbackText);
      setFeedbackSubmittedMsg(res.message);
    } catch (err) {
      console.error("Feedback submit error:", err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleAskAgriSense = () => {
    if (!scan) return;
    const diseaseName = isMarathi && scan.disease_info ? scan.disease_info.name_mr : scan.prediction;
    const query = isMarathi
      ? `माझ्या पिकाला ${diseaseName} रोग झाला आहे (विश्वासार्हता ${Math.round(scan.confidence * 100)}%). कृपया जैविक आणि रासायनिक उपाय सांगा.`
      : `I ran a crop disease scan for ${diseaseName} with ${Math.round(scan.confidence * 100)}% confidence. Please provide full organic and chemical treatment guidelines and dosage.`;
    
    navigate(`/advisor?query=${encodeURIComponent(query)}`);
  };

  if (isLoading) {
    return (
      <LoadingState
        message={isMarathi ? 'रोग निदान निकाल लोड होत आहे...' : 'Loading scan result...'}
      />
    );
  }

  if (error || !scan) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center space-y-4 font-sans">
        <AlertTriangle className="w-14 h-14 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">{error || "Scan not found"}</h2>
        <Button
          variant="forest"
          onClick={() => navigate('/disease')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          <span>{isMarathi ? 'मागे जा' : 'Back to Disease Page'}</span>
        </Button>
      </div>
    );
  }

  const confidencePct = Math.round(scan.confidence * 100);
  const isLowConfidence = scan.confidence < 0.60;
  const disease = scan.disease_info;

  const resultTabs = [
    {
      id: 'treatment',
      label: isMarathi ? 'रासायनिक उपाय (Chemical)' : 'Chemical Advisory',
      icon: <FlaskConical className="w-4 h-4" />
    },
    {
      id: 'organic',
      label: isMarathi ? 'सेंद्रिय व जैविक (Organic)' : 'Organic & Biological',
      icon: <Leaf className="w-4 h-4" />
    },
    {
      id: 'symptoms',
      label: isMarathi ? 'लक्षणे व माहिती (Details)' : 'Symptoms & Info',
      icon: <Info className="w-4 h-4" />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-14 font-sans">
      
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => navigate('/disease')}
          className="flex items-center gap-2 text-forest-800 hover:text-botanical-600 font-bold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4 text-botanical-600" />
          <span>{isMarathi ? 'नवीन स्कॅन करा' : 'Scan Another Leaf'}</span>
        </button>

        <Link
          to="/disease/history"
          className="text-xs font-bold text-forest-700 hover:text-botanical-600 transition flex items-center gap-1"
        >
          <span>{isMarathi ? 'सर्व स्कॅन इतिहास' : 'View Full History'}</span>
        </Link>
      </div>

      {/* Main Result Card */}
      <Card variant="elevated" padding="none" className="overflow-hidden">
        
        {/* Top Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 p-6 sm:p-8 text-white border-b border-forest-800/80">
          <div className="absolute -right-16 -top-16 w-60 h-60 bg-botanical-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-botanical-300">
                <Sparkles className="w-4 h-4 text-botanical-400" />
                <span>{isMarathi ? 'अ‍ॅग्रीसेन्स AI पॅथॉलॉजी निदान निकाल' : 'AgriSense AI Pathology Diagnosis'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {disease ? (isMarathi ? disease.name_mr : disease.name_en) : scan.prediction}
              </h1>
              <div className="text-forest-200 text-xs flex flex-wrap items-center gap-3 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-botanical-400" />
                  {new Date(scan.created_at).toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-forest-600" />
                <span className="flex items-center gap-1 text-forest-300">
                  <Layers className="w-3.5 h-3.5 text-botanical-400" />
                  {scan.model_version}
                </span>
              </div>
            </div>

            {/* Confidence Badge */}
            <div className="bg-forest-900/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-forest-700/60 text-center shrink-0">
              <span className="text-[11px] font-bold text-forest-300 block">
                {isMarathi ? 'विश्वासार्हता स्कोअर' : 'Confidence Score'}
              </span>
              <span className={`text-3xl font-black ${confidencePct >= 75 ? 'text-botanical-300' : confidencePct >= 60 ? 'text-amber-300' : 'text-rose-400'}`}>
                {confidencePct}%
              </span>
            </div>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Column: Image & Confidence Meter */}
          <div className="md:col-span-5 space-y-4">
            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm aspect-[4/3] bg-slate-100 relative flex items-center justify-center">
              {!imageError ? (
                <img
                  src={scan.image_url}
                  alt="Analyzed Crop Leaf"
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <Leaf className="w-12 h-12 mb-2 text-forest-600/50" />
                  <span className="text-xs font-medium text-slate-500">
                    {isMarathi ? 'प्रतिमा लोड करता आली नाही' : 'Image preview unavailable'}
                  </span>
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-forest-950/80 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-xl font-bold border border-forest-700/60">
                {scan.model_version}
              </div>
            </div>

            {/* Confidence Progress Meter */}
            <div className="bg-surface-subtle p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>{isMarathi ? 'विश्वासार्हता श्रेणी:' : 'Confidence Rating:'}</span>
                <span className={confidencePct >= 75 ? 'text-forest-800' : confidencePct >= 60 ? 'text-amber-700' : 'text-rose-700'}>
                  {confidencePct >= 75
                    ? (isMarathi ? 'उच्च (High)' : 'High')
                    : confidencePct >= 60
                    ? (isMarathi ? 'मध्यम (Moderate)' : 'Moderate')
                    : (isMarathi ? 'कमी (Low - पुनर्तपासणी हवी)' : 'Low')}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    confidencePct >= 75
                      ? 'bg-botanical-500'
                      : confidencePct >= 60
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Symptoms, Tabs & Advisory */}
          <div className="md:col-span-7 space-y-5 text-left">
            
            {/* Low Confidence Warning Alert */}
            {isLowConfidence && (
              <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-amber-900 uppercase">
                    {isMarathi ? 'सावधगिरी सूचना (Low Confidence)' : 'Confidence Caution'}
                  </h4>
                  <p className="text-xs font-semibold text-amber-800 mt-1 leading-relaxed">
                    {isMarathi
                      ? "फोटोमध्ये लक्षणे पुरेशी स्पष्ट नाहीत. कृपया दुसरा स्पष्ट फोटो काढा किंवा स्थानिक केव्हीके (KVK) कृषी अधिकाऱ्यांचा सल्ला घ्या."
                      : "The image is not clear enough for a reliable diagnosis. Please upload a clearer photo or consult a local KVK officer."}
                  </p>
                </div>
              </div>
            )}

            {/* Treatment Tabs */}
            <Tabs
              tabs={resultTabs}
              activeTab={activeTab}
              onChange={(tabId) => setActiveTab(tabId as any)}
              variant="pills"
            />

            {/* Tab 1: Chemical Treatment */}
            {activeTab === 'treatment' && disease && (
              <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200/80 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-blue-700" />
                    <span>{isMarathi ? 'रासायनिक फवारणी व औषधोपचार' : 'Chemical Spray Advisory'}</span>
                  </h3>
                  <Badge variant="kvk" size="sm">KVK Recommended</Badge>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed font-semibold whitespace-pre-line pt-1">
                  {isMarathi ? disease.advisory_mr : disease.advisory_en}
                </p>
              </div>
            )}

            {/* Tab 2: Organic Treatment */}
            {activeTab === 'organic' && disease && (
              <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200/80 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-forest-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-botanical-600" />
                    <span>{isMarathi ? 'सेंद्रिय, जैविक व प्रतिबंधात्मक उपाय' : 'Organic & Biological Treatment'}</span>
                  </h3>
                  <Badge variant="forest" size="sm">Zero Chemical</Badge>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed font-semibold whitespace-pre-line pt-1">
                  {isMarathi
                    ? (disease.prevention_mr || 'दशपर्णी अर्क किंवा निंबोळी अर्क (५%) फवारा. ट्रायकोडर्मा व्हिरिडी किंवा स्यूडोमोनास फ्लुरोसेन्स चा वापर करा.')
                    : (disease.prevention_en || 'Apply 5% Neem seed kernel extract (NSKE). Use biological control agents like Trichoderma viride or Pseudomonas fluorescens.')}
                </p>
              </div>
            )}

            {/* Tab 3: Symptoms & Prevention */}
            {activeTab === 'symptoms' && disease && (
              <div className="bg-surface-subtle p-5 rounded-2xl border border-slate-200/80 space-y-3 animate-fade-in">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-forest-700" />
                    <span>{isMarathi ? 'रोगाची लक्षणे:' : 'Disease Symptoms:'}</span>
                  </h4>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                    {isMarathi ? disease.symptoms_mr : disease.symptoms_en}
                  </p>
                </div>
                {disease.prevention_mr && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <h4 className="text-xs font-black text-slate-800 uppercase">
                      {isMarathi ? 'प्रतिबंधात्मक सूचना:' : 'Prevention Guidelines:'}
                    </h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                      {isMarathi ? disease.prevention_mr : disease.prevention_en}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Button: Ask AgriSense */}
            <div className="pt-2">
              <Button
                variant="forest"
                size="lg"
                fullWidth
                onClick={handleAskAgriSense}
                leftIcon={<MessageSquare className="w-5 h-5 text-botanical-300" />}
              >
                <span>{isMarathi ? 'या निकालाबाबत अ‍ॅग्रीसेन्सला विचारा' : 'Ask AgriSense About This Result'}</span>
              </Button>
            </div>

          </div>
        </div>

        {/* Feedback Section Footer */}
        <div className="bg-surface-subtle border-t border-slate-200/80 p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {isMarathi ? 'हे निदान अचूक वाटले का?' : 'Was this result accurate and helpful?'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {isMarathi
                  ? 'तुमचा अभिप्राय अ‍ॅग्रीसेन्स AI मॉडेल अधिक अचूक बनवण्यास मदत करतो.'
                  : 'Your feedback helps improve our AI disease identification models.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleFeedbackSubmit(true)}
                disabled={isSubmittingFeedback}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  feedbackAccurate === true
                    ? 'bg-forest-800 text-white border-forest-800 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-forest-50'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{isMarathi ? 'होय (Accurate)' : 'Yes'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleFeedbackSubmit(false)}
                disabled={isSubmittingFeedback}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  feedbackAccurate === false
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-rose-50'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span>{isMarathi ? 'नाही (Not Accurate)' : 'No'}</span>
              </button>
            </div>
          </div>

          {/* Optional Text Feedback Input */}
          {feedbackAccurate !== null && (
            <div className="pt-2 flex gap-2 max-w-xl">
              <input
                type="text"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={
                  isMarathi
                    ? 'काही प्रतिक्रिया किंवा टिप नोंदवा...'
                    : 'Add optional comments or observation details...'
                }
                className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-botanical-500 bg-white"
              />
              <button
                type="button"
                onClick={() => handleFeedbackSubmit(feedbackAccurate)}
                disabled={isSubmittingFeedback}
                className="px-5 py-2.5 bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isMarathi ? 'पाठवा' : 'Save'}</span>
              </button>
            </div>
          )}

          {feedbackSubmittedMsg && (
            <p className="text-xs font-bold text-forest-800 animate-fade-in">
              ✓ {feedbackSubmittedMsg}
            </p>
          )}
        </div>

      </Card>
    </div>
  );
};

export default DiseaseResultPage;
