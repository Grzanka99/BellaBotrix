import { prisma, prismaQueue } from "services/db";
import { interpolate } from "utils/interpolate-string";
import type { THandleCommadArgs } from "services/types";
import { CoreCommandsHandlers } from "./core-commands";
import { dbCommandToCommand } from "services/commands/commands.transform";

export class CommandHandler {
  private channel: string;

  constructor(channel: string) {
    this.channel = channel;
  }

  public async handle(args: THandleCommadArgs): Promise<undefined> {
    if (!args.api || !args.settings.commands.enabled.value || !args.message) {
      return undefined;
    }

    const prefix = args.settings.commands.prefix.value;

    if (args.message[0] !== prefix) {
      return undefined;
    }

    const triggerWord = args.message.includes(" ")
      ? args.message.substring(1, args.message.indexOf(" "))
      : args.message.replace(prefix, "");

    const allCommands = await prisma.commands.findMany({
      where: { channelName: this.channel, enabled: true },
    });

    const command = allCommands.find((cmd) => {
      const byName = triggerWord.trim().toLowerCase() === cmd.name.trim().toLowerCase();

      if (!byName) {
        const byAlias = cmd.alias
          .split(",")
          .map((el) => el.trim())
          .includes(triggerWord.trim().toLowerCase());

        return !!byAlias;
      }

      return !!byName;
    });

    if (!command) {
      return undefined;
    }

    // NOTE: JsonValue is specifix to prisma (I guess) but it can be consider string in that case
    // @ts-expect-error
    const parsedCommand = dbCommandToCommand(command);

    if (!parsedCommand) {
      return undefined;
    }

    if (parsedCommand.paid) {
      if (!args.tags) {
        return undefined;
      }

      const user = await prismaQueue.enqueue(() =>
        prisma.user.findUnique({
          where: {
            userid: `${args.tags?.userId}@${this.channel}`,
            channel: this.channel,
          },
        }),
      );

      if (!user) {
        return undefined;
      }

      if (user.points < parsedCommand.price) {
        const res = interpolate(parsedCommand.errorMessage, {
          username: `@${args.tags.username}` || "",
          points: parsedCommand.price,
        });

        args.send(res);
        return undefined;
      }

      await prismaQueue.enqueue(() =>
        prisma.user.update({
          where: { id: user.id },
          data: { points: user.points - parsedCommand.price },
        }),
      );
    }

    if (parsedCommand.isCore && CoreCommandsHandlers[parsedCommand.name] && args.tags) {
      const res = await CoreCommandsHandlers[parsedCommand.name].handle({
        ...args,
        tags: args.tags,
        parsedCommand,
        triggerWord,
      });
      if (res) {
        args.send(res);
      }
      return undefined;
    }

    if (!parsedCommand.message || !parsedCommand.message.base) {
      return undefined;
    }

    const res = interpolate(parsedCommand.message.base, {
      username: args.tags?.username || "",
      price: parsedCommand.price,
      channel: this.channel,
    });

    args.send(res);

    return undefined;
  }
}
