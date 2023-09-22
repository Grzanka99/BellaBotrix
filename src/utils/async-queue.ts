export class AsyncQueue {
  private queue: Array<
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [() => Promise<unknown>, (v: any) => void, (v: string) => void]
  > = [];
  private isRunning = false;

  private resolver: (v: boolean) => void = (_) => {};
  private rejecter: (v: boolean) => void = (_) => {};

  public async enqueue<T>(
    callback: () => Promise<T>,
    autostart = true,
  ): Promise<T> {
    return new Promise((res, rej) => {
      this.queue.push([callback, res, rej]);
      if (!this.isRunning && autostart) {
        this.start();
      }
    });
  }

  private run() {
    if (!this.queue.length) {
      this.done();
      return;
    }

    const curr = this.queue.splice(0, 1)[0];

    curr[0]()
      .then((r) => {
        curr[1](r);
        this.run();
      })
      .catch((e) => {
        curr[2](e);
        this.rejecter(e);
      });
  }

  private done() {
    this.resolver(true);
    this.isRunning = false;
  }

  public start() {
    this.isRunning = true;
    this.run();

    new Promise((res, rej) => {
      this.resolver = res;
      this.rejecter = rej;
    });
  }

  public get enqueued(): number {
    return this.queue.length;
  }
}
