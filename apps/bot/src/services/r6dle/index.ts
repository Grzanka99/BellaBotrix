import { capitalize, type TOption } from "bellatrix";
import type { TR6dleOperatorV2 } from "r6dle";
import { prisma, prismaQueue } from "services/db";
import { logger } from "utils/logger";

enum EState {
  Partial = "partial",
  Wrong = "wrong",
  Ok = "ok",
}

// NOTE: match array only for r6dle purposes
function matchArray(target: string[], guess: string[]): EState {
  let matches = 0;
  for (const el of guess) {
    if (target.includes(el)) {
      matches += 1;
    }
  }

  if (matches === target.length) {
    return EState.Ok;
  }

  if (matches > 0) {
    return EState.Partial;
  }

  return EState.Wrong;
}

function matchState(target: string | number, guess: string | number): EState {
  return target === guess ? EState.Ok : EState.Wrong;
}

export class R6Dle {
  private fullOperators: TR6dleOperatorV2[] = [];
  private operators: string[] = [];
  private _currentOperator: string | undefined = undefined;
  private _gameId: number | undefined = undefined;
  private channel: string;

  constructor(channel: string) {
    this.channel = channel;
    this.fetchOperators()
      .then(() => {
        this.loadGame().then(([operator, gameid]) => {
          this._currentOperator = operator;
          this._gameId = gameid;
        });
      })
      .then(() => {
        logger.info("Setting interval to refresh R6Dle operators for 60 seconds");
        setInterval(async () => {
          await this.fetchOperators();
        }, 60_000);
      });
  }

  private async fetchOperators(): Promise<void> {
    logger.info("Fetching R6Dle operators");
    const res = await prisma.r6DleOperators.findMany();

    const mapped = res.map((el) => ({ ...el, role: el.role.split(",") }) as TR6dleOperatorV2);

    this.fullOperators = mapped;
    this.operators = mapped.map((el) => el.name.toUpperCase());
    logger.info(`Loaded ${this.operators.length} operators`);
  }

  private isOperator(name: string): false | string {
    const res = this.operators.includes(name.toUpperCase());
    if (res) {
      return name.toUpperCase();
    }

    return false;
  }

  private diff(target: TR6dleOperatorV2, guess: TR6dleOperatorV2): string {
    let res = "";

    res += `_${matchState(target.gender, guess.gender)}_ ${guess.gender} | `;
    res += `_${matchArray(target.role, guess.role)}_ ${guess.role.join(", ")} | `;
    res += `_${matchState(target.side, guess.side)}_ ${guess.side} | `;

    if (
      matchState(target.region, guess.region) === EState.Ok &&
      matchState(target.country, guess.country) === EState.Ok
    ) {
      res += `_${EState.Ok}_ ${guess.country} | `;
    } else if (
      matchState(target.region, guess.region) === EState.Ok &&
      !(matchState(target.country, guess.country) === EState.Ok)
    ) {
      res += `_${EState.Partial}_ ${guess.country} | `;
    } else {
      res += `_${EState.Wrong}_ ${guess.country} | `;
    }

    res += `_${matchState(target.squad, guess.squad)}_ ${guess.squad} | `;
    res += `_${matchState(target.release, guess.release)}_ ${guess.release}`;
    if (matchState(target.release, guess.release) === EState.Wrong) {
      res += target.release > guess.release ? " _up_" : " _down_";
    }
    res += " | ";
    res += `_${matchState(target.speed, guess.speed)}_ ${guess.speed} speed`;
    return res;
  }

  private async loadGame(): Promise<[string, number]> {
    logger.info(`Loading r6dle game for channel ${this.channel}`);
    const res = await prismaQueue.enqueue(() =>
      prisma.r6DleGame.findFirst({
        where: { channel: this.channel, inProgress: true },
      }),
    );

    if (!res) {
      logger.info(`None r6dle game found for channel ${this.channel}`);
      const newGame = await this.newGame();
      return newGame;
    }

    logger.info(`Game r6dle of id ${res.id} for channel ${this.channel} loaded`);
    return [res.operator, res.id];
  }

  public async newGame(): Promise<[string, number]> {
    logger.info(`Creating new r6dle game for channel ${this.channel}`);
    const rand = Math.floor(Math.random() * this.operators.length);

    const newGame = await prismaQueue.enqueue(() =>
      prisma.r6DleGame.create({
        data: {
          operator: this.operators[rand],
          channel: this.channel,
          inProgress: true,
        },
      }),
    );

    logger.info(`New r6dle game with id: ${newGame.id} for channel ${this.channel} created`);

    return [newGame.operator, newGame.id];
  }

  public async startNewGame(): Promise<void> {
    const [operator, gameid] = await this.newGame();
    this._currentOperator = operator;
    this._gameId = gameid;
  }

  public async endGame(player: string): Promise<void> {
    try {
      await prismaQueue.enqueue(() =>
        prisma.r6DleGame.update({
          where: { id: this.gameId },
          data: { inProgress: false, winner: player },
        }),
      );
    } catch (_) {}
  }

  public async guess(
    name: string,
    player: string,
  ): Promise<TOption<{ response: Record<string, string>; correct: boolean }>> {
    if (!this.currentOperator || !this.gameId) {
      return;
    }

    const current = this.fullOperators.find((el) => el.name.toUpperCase() === this.currentOperator);
    if (!current) {
      return { response: { error: "Something went wrong" }, correct: false };
    }
    console.log(this.currentOperator);
    const isOperator = this.isOperator(name);
    if (!isOperator) {
      return { response: { badOperator: name }, correct: false };
    }

    const chosen = this.fullOperators.find((el) => el.name.toUpperCase() === isOperator);

    if (!chosen) {
      return { response: { badOperator: isOperator }, correct: false };
    }

    if (JSON.stringify(chosen) === JSON.stringify(current)) {
      await prismaQueue.enqueue(async () => {
        if (!this.gameId) {
          return undefined;
        }
        return await prisma.r6DleGuessHistory.create({
          data: {
            gameId: this.gameId,
            player: player,
            guess: isOperator,
            correctGuess: true,
          },
        });
      });
      await this.endGame(player);

      return {
        response: { operator: capitalize(name) },
        correct: true,
      };
    }

    prismaQueue.enqueue(async () => {
      if (!this.gameId) {
        return;
      }

      return await prisma.r6DleGuessHistory.create({
        data: {
          gameId: this.gameId,
          player: player,
          guess: isOperator,
          correctGuess: false,
        },
      });
    });
    return { response: { diff: this.diff(current, chosen) }, correct: false };
  }

  public get currentOperator() {
    return this._currentOperator;
  }

  public get gameId() {
    return this._gameId;
  }
}
