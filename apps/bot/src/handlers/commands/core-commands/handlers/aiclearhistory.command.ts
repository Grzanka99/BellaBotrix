import { CoreCommand } from "../core-command";

export const aiClearHistoryCommand = new CoreCommand(async (ctx) => {
  if (!ctx.message || !ctx.tags) {
    return undefined;
  }

  ctx.ollamaAi.forceHistoryClear();

  return ctx.parsedCommand.message.base;
}, true);
