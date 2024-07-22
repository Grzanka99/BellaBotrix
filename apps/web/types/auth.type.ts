import type { User, WebuiUser } from "@prisma/client";
import { z } from "zod";
import type { TPerms } from "./permissions.type";

export type TChatUser = User;
export type TUser = WebuiUser;

export const SDtoUser = z.object({
  username: z.string().min(5).max(20),
  password: z.string().min(5).max(50),
});
export type TDtoUser = z.infer<typeof SDtoUser>;

export const SDtoCreateUser = SDtoUser.extend({ regToken: z.string().min(1) });
export type TDtoCreateUser = z.infer<typeof SDtoCreateUser>;

export type TAuthSession = {
  id: number;
  username: string;
  channelId: number;
  perms: TPerms[];
};
