import { AutomodAI } from "./aiautomod";

const truescams2 = [
  "Best Viewers and Followers on StreamBoo .com ( cutt.ly/rw5dSmCO )",
  "Best viewers on urlr.me/JWkxg",
  "Best viewers on ***",
  "Best Viewers on castachart.com",
  "Best viewers on breezi.info/plax",
  "Best vie̮wers on happyjudi77.info/tk8p",
  "Best viewers on hialeahgardenskarate.com/gyv9",
  "Best viewers on cutt.ly/GePIC3Og  @j06SqnR9",
  "Best viewers on  streamboo .com (remove the space)  @dYioGhDy",
  "Bestͮ vie͐wers ̷on streamboo .com (remove the space)",
  "Che̢ap vie̮wers on",
  "Best viewers on instantviewers.ru",
  "Best V̐iewers ͚on followersnetwork.ru  @BOhs6Ww6",
  "Cheap V̐iewers ͚on hugefollowers.ru  @39YwqlM7",
  "Cheap V̐iewers ͚on rapidfollowers.ru  @1KX1Bc8t",
  "Best V̐iewers ͚on followandgrow.ru  @ChrW9Xm9",
  "Wanna become famous? Buy followers, primes and views",
];

export class AntispamAI {
  private automodai: AutomodAI;

  static #instance: AntispamAI;

  private constructor() {
    this.automodai = AutomodAI.instance;
  }

  public static get instance(): AntispamAI {
    if (AntispamAI.#instance) {
      return AntispamAI.#instance;
    }

    AntispamAI.#instance = new AntispamAI();
    return AntispamAI.#instance;
  }

  private async checkForSpam(msg: string) {
    const system = [
      `You are an AI mod on twitch channel.
  If message that you scan is a scam, advertisement, viewers buy site or suspicious link, reply "true",
  If message is safe reply "false",
  reply only "true" or "false",`,
      "Allow vulgar messages, dissablow only scams",
      "Messages in polish or starting with explonation mark are likely ok",
      "ts is means teamspeak and its fine",
      "L4 is sick leave and its fine",
      "Memes and emojis and thinks like LUL, XD etc are fine",
      "Do not mark provocative messages or troll messages as scams",
      `Example scam and spam messages: ${truescams2}`,
    ];

    const res = await this.automodai.ask(msg, system);

    return res === "true";
  }

  public async isMessageSpam(msg: string): Promise<boolean> {
    const res1 = await this.checkForSpam(msg);

    return res1;
  }
}
