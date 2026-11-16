import { expect, test } from "bun:test";
import { AsyncQueue } from "./async-queue";

test("continues after a rejected task", async () => {
  const queue = new AsyncQueue();
  const failed = queue.enqueue(async () => Promise.reject(new Error("failed")));
  const succeeded = queue.enqueue(async () => "done");

  await expect(failed).rejects.toThrow("failed");
  await expect(succeeded).resolves.toBe("done");
});

test("continues after a synchronously throwing task", async () => {
  const queue = new AsyncQueue();
  const failed = queue.enqueue(() => {
    throw new Error("failed");
  });
  const succeeded = queue.enqueue(async () => "done");

  await expect(failed).rejects.toThrow("failed");
  await expect(succeeded).resolves.toBe("done");
});

test("waits for each task before starting the next", async () => {
  const queue = new AsyncQueue();
  const gate = Promise.withResolvers<void>();
  const order: string[] = [];
  const first = queue.enqueue(async () => {
    order.push("first started");
    await gate.promise;
    order.push("first finished");
  });
  const second = queue.enqueue(async () => {
    order.push("second started");
  });

  await Promise.resolve();
  expect(order).toEqual(["first started"]);
  gate.resolve();
  await Promise.all([first, second]);
  expect(order).toEqual(["first started", "first finished", "second started"]);
});
