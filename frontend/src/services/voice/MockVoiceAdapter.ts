import { VoiceProvider, VoiceError } from './VoiceProvider';

/**
 * Development & Simulation Mock Adapter.
 * Clearly marked as DEMO MODE - never used in production or pretended to be real speech recognition.
 */
export class MockVoiceAdapter implements VoiceProvider {
  private listeningTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private speakingTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private isListening: boolean = false;
  public readonly isDemoMode: boolean = true;

  isSupported(): boolean {
    return false; // Mock is not real browser voice recognition
  }

  isSTTSupported(): boolean {
    return false;
  }

  isTTSSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  startListening(
    onResult: (text: string) => void,
    _onError: (err: VoiceError) => void,
    lang: 'mr' | 'en',
    onInterim?: (interimText: string) => void
  ): void {
    this.stopListening();
    this.isListening = true;

    if (onInterim) {
      onInterim(lang === 'mr' ? '[डेमो व्हॉईस मोड - आवाज ऐकत आहे...]' : '[Demo Voice Mode - Listening...]');
    }

    // Simulate realistic STT transcription after 2.5 seconds with clear demo label
    this.listeningTimeoutId = setTimeout(() => {
      if (!this.isListening) return;
      this.isListening = false;

      const mockText =
        lang === 'mr'
          ? 'माझ्या कांद्याच्या पिकावर करपा रोग झाला आहे, काय उपाय करावा?'
          : 'My onion crop has purple blotch spots, what should I do?';

      onResult(mockText);
    }, 2200);
  }

  stopListening(): void {
    this.isListening = false;
    if (this.listeningTimeoutId) {
      clearTimeout(this.listeningTimeoutId);
      this.listeningTimeoutId = null;
    }
  }

  speak(
    text: string,
    lang: 'mr' | 'en',
    onEnd?: () => void,
    onError?: (err: any) => void
  ): void {
    this.stopSpeaking();

    // If browser supports actual speechSynthesis, use it even in demo mode
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const clean = text.replace(/[*#_~`>]/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = lang === 'mr' ? 'mr-IN' : 'en-IN';
        utterance.onend = () => onEnd?.();
        utterance.onerror = (e) => onError?.(e);
        window.speechSynthesis.speak(utterance);
        return;
      } catch (e) {
        // Fallback to timer
      }
    }

    // Fallback timer simulation
    const words = text.split(/\s+/).filter(Boolean).length;
    const duration = Math.min(Math.max(words * 180, 2000), 7000);

    this.speakingTimeoutId = setTimeout(() => {
      if (onEnd) onEnd();
    }, duration);
  }

  stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // Ignore
      }
    }
    if (this.speakingTimeoutId) {
      clearTimeout(this.speakingTimeoutId);
      this.speakingTimeoutId = null;
    }
  }
}
