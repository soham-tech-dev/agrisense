import React, { useState, useEffect } from 'react';
import { User as UserIcon, Save, Volume2, Globe, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';

export const Profile: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    village: user?.village || '',
    taluka: user?.taluka || '',
    district: user?.district || 'Nashik',
    language: user?.language || 'mr',
    voice_enabled: user?.voice_enabled ?? true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        village: user.village || '',
        taluka: user.taluka || '',
        district: user.district || 'Nashik',
        language: user.language || 'mr',
        voice_enabled: user.voice_enabled ?? true,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile(formData as any);
      await refreshProfile();
      showToast('प्रोफाइल माहिती यशस्वीपणे जतन केली!', 'success');
    } catch (err: any) {
      showToast(err.message || 'प्रोफाइल जतन करताना त्रुटी आली', 'error');
    } finally {
      setSaving(false);
    }
  };

  const isMarathi = formData.language === 'mr';

  const districtOptions = [
    { value: 'Nashik', label: 'नाशिक (Nashik)' },
    { value: 'Pune', label: 'पुणे (Pune)' },
    { value: 'Ahmednagar', label: 'अहमदनगर (Ahmednagar)' },
    { value: 'Solapur', label: 'सोलापूर (Solapur)' },
    { value: 'Satara', label: 'सातारा (Satara)' },
    { value: 'Kolhapur', label: 'कोल्हापूर (Kolhapur)' },
    { value: 'Nagpur', label: 'नागपूर (Nagpur)' },
    { value: 'Aurangabad', label: 'छत्रपती संभाजीनगर (Aurangabad)' },
    { value: 'Jalgaon', label: 'जळगाव (Jalgaon)' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-14 font-sans">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white p-6 sm:p-8 shadow-xl border border-forest-800/60">
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-botanical-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-forest-800/80 border border-botanical-500/40 text-botanical-300 flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-forest-800/80 border border-botanical-500/30 text-botanical-300 text-xs font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-botanical-400" />
              <span>{isMarathi ? 'नोंदणीकृत शेतकरी खाते' : 'Verified Farmer Profile'}</span>
            </div>
            <h1 className="text-2xl font-black text-white">
              {formData.name || (isMarathi ? 'शेतकरी मित्र' : 'Farmer')}
            </h1>
            <p className="text-xs text-forest-200 font-medium">
              {isMarathi ? 'आपली वैयक्तिक व पत्त्याची माहिती अद्ययावत करा.' : 'Manage your personal profile and location settings.'}
            </p>
          </div>
        </div>
      </div>

      <Card variant="elevated">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={isMarathi ? 'पूर्ण नाव (Full Name)' : 'Full Name'}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="उदा. रमेश पाटील"
              required
            />
            <div className="w-full">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Phone className="w-4 h-4 text-botanical-600" />
                {isMarathi ? 'मोबाईल नंबर' : 'Phone Number'}
              </label>
              <input
                type="text"
                value={user?.phone || ''}
                disabled
                className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-medium text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <Input
            label={isMarathi ? 'ईमेल पत्ता (ऐच्छिक)' : 'Email (Optional)'}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="farmer@example.com"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label={isMarathi ? 'गाव (Village)' : 'Village'}
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              placeholder="उदा. निफाड"
            />
            <Input
              label={isMarathi ? 'तालुका (Taluka)' : 'Taluka'}
              value={formData.taluka}
              onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
              placeholder="उदा. निफाड"
            />
            <Select
              label={isMarathi ? 'जिल्हा (District)' : 'District'}
              value={formData.district}
              options={districtOptions}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={isMarathi ? 'पसंतीची भाषा (Preferred Language)' : 'Preferred Language'}
              value={formData.language}
              options={[
                { value: 'mr', label: 'मराठी (Marathi)' },
                { value: 'en', label: 'English' },
              ]}
              onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
            />

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-subtle border border-slate-200/80 mt-auto">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-botanical-600" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {isMarathi ? 'व्हॉईस असिस्टंट' : 'Voice Assistant'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {isMarathi ? 'मराठी आवाज समर्थन' : 'Speech input & audio output'}
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.voice_enabled}
                onChange={(e) => setFormData({ ...formData, voice_enabled: e.target.checked })}
                className="w-5 h-5 rounded accent-forest-800 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              variant="forest"
              size="md"
              isLoading={saving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isMarathi ? 'प्रोफाइल जतन करा' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
