// Bun ships its own implementation of the `ws` package, so `ws` is not installed and has no
// type declarations. This describes the part of Bun's `ws` WebSocket that the bot uses.
declare module "ws" {
  import type { EventEmitter } from "node:events";

  export type MessageEvent = {
    data: string | Buffer | ArrayBuffer | Buffer[];
    type: string;
    target: WebSocket;
  };

  export class WebSocket extends EventEmitter {
    constructor(address: string | URL, protocols?: string | string[]);
    readonly readyState: number;
    send(data: string | ArrayBufferLike | ArrayBufferView): void;
    close(code?: number, reason?: string): void;
    addEventListener(type: "message", listener: (event: MessageEvent) => void): void;
    addEventListener(type: "open" | "close" | "error", listener: (event: Event) => void): void;
  }
}
