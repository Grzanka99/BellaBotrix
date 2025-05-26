import type { Commands, SubCommands } from "@prisma/client";
import { z } from "zod";

export const SCreateCommand = z.object({
  name: z.string().min(1),
  message: z.string().min(1),
  paid: z.boolean(),
  price: z.number().int(),
  errorMessage: z.string(),
});

export type TCreateCommand = z.infer<typeof SCreateCommand>;

export const SUpdateCommand = z.object({
  id: z.coerce.number(),
  enabled: z.coerce.boolean().optional(),
  message: z.record<z.ZodString>(z.string()).optional(),
  alias: z.coerce.string().optional(),
  paid: z.boolean(),
  price: z.number().int(),
  errorMessage: z.string(),
});

export const SUpdateSubCommand = z.object({
  id: z.coerce.number(),
  message: z.record<z.ZodString>(z.string()).optional(),
  alias: z.coerce.string().optional(),
  paid: z.boolean(),
  price: z.number().int(),
  errorMessage: z.string(),
});

export type TUpdateCommand = z.infer<typeof SUpdateCommand>;
export type TUpdateSubCommand = z.infer<typeof SUpdateSubCommand>;

export type TCommandWithSubCommands = Commands & {
  subCommands: SubCommands[];
};
