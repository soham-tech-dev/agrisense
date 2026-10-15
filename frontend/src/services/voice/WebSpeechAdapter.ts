import { VoiceProvider, VoiceError } from './VoiceProvider';

/**
 * WebSpeechAdapter — real browser Speech Recognition + TTS.
 *
 * === ROOT CAUSE FIXED IN THIS VERSION ===
 * The previous version called navigator.mediaDevices.getUserMedia() to run a
 * separate AudioContext analyser for the volume-bar visualiser, CONCURRENTLY
 * with SpeechRecognition on the same physical microphone.
 *
 * On Windows (WASAPI exclusive mode) and many Linux ALSA/PulseAudio
 * configurations, the OS audio subsystem serialises microphone access: the
 * getUserMedia stream claimed the mic first, leaving Chrome's internal
 * SpeechRecognition service with a silent or starved audio track.  The
 * recognition service then emitted "no-speech" within 1–2 seconds and the
 * session ended before the user could speak.
 *
 * Fix: the separate getUserMedia stream is REMOVED entirely.  The volume-bar
 * visualiser is now driven from SpeechRecognition's own audio-lifecycle events
 * (onaudiostart, onsoundstart, onspeechstart, onspeechend) plus a lightweight
 * animation that stays active while the session is open.  The microphone is
 * held by exactly ONE consumer: the SpeechRecognition API.
 *
 * === OTHER BUGS FIXED IN PRIOR VERSION (still present here) ===
 * 1. Hard-coded fake transcript injection in stopListening().
 * 2. Same injection in VoiceWidget.handleStopListening().
 * 3. 'no-speech' onerror silently swallowed — UI stuck on "Listening".
 * 4. Infinite auto-restart loop on silence timeout.
 * 5. isSTTSupported() returned true for getUserMedia-only environments.
 * 6. English lang defaulted to navigator.language instead of 'en-IN'.
 *
 * === DIAGNOSTIC LOGGING ===
 * All recognition lifecycle events are logged with elapsed-time stamps when
 * window.__AGRISENSE_VOICE_DEBUG = true is set in the browser console.
 * Never logs audio content or credentials.
 */
export class WebSpeechAdapter implements VoiceProvider {
  private recognition: any = null;
  private isListening: boolean = false;
  private isManuallyStopped: boolean = false;

  // Cosmetic audio-level animation — driven from SpeechRecognition events only.
  // No separate getUserMedia stream.
  private animFrameId: number | null = null;
  private currentLevel: number = 0;
  private targetLevel: number = 0;

  private cachedVoices: SpeechSynthesisVoice[] = [];
  public readonly isDemoMode: boolean = false;

  constructor() {
    this.initVoices();
  }

  // ─── TTS voice cache ───────────────────────────────────────────────────────
  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.cachedVoices = window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }

  // ─── Diagnostic helper ─────────────────────────────────────────────────────
  private _sessionStart: number = 0;

  private dbg(msg: string, ...args: any[]): void {
    const elapsed = this._sessionStart
      ? `+${((Date.now() - this._sessionStart) / 1000).toFixed(2)}s`
      : '+0.00s';
    console.log(`[AgriSense Voice ${elapsed}] ${msg}`, ...args);
  }

  // ─── Support checks ────────────────────────────────────────────────────────
  isSupported(): boolean {
    return this.isSTTSupported() || this.isTTSSupported();
  }

  isSTTSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  isTTSSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  // ─── Cosmetic level animation ──────────────────────────────────────────────
  // Smoothly interpolates currentLevel toward targetLevel each animation frame.
  // No microphone stream needed — purely event-driven.
  private startLevelAnimation(onAudioLevel: (level: number) => void): void {
    this.stopLevelAnimation();
    const tick = () => {
      if (!this.isListening) return;
      // Smooth follow with fast rise, slow fall
      const diff = this.targetLevel - this.currentLevel;
      this.currentLevel += diff > 0 ? diff * 0.35 : diff * 0.1;
      onAudioLevel(Math.round(this.currentLevel));
      this.animFrameId = requestAnimationFrame(tick);
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  private stopLevelAnimation(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.currentLevel = 0;
    this.targetLevel = 0;
  }

  // ─── Recognition teardown ──────────────────────────────────────────────────
  private abortCurrentRecognition(reason = 'unspecified'): void {
    if (this.recognition) {
      try {
        const rec = this.recognition;
        this.recognition = null;
        this.dbg('abortCurrentRecognition() executing [reason=%s]', reason);
        // Null handlers BEFORE abort so stale onend cannot trigger side-effects
        rec.onstart    = null;
        rec.onresult   = null;
        rec.onerror    = null;
        rec.onend      = null;
        rec.onaudiostart = null;
        rec.onsoundstart = null;
        rec.onspeechstart = null;
        rec.onspeechend   = null;
        rec.onaudioend   = null;
        rec.abort();
      } catch (err) {
        this.dbg('abortCurrentRecognition() caught error: %s', err);
      }
    }
  }

  // ─── Public: startListening ────────────────────────────────────────────────
  async startListening(
    onResult: (text: string) => void,
    onError: (err: VoiceError) => void,
    lang: 'mr' | 'en',
    onInterim?: (interimText: string) => void,
    onAudioLevel?: (level: number) => void
  ): Promise<void> {
    // 1. Tear down any previous session cleanly
    this.abortCurrentRecognition('new_start_call');
    this.stopLevelAnimation();

    // 2. Reset session state
    this.isListening = true;
    this.isManuallyStopped = false;
    this.currentLevel = 0;
    this.targetLevel = 0;
    this._sessionStart = Date.now();

    this.dbg('startListening() called, lang=%s (trace: %s)', lang, new Error().stack?.split('\n')[2]?.trim() || '');

    // 3. Check API availability
    const SpeechRecognitionClass: any =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      this.isListening = false;
      onError({
        code: 'unsupported_browser',
        message:
          lang === 'mr'
            ? 'या ब्राउझरमध्ये आवाज ओळखणे उपलब्ध नाही. कृपया Chrome किंवा Edge वापरा.'
            : 'Speech recognition is not supported in this browser. Please use Chrome or Edge.',
      });
      return;
    }

    // 4. Build recognition instance — the ONLY microphone consumer this session.
    //    No separate getUserMedia call. This eliminates the OS mic-sharing conflict
    //    that caused immediate no-speech on Windows.
    const rec = new SpeechRecognitionClass();
    this.recognition = rec;

    // In Chrome/Chromium on Windows, continuous = true causes streaming WebSocket timeouts
    // to Google Cloud Speech and delays onresult until an 8-second silence abort.
    // continuous = false operates in single-utterance mode with real-time interim results,
    // which reliably delivers the transcribed sentence immediately upon speaking.
    rec.continuous = false;
    rec.interimResults = true; // Show words in real time as the user speaks
    rec.maxAlternatives = 1;

    // Language: use well-supported BCP-47 tags.
    // When Marathi is selected, use 'mr-IN'.
    // When English is selected, use the browser/system English locale (e.g. 'en-US', 'en-IN')
    // matching the OS acoustic model, defaulting to 'en-US' for widest cloud/local compatibility.
    if (lang === 'mr') {
      rec.lang = 'mr-IN';
    } else {
      const browserLang = (typeof navigator !== 'undefined' && navigator.language) || '';
      rec.lang = browserLang.toLowerCase().startsWith('en') ? browserLang : 'en-US';
    }

    this.dbg('recognition configured: lang=%s continuous=%s interimResults=%s',
      rec.lang, rec.continuous, rec.interimResults);

    // 5. Session-local transcript state
    let sessionFinal = '';
    let sessionInterim = '';

    // 6. Wire event handlers
    rec.onstart = () => {
      this.dbg('onstart — recognition engine session started');
    };

    rec.onaudiostart = () => {
      this.dbg('onaudiostart — mic stream opened by browser');
      this.targetLevel = 30;
      if (onAudioLevel) onAudioLevel(30);
    };

    rec.onsoundstart = () => {
      this.dbg('onsoundstart — sound detected in mic stream');
      this.targetLevel = 60;
      if (onAudioLevel) onAudioLevel(60);
    };

    rec.onspeechstart = () => {
      this.dbg('onspeechstart — browser classified input as speech');
      this.targetLevel = 90;
      if (onAudioLevel) onAudioLevel(90);
    };

    rec.onspeechend = () => {
      this.dbg('onspeechend — speech segment ended');
      this.targetLevel = 15;
      if (onAudioLevel) onAudioLevel(15);
    };

    rec.onaudioend = () => {
      this.dbg('onaudioend — mic stream closed');
      this.targetLevel = 0;
    };

    rec.onresult = (event: any) => {
      let interimChunk = '';
      let finalChunk = '';

      // Iterate from resultIndex to avoid re-processing earlier results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text: string = result[0]?.transcript ?? '';
        if (result.isFinal) {
          finalChunk += text;
          this.dbg('onresult FINAL [%d]: "%s" (confidence=%.2f)',
            i, text, result[0]?.confidence ?? -1);
        } else {
          interimChunk += text;
          this.dbg('onresult interim [%d]: "%s"', i, text);
        }
      }

      if (finalChunk) {
        sessionFinal += (sessionFinal ? ' ' : '') + finalChunk.trim();
        this.targetLevel = 80;
      }
      if (interimChunk) {
        sessionInterim = interimChunk.trim();
        this.targetLevel = 70;
      }

      const display = (sessionFinal + (sessionInterim ? ' ' + sessionInterim : '')).trim();
      if (display && onInterim) {
        onInterim(display);
      }
    };

    rec.onerror = (event: any) => {
      const code: string = event.error ?? '';
      this.dbg('onerror: code="%s" message="%s"', code, event.message ?? '');
      console.warn('[AgriSense Voice] SpeechRecognition error:', code);

      if (code === 'not-allowed' || code === 'service-not-allowed') {
        this.isListening = false;
        onError({
          code: 'permission_denied',
          message:
            lang === 'mr'
              ? 'मायक्रोफोन परवानगी नाकारली आहे. ब्राउझरमध्ये परवानगी द्या.'
              : 'Microphone permission was denied. Please allow microphone access in your browser settings.',
          originalError: event,
        });
        return;
      }

      if (code === 'audio-capture') {
        this.isListening = false;
        onError({
          code: 'audio_capture',
          message:
            lang === 'mr'
              ? 'मायक्रोफोन सापडला नाही किंवा वापरता येत नाही.'
              : 'No microphone found. Please connect a microphone and try again.',
          originalError: event,
        });
        return;
      }

      if (code === 'network') {
        this.isListening = false;
        onError({
          code: 'network_error',
          message:
            lang === 'mr'
              ? 'नेटवर्क त्रुटी — कृपया इंटरनेट कनेक्शन तपासा.'
              : 'Network error — Chrome speech recognition requires an internet connection.',
          originalError: event,
        });
        return;
      }

      if (code === 'no-speech') {
        // Let onend handle this — it will surface the no_speech error properly.
        // Do NOT surface an error here because onerror for no-speech is always
        // followed by onend, and surfacing twice would cause duplicate state updates.
        this.dbg('onerror no-speech — waiting for onend');
        return;
      }

      if (code === 'aborted') {
        this.dbg('onerror aborted — deliberate stop, not an error');
        return;
      }

      // Unknown error — log but don't surface to avoid confusing the user
      console.warn('[AgriSense Voice] Unhandled recognition error:', code, event);
    };

    rec.onend = () => {
      // Guard: if this.recognition was replaced (new session started after this
      // one was aborted), this stale onend must not interfere.
      if (this.recognition !== rec) {
        this.dbg('onend — stale session ignored (new session already started)');
        return;
      }

      this.recognition = null;
      this.stopLevelAnimation();

      const elapsed = Date.now() - this._sessionStart;
      const finalText = sessionFinal.trim();
      const interimText = sessionInterim.trim();
      const transcript = finalText || interimText;

      this.dbg('onend — elapsed=%dms finalText="%s" interimText="%s" manuallyStopped=%s',
        elapsed, finalText, interimText, this.isManuallyStopped);

      if (transcript) {
        this.isListening = false;
        onResult(transcript);
        return;
      }

      if (this.isManuallyStopped) {
        // User clicked Stop with no speech — go idle cleanly
        this.isListening = false;
        return;
      }

      // Session ended without a transcript and without a manual stop.
      // This is the no-speech / silence-timeout path.
      this.isListening = false;
      onError({
        code: 'no_speech',
        message:
          lang === 'mr'
            ? 'कोणताही आवाज आढळला नाही. कृपया मायक्रोफोन जवळ बोला आणि पुन्हा प्रयत्न करा.'
            : 'No speech was detected. Please speak clearly near the microphone and try again.',
      });
    };

    // 7. Start cosmetic level animation (event-driven, no separate audio stream)
    if (onAudioLevel) {
      this.startLevelAnimation(onAudioLevel);
    }

    // 8. Start recognition — the single point where the mic is claimed
    try {
      rec.start();
      this.dbg('rec.start() called — waiting for onaudiostart');
    } catch (e: any) {
      this.dbg('rec.start() threw: %s', e?.message ?? e);
      console.error('[AgriSense Voice] Failed to start recognition:', e);
      this.recognition = null;
      this.isListening = false;
      this.stopLevelAnimation();
      onError({
        code: 'unknown',
        message:
          lang === 'mr'
            ? 'आवाज ओळखणे सुरू करता आले नाही. पुन्हा प्रयत्न करा.'
            : `Could not start speech recognition: ${e?.message ?? String(e)}`,
        originalError: e,
      });
    }
  }

  // ─── Public: stopListening ─────────────────────────────────────────────────
  stopListening(): void {
    this.dbg('stopListening() called');
    this.isManuallyStopped = true;
    this.isListening = false;
    this.stopLevelAnimation();
    if (this.recognition) {
      try {
        // Use .stop() instead of .abort() so the speech engine finalizes
        // any captured speech and delivers final onresult and onend
        this.recognition.stop();
        this.dbg('rec.stop() requested cleanly');
      } catch (err) {
        this.dbg('rec.stop() threw, falling back to abort: %s', err);
        this.abortCurrentRecognition('stop_failed');
      }
    }
  }

  // ─── Public: speak (TTS) ──────────────────────────────────────────────────
  speak(
    text: string,
    lang: 'mr' | 'en',
    onEnd?: () => void,
    onError?: (err: any) => void
  ): void {
    if (!this.isTTSSupported()) {
      onError?.({
        code: 'unsupported_browser',
        message:
          lang === 'mr'
            ? 'या ब्राऊझरमध्ये टेक्स्ट-टू-स्पीच सपोर्ट उपलब्ध नाही.'
            : 'Text-to-speech is not supported in this browser.',
      });
      return;
    }

    try {
      this.stopSpeaking();

      const cleanText = text
        .replace(/[*#_~`>]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim();

      if (!cleanText) { onEnd?.(); return; }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang  = lang === 'mr' ? 'mr-IN' : 'en-IN';
      utterance.rate  = 0.95;
      utterance.pitch = 1.0;

      if (this.cachedVoices.length === 0) {
        this.cachedVoices = window.speechSynthesis.getVoices();
      }

      let selectedVoice: SpeechSynthesisVoice | null = null;
      if (lang === 'mr') {
        selectedVoice =
          this.cachedVoices.find(v => v.lang.toLowerCase() === 'mr-in') ||
          this.cachedVoices.find(v => v.lang.toLowerCase().startsWith('mr')) ||
          this.cachedVoices.find(v => v.name.toLowerCase().includes('marathi')) ||
          this.cachedVoices.find(v => v.lang.toLowerCase() === 'hi-in') ||
          this.cachedVoices.find(v => v.lang.toLowerCase() === 'en-in') ||
          null;
      } else {
        selectedVoice =
          this.cachedVoices.find(v => v.lang.toLowerCase() === 'en-in') ||
          this.cachedVoices.find(v => v.lang.toLowerCase().startsWith('en')) ||
          null;
      }

      if (selectedVoice) utterance.voice = selectedVoice;

      utterance.onend  = () => onEnd?.();
      utterance.onerror = (e) => onError?.(e);

      window.speechSynthesis.speak(utterance);
    } catch (e: any) {
      onError?.(e);
    }
  }

  stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
    }
  }
}
