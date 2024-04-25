import type { SubCommands } from "@prisma/client";
import type { TOption } from "bellatrix";
import { prisma } from "services/db";
import type { THandleCoreCommandArgs, THandleParsedCommandArgs } from "services/types";

function getSubCommand(subCommands: SubCommands[], triggerWord: string): TOption<SubCommands> {
  const command = subCommands.find((cmd) => {
    const byName = triggerWord.trim().toLowerCase() === cmd.name.trim().toLowerCase();

    if (!byName && cmd.alias) {
      const byAlias = cmd.alias
        .split(",")
        .map((el) => el.trim())
        .includes(triggerWord.trim().toLowerCase());

      return !!byAlias;
    }

    return !!byName;
  });

  return command || undefined;
}

export class CoreCommand {
  private expectSub: boolean;
  private handler: (ctx: THandleCoreCommandArgs) => Promise<TOption<string>>;
  private requierMod: boolean;

  constructor(
    handler: (ctx: THandleCoreCommandArgs) => Promise<TOption<string>>,
    requierMod = false,
    expectSub = false,
  ) {
    this.handler = handler;
    this.requierMod = requierMod;
    this.expectSub = expectSub;
  }

  private async canRun(ctx: THandleParsedCommandArgs): Promise<boolean> {
    if (!this.requierMod) {
      return true;
    }

    if (!ctx.tags?.userId || !ctx.tags.username) {
      return false;
    }

    const mods = await ctx.api.getChannelModerators();
    const inModsList = mods.find((m) => m.user_id === ctx.tags?.userId);

    if (!inModsList) {
      const isItStreamerItself = ctx.channel === `#${ctx.tags.username}`;

      return isItStreamerItself;
    }

    return true;
  }

  private async checkForSubCommand(uniqueName: string): Promise<TOption<SubCommands[]>> {
    if (!this.expectSub) {
      return undefined;
    }

    const subCommandsForChannel = await prisma.subCommands.findMany({
      where: { parentCommand: uniqueName },
    });

    if (!subCommandsForChannel) {
      return undefined;
    }

    return subCommandsForChannel;
  }

  public async handle(ctx: THandleParsedCommandArgs): Promise<TOption<string>> {
    if (!ctx.message) {
      return undefined;
    }

    const [subCommands, canRun] = await Promise.all([
      this.checkForSubCommand(ctx.parsedCommand.uniqueName),
      this.canRun(ctx),
    ]);

    if (!canRun) {
      return undefined;
    }

    if (!subCommands) {
      return await this.handler({
        ...ctx,
        subCommand: false,
        commandContent: ctx.message.substring(2 + ctx.triggerWord.length),
      });
    }

    const nameWithoutTrigger = ctx.message.slice(2 + ctx.triggerWord.length);
    const possibleSub = nameWithoutTrigger.includes(" ")
      ? nameWithoutTrigger.substring(0, nameWithoutTrigger.indexOf(" "))
      : nameWithoutTrigger;

    const subCommand = getSubCommand(subCommands, possibleSub);
    if (subCommand) {
      return await this.handler({
        ...ctx,
        subCommand: subCommand.name,
        commandContent: ctx.message.substring(3 + ctx.triggerWord.length + possibleSub.length),
      });
    }

    return await this.handler({
      ...ctx,
      subCommand: false,
      commandContent: ctx.message.substring(2 + ctx.triggerWord.length),
    });
  }
}
