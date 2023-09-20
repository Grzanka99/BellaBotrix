import { logger } from "@cgsh/utils";
import { PrismaClient } from "@prisma/client";
import { AsyncQueue } from "utils/async-queue";

export const prisma = new PrismaClient();
export const prismaQueue = new AsyncQueue();

type TCommand = {
  name: string;
  message: string;
};

const BASE_COMMANDS: TCommand[] = [
  {
    name: "addpoints",
    message:
      "$username just received $points points and now have bit more Kappa",
  },
  {
    name: "removepoints",
    message:
      "$username just was robbed of $points points and now have bit less LUL",
  },
  { name: "points", message: "$username has $points points" },
  {
    name: "gamble",
    message:
      "$username rolled $rolled and $result $points points and now have $total points DinoDance",
  },
  {
    name: "solo",
    message:
      "Hey, $username1, $username2 want's to fight with you for $points points, will you accept the challenge with !yes, or run away like little cat with !nope?",
  },
  {
    name: "yes",
    message:
      "Leeeet's gooom, $winner beat up $looser and won $points points! LEPSZY!",
  },
  {
    name: "nope",
    message: "Hahahaha, $username runaway like a little kitty Kippa",
  },{
    name: "avadakedavra",
    message: "Sirius Black says goodbay!"
  }
];

if (prisma) {
  BASE_COMMANDS.forEach((command) => {
    prismaQueue.enqueue(() => {
      return prisma.commands.upsert({
        where: {
          name: command.name,
        },
        update: {},
        create: {
          name: command.name,
          message: command.message,
          enabled: true,
        },
      });
    });
  });
}

// NOTE: remove later
setInterval(() => {
  if (prismaQueue.enqueued) {
    logger.warning(`PRISMA CURRENTLY ENQUEUED: ${prismaQueue.enqueued}`);
  }
}, 100);
