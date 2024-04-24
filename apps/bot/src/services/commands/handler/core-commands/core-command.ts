import type { TOption } from "bellatrix";
import type { THandleCoreCommandArgs, THandleParsedCommandArgs } from "services/types";

export class CoreCommand {
  private sub: string[] | undefined;
  private handler: (ctx: THandleCoreCommandArgs) => Promise<TOption<string>>;
  private requierMod: boolean;

  constructor(
    handler: (ctx: THandleCoreCommandArgs) => Promise<TOption<string>>,
    requierMod = false,
  ) {
    this.handler = handler;
    this.requierMod = requierMod;
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

  public async handle(ctx: THandleParsedCommandArgs): Promise<TOption<string>> {
    if (!ctx.message) {
      return undefined;
    }

    if (!(await this.canRun(ctx))) {
      return undefined;
    }

    if (!this.sub) {
      return await this.handler({
        ...ctx,
        subCommand: false,
        commandContent: ctx.message.substring(2 + ctx.triggerWord.length),
      });
    }

    const noName = ctx.message.slice(2 + ctx.triggerWord.length);
    const possibleSub = noName.substring(0, noName.indexOf(" "));

    if (this.sub.includes(possibleSub)) {
      return await this.handler({
        ...ctx,
        subCommand: possibleSub,
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
