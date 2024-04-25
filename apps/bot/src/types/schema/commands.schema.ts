import { z } from "zod";

export const CommandMessageSchema = z
  .object({
    base: z.string(),
  })
  .and(z.record(z.string(), z.string()));

export const SubCommandSchema = z.object({
  id: z.number(),
  uniqueName: z.string(),
  name: z.string(),
  channelName: z.string(),
  message: CommandMessageSchema,
  alias: z.array(z.string()).optional(),
});

export const CommandSchema = z.object({
  id: z.number(),
  uniqueName: z.string(),
  name: z.string(),
  channelName: z.string(),
  enabled: z.boolean(),
  message: CommandMessageSchema,
  alias: z.array(z.string()).optional(),
  isCore: z.boolean(),
  subCommands: z.array(SubCommandSchema).optional(),
});

export const MinimalCommandSchema = CommandSchema.omit({
  id: true,
  uniqueName: true,
  channelName: true,
  enabled: true,
}).extend({
  subCommands: z
    .array(
      SubCommandSchema.omit({
        id: true,
        uniqueName: true,
        channelName: true,
      }),
    )
    .optional(),
});

export const CommandFromDBSchema = CommandSchema.extend({
  message: z.string().or(z.null()),
  alias: z.string(),
});

export const CommandsListSchema = z.array(CommandSchema);
export const CommandsListFromDBSchema = z.array(CommandFromDBSchema);
export const MinimalCommandsListSchema = z.array(MinimalCommandSchema);

export type TCommandMessage = z.infer<typeof CommandMessageSchema>;
export type TCommand = z.infer<typeof CommandSchema>;
export type TCommandsList = z.infer<typeof CommandsListSchema>;
export type TCommandFromDB = z.infer<typeof CommandFromDBSchema>;
export type TCommandsListFromDB = z.infer<typeof CommandsListFromDBSchema>;
export type TMinimalCommand = z.infer<typeof MinimalCommandSchema>;
export type TMinimalCommandsList = z.infer<typeof MinimalCommandsListSchema>;
export type TDbInterfaceCommand = Partial<TCommandFromDB> & Pick<TCommandFromDB, "name">;
export type TSubCommand = z.infer<typeof SubCommandSchema>;
