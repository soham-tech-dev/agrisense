export type VoiceErrorCode =
  | 'permission_denied'
  | 'unsupported_browser'
  | 'network_error'
  | 'no_speech'
  | 'audio_capture'
  | 'not_allowed'
  | 'unknown';

export interface VoiceError {
  code: VoiceErrorCode;
  message: string;
  originalError?: any;
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'paused' | 'error';

export interface VoiceProvider {
  /**
   * Starts speech-to-text recognition.
   * @param onResult Callback fired when final speech is transcribed.
   * @param onError Callback fired when an error occurs.
   * @param lang Language code ('mr' for Marathi, 'en' for English).
   * @param onInterim Optional callback for real-time interim speech transcription.
   */
  startListening(
    onResult: (text: string) => void,
    onError: (err: VoiceError) => void,
    lang: 'mr' | 'en',
    onInterim?: (interimText: string) => void,
    onAudioLevel?: (level: number) => void
  ): void | Promise<void>;

  /**
   * Stops active speech recognition manually.
   */
  stopListening(): void;

  /**
   * Speaks out the given text using Text-To-Speech (TTS).
   * @param text Text string to synthesize.
   * @param lang Language code ('mr' for Marathi, 'en' for English).
   * @param onEnd Callback fired when speech completes.
   * @param onError Callback fired if speech synthesis fails.
   */
  speak(
    text: string,
    lang: 'mr' | 'en',
    onEnd?: () => void,
    onError?: (err: any) => void
  ): void;

  /**
   * Stops active speech synthesis immediately.
   */
  stopSpeaking(): void;

  /**
   * Optional pause controls for TTS playback.
   */
  pauseSpeaking?(): void;
  resumeSpeaking?(): void;

  /**
   * Checks if this voice adapter/browser environment supports speech recognition.
   */
  isSupported(): boolean;
  isSTTSupported(): boolean;
  isTTSSupported(): boolean;

  /**
   * Whether this is a development mock adapter
   */
  readonly isDemoMode?: boolean;
}
