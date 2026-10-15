import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Sprout,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Droplets,
  Bug,
  Sparkles,
  ArrowLeft,
  CalendarDays
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

interface CropReminder {
  id: string;
  cropName: string;
  stageName: string;
  activity: string;
  dueDate: string;
  completed: boolean;
  notes?: string;
  isKvkRecommended?: boolean;
}

const DEFAULT_REMINDERS: CropReminder[] = [
  {
    id: 'rem-1',
    cropName: 'कांदा (Onion)',
    stageName: 'लागवड अवस्था (Transplanting)',
    activity: 'रोप लागवडीनंतर २५ दिवसांनी नत्र खताचा पहिला हप्ता (युरिया) व तण नियंत्रण',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    completed: false,
    isKvkRecommended: true
  },
  {
    id: 'rem-2',
    cropName: 'कांदा (Onion)',
    stageName: 'वाढ अवस्था (Vegetative Stage)',
    activity: 'जांभळा करपा प्रतिबंधासाठी मँकोझेब २.५ ग्रॅम प्रति लिटर पाणी फवारणी',
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    completed: false,
    isKvkRecommended: true
  },
  {
    id: 'rem-3',
    cropName: 'सोयाबीन (Soybean)',
    stageName: 'फुलधारणा अवस्था (Flowering)',
    activity: 'फुलोरा अवस्थेत ००:५२:३४ (१५ ग्रॅम/लिटर) फवारणी व खोडमाशी नियंत्रण',
    dueDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
    completed: false,
    isKvkRecommended: true
  },
  {
    id: 'rem-4',
    cropName: 'कापूस (Cotton)',
    stageName: 'बोंड भरण्याची अवस्था (Boll Development)',
    activity: 'गुलाबी बोंडअळीसाठी फेरोमोन ट्रॅप तपासणी व १३:००:४५ खताची फवारणी',
    dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    completed: true,
    isKvkRecommended: true
  }
];

export const CropCalendarPage: React.FC = () => {
  const { language } = useLanguage();
  const isMarathi = language === 'mr';
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [reminders, setReminders] = useState<CropReminder[]>(() => {
    try {
      const saved = localStorage.getItem('agrisense_crop_reminders');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_REMINDERS;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCrop, setFilterCrop] = useState<string>('all');
  const [newCrop, setNewCrop] = useState(isMarathi ? 'कांदा' : 'Onion');
  const [newStage, setNewStage] = useState(isMarathi ? 'वाढ अवस्था' : 'Vegetative');
  const [newActivity, setNewActivity] = useState('');
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]
  );

  useEffect(() => {
    localStorage.setItem('agrisense_crop_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const toggleComplete = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    showToast(isMarathi ? 'स्मरणपत्र काढून टाकले' : 'Reminder removed', 'info');
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.trim()) {
      showToast(isMarathi ? 'कृपया कामाचे नाव टाका' : 'Please enter activity', 'error');
      return;
    }

    const item: CropReminder = {
      id: 'rem-' + Date.now(),
      cropName: newCrop,
      stageName: newStage,
      activity: newActivity.trim(),
      dueDate: newDueDate,
      completed: false,
      isKvkRecommended: false
    };

    setReminders((prev) => [item, ...prev]);
    setShowAddModal(false);
    setNewActivity('');
    showToast(isMarathi ? 'नवीन स्मरणपत्र जोडले!' : 'Reminder added successfully!', 'success');
  };

  const filteredReminders = reminders.filter((r) => {
    if (filterCrop === 'all') return true;
    return r.cropName.toLowerCase().includes(filterCrop.toLowerCase());
  });

  const completedCount = reminders.filter((r) => r.completed).length;
  const pendingCount = reminders.length - completedCount;

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
          onClick={() => setShowAddModal(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          <span>{isMarathi ? '+ नवीन स्मरणपत्र' : '+ Add Reminder'}</span>
        </Button>
      </div>

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white p-6 sm:p-8 shadow-xl border border-forest-800/60">
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-botanical-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-forest-800/80 border border-botanical-500/30 rounded-full text-xs font-bold text-botanical-300">
              <CalendarDays className="w-4 h-4 text-botanical-400" />
              <span>{isMarathi ? 'पिक वेळापत्रक व स्मरणपत्रे' : 'Smart Agronomy Calendar'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isMarathi ? 'हंगामवार पिक कार्य नियोजन' : 'Crop Growth Stage Calendar'}
            </h1>
            <p className="text-forest-200 text-xs sm:text-sm leading-relaxed">
              {isMarathi
                ? 'पेरणी, खत व्यवस्थापन, कीटकनाशक फवारणी आणि काढणीच्या नियोजित तारखा आणि टास्क लिस्ट.'
                : 'Stage-wise agronomic timelines, fertilizer doses, spray schedules, and task reminders.'}
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <div className="bg-forest-900/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-forest-700/60 text-center">
              <span className="text-xl font-black text-amber-300">{pendingCount}</span>
              <span className="text-[10px] font-bold text-forest-300 block">{isMarathi ? 'प्रलंबित' : 'Pending'}</span>
            </div>
            <div className="bg-forest-900/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-forest-700/60 text-center">
              <span className="text-xl font-black text-botanical-300">{completedCount}</span>
              <span className="text-[10px] font-bold text-forest-300 block">{isMarathi ? 'पूर्ण' : 'Done'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['all', 'कांदा', 'सोयाबीन', 'कापूस'].map((cropKey) => {
          const active = filterCrop === cropKey;
          const label =
            cropKey === 'all'
              ? isMarathi
                ? 'सर्व स्मरणपत्रे'
                : 'All Tasks'
              : cropKey;
          return (
            <button
              key={cropKey}
              onClick={() => setFilterCrop(cropKey)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                active
                  ? 'bg-forest-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-forest-50/50'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <Card variant="flat" className="p-10 text-center space-y-3">
            <CalendarIcon className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">
              {isMarathi ? 'या पिकासाठी कोणतीही स्मरणपत्रे नाहीत.' : 'No reminders found for this filter.'}
            </p>
          </Card>
        ) : (
          filteredReminders.map((item) => (
            <Card
              key={item.id}
              padding="sm"
              className={`transition-all ${
                item.completed ? 'bg-slate-50/60 border-slate-200 opacity-75' : 'bg-white hover:border-botanical-300 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleComplete(item.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      item.completed
                        ? 'bg-botanical-500 border-botanical-600 text-white'
                        : 'border-slate-300 hover:border-botanical-500 bg-white'
                    }`}
                  >
                    {item.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-black ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {item.activity}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 pt-0.5">
                      <Badge variant="forest" size="sm">{item.cropName}</Badge>
                      <span className="text-[11px] font-semibold text-slate-500">• {item.stageName}</span>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {item.dueDate}
                      </span>
                      {item.isKvkRecommended && (
                        <Badge variant="kvk" size="sm">KVK Recommended</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteReminder(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition shrink-0"
                  title={isMarathi ? 'काढून टाका' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <Card variant="elevated" className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                {isMarathi ? 'नवीन स्मरणपत्र जोडा' : 'Add New Crop Task'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-3.5 text-left text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{isMarathi ? 'पिक:' : 'Crop:'}</label>
                <input
                  type="text"
                  value={newCrop}
                  onChange={(e) => setNewCrop(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-botanical-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isMarathi ? 'पिकाची अवस्था:' : 'Stage:'}</label>
                <input
                  type="text"
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-botanical-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isMarathi ? 'कामाचे नाव (कृती):' : 'Activity / Task:'}</label>
                <textarea
                  rows={2}
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  placeholder={isMarathi ? 'उदा. युरिया खताची दुसरी मात्रा देणे...' : 'e.g., Spray Mancozeb 2.5g/L...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-botanical-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isMarathi ? 'अपेक्षित तारीख:' : 'Due Date:'}</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-botanical-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="forest" size="md" fullWidth type="submit">
                  {isMarathi ? 'जतन करा' : 'Save Task'}
                </Button>
                <Button variant="outline" size="md" type="button" onClick={() => setShowAddModal(false)}>
                  {isMarathi ? 'रद्द' : 'Cancel'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CropCalendarPage;
