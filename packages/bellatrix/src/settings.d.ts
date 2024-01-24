import { z } from "zod";
import { SSettings, SSettingsUpdate } from "./settings";

export type TSettingOption<T> = {
  value: T;
  description: string;
  vars?: Record<string, string>;
};

export type TSettings = z.infer<typeof SSettings>;
export type TSettingsUpdate = z.infer<typeof SSettingsUpdate>;
