export * from "./settings";

export enum EChannelAccessLevel {
  Mod = "MOD",
  Owner = "OWNER",
  Editor = "EDITOR",
  Viewer = "VIEWER",
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
