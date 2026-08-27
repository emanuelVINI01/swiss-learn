import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export interface TtsProcessConfig {
  voice?: string;
}

// Single Responsibility: wraps one text -> mp3 file synthesis call against
// Microsoft Edge's Read Aloud service (via msedge-tts).
export class TtsProcess {
  private readonly voice: string;

  constructor(config?: TtsProcessConfig) {
    this.voice = config?.voice ?? "de-CH-LeniNeural";
  }

  async synthesize(text: string, outputPath: string): Promise<void> {
    const tts = new MsEdgeTTS();
    try {
      await tts.setMetadata(this.voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(text);
      await pipeline(audioStream, createWriteStream(outputPath));
    } finally {
      tts.close();
    }
  }
}
