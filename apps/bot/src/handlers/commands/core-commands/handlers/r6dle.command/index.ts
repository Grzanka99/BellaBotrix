import { CoreCommand } from "../../core-command";
import { handleGuessSubcommand } from "./r6dle-guess";
import { handleStatsSubcommand } from "./r6dle-stats";

export const r6dleCoreCommand = new CoreCommand(
  async (ctx) => {
    if (!ctx.settings.r6dle.enabled.value) {
      return undefined;
    }

    if (!ctx.subCommand) {
      return "none subcommand";
    }

    switch (ctx.subCommand.name) {
      case "guess": {
        return await handleGuessSubcommand(ctx);
      }
      case "stats": {
        return await handleStatsSubcommand(ctx);
      }
    }
  },
  false,
  true,
);
