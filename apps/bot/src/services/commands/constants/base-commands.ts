import type { TMinimalCommandsList } from "types/schema/commands.schema";

export const BASE_COMMANDS: TMinimalCommandsList = [
  {
    name: "addpoints",
    message: { base: "$username just received $points points and now have bit more Kappa" },
    isCore: true,
  },
  {
    name: "removepoints",
    message: { base: "$username just was robbed of $points points and now have bit less LUL" },
    isCore: true,
  },
  {
    name: "givepoints",
    message: {
      base: "User $giver gave $points points to $receiver",
      notEnoughtPoints: "$giver! You are not Polish goverment, you cannot give what you don't have",
      pointsLTZero: "Nice try $giver, M**awi***i, is that you?",
    },
    isCore: true,
  },
  {
    name: "points",
    message: { base: "$username has $points points" },
    alias: ["punkty", "punkciki"],
    isCore: true,
  },
  {
    name: "gamble",
    message: {
      base: "$username rolled $rolled and $result $points points and now have $total points DinoDance",
      superWon: "$username is awesome",
      extremeWon: "$username is god",
      lose: "$username rolle $rolled and wasted his $points points, and now have $total points DinoLose",
      notEnoughtPoints: "You are poor, you need more points $username",
      wtf: "You should never get here...",
    },
    isCore: true,
  },
  {
    name: "solo",
    message: {
      base: "Hey, $username2, $username1 want to fight with you for $points points, will you accept the challenge with !yes, or run away like little cat with !nope?",
      inSolo:
        "Hey, @$username1, you already in solo with @$username2, if you wan't to cancel, write !nope",
      notEnoughtPoints: "You don't have enought poitns for this fight xD",
    },
    isCore: true,
  },
  {
    name: "yes",
    message: {
      base: "Leeeet's gooom, $winner beat up $looser and won $points points! LEPSZY!",
      notEnoughtPoints: `@$username, you don't have enought poitns to enter this fight, LUL`,
    },
    alias: ["tak"],
    isCore: true,
  },
  {
    name: "nope",
    message: { base: "Hahahaha, $username runaway like a little kitty Kippa" },
    alias: ["nie", "pierdolsie"],
    isCore: true,
  },
  {
    name: "avadakedavra",
    message: { base: "Sirius Black says goodbay!" },
    isCore: true,
  },
  {
    name: "htfu",
    message: {
      base: "$username1 just spit on $username2 PepeSpit",
      onHimself: "$username1 just stip on himself, what a kitty",
    },
    alias: ["tfu"],
    isCore: true,
  },
  {
    name: "winrate",
    message: {
      base: "$username has $winrate winrate in $total soloes with $wins wins",
      winrateNegative: "$username is a looooser with $winrate winrate xD",
      fiftypercent: "$username has exacly 50% winrate, WOWOWOWOWOW",
    },
    isCore: true,
  },
  {
    name: "top",
    message: {
      base: "Those are reachest guys: $result",
      listItem: "$index. $username has $points",
    },
    isCore: true,
  },
  {
    name: "r6dle",
    message: {
      base: "Either use !r6dle guess or !r6dle stats",
    },
    isCore: true,
    subCommands: [
      {
        name: "guess",
        message: {
          base: "You are right $username, it's indeed $operator!",
          badOperator: "Operator $badOperator doesn't exist",
          wrong: "$diff",
        },
      },
      {
        name: "stats",
        message: {
          base: "$username won $won and has score of $score",
        },
      },
    ],
  },
];
