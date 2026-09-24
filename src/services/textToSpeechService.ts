/**
 * Text-to-Speech Service with Multi-Provider Architecture:
 * - Provider A: Gemini TTS (gemini-3.8-flash-lite-tts via /api/anna/tts)
 * - Provider B: Browser SpeechSynthesis (native speech synthesis fallback)
 * - Controls: Play, Pause, Resume, Stop, Mute, Blocked Autoplay detection, Audio Level.
 */

import { AudioPlayer } from '../audio/AudioPlayer';

export interface TTSState {
  isSpeaking: boolean;
  isPaused: boolean;
  isMuted: boolean;
  activeMessageId: string | null;
  autoplayBlocked: boolean;
  currentLang: string;
  provider: 'gemini' | 'browser' | 'none';
}

export interface TTSCallbacks {
  onStart?: (msgId: string) => void;
  onEnd?: (msgId: string) => void;
  onError?: (error: string) => void;
  onAutoplayBlocked?: () => void;
  onStateChange?: (state: TTSState) => void;
}

export class TextToSpeechService {
  private isMuted: boolean = false;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private activeMessageId: string | null = null;
  private autoplayBlocked: boolean = false;
  private currentProvider: 'gemini' | 'browser' | 'none' = 'none';
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioPlayer: AudioPlayer | null = null;
  private callbacks: TTSCallbacks = {};
  private voices: SpeechSynthesisVoice[] = [];
  private currentLang: string = 'en-IN';
  private fallbackToBrowserUntil: number = 0;

  constructor() {
    this.initVoices();
    this.initAudioPlayer();
  }

  private initAudioPlayer() {
    if (typeof window !== 'undefined') {
      try {
        this.audioPlayer = new AudioPlayer();
        this.audioPlayer.onPlaybackStateChange = (isPlaying) => {
          if (!isPlaying && this.currentProvider === 'gemini') {
            this.isSpeaking = false;
            this.isPaused = false;
            const finishedId = this.activeMessageId;
            this.activeMessageId = null;
            if (finishedId) {
              this.callbacks.onEnd?.(finishedId);
            }
            this.notifyState();
          }
        };
      } catch (e) {
        console.warn('[TTS] AudioPlayer initialization warning:', e);
      }
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const load = () => {
      try {
        this.voices = window.speechSynthesis.getVoices();
      } catch (e) {
        this.voices = [];
      }
    };

    load();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = load;
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && ('speechSynthesis' in window || !!this.audioPlayer);
  }

  public setCallbacks(callbacks: TTSCallbacks) {
    this.callbacks = callbacks;
  }

  public getState(): TTSState {
    return {
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
      isMuted: this.isMuted,
      activeMessageId: this.activeMessageId,
      autoplayBlocked: this.autoplayBlocked,
      currentLang: this.currentLang,
      provider: this.currentProvider,
    };
  }

  public getAudioLevel(): number {
    if (this.currentProvider === 'gemini' && this.audioPlayer) {
      return this.audioPlayer.getAudioLevel();
    }
    return this.isSpeaking ? 0.6 : 0;
  }

  private notifyState() {
    this.callbacks.onStateChange?.(this.getState());
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isSpeaking) {
      this.stop();
    }
    this.notifyState();
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Resolve best native browser voice matching target BCP-47 tag
   */
  private findBestVoice(bcp47: string): SpeechSynthesisVoice | null {
    if (!this.voices || this.voices.length === 0) {
      this.initVoices();
    }
    if (!this.voices.length) return null;

    const target = bcp47.toLowerCase();
    const targetPrefix = target.split('-')[0];

    // 1. Exact match (e.g. 'hi-IN' or 'mr-IN')
    let match = this.voices.find(v => v.lang.toLowerCase() === target);
    if (match) return match;

    // 2. Prefix match (e.g. 'hi' matches 'hi-IN')
    match = this.voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix));
    if (match) return match;

    // 3. Fallback female or natural voice for that language
    match = this.voices.find(v => v.lang.toLowerCase().includes(targetPrefix) && (v.name.includes('Natural') || v.name.includes('Female')));
    if (match) return match;

    return null;
  }

  /**
   * Speak a message in the designated language using Provider A (Gemini TTS) with fallback to Provider B (Browser SpeechSynthesis)
   */
  public async speak(
    text: string,
    bcp47: string = 'en-IN',
    messageId: string = `msg-${Date.now()}`,
    isUserInitiated: boolean = false
  ): Promise<boolean> {
    if (this.isMuted) {
      return false;
    }

    // Stop any currently running speech
    this.stop();

    this.currentLang = bcp47;
    this.activeMessageId = messageId;
    this.autoplayBlocked = false;

    // Clean markdown, brackets, and code tags
    const spokenText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s+/g, '')
      .replace(/`{1,3}.*?`{1,3}/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .trim();

    if (!spokenText) return false;

    // Fast-path: If Gemini TTS is currently on quota cooldown, go directly to browser synthesis
    if (Date.now() < this.fallbackToBrowserUntil) {
      return this.speakViaBrowser(spokenText, bcp47, messageId, isUserInitiated);
    }

    // 1. Try Provider A: Server-side Gemini TTS (gemini-3.8-flash-lite-tts)
    try {
      const response = await fetch('/api/anna/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: spokenText.slice(0, 450),
          voiceName: 'Kore',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.audioBase64 && this.audioPlayer) {
          try {
            await this.audioPlayer.resume();
            this.currentProvider = 'gemini';
            this.isSpeaking = true;
            this.isPaused = false;
            this.callbacks.onStart?.(messageId);
            this.notifyState();

            this.audioPlayer.queueAudioChunk(data.audioBase64);
            return true;
          } catch (playerErr) {
            // AudioPlayer resume failed, proceed to browser fallback
          }
        } else if (data.fallback === 'browser' || data.inCooldown) {
          // If server signals cooldown/fallback, cache for 5 minutes
          this.fallbackToBrowserUntil = Date.now() + 5 * 60 * 1000;
        }
      } else {
        this.fallbackToBrowserUntil = Date.now() + 5 * 60 * 1000;
      }
    } catch {
      this.fallbackToBrowserUntil = Date.now() + 60 * 1000;
    }

    // 2. Provider B: Native Browser SpeechSynthesis Fallback
    return this.speakViaBrowser(spokenText, bcp47, messageId, isUserInitiated);
  }

  /**
   * Browser SpeechSynthesis Provider
   */
  private speakViaBrowser(
    spokenText: string,
    bcp47: string,
    messageId: string,
    isUserInitiated: boolean
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        this.isSpeaking = false;
        this.notifyState();
        resolve(false);
        return;
      }

      this.currentProvider = 'browser';
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = bcp47;
      utterance.rate = 0.95; // Slightly measured for clinical clarity
      utterance.pitch = 1.0;

      const voice = this.findBestVoice(bcp47);
      if (voice) {
        utterance.voice = voice;
      }

      let started = false;

      utterance.onstart = () => {
        started = true;
        this.isSpeaking = true;
        this.isPaused = false;
        this.autoplayBlocked = false;
        this.callbacks.onStart?.(messageId);
        this.notifyState();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.activeMessageId = null;
        this.currentProvider = 'none';
        this.callbacks.onEnd?.(messageId);
        this.notifyState();
        resolve(true);
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.activeMessageId = null;
        this.currentProvider = 'none';

        // Detect browser autoplay blockage
        if (e.error === 'not-allowed' || (!started && !isUserInitiated)) {
          this.autoplayBlocked = true;
          this.callbacks.onAutoplayBlocked?.();
        } else {
          this.callbacks.onError?.(e.error || 'Speech synthesis error');
        }

        this.notifyState();
        resolve(false);
      };

      this.currentUtterance = utterance;

      try {
        window.speechSynthesis.speak(utterance);

        // Autoplay check if browser suspended synthesis silently
        setTimeout(() => {
          if (!started && !this.isSpeaking && !this.isMuted) {
            this.autoplayBlocked = true;
            this.callbacks.onAutoplayBlocked?.();
            this.notifyState();
          }
        }, 1200);
      } catch (err) {
        this.autoplayBlocked = true;
        this.callbacks.onAutoplayBlocked?.();
        this.notifyState();
        resolve(false);
      }
    });
  }

  public pause() {
    if (this.currentProvider === 'gemini' && this.audioPlayer) {
      this.audioPlayer.interrupt();
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.isSpeaking) {
      window.speechSynthesis.pause();
    }
    this.isPaused = true;
    this.notifyState();
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.isPaused) {
      window.speechSynthesis.resume();
      this.isPaused = false;
      this.notifyState();
    }
  }

  public stop() {
    if (this.audioPlayer) {
      this.audioPlayer.interrupt();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.activeMessageId = null;
    this.currentProvider = 'none';
    this.notifyState();
  }
}

export const textToSpeechService = new TextToSpeechService();
