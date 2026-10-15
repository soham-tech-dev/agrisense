import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Globe, ShieldCheck, LogOut, CheckCircle, Volume2, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LanguageToggle } from '../components/common/LanguageToggle';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    api.checkHealth()
      .then(res => setHealth(res))
      .catch(err => console.error('Health check error:', err));
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-14 font-sans">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white p-6 sm:p-8 shadow-xl border border-forest-800/60">
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-botanical-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-forest-800/80 border border-botanical-500/40 text-botanical-300 flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
            <SettingsIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-forest-800/80 border border-botanical-500/30 text-botanical-300 text-xs font-bold mb-1">
              <Cpu className="w-3.5 h-3.5 text-botanical-400" />
              <span>प्रणाली सेटिंग्ज</span>
            </div>
            <h1 className="text-2xl font-black text-white">
              {t('settings.title', 'App Settings & Preferences')}
            </h1>
            <p className="text-xs text-forest-200 font-medium">
              {t('settings.subTitle', 'Configure language, voice assistant, and diagnostics')}
            </p>
          </div>
        </div>
      </div>

      {/* Language Preference Card */}
      <Card title={t('settings.languageSection', 'Language Preference')}>
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <p className="text-xs text-slate-600 font-medium text-center">
            {t('common.switchLanguage', 'Change Language')}
          </p>
          <LanguageToggle variant="pill" className="scale-110" />
        </div>
      </Card>

      {/* Voice Assistant Settings Card */}
      <Card title={t('settings.voiceSection', 'Voice Assistant Settings')}>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-subtle border border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold">
              <Volume2 className="w-5 h-5 text-forest-800" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{t('settings.autoTTS', 'Auto-play Voice Answer (TTS)')}</p>
              <p className="text-xs text-slate-500">{t('settings.autoTTSSub', 'Automatically read out AI advisor responses aloud')}</p>
            </div>
          </div>
          <Badge variant="success">
            {t('common.active', 'Active')}
          </Badge>
        </div>
      </Card>

      {/* System Health Diagnostic Card */}
      <Card title="System Diagnostics" badge={<Badge variant="forest">Live Check</Badge>}>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-subtle border border-slate-200/80">
            <span className="text-slate-700 font-semibold text-xs">FastAPI Backend API Health</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-botanical-100 text-forest-900 text-xs font-bold border border-botanical-300">
              <CheckCircle className="w-3.5 h-3.5 text-botanical-700" />
              {health?.status || 'OK'} (v{health?.version || '1.0.0'})
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-subtle border border-slate-200/80">
            <span className="text-slate-700 font-semibold text-xs">Speech Recognition Engine</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
              WebSpeech (mr-IN / en-IN)
            </span>
          </div>
        </div>
      </Card>

      {/* Logout Action Card */}
      <Card>
        <Button
          variant="danger"
          fullWidth
          size="lg"
          leftIcon={<LogOut className="w-5 h-5" />}
          onClick={() => {
            logout();
            showToast('Logged out successfully', 'info');
          }}
        >
          {t('nav.logout', 'Logout')}
        </Button>
      </Card>
    </div>
  );
};

export default SettingsPage;
