import { capitalize, type TOption } from "bellatrix";
import { R6DleOperators, type TR6DleOperator } from "r6dle";
import { interpolate } from "utils/interpolate-string";

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
  private currentOperator = "SLEDGE";

  constructor() {
    this.newOperator();
  }

  public isOperator(name: string): false | string {
    const res = this.operators.includes(name.toUpperCase());
    if (res) {
      return name.toUpperCase();
    }

    return false;
  }

  public diff(target: TR6DleOperator, guess: TR6DleOperator): string {
    let res = "";

    res += `[${matchState(target.sex, guess.sex)}] ${guess.sex} | `;
    res += `[${matchArray(target.role, guess.role)}] ${guess.role.join(", ")} | `;
    res += `[${matchState(target.side, guess.side)}] ${guess.side} | `;
    res += `[${matchState(target.continent, guess.continent)}] ${guess.continent} | `;
    res += `[${matchState(target.release_year, guess.release_year)}] ${guess.release_year + 2014}`;
    if (matchState(target.release_year, guess.release_year) === EState.Wrong) {
      res += target.release_year > guess.release_year ? "[up]" : "[down]";
    }
    res += " | ";
    res += `[${matchState(target.speed, guess.speed)}] ${guess.speed} speed`;
    return res;
  }

  public newOperator(): void {
    const rand = Math.floor(Math.random() * this.operators.length);
    console.log(this.operators[rand], rand);
    this.currentOperator = this.operators[rand];
  }

  public guess(name: string): TOption<{ response: Record<string, string>; correct: boolean }> {
    const current = R6DleOperators[this.currentOperator];
    const isOperator = this.isOperator(name);
    if (!isOperator) {
      return { response: { badOperator: name }, correct: false };
    }

    const chosen = R6DleOperators[isOperator];

    if (JSON.stringify(chosen) === JSON.stringify(current)) {
      this.newOperator();
      return {
        response: { name: capitalize(name) },
        correct: true,
      };
    }

    return { response: { diff: this.diff(current, chosen) }, correct: false };
  }
}
