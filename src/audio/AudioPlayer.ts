// AudioPlayer handles low-latency 24kHz playback of Gemini Live audio chunks with gapless scheduling and barge-in interruption

export class AudioPlayer {
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isPlaying = false;
  private endTimeout: any = null;

  public onPlaybackStateChange: ((isPlaying: boolean) => void) | null = null;

  constructor() {}

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('[AudioPlayer] Web Audio API is not supported in this environment.');
        return;
      }
      try {
        // 24kHz sample rate for Gemini Live response audio
        this.audioCtx = new AudioContextClass({ sampleRate: 24000 });
      } catch (e) {
        try {
          this.audioCtx = new AudioContextClass();
        } catch (err) {
          console.warn('[AudioPlayer] Failed to instantiate AudioContext:', err);
          return;
        }
      }
      try {
        this.gainNode = this.audioCtx.createGain();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;

        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
      } catch (e) {
        console.warn('[AudioPlayer] Failed to setup audio routing:', e);
      }
    }
  }

  public async resume(): Promise<void> {
    this.initContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  // Queue and schedule an incoming 24kHz PCM16 audio chunk
  public queueAudioChunk(base64Pcm16: string): void {
    try {
      this.initContext();
      if (!this.audioCtx || !this.gainNode) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const audioBuffer = this.pcm16Base64ToAudioBuffer(base64Pcm16, this.audioCtx, 24000);
      if (!audioBuffer) return;

      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode);

      // Gapless scheduling
      const currentTime = this.audioCtx.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;

      this.activeSources.push(source);

      if (!this.isPlaying) {
        this.isPlaying = true;
        if (this.onPlaybackStateChange) {
          this.onPlaybackStateChange(true);
        }
      }

      // Cleanup source on complete
      source.onended = () => {
        const index = this.activeSources.indexOf(source);
        if (index > -1) {
          this.activeSources.splice(index, 1);
        }

        if (this.activeSources.length === 0) {
          // Add a small buffer to avoid fluttering between words
          clearTimeout(this.endTimeout);
          this.endTimeout = setTimeout(() => {
            if (this.activeSources.length === 0 && this.isPlaying) {
              this.isPlaying = false;
              if (this.onPlaybackStateChange) {
                this.onPlaybackStateChange(false);
              }
            }
          }, 150);
        }
      };
    } catch (err) {
      console.error('[AudioPlayer] Error queuing audio chunk:', err);
    }
  }

  // Immediate stop on barge-in / user interruption
  public interrupt(): void {
    clearTimeout(this.endTimeout);
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {}
    }
    this.activeSources = [];

    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    } else {
      this.nextStartTime = 0;
    }

    if (this.isPlaying) {
      this.isPlaying = false;
      if (this.onPlaybackStateChange) {
        this.onPlaybackStateChange(false);
      }
    }
  }

  // Frequency data for visual waveform
  public getFrequencyData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(16);
    }
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  // Audio level (0 to 1) for pulsation animation
  public getAudioLevel(): number {
    if (!this.analyser || !this.isPlaying) return 0;
    const data = this.getFrequencyData();
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    const avg = sum / data.length;
    return Math.min(1, avg / 128);
  }

  public get playing(): boolean {
    return this.isPlaying;
  }

  public destroy(): void {
    this.interrupt();
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }
  }

  private pcm16Base64ToAudioBuffer(base64: string, ctx: AudioContext, sampleRate = 24000): AudioBuffer | null {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);

      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const buffer = ctx.createBuffer(1, float32Array.length, sampleRate);
      buffer.copyToChannel(float32Array, 0);
      return buffer;
    } catch (err) {
      console.error('[AudioPlayer] Failed to decode PCM16 audio chunk:', err);
      return null;
    }
  }
}
