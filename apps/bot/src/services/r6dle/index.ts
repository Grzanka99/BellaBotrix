import { capitalize, type TOption } from "bellatrix";
import { R6DleOperators, type TR6DleOperator } from "r6dle";
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
  private operators = Object.keys(R6DleOperators).map((el) => el.toUpperCase());
  private _currentOperator: string | undefined = undefined;
  private _gameId: number | undefined = undefined;
  private channel: string;

  constructor(channel: string) {
    this.channel = channel;
    this.loadGame().then(([operator, gameid]) => {
      this._currentOperator = operator;
      this._gameId = gameid;
    });
  }

  private isOperator(name: string): false | string {
    const res = this.operators.includes(name.toUpperCase());
    if (res) {
      return name.toUpperCase();
    }

    return false;
  }

  private diff(target: TR6DleOperator, guess: TR6DleOperator): string {
    let res = "";

    res += `_${matchState(target.sex, guess.sex)}_ ${guess.sex} | `;
    res += `_${matchArray(target.role, guess.role)}_ ${guess.role.join(", ")} | `;
    res += `_${matchState(target.side, guess.side)}_ ${guess.side} | `;
    res += `_${matchState(target.continent, guess.continent)}_ ${guess.continent} | `;
    res += `_${matchState(target.release_year, guess.release_year)}_ ${guess.release_year + 2014}`;
    if (matchState(target.release_year, guess.release_year) === EState.Wrong) {
      res += target.release_year > guess.release_year ? "_up_" : " _down_";
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
    const current = R6DleOperators[this.currentOperator];
    const isOperator = this.isOperator(name);
    if (!isOperator) {
      return { response: { badOperator: name }, correct: false };
    }

    const chosen = R6DleOperators[isOperator];

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
