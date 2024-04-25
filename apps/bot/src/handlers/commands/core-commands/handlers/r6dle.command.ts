import { interpolate } from "utils/interpolate-string";
import { CoreCommand } from "../core-command";

export const r6dleCoreCommand = new CoreCommand(
  async (ctx) => {
    if (!ctx.settings.r6dle.enabled.value) {
      return undefined;
    }

    switch (ctx.subCommand) {
      case "guess": {
        const res = ctx.r6dle.guess(ctx.commandContent);
        if (!res) {
          return undefined;
        }
        return interpolate("$badOperator $name $diff", res.response);
      }
      case "stats": {
        return "stats subcommand";
      }
    }

    return "none subcommand";
  },
  false,
  true,
);
