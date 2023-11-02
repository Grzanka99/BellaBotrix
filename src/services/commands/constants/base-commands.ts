type TCommand = {
  name: string;
  message: string;
  alias?: string;
};

export const BASE_COMMANDS: TCommand[] = [
  {
    name: "addpoints",
    message: "$username just received $points points and now have bit more Kappa",
  },
  {
    name: "removepoints",
    message: "$username just was robbed of $points points and now have bit less LUL",
  },
  {
    name: "points",
    message: "$username has $points points",
    alias: "punkty, punkciki",
  },
  {
    name: "gamble",
    message:
      "$username rolled $rolled and $result $points points and now have $total points DinoDance",
  },
  {
    name: "solo",
    message:
      "Hey, $username2, $username1 want to fight with you for $points points, will you accept the challenge with !yes, or run away like little cat with !nope?",
  },
  {
    name: "yes",
    message: "Leeeet's gooom, $winner beat up $looser and won $points points! LEPSZY!",
    alias: "tak",
  },
  {
    name: "nope",
    message: "Hahahaha, $username runaway like a little kitty Kippa",
    alias: "nie, pierdolsie",
  },
  {
    name: "avadakedavra",
    message: "Sirius Black says goodbay!",
  },
  {
    name: "htfu",
    message: "$username1 just spit on $username2 PepeSpit",
    alias: "tfu",
  },
  {
    name: "winrate",
    message: "$username has $winrate winrate in $total soloes with $wins wins",
  },
];
