export type TTimerSender = (msg: string) => void;

export class SingleTimer {
  private timeout: number;
  private message: string;
  private sender: TTimerSender;

  private timer: Timer | undefined;

  constructor(initTimeout: number, initMsg: string, sender: TTimerSender) {
    this.timeout = initTimeout;
    this.message = initMsg;
    this.sender = sender;
    this.start();
  }

  public start(): void {
    this.timer = setTimeout(() => {
      this.sender(this.message);
      this.start();
    }, this.timeout);
  }

  public stop(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
  }

  public update(timeout: number, msg: string): void {
    this.timeout = timeout;
    this.message = msg;
  }
}
