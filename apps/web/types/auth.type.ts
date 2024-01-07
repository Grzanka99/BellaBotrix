import type { User, WebuiUser } from "@prisma/client";
import { z } from "zod";

export type TChatUser = User;
export type TUser = WebuiUser;

export const SDtoUser = z.object({
  username: z.string(),
  password: z.string(),
});
export type TDtoUser = z.infer<typeof SDtoUser>;

export type TAuthSession = {
  id: number;
  username: string;
};
