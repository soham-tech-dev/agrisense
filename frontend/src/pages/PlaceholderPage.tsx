import React from 'react';
import { Clock, ArrowLeft, ShieldCheck, Stethoscope, MessageSquare, CloudSun, TrendingUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const PlaceholderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isMarathi = user?.language === 'mr';

  const routeDetails: Record<string, { title: string; phase: string; icon: React.ReactNode; desc: string }> = {
    '/crop-health': {
      title: isMarathi ? 'पिक रोग निदान (Crop Health Scanner)' : 'Crop Disease Scanner',
      phase: 'Phase 2',
      icon: <Stethoscope className="w-8 h-8 text-emerald-600" />,
      desc: isMarathi
        ? 'टप्पा २ मध्ये मोबाईलने पानाचा फोटो काढून MobileNetV2 एआय मॉडेलद्वारे त्वरित रोग ओळख व उपाय मिळतील.'
        : 'In Phase 2, MobileNetV2 + OpenCV will analyze leaf photos to diagnose crop diseases and provide treatment steps.',
    },
    '/advisor': {
      title: isMarathi ? 'अ‍ॅग्रीसेन्स केव्हीके एआय सल्ला (Voice AI Advisor)' : 'KVK Grounded AI Voice Advisor',
      phase: 'Phase 3',
      icon: <MessageSquare className="w-8 h-8 text-teal-600" />,
      desc: isMarathi
        ? 'टप्पा ३ मध्ये मराठीतून बोलून कृषी विज्ञान केंद्र (KVK) आणि ICAR च्या अधिकृत मार्गदर्शकांवर आधारित एआय उत्तरे मिळतील.'
        : 'In Phase 3, voice-first Marathi interaction powered by Claude API & ChromaDB RAG will answer your farming queries.',
    },
    '/weather': {
      title: isMarathi ? 'हवामान व कृषी सल्ला (Weather Dashboard)' : 'Agromet Weather Dashboard',
      phase: 'Phase 4',
      icon: <CloudSun className="w-8 h-8 text-sky-600" />,
      desc: isMarathi
        ? 'टप्पा ४ मध्ये आपल्या जिल्ह्याचा दैनंदिन पाऊस, तापमान व ५ दिवसांचा हवामान अंदाज उपलब्ध होईल.'
        : 'In Phase 4, OpenWeatherMap integration will supply daily forecasts and weather-informed farming guidance.',
    },
    '/market': {
      title: isMarathi ? 'बाजार समिती भाव (Mandi Commodity Prices)' : 'APMC Mandi Price Dashboard',
      phase: 'Phase 4',
      icon: <TrendingUp className="w-8 h-8 text-amber-600" />,
      desc: isMarathi
        ? 'टप्पा ४ मध्ये महाराष्ट्रातील मुख्य कृषी उत्पन्न बाजार समित्यांमधील रोजचे बाजार भाव पाहता येतील.'
        : 'In Phase 4, data.gov.in Agmarknet integration will present real-time commodity prices across Maharashtra APMC markets.',
    },
  };

  const currentModule = routeDetails[location.pathname] || {
    title: isMarathi ? 'नवीन मॉड्युल' : 'Upcoming Feature',
    phase: 'Next Phase',
    icon: <Clock className="w-8 h-8 text-emerald-600" />,
    desc: isMarathi ? 'हे मॉड्युल पुढील विकास टप्प्यात समाविष्ट केले जाईल.' : 'This module will be unlocked in upcoming development phases.',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-4">
      <Card className="text-center p-8 border border-slate-200">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          {currentModule.icon}
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-3">
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          {isMarathi ? `टप्पा: ${currentModule.phase} मध्ये येत आहे` : `Coming in ${currentModule.phase}`}
        </span>

        <h1 className="text-2xl font-black text-slate-800 mb-2">
          {currentModule.title}
        </h1>

        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
          {currentModule.desc}
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 max-w-md mx-auto mb-6 text-left space-y-1">
          <p className="font-bold text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {isMarathi ? 'सध्याचा टप्पा १ पूर्ण:' : 'Phase 1 Active Scaffolding:'}
          </p>
          <p>✓ {isMarathi ? 'शेतकरी नोंदणी व प्रमाणीकरण' : 'Farmer authentication & profile management'}</p>
          <p>✓ {isMarathi ? 'शेतीचे क्षेत्र व पिकांची निवड' : 'Farm size, ownership & crop selection profile'}</p>
          <p>✓ {isMarathi ? 'मराठी व इंग्रजी इंटरफेस' : 'Mobile-first Marathi & English app shell'}</p>
        </div>

        <Button
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/dashboard')}
        >
          {isMarathi ? 'मुख्य पानावर जा (Back to Dashboard)' : 'Back to Dashboard'}
        </Button>
      </Card>
    </div>
  );
};
