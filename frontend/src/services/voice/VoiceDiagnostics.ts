/**
 * VoiceDiagnostics.ts
 * Standalone, non-intrusive diagnostic tool to investigate microphone input and Web Speech API behavior.
 */

export interface MicDiagnosticResult {
  hasGetUserMedia: boolean;
  hasSpeechRecognition: boolean;
  speechRecognitionApiName: string | null;
  trackInfo: {
    label: string;
    enabled: boolean;
    muted: boolean;
    readyState: string;
    sampleRate?: number;
    channelCount?: number;
    deviceId?: string;
  } | null;
  audioLevels: {
    samplesCount: number;
    minLevel: number;
    maxLevel: number;
    avgLevel: number;
    hasActiveSignal: boolean; // maxLevel > 2
  };
  streamError: string | null;
}

export interface SpeechDiagnosticResult {
  lang: string;
  eventsFired: Array<{ event: string; elapsedMs: number; details?: any }>;
  finalTranscript: string;
  interimTranscripts: string[];
  errorCode: string | null;
  errorMessage: string | null;
  success: boolean;
}

export interface FullDiagnosticReport {
  timestamp: string;
  userAgent: string;
  isSecureContext: boolean;
  protocol: string;
  mic: MicDiagnosticResult;
  speech: SpeechDiagnosticResult;
}

/**
 * Test microphone capture independently via getUserMedia.
 * Samples audio levels for durationMs, then completely cleans up tracks and AudioContext.
 */
export async function testMicrophoneCapture(durationMs = 2500): Promise<MicDiagnosticResult> {
  const result: MicDiagnosticResult = {
    hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    hasSpeechRecognition: !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
    speechRecognitionApiName: (window as any).SpeechRecognition ? 'SpeechRecognition' : (window as any).webkitSpeechRecognition ? 'webkitSpeechRecognition' : null,
    trackInfo: null,
    audioLevels: {
      samplesCount: 0,
      minLevel: 100,
      maxLevel: 0,
      avgLevel: 0,
      hasActiveSignal: false,
    },
    streamError: null,
  };

  if (!result.hasGetUserMedia) {
    result.streamError = 'navigator.mediaDevices.getUserMedia is not available';
    return result;
  }

  let stream: MediaStream | null = null;
  let audioCtx: AudioContext | null = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioTrack = stream.getAudioTracks()[0];

    if (!audioTrack) {
      result.streamError = 'getUserMedia returned stream with 0 audio tracks';
      return result;
    }

    const settings = audioTrack.getSettings ? audioTrack.getSettings() : {};
    result.trackInfo = {
      label: audioTrack.label || 'Default Microphone',
      enabled: audioTrack.enabled,
      muted: audioTrack.muted,
      readyState: audioTrack.readyState,
      sampleRate: settings.sampleRate,
      channelCount: settings.channelCount,
      deviceId: settings.deviceId,
    };

    // Setup AudioContext and AnalyserNode to measure actual incoming audio amplitude
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const samples: number[] = [];

      const intervalMs = 100;
      const totalSamples = Math.floor(durationMs / intervalMs);

      for (let i = 0; i < totalSamples; i++) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
        analyser.getByteFrequencyData(dataArray);

        // Calculate average volume for this frame
        let sum = 0;
        for (let j = 0; j < bufferLength; j++) {
          sum += dataArray[j];
        }
        const frameAvg = sum / bufferLength;
        samples.push(frameAvg);
      }

      const min = samples.length ? Math.min(...samples) : 0;
      const max = samples.length ? Math.max(...samples) : 0;
      const avg = samples.length ? samples.reduce((a, b) => a + b, 0) / samples.length : 0;

      result.audioLevels = {
        samplesCount: samples.length,
        minLevel: Math.round(min * 10) / 10,
        maxLevel: Math.round(max * 10) / 10,
        avgLevel: Math.round(avg * 10) / 10,
        hasActiveSignal: max > 2, // Anything above 2 out of 255 indicates signal presence
      };
    }
  } catch (err: any) {
    result.streamError = err?.message || String(err);
  } finally {
    // ALWAYS clean up all media resources
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch { /* ignore */ }
      });
    }
    if (audioCtx) {
      try {
        await audioCtx.close();
      } catch { /* ignore */ }
    }
  }

  return result;
}

/**
 * Test SpeechRecognition lifecycle events independently.
 */
export async function testSpeechRecognitionLifecycle(
  lang: 'en' | 'mr' = 'en',
  timeoutMs = 6000
): Promise<SpeechDiagnosticResult> {
  const result: SpeechDiagnosticResult = {
    lang: lang === 'mr' ? 'mr-IN' : (navigator.language?.toLowerCase().startsWith('en') ? navigator.language : 'en-US'),
    eventsFired: [],
    finalTranscript: '',
    interimTranscripts: [],
    errorCode: null,
    errorMessage: null,
    success: false,
  };

  const SpeechRecognitionClass: any =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    result.errorCode = 'no_api';
    result.errorMessage = 'SpeechRecognition API is not available in window';
    return result;
  }

  return new Promise((resolve) => {
    let rec: any = null;
    let timer: any = null;
    const startTime = performance.now();

    const recordEvent = (eventName: string, details?: any) => {
      const elapsed = Math.round(performance.now() - startTime);
      result.eventsFired.push({ event: eventName, elapsedMs: elapsed, details });
      console.log(`[Diagnostic-Speech +${(elapsed / 1000).toFixed(2)}s] ${eventName}`, details || '');
    };

    try {
      rec = new SpeechRecognitionClass();
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = result.lang;

      rec.onstart = () => recordEvent('onstart');
      rec.onaudiostart = () => recordEvent('onaudiostart');
      rec.onsoundstart = () => recordEvent('onsoundstart');
      rec.onspeechstart = () => recordEvent('onspeechstart');
      rec.onspeechend = () => recordEvent('onspeechend');
      rec.onaudioend = () => recordEvent('onaudioend');

      rec.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          if (res.isFinal) {
            result.finalTranscript += (result.finalTranscript ? ' ' : '') + text;
            recordEvent('onresult-final', { text, confidence: res[0]?.confidence });
          } else {
            result.interimTranscripts.push(text);
            recordEvent('onresult-interim', { text });
          }
        }
      };

      rec.onerror = (event: any) => {
        result.errorCode = event.error || 'unknown_error';
        result.errorMessage = event.message || '';
        recordEvent('onerror', { error: result.errorCode, message: result.errorMessage });
      };

      rec.onend = () => {
        recordEvent('onend');
        if (timer) clearTimeout(timer);
        result.success = !!result.finalTranscript || result.interimTranscripts.length > 0;
        resolve(result);
      };

      timer = setTimeout(() => {
        recordEvent('timeout_abort');
        try {
          rec.abort();
        } catch { /* ignore */ }
        resolve(result);
      }, timeoutMs);

      recordEvent('calling_rec.start');
      rec.start();
    } catch (err: any) {
      result.errorCode = 'start_exception';
      result.errorMessage = err?.message || String(err);
      recordEvent('start_exception', { error: result.errorMessage });
      if (timer) clearTimeout(timer);
      resolve(result);
    }
  });
}

/**
 * Execute full diagnostic suite.
 */
export async function runFullVoiceDiagnostics(lang: 'en' | 'mr' = 'en'): Promise<FullDiagnosticReport> {
  console.log('[AgriSense Diagnostics] Starting Full Diagnostic Suite...');

  // Step 1: Microphone capture test
  console.log('[AgriSense Diagnostics] Step 1: Testing MediaDevices getUserMedia...');
  const micResult = await testMicrophoneCapture(2500);
  console.log('[AgriSense Diagnostics] Mic Test Result:', micResult);

  // Short pause to ensure OS audio device release
  await new Promise((r) => setTimeout(r, 400));

  // Step 2: SpeechRecognition lifecycle test
  console.log('[AgriSense Diagnostics] Step 2: Testing SpeechRecognition Lifecycle (lang=' + lang + ')...');
  const speechResult = await testSpeechRecognitionLifecycle(lang, 6000);
  console.log('[AgriSense Diagnostics] Speech Test Result:', speechResult);

  const report: FullDiagnosticReport = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    isSecureContext: window.isSecureContext,
    protocol: window.location.protocol,
    mic: micResult,
    speech: speechResult,
  };

  (window as any).__AGRISENSE_LATEST_DIAGNOSTIC = report;
  console.log('[AgriSense Diagnostics] Diagnostic Suite Complete. Full report saved in window.__AGRISENSE_LATEST_DIAGNOSTIC');
  return report;
}

// Automatically expose on window for easy browser test execution
if (typeof window !== 'undefined') {
  (window as any).runAgriSenseVoiceDiagnostics = runFullVoiceDiagnostics;
  (window as any).testMicrophoneCapture = testMicrophoneCapture;
  (window as any).testSpeechRecognitionLifecycle = testSpeechRecognitionLifecycle;
}
