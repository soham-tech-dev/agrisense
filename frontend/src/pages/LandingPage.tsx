import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout,
  Mic,
  ArrowRight,
  TrendingUp,
  CloudSun,
  Stethoscope,
  Bot,
  Tractor,
  History,
  Calendar,
  Sparkles,
  ShieldCheck,
  Check,
  Building2,
  Languages,
  Menu,
  X,
  ChevronDown,
  Globe,
  Leaf,
  Volume2,
  PhoneCall,
  ExternalLink,
  BookOpen,
  Bookmark,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { VoiceWidget } from '../components/advisor/VoiceWidget';
import { voiceFactory } from '../services/voice/VoiceFactory';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const isMarathi = language === 'mr';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const voiceProvider = voiceFactory.getProvider();

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAction = (path: string) => {
    navigate(path);
  };

  const faqs = [
    {
      qMr: 'अ‍ॅग्रीसेन्स (AgriSense) कसे काम करते?',
      qEn: 'How does AgriSense work?',
      aMr: 'अ‍ॅग्रीसेन्स हे आधुनिक कृषी एआय तंत्रज्ञान आणि भारतीय कृषी अनुसंधान परिषद (ICAR) व कृषी विज्ञान केंद्रांच्या (KVK) अधिकृत ज्ञानकोशावर आधारित आहे. शेतकरी आपल्या स्थानिक भाषेत प्रश्न विचारू शकतात किंवा पिकाच्या पानाचा फोटो काढून रोग निदान व उपाय मिळवू शकतात.',
      aEn: 'AgriSense combines agricultural AI with verified knowledge bases from ICAR and Krishi Vigyan Kendras (KVK). Farmers can ask questions by voice in regional languages or upload crop photos for disease diagnosis.'
    },
    {
      qMr: 'मी मराठी भाषेत बोलून सल्ला विचारू शकतो का?',
      qEn: 'Can I use voice assistance in Marathi?',
      aMr: 'होय! अ‍ॅग्रीसेन्स हे प्रामुख्याने महाराष्ट्रातील शेतकरी बांधवांसाठी मराठी भाषेत पूर्णपणे उपलब्ध आहे. तुम्ही मराठीत बोलून प्रश्न विचारू शकता आणि उत्तरही स्पीकरवर ऐकू शकता.',
      aEn: 'Yes! AgriSense is fully localized for farmers in Maharashtra with native Marathi speech recognition, Devanagari interface, and Marathi voice playback.'
    },
    {
      qMr: 'पिकाच्या रोगाचा फोटो कसा तपासायचा?',
      qEn: 'How do I check a crop disease with a photo?',
      aMr: 'मुख्य पानावर "Crop Disease Check" वर टॅप करा. मोबाईल कॅमेऱ्याने बाधित पानाचा स्पष्ट फोटो काढा किंवा गॅलरीतून अपलोड करा. काही सेकंदात रोगाचे नाव आणि रासायनिक व सेंद्रिय उपाय मिळतील.',
      aEn: 'Tap "Crop Disease Check", use your smartphone camera to capture a clear close-up of the affected leaf, and receive verified diagnoses along with organic and chemical remedies.'
    },
    {
      qMr: 'हवामान आणि बाजार भाव ताजे असतात का?',
      qEn: 'Are the weather and mandi prices live?',
      aMr: 'होय, हवामान अंदाज तुमच्या तालुक्यानुसार थेट हवामान सेवेकडून घेतला जातो आणि बाजार भाव महाराष्ट्रातील विविध कृषी उत्पन्न बाजार समित्यांच्या (APMC) दैनंदिन अधिकृत नोंदींवरून दाखवले जातात.',
      aEn: 'Yes. Weather forecasts are fetched hyperlocal to your taluka/district, and market prices reflect official daily wholesale APMC data across Maharashtra.'
    },
    {
      qMr: 'रोग निदानाबाबत शंका असल्यास काय करावे?',
      qEn: 'What should I do if I am unsure about a diagnosis?',
      aMr: 'अ‍ॅग्रीसेन्सचे निदान मार्गदर्शक स्वरूपाचे आहे. गंभीर समस्या असल्यास स्थानिक कृषी विज्ञान केंद्र (KVK), कृषी सहाय्यक किंवा किसान कॉल सेंटर (1800-180-1551) वर थेट संपर्क साधावा.',
      aEn: 'AI diagnoses provide early advisory guidance. In critical situations, consult your local KVK extension scientist, taluka agricultural officer, or call the Kisan Call Center (1800-180-1551).'
    },
    {
      qMr: 'माझी वैयक्तिक माहिती व शेती नोंदी सुरक्षित आहेत का?',
      qEn: 'How is my farm data protected?',
      aMr: 'तुमची माहिती सुरक्षित ठेवली जाते. शेती नोंदी आणि स्मरणपत्रे फक्त तुमच्या खात्यात सुरक्षित राहतात व कोणाशीही शेअर केली जात नाहीत.',
      aEn: 'Your farm data is encrypted and private. Field notes and advisory bookmarks remain accessible solely within your authenticated farmer profile.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-800 font-sans selection:bg-emerald-200 selection:text-emerald-950 flex flex-col">
      
      {/* =========================================================================
          1. HEADER / NAVBAR (Clean, Balanced, Premium Spacing)
      ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          
          {/* Brand Logo with Duo-Leaf & Green Sense */}
          <div
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-10.5 h-10.5 drop-shadow-[0_2px_10px_rgba(5,150,105,0.3)]"
              >
                {/* Small Left Leaflet */}
                <path
                  d="M6.2 21.8C5.2 18.2 6.6 15 9.8 14.2C10.5 17.2 9.6 20.4 6.2 21.8Z"
                  fill="#6ee7b7"
                />
                {/* Main Upward-Right Leaf */}
                <path
                  d="M9.8 23.8C8.8 17.2 12.2 10.2 25.2 6.8C25.8 14.8 20.8 23.8 9.8 23.8Z"
                  fill="#10b981"
                />
                {/* Central Curved Vein */}
                <path
                  d="M10.8 22.8C13.8 18.2 17.4 13.8 23.4 9.2"
                  stroke="#064e3b"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight leading-none flex items-center gap-2">
                <span>
                  <span className="text-slate-900">Agri</span>
                  <span className="text-emerald-700">Sense</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {isMarathi ? 'शेतकरी AI' : 'Smart Farming'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium tracking-wide mt-1">
                {isMarathi ? 'स्मार्ट शेती • समृद्ध भविष्य' : 'Smart Farming • Better Tomorrow'}
              </div>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-emerald-800 font-bold border-b-2 border-emerald-600 pb-1 transition-colors"
            >
              {isMarathi ? 'मुख्य पान' : 'Home'}
            </button>
            <button
              onClick={() => scrollToSection('quick-actions')}
              className="hover:text-emerald-700 transition-colors"
            >
              {isMarathi ? 'सेवा' : 'Features'}
            </button>
            <button
              onClick={() => scrollToSection('voice-assistant')}
              className="hover:text-emerald-700 transition-colors"
            >
              {isMarathi ? 'व्हॉईस' : 'Voice'}
            </button>
            <button
              onClick={() => scrollToSection('smart-tools')}
              className="hover:text-emerald-700 transition-colors"
            >
              {isMarathi ? 'शेती साधने' : 'Tools'}
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-emerald-700 transition-colors"
            >
              {isMarathi ? 'कसे चालते' : 'How It Works'}
            </button>
            <button
              onClick={() => scrollToSection('trust')}
              className="hover:text-emerald-700 transition-colors"
            >
              {isMarathi ? 'विश्वास' : 'Benefits'}
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-emerald-700 transition-colors"
            >
              {isMarathi ? 'प्रश्नोत्तरे' : 'FAQ'}
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="px-3.5 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition shadow-2xs"
              >
                <Globe className="w-4 h-4 text-emerald-700" />
                <span>{isMarathi ? 'मराठी' : 'English'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs">
                  <button
                    onClick={() => {
                      setLanguage('mr');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 font-bold hover:bg-emerald-50 ${
                      isMarathi ? 'text-emerald-800 bg-emerald-50/80 font-black' : 'text-slate-700'
                    }`}
                  >
                    मराठी (Marathi)
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 font-bold hover:bg-emerald-50 ${
                      !isMarathi ? 'text-emerald-800 bg-emerald-50/80 font-black' : 'text-slate-700'
                    }`}
                  >
                    English
                  </button>
                </div>
              )}
            </div>

            {/* Login / Dashboard */}
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition shadow-sm flex items-center gap-2 active:scale-95"
              >
                <span>{isMarathi ? 'डॅशबोर्ड उघडा' : 'Go to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-full border border-slate-300 hover:border-slate-400 text-slate-700 text-xs sm:text-sm font-bold transition hover:bg-slate-50"
                >
                  {isMarathi ? 'लॉगिन' : 'Login'}
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition shadow-sm hover:shadow active:scale-95 flex items-center gap-1.5"
                >
                  <span>{isMarathi ? 'सुरु करा' : 'Get Started'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setLanguage(isMarathi ? 'en' : 'mr')}
              className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-full text-slate-700 bg-white"
            >
              {isMarathi ? 'ENG' : 'मराठी'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-5 py-5 space-y-3.5 text-sm font-semibold shadow-xl animate-fade-in">
            <button
              onClick={() => scrollToSection('hero')}
              className="block w-full text-left py-2 text-emerald-800 font-bold border-b border-slate-100"
            >
              {isMarathi ? '१. मुख्य पान' : '1. Home'}
            </button>
            <button
              onClick={() => scrollToSection('quick-actions')}
              className="block w-full text-left py-2 text-slate-700 border-b border-slate-100"
            >
              {isMarathi ? '२. शेतकरी सेवा' : '2. Features'}
            </button>
            <button
              onClick={() => scrollToSection('voice-assistant')}
              className="block w-full text-left py-2 text-slate-700 border-b border-slate-100"
            >
              {isMarathi ? '३. व्हॉईस असिस्टंट' : '3. Voice'}
            </button>
            <button
              onClick={() => scrollToSection('smart-tools')}
              className="block w-full text-left py-2 text-slate-700 border-b border-slate-100"
            >
              {isMarathi ? '४. शेती साधने' : '4. Tools'}
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left py-2 text-slate-700 border-b border-slate-100"
            >
              {isMarathi ? '५. कसे चालते' : '5. How It Works'}
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left py-2 text-slate-700 border-b border-slate-100"
            >
              {isMarathi ? '६. प्रश्नोत्तरे' : '6. FAQ'}
            </button>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="w-1/2 py-2.5 rounded-full border border-slate-300 text-center font-bold text-xs"
              >
                {isMarathi ? 'लॉगिन' : 'Login'}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-1/2 py-2.5 rounded-full bg-emerald-800 text-white text-center font-bold text-xs shadow-sm"
              >
                {isMarathi ? 'सुरु करा' : 'Get Started'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. REBUILT HERO SECTION (Vivid Farmer on Right, High Contrast Text on Left)
      ========================================================================= */}
      <section
        id="hero"
        className="relative overflow-hidden bg-[#fbf9f4] border-b border-slate-200/60"
      >
        {/* Scenic Landscape Backing with Gentle Warm Tone */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-multiply pointer-events-none"
          style={{ backgroundImage: `url('/images/tools-bg.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#fbf9f4] via-[#fbf9f4]/95 via-50% to-[#fbf9f4]/60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-14">
          
          {/* Left Column (Headline, Copy, 4 Indicators, CTAs) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/80 text-emerald-900 text-xs font-bold shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>
                {isMarathi
                  ? 'केव्हीके (KVK) व आयसीएआर (ICAR) पडताळित कृषी बुद्धिमत्ता'
                  : 'Grounded in ICAR & Krishi Vigyan Kendra Knowledge'}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.12]">
              {isMarathi ? (
                <>
                  अ‍ॅग्रीसेन्ससह <br />
                  <span className="text-emerald-800">स्मार्ट आणि समृद्ध शेती</span>
                </>
              ) : (
                <>
                  Smarter Farming with <br />
                  <span className="text-emerald-800">AgriSense</span>
                </>
              )}
            </h1>

            {/* Supporting Copy */}
            <p className="text-sm sm:text-base md:text-lg text-slate-700 font-medium leading-relaxed max-w-xl">
              {isMarathi
                ? 'पिकांवरील रोग, हवामान अंदाज, बाजार भाव आणि शेती विषयक योग्य निर्णय घेण्यासाठी आपल्या भाषेत विश्वासू सल्ला मिळवा.'
                : 'Get trusted help with crop problems, weather updates, market prices, and farming decisions—in your language.'}
            </p>

            {/* 4 Feature Indicator Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-1.5">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="text-xs font-extrabold text-slate-900 leading-tight">
                  {isMarathi ? 'रोग निदान' : 'Disease Check'}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {isMarathi ? 'पानाचा फोटो' : 'Leaf photo scan'}
                </div>
              </div>

              <div className="p-3 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center mb-1.5">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div className="text-xs font-extrabold text-slate-900 leading-tight">
                  {isMarathi ? 'हवामान अंदाज' : 'Weather Alerts'}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {isMarathi ? '७ दिवसांचा पाऊस' : '7-day forecast'}
                </div>
              </div>

              <div className="p-3 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-1.5">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-xs font-extrabold text-slate-900 leading-tight">
                  {isMarathi ? 'बाजार भाव' : 'Mandi Rates'}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {isMarathi ? 'थेट APMC दर' : 'Live APMC rates'}
                </div>
              </div>

              <div className="p-3 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-1.5">
                  <Mic className="w-5 h-5" />
                </div>
                <div className="text-xs font-extrabold text-slate-900 leading-tight">
                  {isMarathi ? 'व्हॉईस AI' : 'Voice Assistant'}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {isMarathi ? 'मराठी व इंग्रजी' : 'Bilingual speech'}
                </div>
              </div>
            </div>

            {/* CTAs Row */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => setShowVoiceModal(true)}
                className="px-7 py-3.5 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-md hover:shadow-lg transition transform active:scale-95"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-900 flex items-center justify-center">
                  <Mic className="w-4 h-4 text-emerald-200" />
                </div>
                <span>{isMarathi ? 'आवाजाने सुरू करा' : 'Start Free with Voice'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('quick-actions')}
                className="px-6 py-3.5 rounded-full bg-amber-100/90 hover:bg-amber-200 border border-amber-300 text-amber-950 font-bold text-sm sm:text-base transition shadow-2xs"
              >
                {isMarathi ? 'वैशिष्ट्ये पहा' : 'Explore Features'}
              </button>
            </div>

            {/* Trust Motto */}
            <div className="text-xs font-semibold text-slate-600 tracking-wide pt-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isMarathi ? 'बोला • विचारा • उत्तर मिळवा • समृद्ध व्हा' : 'Speak • Ask • Get Answers • Grow Better'}</span>
            </div>
          </div>

          {/* Right Column: Vivid, High-Resolution Indian Farmer with Smartphone & Diagnostic Overlays */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              
              {/* Main crisp farmer photograph container */}
              <div className="rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-white relative">
                <img
                  src="/images/hero-farmer.jpg"
                  alt="Indian farmer in agricultural field using smartphone"
                  className="w-full h-[410px] sm:h-[470px] object-cover object-right sm:object-center"
                />

                {/* Subtle soft gradient at very bottom of image for badge legibility */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/70 to-transparent pointer-events-none" />

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Sprout className="w-4 h-4" />
                    <span>{isMarathi ? 'महाराष्ट्रातील शेतकरी बांधव' : 'Designed for Farmers in Maharashtra'}</span>
                  </div>
                  <div className="text-[11px] text-white/90 font-medium">
                    {isMarathi ? 'सोप्या मराठीत अचूक कृषी मार्गदर्शन' : 'Simple, accessible guidance in Marathi & English'}
                  </div>
                </div>
              </div>

              {/* OVERLAY 1: Weather Information Overlay (Top-Right) */}
              <div className="absolute -top-3 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-3 border border-slate-200/90 flex items-center gap-2.5 z-20 animate-fade-in">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 leading-tight">28°C • {isMarathi ? 'सूर्यप्रकाश' : 'Sunny'}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">{isMarathi ? 'आर्द्रता ६५% • वारा ८ किमी/तास' : '65% Humidity • Wind 8 km/h'}</div>
                </div>
              </div>

              {/* OVERLAY 2: Crop-Health Preview Overlay (Bottom-Left) */}
              <div className="absolute -bottom-4 -left-2 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-3 border border-slate-200/90 flex items-center gap-2.5 z-20 animate-fade-in">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Leaf className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>{isMarathi ? 'पान आरोग्य: ९६%' : 'Leaf Health: 96%'}</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {isMarathi ? 'उत्कृष्ट' : 'Optimal'}
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">
                    {isMarathi ? 'कोणताही करपा आढळला नाही' : 'No Early Blight Detected'}
                  </div>
                </div>
              </div>

              {/* Floating Voice Dialogue Bubble */}
              <div className="absolute top-20 -left-4 sm:-left-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-3 sm:p-3.5 border border-slate-200 max-w-[240px] animate-fade-in flex items-center gap-2.5 z-10">
                <div
                  onClick={() => setShowVoiceModal(true)}
                  className="w-9 h-9 rounded-full bg-emerald-700 hover:bg-emerald-600 cursor-pointer flex items-center justify-center text-white shrink-0 shadow-sm transition"
                  title="Try Voice"
                >
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900 leading-tight">
                    {isMarathi ? 'माझ्या पिकावर रोग आहे का?' : 'Is there disease on my crop?'}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-emerald-600">
                    <span className="w-1 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="w-1 h-3.5 bg-emerald-600 rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse delay-150" />
                    <span className="w-1 h-4 bg-emerald-700 rounded-full animate-pulse" />
                    <span className="w-1 h-2.5 bg-emerald-500 rounded-full animate-pulse delay-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          3. REPLACED SPACIOUS QUICK ACTIONS (3 Columns, Large Cards, What Can We Help You With?)
      ========================================================================= */}
      <section id="quick-actions" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isMarathi ? 'मुख्य शेतकरी सेवा' : 'Core Farmer Services'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              {isMarathi ? 'आम्ही तुम्हाला कशात मदत करू शकतो?' : 'What can we help you with?'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              {isMarathi
                ? 'आज तुम्हाला ज्या सेवेची गरज आहे ती निवडा, किंवा व्हॉईस असिस्टंटने थेट प्रश्न विचारा.'
                : 'Choose the service you need today, or use voice assistance for instant hands-free guidance.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowVoiceModal(true)}
            className="self-start md:self-auto px-5 py-3 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition active:scale-95"
          >
            <Mic className="w-4 h-4 text-emerald-300" />
            <span>{isMarathi ? 'व्हॉईस असिस्टंट वापरा' : 'Use Voice Assistant'}</span>
          </button>
        </div>

        {/* 6 Spacious Cards in 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          
          {/* Card 1: Crop Disease Check */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-xs hover:shadow-xl hover:border-emerald-300 transition duration-200 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Stethoscope className="w-7 h-7 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-emerald-800 transition">
                  {isMarathi ? '१. पिक रोग तपासणी' : '1. Crop Disease Check'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-2">
                  {isMarathi
                    ? 'बाधित पानाचा फोटो काढून सेकंदात रोगाचे अचूक नाव आणि रासायनिक व सेंद्रिय औषधोपचार मिळवा.'
                    : 'Upload or capture a leaf photo to diagnose diseases instantly with verified remedies and spray instructions.'}
                </p>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                onClick={() => handleAction('/disease')}
                className="w-full py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
              >
                <span>{isMarathi ? 'पानाचा फोटो स्कॅन करा' : 'Scan Leaf Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: AI Farming Assistant */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-xs hover:shadow-xl hover:border-blue-300 transition duration-200 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Bot className="w-7 h-7 text-sky-700" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-sky-800 transition">
                  {isMarathi ? '२. कृषी सल्लागार' : '2. AI Farming Assistant'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-2">
                  {isMarathi
                    ? 'पिके, खते, कीड व्यवस्थापन किंवा पाणी नियोजनाबाबत मराठीत बोलून प्रश्न विचारा.'
                    : 'Ask any crop, soil, fertilizer, or pest question by voice or text in Marathi & English.'}
                </p>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                onClick={() => handleAction('/advisor')}
                className="w-full py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
              >
                <span>{isMarathi ? 'सल्लागार चॅट उघडा' : 'Ask Assistant'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 3: Weather Forecast */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-xs hover:shadow-xl hover:border-amber-300 transition duration-200 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CloudSun className="w-7 h-7 text-amber-700" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-amber-800 transition">
                  {isMarathi ? '३. हवामान व फवारणी अंदाज' : '3. Weather Forecast'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-2">
                  {isMarathi
                    ? 'पुढील ७ दिवसांचा पाऊस, तापमान आणि फवारणी व सिंचनासाठी अनुकूल वेळेचे मार्गदर्शन.'
                    : 'Hyperlocal rain probability, 7-day temperature trends, humidity, and spray window timings.'}
                </p>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                onClick={() => handleAction('/weather')}
                className="w-full py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
              >
                <span>{isMarathi ? 'हवामान अंदाज पहा' : 'View Forecast'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 4: Mandi Prices */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-xs hover:shadow-xl hover:border-purple-300 transition duration-200 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-7 h-7 text-purple-700" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-purple-800 transition">
                  {isMarathi ? '४. बाजार भाव (Mandi Rates)' : '4. Mandi Prices'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-2">
                  {isMarathi
                    ? 'नाशिक, लासलगाव, पुणे यांसह महाराष्ट्रातील सर्व एपीएमसीमधील कांदा, सोयाबीन, कापसाचे ताजे दर.'
                    : 'Live daily wholesale commodity rates and multi-market price comparisons across Maharashtra APMCs.'}
                </p>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                onClick={() => handleAction('/market')}
                className="w-full py-2.5 rounded-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
              >
                <span>{isMarathi ? 'बाजार भाव तपासा' : 'Compare Prices'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 5: My Farm & Crops */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-xs hover:shadow-xl hover:border-teal-300 transition duration-200 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Tractor className="w-7 h-7 text-teal-700" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-teal-800 transition">
                  {isMarathi ? '५. माझी शेती व पिके' : '5. My Farm & Crops'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-2">
                  {isMarathi
                    ? 'आपली शेत जमीन, मातीचा प्रकार, सिंचन व्यवस्था आणि सध्या घेतलेली पिके एकाच ठिकाणी नोंदवून ठेवा.'
                    : 'Manage registered plots, soil profiles, sowing dates, acreages, and irrigation infrastructure.'}
                </p>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                onClick={() => handleAction('/farm')}
                className="w-full py-2.5 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
              >
                <span>{isMarathi ? 'शेती व्यवस्थापन उघडा' : 'Manage Farm'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 6: My History */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-xs hover:shadow-xl hover:border-indigo-300 transition duration-200 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <History className="w-7 h-7 text-indigo-700" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-indigo-800 transition">
                  {isMarathi ? '६. माझा इतिहास व नोंदी' : '6. My History'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-2">
                  {isMarathi
                    ? 'यापूर्वी तपासलेल्या पिकांचे फोटो, रोगांचे निदान आणि दिलेले सल्ले कधीही पुन्हा तपासा.'
                    : 'Review past disease scans, diagnoses, prescribed sprays, and treatment outcomes across seasons.'}
                </p>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                onClick={() => handleAction('/disease/history')}
                className="w-full py-2.5 rounded-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
              >
                <span>{isMarathi ? 'इतिहास उघडा' : 'Open History'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. REDESIGNED SPACIOUS VOICE ASSISTANT SHOWCASE (2 Columns + 3 Bottom Benefits)
      ========================================================================= */}
      <section
        id="voice-assistant"
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto space-y-14 relative z-10">
          
          {/* Main 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            {/* Left: Smartphone Mockup constructed from clean real interface elements */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[320px] bg-slate-950 rounded-[44px] border-[6px] border-slate-800 p-4 shadow-2xl space-y-4">
                
                {/* Speaker Notch */}
                <div className="w-24 h-4 bg-slate-800 rounded-b-2xl mx-auto mb-1" />

                {/* Smartphone App Header */}
                <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                      <Sprout className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">AgriSense Voice</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">मराठी (mr-IN) Active</div>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>

                {/* Simulated Chat Messages */}
                <div className="space-y-3 text-xs">
                  <div className="bg-emerald-900/90 text-white p-3 rounded-2xl rounded-tr-none font-medium text-[11px] leading-relaxed border border-emerald-700/50">
                    <div className="text-[9px] text-emerald-300 font-bold mb-0.5">शेतकरी (Farmer):</div>
                    "कांद्यावर जांभळा करपा पडला आहे, काय फवारावे?"
                  </div>

                  <div className="bg-white text-slate-800 p-3 rounded-2xl rounded-tl-none font-medium text-[11px] leading-relaxed shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] text-emerald-800 font-bold border-b border-slate-100 pb-1">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        केव्हीके शिफारस
                      </span>
                      <span className="text-slate-400">आताच</span>
                    </div>
                    <p className="text-slate-700">
                      जांभळा करपा नियंत्रणासाठी मँकोझेब २.५ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारावे.
                    </p>
                  </div>
                </div>

                {/* Interactive Mic Button */}
                <div className="pt-2 pb-1 text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowVoiceModal(true)}
                    className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-900/50 active:scale-95 transition"
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                  <div className="text-[11px] font-bold text-emerald-200">
                    {isMarathi ? 'मायक दाबून बोला' : 'Tap microphone to speak'}
                  </div>
                </div>

                {/* Bottom App Nav */}
                <div className="pt-2 border-t border-slate-800 grid grid-cols-4 text-center text-[10px] text-slate-400 font-bold">
                  <div className="text-emerald-400">Home</div>
                  <div>Scan</div>
                  <div className="text-emerald-400">Voice</div>
                  <div>Weather</div>
                </div>
              </div>
            </div>

            {/* Right: Heading, Benefits & Action */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold">
                <Mic className="w-4 h-4 text-emerald-300" />
                <span>{isMarathi ? 'हात मोकळे ठेवून शेती सल्ला' : 'Hands-Free Agricultural Assistant'}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white">
                {isMarathi
                  ? 'बोला, टाइप करू नका! शेतात काम करताना सोपा सल्ला'
                  : "Talk, don't type! Built for working hands in the field"}
              </h2>

              <p className="text-sm sm:text-base text-emerald-100 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                {isMarathi
                  ? 'शेतात काम करताना मोबाईलवर टाइप करणे अवघड असते. अ‍ॅग्रीसेन्समध्ये मायक्रोफोन टॅप करा आणि मराठी किंवा इंग्रजीत थेट बोला. आमचा असिस्टंट तुमचा प्रश्न समजून घेतो आणि उत्तर वाचून दाखवतो.'
                  : 'Working in the field leaves your hands busy with soil and tools. Tap the microphone to speak naturally in Marathi or English. Our assistant transcribes, retrieves verified advice, and speaks the answer aloud.'}
              </p>

              {/* 4 Checkmark Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs sm:text-sm font-bold text-left max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{isMarathi ? 'मराठी व इंग्रजी भाषा ओळख' : 'Marathi & English recognition'}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{isMarathi ? 'उत्तर वाचून दाखवण्याची सोय (TTS)' : 'Voice answer playback (TTS)'}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{isMarathi ? 'पाठवण्यापूर्वी मजकूर तपासा' : 'Review transcript before sending'}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{isMarathi ? 'मोबाईल ब्राऊझरवर उपलब्ध' : 'Works directly on mobile browser'}</span>
                </div>
              </div>

              {/* CTA Action */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  type="button"
                  onClick={() => setShowVoiceModal(true)}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl transition active:scale-95"
                >
                  <Mic className="w-5 h-5" />
                  <span>{isMarathi ? 'व्हॉईस असिस्टंट वापरून पहा' : 'Try Voice Assistant'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('/advisor')}
                  className="w-full sm:w-auto px-6 py-4 rounded-full bg-emerald-800/80 hover:bg-emerald-800 text-white border border-emerald-600 font-bold text-sm transition"
                >
                  {isMarathi ? 'सल्लागार चॅट उघडा' : 'Open Advisor Chat'}
                </button>
              </div>
            </div>

          </div>

          {/* Row of 3 Compact Benefits Below */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-emerald-800/80">
            <div className="p-5 rounded-2xl bg-emerald-900/60 border border-emerald-700/50 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-emerald-300 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-white">
                {isMarathi ? 'बोलून किंवा लिहून विचारा' : 'Ask by Voice or Text'}
              </h4>
              <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                {isMarathi
                  ? 'मराठी किंवा इंग्रजीत सहज बोला, अथवा टाइप करून प्रश्न विचारा.'
                  : 'Speak naturally in Marathi or English, or type your query when preferred.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-900/60 border border-emerald-700/50 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-emerald-300 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-white">
                {isMarathi ? 'स्पष्ट उत्तर ऐका' : 'Listen to Answers'}
              </h4>
              <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                {isMarathi
                  ? 'वाचण्याऐवजी फवारणी प्रमाण व औषधोपचार मराठी आवाजात ऐका.'
                  : 'Audio playback reads out chemical dosages, spray intervals, and precautions.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-900/60 border border-emerald-700/50 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-emerald-300 flex items-center justify-center">
                <Bookmark className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-white">
                {isMarathi ? 'सल्ला जतन करा' : 'Save and Revisit Advice'}
              </h4>
              <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                {isMarathi
                  ? 'महत्त्वाचा सल्ला वहीत नोंदवून ठेवा आणि शेतीतील परिणाम नोंदवा.'
                  : 'Bookmark essential recommendations to your personal notebook for offline review.'}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          5. STRONGER SMART FARMING TOOLS SECTION (Warm Cream Background + 6 Distinct Cards)
      ========================================================================= */}
      <section
        id="smart-tools"
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#fbf9f4] border-b border-slate-200/60"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isMarathi ? 'प्रगत कृषी साधने' : 'Comprehensive Agricultural Suite'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              {isMarathi ? 'स्मार्ट शेतीसाठी आधुनिक साधने' : 'Smart Tools for Smarter Farming'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              {isMarathi
                ? 'पेरणीपासून ते बाजारात शेतमाल विकेपर्यंत प्रत्येक टप्प्यावर अचूक निर्णय घेण्यासाठीची साधने.'
                : 'Everything you need to plan, protect, and profit from your harvest, connected to working pages.'}
            </p>
          </div>

          {/* 6 Spacious Feature Cards (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Tool 1: Weather & Rain Alerts */}
            <div
              onClick={() => handleAction('/weather')}
              className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CloudSun className="w-6 h-6 text-sky-700" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-emerald-800 transition">
                  {isMarathi ? 'हवामान अंदाज व पाऊस सूचना' : 'Weather & Rain Alerts'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {isMarathi
                    ? 'स्थानिक ७ दिवसांचा पाऊस अंदाज, वाऱ्याचा वेग आणि फवारणी व सिंचनासाठी अनुकूल वेळ तपासा.'
                    : 'Hyperlocal rain alerts, humidity forecasts, and optimal spray window timings.'}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-700">
                <span>{isMarathi ? 'हवामान पहा' : 'View Forecast'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tool 2: Mandi Price Comparison */}
            <div
              onClick={() => handleAction('/market')}
              className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6 text-purple-700" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-emerald-800 transition">
                  {isMarathi ? 'बाजार भाव तुलना' : 'Mandi Price Comparison'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {isMarathi
                    ? 'विविध एपीएमसीमधील कांदा, सोयाबीन, कापसाचे कमाल, किमान व सरासरी दर तपासून माल विका.'
                    : 'Multi-APMC commodity price trends to help you choose the best market before harvesting.'}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
                <span>{isMarathi ? 'बाजार भाव पहा' : 'Compare Rates'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tool 3: Crop Calendar & Reminders */}
            <div
              onClick={() => handleAction('/calendar')}
              className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar className="w-6 h-6 text-teal-700" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-emerald-800 transition">
                  {isMarathi ? 'पिक दिनदर्शिका व स्मरणपत्रे' : 'Crop Calendar & Reminders'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {isMarathi
                    ? 'कांदा, सोयाबीन व कापूस पिकाचे पेरणी ते काढणीपर्यंतचे खत, फवारणी व कामे नियोजित करा.'
                    : 'Stage-by-stage crop timelines for Onion, Cotton, and Soybean with farmer task reminders.'}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                <span>{isMarathi ? 'दिनदर्शिका उघडा' : 'Open Calendar'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tool 4: Soil Health Guidance */}
            <div
              onClick={() => handleAction('/farm')}
              className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Leaf className="w-6 h-6 text-emerald-700" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-emerald-800 transition">
                  {isMarathi ? 'माती आरोग्य व शेत व्यवस्थापन' : 'Soil Health Guidance'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {isMarathi
                    ? 'तुमच्या जमिनीचा पोत, मातीचा प्रकार आणि योग्य खत मात्रेचे नियोजन नोंदवून ठेवा.'
                    : 'Soil texture analysis, organic carbon guidance, and basal fertilizer planning for registered plots.'}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>{isMarathi ? 'शेती नोंदवा' : 'Manage Soil & Land'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tool 5: Agricultural Resources & Govt Schemes */}
            <div
              onClick={() => handleAction('/resources')}
              className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6 text-indigo-700" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-emerald-800 transition">
                  {isMarathi ? 'शासकीय योजना व हेल्पलाइन' : 'Agricultural Resources'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {isMarathi
                    ? 'महाडीबीटी, पीएम-किसान, पिक विमा (PMFBY) आणि २४/७ किसान कॉल सेंटर (1800-180-1551) थेट लिंक्स.'
                    : 'Direct verified links to MahaDBT, PM-KISAN, PMFBY, and the 24/7 Kisan Call Center hotline.'}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
                <span>{isMarathi ? 'योजना पहा' : 'View Verified Schemes'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tool 6: Marathi & English Assistance */}
            <div
              onClick={() => handleAction('/advisor')}
              className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Languages className="w-6 h-6 text-amber-700" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-emerald-800 transition">
                  {isMarathi ? 'मराठी व इंग्रजी द्विभाषिक सहाय्य' : 'Marathi & English Assistance'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {isMarathi
                    ? 'स्थानिक बोलीभाषेतील शब्द समजून घेण्याची क्षमता आणि देवनागरीत संपूर्ण वापर.'
                    : 'Bilingual Devanagari and English voice processing optimized for regional farming terms.'}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800">
                <span>{isMarathi ? 'सल्लागार उघडा' : 'Start Talking'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          6. HOW IT WORKS (Contrasting Dark Forest-Green Section)
      ========================================================================= */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-forest-950 via-forest-900 to-forest-950 text-white relative overflow-hidden border-y border-forest-800"
      >
        {/* Glow blur backgrounds */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-botanical-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-forest-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-forest-800/80 border border-botanical-500/30 text-botanical-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-botanical-400" />
              <span>{isMarathi ? 'अतिशय सोपी ३-टप्पी पद्धत' : 'Simple 3-Step Process'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              {isMarathi ? 'अ‍ॅग्रीसेन्स कसे काम करते?' : 'How AgriSense Works'}
            </h2>
            <p className="text-sm sm:text-base text-forest-200 font-medium">
              {isMarathi
                ? 'शेतात काम करताना कोणत्याही गुंतागुंतीशिवाय अचूक व पडताळित कृषी मार्गदर्शन मिळवा.'
                : 'From spotting a crop issue in the field to executing verified KVK science guidance.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Step 1 */}
            <div className="p-7 bg-forest-900/70 backdrop-blur-md rounded-3xl border border-forest-700/60 shadow-xl flex flex-col justify-between space-y-4 hover:border-botanical-400/60 transition group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-botanical-500 text-forest-950 font-black text-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  1
                </div>
                <div>
                  <h3 className="font-black text-lg sm:text-xl text-white group-hover:text-botanical-300 transition">
                    {isMarathi ? '१. बोला किंवा फोटो काढा' : '1. Capture or Speak'}
                  </h3>
                  <p className="text-xs sm:text-sm text-forest-200 font-medium leading-relaxed mt-2">
                    {isMarathi
                      ? 'मायक्रोफोन टॅप करून मराठीत थेट प्रश्न विचारा किंवा पिकाच्या बाधित पानाचा स्पष्ट फोटो कॅमेऱ्याने काढा.'
                      : 'Tap the microphone to ask in natural Marathi/English, or snap a crisp photo of the affected crop leaf.'}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-forest-800/80 text-[11px] font-bold text-botanical-400 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5" />
                <span>{isMarathi ? 'व्हॉईस व इमेज इनपुट' : 'Voice & Image Input'}</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-7 bg-forest-900/70 backdrop-blur-md rounded-3xl border border-forest-700/60 shadow-xl flex flex-col justify-between space-y-4 hover:border-botanical-400/60 transition group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-botanical-500 text-forest-950 font-black text-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  2
                </div>
                <div>
                  <h3 className="font-black text-lg sm:text-xl text-white group-hover:text-botanical-300 transition">
                    {isMarathi ? '२. एआय व केव्हीके विश्लेषण' : '2. AI & KVK Analysis'}
                  </h3>
                  <p className="text-xs sm:text-sm text-forest-200 font-medium leading-relaxed mt-2">
                    {isMarathi
                      ? 'आर्टिफिशियल इंटेलिजन्स मॉडेल आणि आयसीएआर (ICAR) व कृषी विज्ञान केंद्रांचा ज्ञानकोश रोग व लक्षणांचे विश्लेषण करतो.'
                      : 'Agricultural AI models cross-reference symptoms against official ICAR Package of Practices and KVK agronomic manuals.'}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-forest-800/80 text-[11px] font-bold text-botanical-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isMarathi ? '१००% पडताळित ज्ञान' : '100% Grounded Science'}</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-7 bg-forest-900/70 backdrop-blur-md rounded-3xl border border-forest-700/60 shadow-xl flex flex-col justify-between space-y-4 hover:border-botanical-400/60 transition group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-botanical-500 text-forest-950 font-black text-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  3
                </div>
                <div>
                  <h3 className="font-black text-lg sm:text-xl text-white group-hover:text-botanical-300 transition">
                    {isMarathi ? '३. कृतीयोग्य सल्ला व उपाय' : '3. Actionable Advisory'}
                  </h3>
                  <p className="text-xs sm:text-sm text-forest-200 font-medium leading-relaxed mt-2">
                    {isMarathi
                      ? 'रासायनिक व सेंद्रिय फवारणीचे प्रमाण, सावधानता आणि अनुकूल वेळ मिळवा. उत्तर मराठीत ऐका व वहीत जतन करा.'
                      : 'Get exact chemical dosages, organic alternatives, and spray intervals. Listen aloud in Marathi and save to your notebook.'}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-forest-800/80 text-[11px] font-bold text-botanical-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isMarathi ? 'आवाजात ऐका व अमलात आणा' : 'Listen & Apply in Field'}</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          7. TRUST AND FARMER BENEFITS (Evidence-Based, Zero Fabricated Numbers)
      ========================================================================= */}
      <section id="trust" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{isMarathi ? 'विश्वास व जबाबदार कृषी तंत्रज्ञान' : 'Trust & Responsible Agricultural Intelligence'}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                {isMarathi ? 'शेतकऱ्यांसाठी विश्वासू तंत्रज्ञान — अचूक आणि सुरक्षित' : 'Built for Real Farmers in Maharashtra'}
              </h2>

              <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                {isMarathi
                  ? 'अ‍ॅग्रीसेन्सचे सर्व सल्ले कृषी विज्ञान केंद्र (KVK) आणि कृषी विद्यापीठांच्या अधिकृत पॅकेज ऑफ प्रॅक्टिसवर आधारलेले असतात. आम्ही कोणत्याही अनधिकृत किंवा खोट्या दाव्यांवर विसंबून राहत नाही.'
                  : 'AgriSense advisory responses are strictly grounded in official Package of Practices from ICAR, State Agricultural Universities, and Krishi Vigyan Kendras.'}
              </p>

              {/* 3 Pillars */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                      {isMarathi ? 'आयसीएआर व केव्हीके दस्तऐवज पडताळणी' : 'ICAR & KVK Package of Practices Grounding'}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                      {isMarathi
                        ? 'उत्तर देताना अधिकृत कृषी दस्तऐवजांचा संदर्भ दिला जातो.'
                        : 'Responses cite verified agronomic documents and recommended active ingredients.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                      {isMarathi ? 'पारदर्शक रोग निदान व मर्यादा' : 'Responsible AI & Precautionary Advice'}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                      {isMarathi
                        ? 'रोग निदान हे सहाय्यक मार्गदर्शक आहे. गंभीर प्रादुर्भावात स्थानिक कृषी तज्ञांचा सल्ला आवश्यक.'
                        : 'AI predictions provide early warnings and always recommend verifying critical outbreaks with extension officers.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                      {isMarathi ? 'शेतकऱ्यांसाठी मोफत व डेटा सुरक्षितता' : 'Open Access & Complete Privacy for Farmers'}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                      {isMarathi
                        ? 'तुमचा फोन नंबर किंवा शेती माहिती कधीही विकली जात नाही.'
                        : 'Zero monetization of personal farmer profiles. Open and private access.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Callout: Kisan Helpline Card & Visual */}
            <div className="lg:col-span-5 bg-emerald-50 rounded-3xl p-7 border border-emerald-200/80 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  {isMarathi ? 'अधिकृत शासकीय कृषी संपर्क' : 'Official Emergency Helpline'}
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {isMarathi ? 'किसान कॉल सेंटर (KCC)' : 'Kisan Call Center (24/7)'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {isMarathi
                    ? 'कोणत्याही गंभीर संकटात किंवा कीड प्रादुर्भावात थेट भारत सरकारच्या कृषी शास्त्रज्ञांशी बोला.'
                    : 'Ministry of Agriculture 24/7 toll-free helpline providing immediate expert advice.'}
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 font-bold">Toll-Free Helpline</div>
                  <div className="text-lg font-black text-emerald-800">1800-180-1551</div>
                </div>
                <a
                  href="tel:18001801551"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
              </div>

              <div className="pt-2 text-xs text-slate-600 font-medium flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>
                  {isMarathi ? 'शासकीय पोर्टल: pmkisan.gov.in, mahadbt.maharashtra.gov.in' : 'Official portals: pmkisan.gov.in, mahadbt.maharashtra.gov.in'}
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          8. FAQ SECTION (Accordion with Clear Farmer Answers)
      ========================================================================= */}
      <section id="faq" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isMarathi ? 'नेहमी विचारले जाणारे प्रश्न' : 'Frequently Asked Questions'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isMarathi ? 'शेतकऱ्यांचे सामान्य प्रश्न' : 'Clear Answers to Farmer Questions'}
          </h2>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left font-extrabold text-sm sm:text-base text-slate-900 flex items-center justify-between gap-4 hover:bg-emerald-50/50 transition"
                  aria-expanded={isOpen}
                >
                  <span>{isMarathi ? faq.qMr : faq.qEn}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-emerald-700 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3.5 animate-fade-in">
                    {isMarathi ? faq.aMr : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          8.5. CONVERSION SECTION (Clear Call-to-Action for Farmers)
      ========================================================================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-forest-950 via-forest-900 to-forest-950 text-white relative overflow-hidden border-t border-forest-800">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-botanical-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-forest-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-800/80 border border-botanical-500/30 text-botanical-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-botanical-400" />
            <span>{isMarathi ? '१००% मोफत व सुरक्षित' : '100% Free & Open Access for Farmers'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {isMarathi ? (
              <>
                आपल्या शेतीला स्मार्ट बनवण्यासाठी <br />
                <span className="text-botanical-300">आजच सुरुवात करा!</span>
              </>
            ) : (
              <>
                Ready to Modernize Your Farm with <br />
                <span className="text-botanical-300">AgriSense?</span>
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-forest-200 font-medium max-w-2xl mx-auto leading-relaxed">
            {isMarathi
              ? 'स्थानिक भाषेत बोलून किंवा पिकाचा फोटो काढून अचूक सल्ला मिळवा. हवामान अंदाज आणि बाजार दरांची माहिती एकाच ठिकाणी.'
              : 'Empower your daily agricultural decisions with verified ICAR scientific knowledge, live APMC market prices, and hyper-local rain alerts.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowVoiceModal(true)}
              className="px-8 py-4 rounded-full bg-botanical-500 hover:bg-botanical-400 text-forest-950 font-black text-sm sm:text-base flex items-center gap-2.5 shadow-xl transition transform active:scale-95"
            >
              <Mic className="w-5 h-5 text-forest-950" />
              <span>{isMarathi ? 'आवाजाने मोफत सुरू करा' : 'Start Free with Voice'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              className="px-8 py-4 rounded-full bg-forest-800/90 hover:bg-forest-800 text-white border border-forest-600/70 font-bold text-sm sm:text-base transition active:scale-95"
            >
              <span>{isAuthenticated ? (isMarathi ? 'डॅशबोर्ड उघडा' : 'Open Dashboard') : (isMarathi ? 'शेतकरी नोंदणी / लॉगिन' : 'Farmer Sign Up / Login')}</span>
            </button>
          </div>

          {/* 3 Value Pillars */}
          <div className="pt-6 border-t border-forest-800/80 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-forest-300">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-botanical-400" />
              <span>{isMarathi ? 'कोणतेही शुल्क नाही' : 'Zero Hidden Charges'}</span>
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-botanical-400" />
              <span>{isMarathi ? 'मराठी व इंग्रजी भाषा' : 'Marathi & English'}</span>
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-botanical-400" />
              <span>{isMarathi ? 'केव्हीके नियमावलीवर आधारित' : 'KVK & ICAR Grounded'}</span>
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. DARK FOREST-GREEN FOOTER (Branding, Verified Portals, Socials & India Tag)
      ========================================================================= */}
      <footer id="contact" className="bg-[#052e16] text-white pt-14 pb-8 border-t border-emerald-950 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
                  <Sprout className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black tracking-tight">AgriSense</span>
              </div>
              <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                {isMarathi
                  ? 'महाराष्ट्रातील शेतकऱ्यांचा विश्वासू एआय डिजिटल मित्र. केव्हीके व आयसीएआर नियमावलीवर आधारित कृषी मार्गदर्शन.'
                  : 'Smart farming companion for smallholder farmers across Maharashtra, grounded in verified agricultural science.'}
              </p>
              <div className="text-xs text-emerald-300 font-bold pt-1">
                {isMarathi ? 'टोल-फ्री किसान कॉल सेंटर:' : 'Kisan Call Center Hotline:'}
                <div className="text-sm text-white font-extrabold mt-0.5">1800-180-1551 (24/7)</div>
              </div>
            </div>

            {/* Col 2: Core Pages */}
            <div className="space-y-3 text-xs">
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-emerald-400">
                {isMarathi ? 'महत्त्वाच्या सेवा' : 'Core Services'}
              </h4>
              <ul className="space-y-2 text-emerald-200 font-medium">
                <li>
                  <button onClick={() => navigate('/disease')} className="hover:text-white transition">
                    {isMarathi ? 'पिक रोग तपासणी' : 'Crop Disease Check'}
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/advisor')} className="hover:text-white transition">
                    {isMarathi ? 'कृषी सल्लागार (AI Advisor)' : 'Ask AgriSense Advisor'}
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/weather')} className="hover:text-white transition">
                    {isMarathi ? 'हवामान अंदाज' : 'Weather & Alerts'}
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/market')} className="hover:text-white transition">
                    {isMarathi ? 'एपीएमसी बाजार भाव' : 'APMC Mandi Rates'}
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/calendar')} className="hover:text-white transition">
                    {isMarathi ? 'पिक दिनदर्शिका व स्मरणपत्रे' : 'Crop Calendar & Reminders'}
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/saved-advice')} className="hover:text-white transition">
                    {isMarathi ? 'जतन केलेली सल्ला वही' : 'Saved Advisory Notebook'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Official Portals */}
            <div className="space-y-3 text-xs">
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-emerald-400">
                {isMarathi ? 'अधिकृत पोर्टल' : 'Official Portals'}
              </h4>
              <ul className="space-y-2 text-emerald-200 font-medium">
                <li>
                  <a
                    href="https://mahadbt.maharashtra.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition flex items-center gap-1"
                  >
                    <span>{isMarathi ? 'महाडीबीटी शेतकरी योजना' : 'MahaDBT Farmer Portal'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://pmkisan.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition flex items-center gap-1"
                  >
                    <span>{isMarathi ? 'पीएम-किसान सन्मान निधी' : 'PM-KISAN Portal'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://pmfby.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition flex items-center gap-1"
                  >
                    <span>{isMarathi ? 'प्रधानमंत्री पीक विमा (PMFBY)' : 'PM Crop Insurance'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://agmarknet.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition flex items-center gap-1"
                  >
                    <span>{isMarathi ? 'अ‍ॅगमार्कनेट भाव' : 'Agmarknet Market Portal'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <button onClick={() => navigate('/resources')} className="hover:text-white transition font-bold text-emerald-300">
                    {isMarathi ? 'सर्व शासकीय दुवे पहा →' : 'All Verified Portals →'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Language & Farmer Access */}
            <div className="space-y-3 text-xs">
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-emerald-400">
                {isMarathi ? 'भाषा व प्रवेश' : 'Language & Access'}
              </h4>
              <p className="text-emerald-200">
                {isMarathi
                  ? 'अ‍ॅग्रीसेन्स संपूर्णपणे मराठी व इंग्रजी दोन्ही भाषांना समर्थन देते.'
                  : 'Switch instantly between Marathi and English across all tools.'}
              </p>
              <div className="pt-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold transition border border-emerald-700"
                  >
                    {isMarathi ? 'डॅशबोर्डवर जा' : 'Open Dashboard'}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl font-black transition shadow"
                  >
                    {isMarathi ? 'शेतकरी लॉगिन' : 'Farmer Login'}
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Bottom Copyright & India Badge */}
          <div className="border-t border-emerald-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-400 font-medium">
            <p>
              © {new Date().getFullYear()} AgriSense. {isMarathi ? 'सर्व हक्क राखीव. स्मार्ट शेती, समृद्ध भविष्य.' : 'All rights reserved. Smart Farming. Better Tomorrow.'}
            </p>
            <div className="flex items-center gap-2 text-emerald-300 text-xs">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>Made for Farmers With 🧡 in India</span>
            </div>
          </div>

        </div>
      </footer>

      {/* =========================================================================
          WORKING LIVE VOICE ASSISTANT MODAL OVERLAY
      ========================================================================= */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md">
            <VoiceWidget
              onSpeechResult={(transcribed) => {
                navigate(`/advisor?query=${encodeURIComponent(transcribed)}`);
              }}
              onSendImmediate={(textToSend) => {
                navigate(`/advisor?query=${encodeURIComponent(textToSend)}`);
              }}
              onClose={() => setShowVoiceModal(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
