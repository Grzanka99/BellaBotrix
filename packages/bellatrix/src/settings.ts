import { z } from "zod";

export function SSettingOptionSchema<T>(t: z.ZodType<T>) {
  return z.object({
    value: t,
    description: z.string(),
    vars: z.record(z.string(), z.string()).optional(),
  });
}

export const SSettings = z.object({
  commands: z.object({
    enabled: SSettingOptionSchema(z.boolean()),
    prefix: SSettingOptionSchema(z.string().length(1)),
  }),
  joinMessage: z.object({
    forAllUsers: z.object({
      enabled: SSettingOptionSchema(z.boolean()),
      message: SSettingOptionSchema(z.string()),
    }),
    forSpecificUsers: z.object({
      enabled: SSettingOptionSchema(z.boolean()),
      users: SSettingOptionSchema(z.array(z.string())),
      message: SSettingOptionSchema(z.string()),
    }),
  }),
  points: z.object({
    enabled: SSettingOptionSchema(z.boolean()),
    autoIncrement: SSettingOptionSchema(z.number()),
    chancesOffset: SSettingOptionSchema(z.number()),
    pointsPerMessage: SSettingOptionSchema(z.number()),
  }),
  triggerWords: z.object({
    enabled: SSettingOptionSchema(z.boolean()),
  }),
  r6dle: z.object({
    enabled: SSettingOptionSchema(z.boolean()),
  }),
  automod: z.object({
    emotesLimit: z.object({
      enabled: SSettingOptionSchema(z.boolean()),
      limit: SSettingOptionSchema(z.number()),
      sanctions: SSettingOptionSchema(z.record(z.string(), z.string())),
      warningMessage: SSettingOptionSchema(z.string()),
      banMessage: SSettingOptionSchema(z.string()),
    }),
  }),
});

export const SSettingsUpdate = SSettings.deepPartial();

export type TSettingOption<T> = {
  value: T;
  description: string;
  vars?: Record<string, string>;
};

export type TSettings = z.infer<typeof SSettings>;
export type TSettingsUpdate = z.infer<typeof SSettingsUpdate>;
