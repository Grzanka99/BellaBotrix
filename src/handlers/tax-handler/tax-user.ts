import {  TTaxValues,  } from "handlers/types";

const TAX_AMOUNT = 25;
const TAX_COLLERCTOR = "@Trejekk";

export function prepareTaxMessages(tax: TTaxValues): [string, string] {
  const taxValue = Math.ceil(tax.points * (TAX_AMOUNT / 100));

  const removePoints = `!removepoints ${tax.winningUser} ${taxValue}`;
  const givePoints = `!addpoints ${TAX_COLLERCTOR} ${taxValue}`;

  return [removePoints, givePoints];
}
