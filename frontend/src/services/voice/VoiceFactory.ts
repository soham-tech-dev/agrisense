import { VoiceProvider } from './VoiceProvider';
import { WebSpeechAdapter } from './WebSpeechAdapter';
import { MockVoiceAdapter } from './MockVoiceAdapter';

class VoiceFactory {
  private activeProvider: VoiceProvider | null = null;

  public getProvider(): VoiceProvider {
    if (this.activeProvider) {
      return this.activeProvider;
    }

    const configuredProvider = (import.meta.env.VITE_VOICE_PROVIDER || 'webspeech').toLowerCase();

    if (configuredProvider === 'mock') {
      this.activeProvider = new MockVoiceAdapter();
    } else {
      // Default to genuine WebSpeechAdapter
      this.activeProvider = new WebSpeechAdapter();
    }

    return this.activeProvider;
  }
}

export const voiceFactory = new VoiceFactory();
