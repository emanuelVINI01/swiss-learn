// Single Responsibility: caps how many generation tasks run at once.
// Generic on purpose — knows nothing about TTS, just concurrency.
export class GenerationQueue<T> {
  private queue: Array<() => Promise<void>> = [];
  private running = 0;
  private readonly concurrencyLimit: number;

  constructor(concurrencyLimit = 3) {
    this.concurrencyLimit = concurrencyLimit;
  }

  add(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const wrappedTask = async () => {
        try {
          resolve(await task());
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.processQueue();
        }
      };

      this.queue.push(wrappedTask);
      this.processQueue();
    });
  }

  private processQueue() {
    if (this.running < this.concurrencyLimit && this.queue.length > 0) {
      const nextTask = this.queue.shift();
      if (nextTask) {
        this.running++;
        nextTask();
      }
    }
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getRunningCount(): number {
    return this.running;
  }
}
