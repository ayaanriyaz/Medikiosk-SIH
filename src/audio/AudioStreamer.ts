// AudioStreamer captures microphone audio at 16kHz PCM16 and streams chunks via WebSocket

export class AudioStreamer {
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private isRecording = false;
  private onChunkCallback: ((base64Pcm16: string) => void) | null = null;
  private onLevelCallback: ((level: number) => void) | null = null;
  private onErrorCallback: ((err: Error) => void) | null = null;

  constructor() {}

  public async start(
    onChunk: (base64Pcm16: string) => void,
    onLevel?: (level: number) => void,
    onError?: (err: Error) => void
  ): Promise<boolean> {
    this.onChunkCallback = onChunk;
    this.onLevelCallback = onLevel || null;
    this.onErrorCallback = onError || null;

    if (this.isRecording) {
      return true;
    }

    try {
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        throw new Error('Microphone access is not available in this browser or iframe environment.');
      }

      // 1. Request microphone stream with voice-optimized constraints
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 2. Create 16kHz AudioContext for Gemini Live API
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API is not supported in this browser.');
      }

      try {
        this.audioCtx = new AudioContextClass({ sampleRate: 16000 });
      } catch (e) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.source = this.audioCtx.createMediaStreamSource(this.mediaStream);

      // 3. Process audio chunks (4096 samples = ~256ms chunk at 16kHz)
      this.processor = this.audioCtx.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!this.isRecording) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // Calculate RMS audio level for waveform feedback
        let sumSquares = 0;
        for (let i = 0; i < inputData.length; i++) {
          sumSquares += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sumSquares / inputData.length);
        const normalizedLevel = Math.min(1, Math.max(0, rms * 4));
        if (this.onLevelCallback) {
          this.onLevelCallback(normalizedLevel);
        }

        // Convert Float32Array to 16-bit PCM Little Endian
        const base64 = this.float32ToPcm16Base64(inputData);
        if (this.onChunkCallback && base64) {
          this.onChunkCallback(base64);
        }
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioCtx.destination);

      this.isRecording = true;
      return true;
    } catch (err: any) {
      console.error('[AudioStreamer] Failed to initialize microphone:', err);
      this.stop();
      if (this.onErrorCallback) {
        this.onErrorCallback(err instanceof Error ? err : new Error(String(err)));
      }
      return false;
    }
  }

  public stop(): void {
    this.isRecording = false;

    if (this.processor) {
      try {
        this.processor.disconnect();
      } catch (e) {}
      this.processor = null;
    }

    if (this.source) {
      try {
        this.source.disconnect();
      } catch (e) {}
      this.source = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }

    if (this.onLevelCallback) {
      this.onLevelCallback(0);
    }
  }

  public get recording(): boolean {
    return this.isRecording;
  }

  private float32ToPcm16Base64(input: Float32Array): string {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
