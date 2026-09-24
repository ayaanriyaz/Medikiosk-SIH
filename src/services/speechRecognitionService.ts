/**
 * Speech Recognition Service with hospital noise handling, Web Speech API abstraction,
 * permission management, and text fallback.
 */

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onResult?: (result: SpeechRecognitionResult) => void;
  onError?: (errorMessage: string, isPermissionError: boolean) => void;
  onEnd?: () => void;
  onAudioLevel?: (level: number) => void; // 0 to 1 for visual mic wave
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private currentLanguageBcp47 = 'en-IN';
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private callbacks: SpeechRecognitionCallbacks = {};

  constructor() {
    this.initRecognition();
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && !!(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.callbacks.onStart?.();
        this.startAudioMeter();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        let confidence = 0.85;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript;
            if (res[0].confidence) confidence = res[0].confidence;
          } else {
            interimTranscript += res[0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (text) {
          this.callbacks.onResult?.({
            transcript: text,
            isFinal: !!finalTranscript,
            confidence,
          });
        }
      };

      this.recognition.onerror = (event: any) => {
        const error = event.error || 'speech_recognition_error';
        let userMessage = 'Could not clearly capture speech. Please try again or type.';
        let isPermission = false;

        if (error === 'not-allowed' || error === 'service-not-allowed') {
          userMessage = 'Microphone access is unavailable or denied. You can type your response instead.';
          isPermission = true;
        } else if (error === 'no-speech') {
          userMessage = "I didn't hear any speech. Please tap the microphone and speak again, or type your answer.";
        } else if (error === 'audio-capture') {
          userMessage = 'No microphone was found on this device. You can type your response.';
        } else if (error === 'network') {
          userMessage = 'Network connection issue for speech recognition. You can type your response.';
        }

        this.stopAudioMeter();
        this.isListening = false;
        this.callbacks.onError?.(userMessage, isPermission);
      };

      this.recognition.onend = () => {
        this.stopAudioMeter();
        this.isListening = false;
        this.callbacks.onEnd?.();
      };
    } catch (e) {
      console.warn('SpeechRecognition initialization error:', e);
    }
  }

  /**
   * Start listening with given BCP-47 language tag and callbacks
   */
  public async startListening(bcp47: string, callbacks: SpeechRecognitionCallbacks): Promise<boolean> {
    this.callbacks = callbacks;
    this.currentLanguageBcp47 = bcp47;

    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      this.callbacks.onError?.('Speech recognition is not supported in this browser. Please type your response.', false);
      return false;
    }

    try {
      this.recognition.lang = bcp47;
      this.recognition.start();
      return true;
    } catch (err: any) {
      // If already started, restart
      if (err.name === 'InvalidStateError') {
        try {
          this.recognition.stop();
          setTimeout(() => {
            try {
              this.recognition.lang = bcp47;
              this.recognition.start();
            } catch (e) {
              this.callbacks.onError?.('Could not activate microphone. Please type your response.', false);
            }
          }, 200);
          return true;
        } catch (e) {}
      }
      this.callbacks.onError?.('Microphone activation failed. You can type your response instead.', false);
      return false;
    }
  }

  /**
   * Stop active speech recognition
   */
  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.stopAudioMeter();
    this.isListening = false;
  }

  /**
   * Hospital Noise Handling: Web Audio API level monitoring and high-pass acoustic filtering
   */
  private async startAudioMeter() {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.mediaStream = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);

      // Acoustic noise high-pass filter: reduce low-frequency hospital rumble / AC noise (<85 Hz)
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(85, this.audioContext.currentTime);

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(filter);
      filter.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!this.analyser || !this.isListening) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(1, Math.max(0, average / 128));

        this.callbacks.onAudioLevel?.(normalized);
        this.animationFrameId = requestAnimationFrame(checkVolume);
      };

      this.animationFrameId = requestAnimationFrame(checkVolume);
    } catch (e) {
      // Audio meter is optional enhancement, failure is benign
    }
  }

  private stopAudioMeter() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
    this.analyser = null;
    this.callbacks.onAudioLevel?.(0);
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
