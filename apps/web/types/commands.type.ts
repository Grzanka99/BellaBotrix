import type { Commands, SubCommands } from "@prisma/client";
import { ETimeoutType } from "bellatrix";
import { z } from "zod";

export const SCreateCommand = z.object({
  name: z.string().min(1),
  message: z.string().min(1),
  paid: z.boolean(),
  price: z.number().int(),
  errorMessage: z.string(),
  timeout: z.number().int(),
  timeoutEnabled: z.boolean(),
  timeoutType: z.nativeEnum(ETimeoutType),
});

export type TCreateCommand = z.infer<typeof SCreateCommand>;

export const SUpdateCommand = z.object({
  id: z.coerce.number(),
  enabled: z.coerce.boolean().optional(),
  message: z.record<z.ZodString>(z.string()).optional(),
  alias: z.coerce.string().optional(),
  paid: z.boolean().optional(),
  price: z.number().int().optional(),
  errorMessage: z.string().optional(),
  timeout: z.number().int().optional(),
  timeoutEnabled: z.boolean().optional(),
  timeoutType: z.nativeEnum(ETimeoutType).optional(),
});

export const SUpdateSubCommand = z.object({
  id: z.coerce.number(),
  message: z.record<z.ZodString>(z.string()).optional(),
  alias: z.coerce.string().optional(),
  paid: z.boolean(),
  price: z.number().int(),
  errorMessage: z.string(),
  timeout: z.number().int().optional(),
  timeoutEnabled: z.boolean().optional(),
  timeoutType: z.nativeEnum(ETimeoutType).optional(),
});

export type TUpdateCommand = z.infer<typeof SUpdateCommand>;
export type TUpdateSubCommand = z.infer<typeof SUpdateSubCommand>;

export type TCommandWithSubCommands = Commands & {
  subCommands: SubCommands[];
};
