export * from "./src/settings.ts";
export type * from "./src/settings.d";

export type TOption<T> = T | undefined;

export enum EChannelAccessLevel {
  Mod = "MOD",
  Owner = "OWNER",
  Editor = "EDITOR",
  Viewer = "VIEWER",
}
