export * from "./src";

export type TOption<T> = T | undefined;

export enum ETimeoutType {
  User = "USER",
  Command = "COMMAND",
}
