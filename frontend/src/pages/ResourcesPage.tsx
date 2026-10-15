import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ExternalLink,
  PhoneCall,
  ShieldCheck,
  Building2,
  FileCheck2,
  HelpCircle,
  ArrowLeft,
  Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

interface OfficialResource {
  titleMr: string;
  titleEn: string;
  categoryMr: string;
  categoryEn: string;
  descriptionMr: string;
  descriptionEn: string;
  url?: string;
  helpline?: string;
  badge: string;
}

const OFFICIAL_RESOURCES: OfficialResource[] = [
  {
    titleMr: 'किसान कॉल सेंटर (Kisan Call Center)',
    titleEn: 'Kisan Call Center (KCC)',
    categoryMr: 'थेट कृषी तज्ञ सल्ला',
    categoryEn: 'Direct Expert Advisory',
    descriptionMr: 'भारत सरकारच्या कृषी मंत्रालयाची मोफत २४/७ टोल-फ्री हेल्पलाइन. स्थानिक भाषेत तज्ञांशी थेट चर्चा करा.',
    descriptionEn: 'Ministry of Agriculture 24/7 toll-free helpline providing immediate expert advice in regional languages.',
    helpline: '1800-180-1551',
    badge: 'Toll-Free Helpline'
  },
  {
    titleMr: 'महाडीबीटी शेतकरी योजना (MahaDBT Farmer Portal)',
    titleEn: 'MahaDBT Farmer Schemes Portal',
    categoryMr: 'महाराष्ट्र शासकीय योजना',
    categoryEn: 'Maharashtra Govt Subsidies',
    descriptionMr: 'ठिबक सिंचन, कृषी यांत्रिकीकरण (ट्रॅक्टर, अवजारे), शेततळे आणि फळबाग अनुदानासाठी अधिकृत पोर्टल.',
    descriptionEn: 'Official Maharashtra portal for drip irrigation, farm mechanization, farm ponds, and horticulture subsidies.',
    url: 'https://mahadbt.maharashtra.gov.in/',
    badge: 'Maharashtra Govt'
  },
  {
    titleMr: 'प्रधानमंत्री किसान सन्मान निधी (PM-KISAN)',
    titleEn: 'PM-Kisan Samman Nidhi',
    categoryMr: 'थेट आर्थिक मदत',
    categoryEn: 'Direct Benefit Transfer',
    descriptionMr: 'शेतकऱ्यांना दरवर्षी ₹६,००० थेट बँक खात्यात जमा होणाऱ्या योजनेची माहिती, ई-केवायसी व हप्ता स्थिती तपासणी.',
    descriptionEn: 'Check beneficiary status, e-KYC compliance, and installment updates for the ₹6,000/year income support.',
    url: 'https://pmkisan.gov.in/',
    badge: 'Central Govt'
  },
  {
    titleMr: 'प्रधानमंत्री पीक विमा योजना (PMFBY)',
    titleEn: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    categoryMr: 'पीक नुकसान भरपाई',
    categoryEn: 'Crop Insurance',
    descriptionMr: 'अवेळी पाऊस, दुष्काळ किंवा नैसर्गिक आपत्तीमुळे झालेल्या पीक नुकसानीसाठी ७२ तासांत ऑनलाइन पूर्वसूचना नोंदवा.',
    descriptionEn: 'Report crop loss within 72 hours of localized calamity and track insurance claims online.',
    url: 'https://pmfby.gov.in/',
    badge: 'Insurance Portal'
  },
  {
    titleMr: 'आयसीएआर - कृषी विज्ञान केंद्र (ICAR KVK Portal)',
    titleEn: 'ICAR - Krishi Vigyan Kendra Network',
    categoryMr: 'स्थानिक कृषी संशोधन',
    categoryEn: 'Agricultural Extension',
    descriptionMr: 'महाराष्ट्रातील प्रत्येक जिल्ह्यातील केव्हीके तज्ञांचे पत्ते, संपर्क आणि तंत्रज्ञान प्रसार माहिती.',
    descriptionEn: 'Directory and technical advisories from Krishi Vigyan Kendras across all Maharashtra districts.',
    url: 'https://kvk.icar.gov.in/',
    badge: 'ICAR Verified'
  },
  {
    titleMr: 'अ‍ॅगमार्कनेट बाजार भाव पोर्टल (Agmarknet)',
    titleEn: 'Agmarknet APMC Mandi Portal',
    categoryMr: 'राष्ट्रीय बाजार भाव',
    categoryEn: 'National Commodity Rates',
    descriptionMr: 'देशभरातील आणि महाराष्ट्रातील सर्व कृषी उत्पन्न बाजार समित्यांचे अधिकृत दैनंदिन आवक व बाजार भाव.',
    descriptionEn: 'Official government portal with arrival volumes and daily wholesale rates across all APMC markets.',
    url: 'https://agmarknet.gov.in/',
    badge: 'Govt APMC Data'
  }
];

export const ResourcesPage: React.FC = () => {
  const { language } = useLanguage();
  const isMarathi = language === 'mr';
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-14 font-sans">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-forest-800 hover:text-botanical-600 transition"
        >
          <ArrowLeft className="w-4 h-4 text-botanical-600" />
          <span>{isMarathi ? 'डॅशबोर्डवर परत जा' : 'Back to Dashboard'}</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white p-6 sm:p-8 shadow-xl border border-forest-800/60">
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-botanical-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-forest-800/80 border border-botanical-500/30 rounded-full text-xs font-bold text-botanical-300">
            <BookOpen className="w-4 h-4 text-botanical-400" />
            <span>{isMarathi ? 'अधिकृत शासकीय कृषी संसाधने' : 'Official Agricultural Resources'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {isMarathi ? 'शासकीय योजना व अधिकृत शेतकरी हेल्पलाइन' : 'Government Schemes & Verified Portals'}
          </h1>
          <p className="text-xs sm:text-sm text-forest-200 max-w-xl leading-relaxed">
            {isMarathi
              ? 'महाराष्ट्र शासन व केंद्र सरकारच्या अधिकृत पोर्टलच्या थेट लिंक्स आणि टोल-फ्री संपर्क. कोणत्याही मध्यस्थांशिवाय थेट अर्ज करा.'
              : 'Direct links to official central and Maharashtra state portals, subsidy schemes, and verified emergency farmer helplines.'}
          </p>
        </div>
      </div>

      {/* Trust Notice */}
      <Card variant="subtle" padding="sm" className="border-botanical-200">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-forest-700 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-forest-900">
              {isMarathi ? 'सत्यता पडताळणी: ' : 'Verification Guarantee: '}
            </span>
            <span className="text-forest-800">
              {isMarathi
                ? 'खालील सर्व लिंक्स अधिकृत शासकीय (.gov.in / .nic.in) संकेतस्थळांशी जोडलेल्या आहेत. अ‍ॅग्रीसेन्स कोणत्याही योजनेसाठी शुल्क घेत नाही.'
                : 'All listed destinations link directly to official .gov.in domains. AgriSense never charges fees for government schemes.'}
            </span>
          </div>
        </div>
      </Card>

      {/* Grid of Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OFFICIAL_RESOURCES.map((res, idx) => (
          <Card key={idx} hoverable className="flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="forest" size="sm">
                  {res.badge}
                </Badge>
                <span className="text-[11px] font-semibold text-slate-400">
                  {isMarathi ? res.categoryMr : res.categoryEn}
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900">
                {isMarathi ? res.titleMr : res.titleEn}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {isMarathi ? res.descriptionMr : res.descriptionEn}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {res.helpline ? (
                <a
                  href={`tel:${res.helpline}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-botanical-50 hover:bg-botanical-100/80 text-forest-900 rounded-xl font-bold text-xs transition border border-botanical-200"
                >
                  <PhoneCall className="w-4 h-4 text-botanical-700" />
                  <span>{res.helpline}</span>
                </a>
              ) : res.url ? (
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-botanical-600 transition"
                >
                  <span>{isMarathi ? 'पोर्टल उघडा' : 'Open Portal'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : null}

              <span className="text-[10px] text-slate-400 font-medium">
                {isMarathi ? 'अधिकृत पोर्टल' : 'Official Portal'}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ResourcesPage;
