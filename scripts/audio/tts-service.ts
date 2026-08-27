import { TtsProcess, type TtsProcessConfig } from "./tts-process";
import { GenerationQueue } from "./generation-queue";

export interface TtsServiceConfig extends TtsProcessConfig {
  concurrencyLimit?: number;
}

export interface TtsGenerateOptions {
  text: string;
  outputPath: string;
}

// Singleton entry point for asynchronous edge-tts audio generation.
export class TtsService {
  private static instance: TtsService;
  private readonly queue: GenerationQueue<void>;
  private readonly process: TtsProcess;

  private constructor(config?: TtsServiceConfig) {
    this.queue = new GenerationQueue<void>(config?.concurrencyLimit ?? 3);
    this.process = new TtsProcess({ voice: config?.voice });
  }

  static getInstance(config?: TtsServiceConfig): TtsService {
    if (!TtsService.instance) {
      TtsService.instance = new TtsService(config);
    }
    return TtsService.instance;
  }

  // Queues a synthesis task; resolves once the file has been written.
  generateAudio(options: TtsGenerateOptions): Promise<void> {
    return this.queue.add(() => this.process.synthesize(options.text, options.outputPath));
  }
}
