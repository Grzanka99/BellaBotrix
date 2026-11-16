export class AsyncQueue {
  private tail = Promise.resolve();

  public enqueue<T>(callback: () => Promise<T>): Promise<T> {
    const task = this.tail.then(callback);
    this.tail = task.then(
      () => undefined,
      () => undefined,
    );
    return task;
  }
}
