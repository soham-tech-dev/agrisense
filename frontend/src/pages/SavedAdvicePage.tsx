import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Search,
  Trash2,
  Edit3,
  Check,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Volume2,
  VolumeX,
  FileText,
  Tag,
  Sprout,
  Plus,
  BookOpen
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import { voiceFactory } from '../services/voice/VoiceFactory';

export interface SavedAdviceItem {
  id: string;
  title: string;
  content: string;
  crop?: string;
  topic?: string;
  source?: string;
  date: string;
  farmerNote?: string;
}

const DEFAULT_SAVED_ADVICE: SavedAdviceItem[] = [
  {
    id: 'save-1',
    title: 'कांद्यावरील जांभळा करपा नियंत्रण (Purple Blotch Management)',
    content:
      'कांद्यावरील जांभळा करपा रोगाच्या नियंत्रणासाठी मँकोझेब ७५% डब्ल्यूपी २.५ ग्रॅम किंवा टेबुकोनॅझोल २५.९% ईसी १.५ मिली प्रति लिटर पाण्यात मिसळून फवारणी करावी. फवारणीच्या पाण्यात स्टिकर (चिटकणारा डिंक) अवश्य वापरावा.',
    crop: 'कांदा (Onion)',
    topic: 'रोग नियंत्रण (Disease Control)',
    source: 'केव्हीके नाशिक शिफारस (ICAR-DOGR)',
    date: '2026-10-10',
    farmerNote: '१२ ऑक्टोबरला मँकोझेब फवारले. ४ दिवसांनी पाने सुधारली.'
  },
  {
    id: 'save-2',
    title: 'सोयाबीन खोडमाशी व चक्रीभुंगा उपाय (Stem Fly & Girdle Beetle)',
    content:
      'सोयाबीन पिकामध्ये खोडमाशी व चक्रीभुंग्याच्या प्रतिबंधात्मक नियंत्रणासाठी क्लोरअँट्रानिलीप्रोल १८.५% एससी ३ मिली किंवा थायामेथोक्सम १२.६% + लॅम्बडा सायहेलोथ्रीन ९.५% झेडसी २.५ मिली प्रति १० लिटर पाण्यात मिसळून फवारावे.',
    crop: 'सोयाबीन (Soybean)',
    topic: 'कीड नियंत्रण (Pest Control)',
    source: 'वसंतराव नाईक मराठवाडा कृषी विद्यापीठ शिफारस',
    date: '2026-10-08',
    farmerNote: 'दुसऱ्या आठवड्यात फवारणी केली.'
  }
];

export const SavedAdvicePage: React.FC = () => {
  const { language } = useLanguage();
  const isMarathi = language === 'mr';
  const navigate = useNavigate();
  const { showToast } = useToast();
  const voiceProvider = voiceFactory.getProvider();

  const [savedItems, setSavedItems] = useState<SavedAdviceItem[]>(() => {
    try {
      const data = localStorage.getItem('agrisense_saved_notebook');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SAVED_ADVICE;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('agrisense_saved_notebook', JSON.stringify(savedItems));
  }, [savedItems]);

  const handleDelete = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
    showToast(isMarathi ? 'नोंद वहीतून सल्ला हटवला' : 'Item removed from notebook', 'info');
  };

  const handleStartEditNote = (item: SavedAdviceItem) => {
    setEditingNoteId(item.id);
    setTempNote(item.farmerNote || '');
  };

  const handleSaveNote = (id: string) => {
    setSavedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, farmerNote: tempNote.trim() } : item
      )
    );
    setEditingNoteId(null);
    showToast(isMarathi ? 'शेतकरी नोंद जतन केली!' : 'Farmer note saved!', 'success');
  };

  const handleSpeak = (item: SavedAdviceItem) => {
    if (playingId === item.id) {
      voiceProvider.stopSpeaking();
      setPlayingId(null);
      return;
    }
    voiceProvider.stopSpeaking();
    setPlayingId(item.id);
    voiceProvider.speak(
      item.content,
      isMarathi ? 'mr' : 'en',
      () => setPlayingId(null),
      () => setPlayingId(null)
    );
  };

  const filteredItems = savedItems.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      (item.crop && item.crop.toLowerCase().includes(q)) ||
      (item.farmerNote && item.farmerNote.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-14 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-forest-800 hover:text-botanical-600 transition"
        >
          <ArrowLeft className="w-4 h-4 text-botanical-600" />
          <span>{isMarathi ? 'डॅशबोर्डवर परत जा' : 'Back to Dashboard'}</span>
        </button>

        <Button
          variant="forest"
          size="sm"
          onClick={() => navigate('/advisor')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          <span>{isMarathi ? 'नवीन सल्ला शोधा' : 'Ask AI Advisor'}</span>
        </Button>
      </div>

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white p-6 sm:p-8 shadow-xl border border-forest-800/60">
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-forest-800/80 border border-amber-400/30 rounded-full text-xs font-bold text-amber-300">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{isMarathi ? 'माझी शेती सल्ला वही' : 'Saved Advisory Notebook'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isMarathi ? 'जतन केलेले कृषी सल्ले व शेती नोंदी' : 'My Bookmarked Field Advisory'}
            </h1>
            <p className="text-forest-200 text-xs sm:text-sm leading-relaxed">
              {isMarathi
                ? 'कृषी सल्लागाराकडून मिळालेले महत्त्वाचे उपाय, फवारणी डोस आणि स्वतःच्या शेती नोंदी.'
                : 'Offline-ready bookmarked recommendations, spray dosage notes, and farmer observation logs.'}
            </p>
          </div>

          <div className="bg-forest-900/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-forest-700/60 text-center shrink-0">
            <span className="text-2xl font-black text-amber-300">{savedItems.length}</span>
            <span className="text-[11px] font-bold text-forest-300 block">{isMarathi ? 'जतन सल्ले' : 'Saved Items'}</span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isMarathi ? 'पिकाचे नाव, कीड, रोग किंवा स्वतःची नोंद शोधा...' : 'Search saved items by crop, pest, treatment or note...'}
          className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200/80 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-botanical-500 shadow-2xs outline-none"
        />
      </div>

      {/* List of Saved Items */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <Card variant="flat" className="p-12 text-center space-y-3">
            <Bookmark className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">
              {isMarathi ? 'कोणतेही जतन केलेले सल्ले आढळले नाहीत.' : 'No saved advisory items found.'}
            </p>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} variant="elevated" className="space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.crop && <Badge variant="forest" size="sm">{item.crop}</Badge>}
                    {item.topic && <Badge variant="neutral" size="sm">{item.topic}</Badge>}
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.date}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 pt-1">
                    {item.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSpeak(item)}
                    className={`p-2 rounded-xl transition ${
                      playingId === item.id
                        ? 'bg-botanical-500 text-forest-950 font-bold'
                        : 'bg-forest-50 text-forest-800 hover:bg-forest-100'
                    }`}
                    title={isMarathi ? 'ऐका' : 'Listen'}
                  >
                    {playingId === item.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                    title={isMarathi ? 'काढून टाका' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Advisory Body */}
              <div className="p-4 rounded-2xl bg-surface-subtle border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">
                {item.content}
              </div>

              {/* Source attribution */}
              {item.source && (
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-botanical-600" />
                  <span>{isMarathi ? 'स्त्रोत: ' : 'Source: '}{item.source}</span>
                </div>
              )}

              {/* Farmer Personal Note Editor */}
              <div className="pt-2 border-t border-slate-100">
                {editingNoteId === item.id ? (
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={tempNote}
                      onChange={(e) => setTempNote(e.target.value)}
                      placeholder={isMarathi ? 'तुमची स्वतःची नोंद लिहा (उदा. फवारणी तारीख, परिणाम...)' : 'Write your farm observation note...'}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-botanical-500"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="forest" size="xs" onClick={() => handleSaveNote(item.id)}>
                        {isMarathi ? 'जतन करा' : 'Save'}
                      </Button>
                      <Button variant="outline" size="xs" onClick={() => setEditingNoteId(null)}>
                        {isMarathi ? 'रद्द' : 'Cancel'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs bg-amber-50/60 p-3 rounded-xl border border-amber-200/70">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-amber-900 block">{isMarathi ? 'माझी शेती नोंद:' : 'Farmer Note:'}</span>
                        <span className="text-slate-700 font-medium">
                          {item.farmerNote || (isMarathi ? 'अद्याप नोंद केलेली नाही.' : 'No notes added yet.')}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartEditNote(item)}
                      className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 text-[11px] shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isMarathi ? 'नोंद बदला' : 'Edit'}</span>
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SavedAdvicePage;
