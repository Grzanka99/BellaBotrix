import { TMinimalCommandsList } from "types/schema/commands.schema";

export const BASE_COMMANDS: TMinimalCommandsList = [
  {
    name: "addpoints",
    message: { base: "$username just received $points points and now have bit more Kappa" },
  },
  {
    name: "removepoints",
    message: { base: "$username just was robbed of $points points and now have bit less LUL" },
  },
  {
    name: "givepoints",
    message: {
      base: "User $giver gave $points points to $receiver",
      notEnoughtPoints: "$giver! You are not Polish goverment, you cannot give what you don't have",
      pointsLTZero: "Nice try $giver, M**awi***i, is that you?",
    },
  },
  {
    name: "points",
    message: { base: "$username has $points points" },
    alias: ["punkty", "punkciki"],
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
  },
  {
    name: "solo",
    message: {
      base: "Hey, $username2, $username1 want to fight with you for $points points, will you accept the challenge with !yes, or run away like little cat with !nope?",
      inSolo:
        "Hey, @$username1, you already in solo with @$username2, if you wan't to cancel, write !nope",
      notEnoughtPoints: "You don't have enought poitns for this fight xD",
    },
  },
  {
    name: "yes",
    message: {
      base: "Leeeet's gooom, $winner beat up $looser and won $points points! LEPSZY!",
      notEnoughtPoints: `@$username, you don't have enought poitns to enter this fight, LUL`,
    },
    alias: ["tak"],
  },
  {
    name: "nope",
    message: { base: "Hahahaha, $username runaway like a little kitty Kippa" },
    alias: ["nie", "pierdolsie"],
  },
  {
    name: "avadakedavra",
    message: { base: "Sirius Black says goodbay!" },
  },
  {
    name: "htfu",
    message: { base: "$username1 just spit on $username2 PepeSpit",
      onHimself: "$username1 just stip on himself, what a kitty",
    },
    alias: ["tfu"],
  },
  {
    name: "winrate",
    message: {
      base: "$username has $winrate winrate in $total soloes with $wins wins",
      winrateNegative: "$username is a looooser with $winrate winrate xD",
      fiftypercent: "$username has exacly 50% winrate, WOWOWOWOWOW",
    },
  },
];
