import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mic, 
  AlertCircle, 
  RefreshCw, 
  Radio, 
  X, 
  Send,
  HelpCircle,
  Play,
  Square,
  Volume2,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { voiceFactory } from '../../services/voice/VoiceFactory';
import { VoiceState, VoiceError } from '../../services/voice/VoiceProvider';
import { runFullVoiceDiagnostics, FullDiagnosticReport } from '../../services/voice/VoiceDiagnostics';

interface VoiceWidgetProps {
  onSpeechResult: (text: string) => void;
  onSendImmediate?: (text: string) => void;
  isProcessingQuery?: boolean;
  latestAnswerText?: string;
  onClose?: () => void;
  className?: string;
}

export const VoiceWidget: React.FC<VoiceWidgetProps> = ({
  onSpeechResult,
  onSendImmediate,
  isProcessingQuery = false,
  latestAnswerText,
  onClose,
  className = ''
}) => {
  const { t, language, toggleLanguage } = useLanguage();
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [noSpeechDetected, setNoSpeechDetected] = useState<boolean>(false);
  const [voiceError, setVoiceError] = useState<VoiceError | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [permissionNotice, setPermissionNotice] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const provider = voiceFactory.getProvider();
  const isMarathi = language === 'mr';

  // Stop listening or speaking on unmount
  useEffect(() => {
    return () => {
      provider.stopListening();
      provider.stopSpeaking();
    };
  }, [provider]);

  // Handle external query processing state changes
  useEffect(() => {
    if (isProcessingQuery) {
      setVoiceState('processing');
    }
  }, [isProcessingQuery]);

  // Diagnostics runner
  const [diagReport, setDiagReport] = useState<FullDiagnosticReport | null>(null);
  const [isRunningDiag, setIsRunningDiag] = useState<boolean>(false);
  const [showDiagPanel, setShowDiagPanel] = useState<boolean>(false);

  const handleRunDiagnostics = async () => {
    setIsRunningDiag(true);
    setShowDiagPanel(true);
    try {
      const report = await runFullVoiceDiagnostics(language);
      setDiagReport(report);
    } catch (err) {
      console.error('Diagnostics failed:', err);
    } finally {
      setIsRunningDiag(false);
    }
  };

  const handleStartListening = () => {
    setVoiceError(null);
    setNoSpeechDetected(false);
    setLiveTranscript('');
    setFinalTranscript('');
    setPermissionNotice(true);
    setVoiceState('listening');

    provider.startListening(
      // onResult — real transcript from browser SpeechRecognition
      (transcript: string) => {
        setPermissionNotice(false);
        const clean = transcript.trim();
        if (clean) {
          setFinalTranscript(clean);
          setLiveTranscript(clean);
          setVoiceState('idle');
          // Do NOT auto-send: place transcript in input so user can review/edit
          onSpeechResult(clean);
        }
      },
      // onError
      (err: VoiceError) => {
        setPermissionNotice(false);
        if (err.code === 'no_speech') {
          // Not a hard error — show retry prompt without error styling
          setNoSpeechDetected(true);
          setVoiceState('idle');
        } else {
          setVoiceState('error');
          setVoiceError(err);
        }
      },
      language,
      // onInterim — partial/live transcript
      (interim: string) => {
        setPermissionNotice(false);
        setLiveTranscript(interim);
      },
      // onAudioLevel — cosmetic visualiser only
      (level: number) => {
        setAudioLevel(level);
      }
    );
  };

  const handleStopListening = () => {
    provider.stopListening();
    setPermissionNotice(false);
    // Preserve any transcript already received; never inject fake text
    const captured = finalTranscript.trim() || liveTranscript.trim();
    if (captured) {
      setFinalTranscript(captured);
      onSpeechResult(captured);
    }
    setVoiceState('idle');
  };

  const handleConfirmAndSend = () => {
    const textToSend = finalTranscript.trim() || liveTranscript.trim();
    if (!textToSend) return;

    if (onSendImmediate) {
      onSendImmediate(textToSend);
    } else {
      onSpeechResult(textToSend);
    }
    
    if (onClose) {
      onClose();
    }
  };

  const handleReset = () => {
    setLiveTranscript('');
    setFinalTranscript('');
    setVoiceError(null);
    setVoiceState('idle');
  };

  const handleSpeakAnswer = useCallback(() => {
    if (!latestAnswerText) return;

    setIsPlayingAudio(true);
    setVoiceState('speaking');

    provider.speak(
      latestAnswerText,
      language,
      () => {
        setIsPlayingAudio(false);
        setVoiceState('idle');
      },
      (err) => {
        console.error('TTS error:', err);
        setIsPlayingAudio(false);
        setVoiceState('idle');
      }
    );
  }, [latestAnswerText, language, provider]);

  const handleStopSpeaking = () => {
    provider.stopSpeaking();
    setIsPlayingAudio(false);
    setVoiceState('idle');
  };

  // Preset question shortcuts for instant speech fallback in any browser
  const presetQuestions = [
    { en: "Tomatoes are very bright red what should I do", mr: "टोमॅटो चमकदार लाल झाले आहेत काय करावे?" },
    { en: "Should I irrigate today?", mr: "आज पिकाला पाणी देऊ का?" },
    { en: "How to manage purple blotch in onion?", mr: "कांद्यावरील करपा कसा नियंत्रित करावा?" },
    { en: "How can I improve soil health?", mr: "जमिनीचे आरोग्य व सुपीकता कशी वाढवावी?" },
  ];

  return (
    <div
      className={`bg-white border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl text-center max-w-lg mx-auto space-y-4 relative ${className}`}
      role="region"
      aria-label={t('voice.title', 'Voice Assistant')}
    >
      {/* Close button — always stops recognition before closing */}
      {onClose && (
        <button
          type="button"
          onClick={() => {
            provider.stopListening();
            provider.stopSpeaking();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
          aria-label={t('common.close', 'Close')}
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header Tag with interactive language toggle */}
      <div className="flex items-center justify-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <button
          type="button"
          onClick={() => {
            toggleLanguage();
            if (voiceState === 'listening') {
              handleStopListening();
            }
          }}
          className="text-xs uppercase tracking-wider font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
          title={isMarathi ? 'इंग्रजीमध्ये बदलण्यासाठी क्लिक करा' : 'Click to switch to Marathi'}
        >
          <span>{isMarathi ? 'व्हॉईस असिस्टंट • मराठी' : 'Voice Assistant • English'}</span>
          <span className="text-[10px] text-emerald-600 font-medium">({isMarathi ? 'English' : 'मराठी'})</span>
        </button>
      </div>

      {/* Demo Mode Badge if explicitly mock */}
      {provider.isDemoMode && (
        <div className="text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 inline-block">
          ⚠️ {isMarathi ? 'डेमो मोड सक्रिय' : 'DEMO MODE ACTIVE'}
        </div>
      )}

      {/* Main Microphone Action Target */}
      <div className="relative inline-block my-2">
        {/* Pulsing visual wave during listening reacting to real audio level */}
        {voiceState === 'listening' && (
          <div 
            className="absolute -inset-4 rounded-full bg-emerald-500/25 animate-ping pointer-events-none transition-transform"
            style={{ transform: `scale(${1 + Math.min(0.5, audioLevel / 100)})` }}
          />
        )}

        <button
          type="button"
          onClick={voiceState === 'listening' ? handleStopListening : handleStartListening}
          disabled={voiceState === 'processing'}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-xl transition-all transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400 ${
            voiceState === 'listening'
              ? 'bg-rose-600 text-white shadow-rose-900/40 ring-4 ring-rose-400 scale-105 animate-pulse'
              : voiceState === 'processing'
              ? 'bg-amber-600 text-white animate-pulse'
              : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-emerald-900/30 hover:scale-105'
          }`}
          aria-label={
            voiceState === 'listening'
              ? (isMarathi ? 'ऐकणे थांबवा' : 'Stop listening')
              : (isMarathi ? 'मायक टॅप करा आणि बोला' : 'Tap microphone and speak')
          }
        >
          {voiceState === 'listening' ? (
            <Square className="w-9 h-9 fill-current" />
          ) : voiceState === 'processing' ? (
            <RefreshCw className="w-9 h-9 animate-spin" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>
      </div>

      {/* Live Microphone Level Indicator — event-driven from SpeechRecognition */}
      {voiceState === 'listening' && (
        <div className="flex items-center justify-center gap-1 py-1">
          <span className="text-[11px] font-bold text-slate-500 mr-1.5">
            {isMarathi ? 'आवाज पातळी:' : 'Mic:'}
          </span>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => {
            // audioLevel is driven from SpeechRecognition events:
            // 30=onaudiostart (mic open), 60=onsoundstart, 90=onspeechstart
            // Bar threshold: bar * 10 so bars 1-3 light at audioLevel≥30 (mic open),
            // bars 1-6 at ≥60 (sound), all 8 at ≥80 (speech detected).
            const isActive = audioLevel > bar * 10;
            // If mic is open (level≥30) give inactive bars a subtle pulse so the
            // user sees the device is live even before speaking.
            const isPulsing = audioLevel >= 30 && !isActive && bar <= 3;
            return (
              <div
                key={bar}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500 h-5'
                    : isPulsing
                    ? 'bg-emerald-300 h-3 animate-pulse'
                    : 'bg-slate-200 h-2'
                }`}
              />
            );
          })}
        </div>
      )}

      {/* Instructional Prompts */}
      <div className="space-y-1">
        <h4 className="text-lg font-bold text-slate-800">
          {voiceState === 'listening'
            ? (isMarathi ? 'आम्ही ऐकत आहोत... बोला!' : 'Listening... Speak now!')
            : voiceState === 'processing'
            ? (isMarathi ? 'प्रक्रिया करत आहे...' : 'Processing...')
            : (isMarathi ? 'मायक टॅप करा आणि प्रश्न विचारा' : 'Tap mic and ask your question')}
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {voiceState === 'listening'
            ? (isMarathi ? 'बोलून झाल्यावर चौकोन बटण दाबा किंवा थांबा' : 'Press square button when finished speaking')
            : (isMarathi ? 'उदा. "टोमॅटो चमकदार लाल झाले आहेत काय करावे?"' : 'e.g. "Tomatoes are very bright red what should I do"')}
        </p>
      </div>

      {/* Permission Notice Banner */}
      {permissionNotice && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-2.5 rounded-xl flex items-center gap-2 text-left animate-fade-in">
          <HelpCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            {isMarathi
              ? 'ब्राउझरने मायक्रोफोन परवानगी विचारल्यास "Allow" (परवानगी द्या) वर क्लिक करा.'
              : 'If your browser asks for microphone permission, please click "Allow".'}
          </span>
        </div>
      )}

      {/* Real-time transcribed text display & review */}
      {(liveTranscript || finalTranscript) && (
        <div className="bg-emerald-50/80 border-2 border-emerald-300 p-4 rounded-2xl text-left space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
            <span>{isMarathi ? 'तुमचा प्रश्न (तपासा):' : 'Transcribed Question (Review):'}</span>
            <span className="text-emerald-700">{liveTranscript ? '✓ नोंदवले' : ''}</span>
          </div>
          <p className="text-sm font-semibold text-slate-900 leading-relaxed min-h-[2rem]">
            "{finalTranscript || liveTranscript}"
          </p>

          {/* Action Confirmation Buttons */}
          <div className="pt-2 flex items-center gap-2 justify-end border-t border-emerald-200">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition"
            >
              {isMarathi ? 'पुन्हा बोला' : 'Re-record'}
            </button>
            <button
              type="button"
              onClick={handleConfirmAndSend}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'हा प्रश्न पाठवा' : 'Send Question'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Farmer Question Presets for 1-Tap Fallback in Any Browser */}
      <div className="pt-2 text-left space-y-2 border-t border-slate-100">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block text-center">
          {isMarathi ? 'किंवा पटकन प्रश्न निवडा:' : 'Or tap a common farmer question:'}
        </span>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {presetQuestions.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const q = isMarathi ? preset.mr : preset.en;
                setLiveTranscript(q);
                setFinalTranscript(q);
                if (onSendImmediate) {
                  onSendImmediate(q);
                } else {
                  onSpeechResult(q);
                }
                if (onClose) {
                  onClose();
                }
              }}
              className="text-xs bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-full transition font-semibold"
            >
              {isMarathi ? preset.mr : preset.en}
            </button>
          ))}
        </div>

        {/* Quick query bar fallback for instant cross-browser usability */}
        <div className="flex items-center gap-1.5 pt-1.5">
          <input
            type="text"
            value={finalTranscript || liveTranscript}
            onChange={(e) => {
              setLiveTranscript(e.target.value);
              setFinalTranscript(e.target.value);
            }}
            placeholder={isMarathi ? 'किंवा येथे प्रश्न टाइप करा / संपादित करा...' : 'Or type / edit question here...'}
            className="flex-1 text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/80 text-slate-800 placeholder:text-slate-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirmAndSend();
              }
            }}
          />
          <button
            type="button"
            onClick={handleConfirmAndSend}
            disabled={!(finalTranscript || liveTranscript).trim()}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95 shrink-0"
            title={isMarathi ? 'प्रश्न पाठवा' : 'Send Question'}
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isMarathi ? 'पाठवा' : 'Send'}</span>
          </button>
        </div>
      </div>

      {/* No-speech notice with retry & diagnostic option */}
      {noSpeechDetected && voiceState === 'idle' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-2.5 rounded-xl flex flex-col gap-2 text-left">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <div className="flex-1">
              <span className="font-bold block">
                {isMarathi ? 'आवाज ऐकू आला नाही.' : 'No speech detected.'}
              </span>
              <span className="text-amber-700 block">
                {isMarathi
                  ? 'मायक्रोफोन जवळ बोला किंवा खाली टाइप करा.'
                  : 'Speak clearly near the mic, or type your question below.'}
              </span>
              <span className="text-[10px] text-amber-700 font-medium block mt-1">
                💡 {isMarathi
                  ? 'टीप: ब्राउझर URL जवळील सेटिंग्ज चिन्हावर क्लिक करा आणि "Microphone Array (Realtek)" मायक्रोफोन निवडलेला आहे का ते तपासा.'
                  : 'Tip: Click the tune/lock icon in the address bar → ensure "Microphone Array (Realtek)" is selected (not a virtual mic).'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleStartListening}
              className="shrink-0 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition active:scale-95"
            >
              <RefreshCw className="w-3 h-3" />
              {isMarathi ? 'पुन्हा' : 'Retry'}
            </button>
          </div>
          <div className="pt-1.5 border-t border-amber-200/70 flex items-center justify-between text-[11px]">
            <button
              type="button"
              id="btn-run-voice-diagnostics"
              onClick={handleRunDiagnostics}
              disabled={isRunningDiag}
              className="text-amber-900 font-bold hover:underline flex items-center gap-1"
            >
              <Activity className="w-3.5 h-3.5 text-amber-700" />
              {isRunningDiag ? 'Running mic test (2.5s)...' : 'Run Microphone & Voice Diagnostics'}
            </button>
          </div>
        </div>
      )}

      {/* Diagnostics Panel */}
      {showDiagPanel && (
        <div id="voice-diagnostics-panel" className="bg-slate-900 text-slate-100 text-[11px] p-3 rounded-xl space-y-2 text-left font-mono border border-slate-700 animate-fade-in max-h-56 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1">
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Hardware & Voice Diagnostics
            </span>
            <button
              type="button"
              onClick={() => setShowDiagPanel(false)}
              className="text-slate-400 hover:text-white text-xs font-sans px-1"
            >
              ✕
            </button>
          </div>
          {isRunningDiag && (
            <div className="text-amber-300 animate-pulse flex items-center gap-1 py-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> Sampling microphone audio and checking speech API...
            </div>
          )}
          {diagReport && !isRunningDiag && (
            <div className="space-y-1.5">
              <div>
                <span className="text-slate-400">Mic Track: </span>
                <span className={diagReport.mic.trackInfo?.enabled ? 'text-emerald-400' : 'text-rose-400'}>
                  {diagReport.mic.trackInfo?.label || 'None'} ({diagReport.mic.trackInfo?.readyState})
                </span>
              </div>
              <div>
                <span className="text-slate-400">Track Muted: </span>
                <span className={diagReport.mic.trackInfo?.muted ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {String(diagReport.mic.trackInfo?.muted)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Audio Level (0-255): </span>
                <span>min={diagReport.mic.audioLevels.minLevel}, max={diagReport.mic.audioLevels.maxLevel}, avg={diagReport.mic.audioLevels.avgLevel}</span>
                <span className={diagReport.mic.audioLevels.hasActiveSignal ? ' text-emerald-400 ml-1 font-bold' : ' text-amber-400 ml-1'}>
                  {diagReport.mic.audioLevels.hasActiveSignal ? '✓ Signal detected' : '⚠ Pure silence (0 signal)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Speech API: </span>
                <span>{diagReport.mic.speechRecognitionApiName || 'Missing'} (lang={diagReport.speech.lang})</span>
              </div>
              <div>
                <span className="text-slate-400">Events: </span>
                <span>{diagReport.speech.eventsFired.map(e => `${e.event}(+${(e.elapsedMs/1000).toFixed(1)}s)`).join(' → ')}</span>
              </div>
              {diagReport.speech.errorCode && (
                <div className="text-rose-400">
                  <span className="text-slate-400">Speech Error: </span>
                  {diagReport.speech.errorCode} ({diagReport.speech.errorMessage || 'no details'})
                </div>
              )}
              {diagReport.speech.finalTranscript && (
                <div className="text-emerald-400 font-sans font-bold">
                  Transcript: "{diagReport.speech.finalTranscript}"
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Accessible Status Live Region */}
      <div
        className="text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5 min-h-[20px]"
        aria-live="polite"
      >
        {voiceState === 'listening' && (
          <span className="flex items-center gap-1 text-rose-700">
            <Radio className="w-4 h-4 animate-pulse text-rose-600" />
            {isMarathi ? 'ऐकत आहे — बोला!' : 'Listening — speak now!'}
          </span>
        )}
        {voiceState === 'processing' && (
          <span className="text-amber-700">{t('voice.status.processing', 'Searching verified KVK advisory...')}</span>
        )}
        {voiceState === 'speaking' && (
          <span className="text-emerald-800 flex items-center gap-1">
            <Volume2 className="w-4 h-4 animate-pulse text-emerald-700" />
            {isMarathi ? 'उत्तर वाचून दाखवत आहे...' : 'Reading answer aloud...'}
          </span>
        )}
      </div>

      {/* Answer Speech Output Controls */}
      {latestAnswerText && (
        <div className="pt-3 border-t border-slate-200 flex items-center justify-center gap-3">
          {!isPlayingAudio ? (
            <button
              type="button"
              onClick={handleSpeakAnswer}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition shadow active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isMarathi ? '🔊 उत्तर ऐका (मराठीत)' : '🔊 Play Answer Aloud'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopSpeaking}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow active:scale-95"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>{isMarathi ? 'आवाज थांबवा' : 'Stop Audio'}</span>
            </button>
          )}
        </div>
      )}

      {/* Voice Error & Retry Banner */}
      {voiceError && (
        <div className="bg-rose-50 border border-rose-300 p-3.5 rounded-2xl text-rose-800 text-xs text-left space-y-2 animate-fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block text-rose-900">
                {t(`voice.errors.${voiceError.code}`, voiceError.message)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStartListening}
            className="w-full py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isMarathi ? 'पुन्हा प्रयत्न करा' : 'Try Again'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
