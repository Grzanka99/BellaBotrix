import { z } from "zod";

export function SettingOptionSchema<T>(t: z.ZodType<T>) {
  return z.object({
    value: t,
    description: z.string(),
    vars: z.record(z.string(), z.string()).optional(),
  });
}

export type TSettingOption<T> = {
  value: T;
  description: string;
  vars?: Record<string, string>;
};

export const SettingSchema = z.object({
  commands: SettingOptionSchema(z.boolean()),
  joinMessage: z.object({
    forAllUsers: z.object({
      enabled: SettingOptionSchema(z.boolean()),
      message: SettingOptionSchema(z.string()),
    }),
    forSpecificUsers: z.object({
      enabled: SettingOptionSchema(z.boolean()),
      users: SettingOptionSchema(z.array(z.string())),
      message: SettingOptionSchema(z.string()),
    }),
  }),
  points: z.object({
    enabled: SettingOptionSchema(z.boolean()),
    autoIncrement: SettingOptionSchema(z.number()),
    chancesOffset: SettingOptionSchema(z.number()),
    pointsPerMessage: SettingOptionSchema(z.number()),
  }),
  automod: z.object({
    emotesLimit: z.object({
      enabled: SettingOptionSchema(z.boolean()),
      limit: SettingOptionSchema(z.number()),
      sanctions: SettingOptionSchema(z.record(z.string(), z.string())),
      warningMessage: SettingOptionSchema(z.string()),
      banMessage: SettingOptionSchema(z.string()),
    }),
  }),
});

export const OnOffSchema = z.union([z.literal("on"), z.literal("off"), z.undefined()]);

export const SettingUpdateSchema = z.object({
  commands: OnOffSchema,
  "joinMessage.forAllUsers.enabled": OnOffSchema,
  "joinMessage.forAllUsers.message": z.string(),
  "joinMessage.forSpecificUsers.enabled": OnOffSchema,
  "joinMessage.forSpecificUsers.message": z.string(),
  "joinMessage.forSpecificUsers.users": z.string(),
  "points.enabled": OnOffSchema,
  "points.autoIncrement": z.coerce.number().default(30),
  "points.chancesOffset": z.coerce.number().default(25),
  "points.pointsPerMessage": z.coerce.number().default(1),
  "automod.emotesLimit.enabled": OnOffSchema,
  "automod.emotesLimit.limit": z.coerce.number(),
  "automod.emotesLimit.sanctions": z.string(),
  "automod.emotesLimit.warningMessage": z.string(),
  "automod.emotesLimit.banMessage": z.string(),
});

export type TSettings = z.infer<typeof SettingSchema>;
export type TSettingsUpdate = z.infer<typeof SettingUpdateSchema>;
