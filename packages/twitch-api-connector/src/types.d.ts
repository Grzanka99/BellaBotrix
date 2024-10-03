import { z } from "zod";

export type TResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
    };

export const SWrappedResponse = <T>(t: z.ZodType<T>) =>
  z.object({
    data: t,
    pagination: z.record(z.string()),
    total: z.number(),
  });

export type TWrappedResponse<T> = {
  data: T;
  pagination: Record<string, string>;
  total?: number;
};
