import { logger } from "./logger";

export class AsyncPipe<T extends Array<unknown> = [], R = void> {
  private fn: Array<() => Promise<R>> = [];
  private curr = 0;
  private loggerEnabled = false;

  private get logger() {
    return this.loggerEnabled
      ? logger
      : {
          info: () => {},
          error: () => {},
        };
  }

  constructor(fn: (...args: T) => R, args: T[] | unknown[], logger = false) {
    this.loggerEnabled = logger;
    args.forEach((arg) => {
      const a = async (): Promise<R> => {
        return await fn(...(arg as T));
      };
      this.fn.push(a);
    });
  }

  public get total() {
    return this.fn.length;
  }

  public get current() {
    return this.curr + 1;
  }

  private resolver: (v: number) => void = (_) => {};
  private rejecter: (v: number) => void = (_) => {};

  private done() {
    if (this.curr + 1 < this.total) {
      this.logger.error(`Pipe failed at ${this.curr + 1} operation`);
      this.rejecter(this.curr + 1);
    } else {
      this.logger.info("Pipe finished after all operations");
      this.resolver(this.current);
    }
  }

  private run() {
    this.logger.info(`Running ${this.curr + 1}/${this.total}`);
    this.fn[this.curr]().then(() => {
      if (this.curr + 1 < this.total) {
        this.curr = this.curr + 1;
        this.run();
      } else {
        this.done();
      }
    });
  }

  public async start() {
    this.logger.info(`Starting ${this.total} operations in async pipe`);
    this.curr = 0;
    this.run();

    return new Promise((res, rej) => {
      this.resolver = res;
      this.rejecter = rej
    });
  }
}
