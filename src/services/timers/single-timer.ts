type TSend = (msg: string) => void;

export class SingleTimer {
  private timeout: number;
  private message: string;
  private sender: TSend;

  private timer: Timer | undefined = undefined;

  constructor(initTimeout: number, initMsg: string, sender: TSend) {
    this.timeout = initTimeout;
    this.message = initMsg;
    this.sender = sender;
    this.start();
  }

  public start() {
    this.timer = setTimeout(() => {
      this.sender(this.message);
      this.start();
    }, this.timeout);
  }

  public stop() {
    clearTimeout(this.timer);
    this.timer = undefined;
  }

  public update(timeout: number, msg: string) {
    this.timeout = timeout;
    this.message = msg;
  }
}
