import { z } from "zod";

const SPerms = z.union([
  z.literal("user"),
  z.literal("moderator"),
  z.literal("r6dleadmin"),
  z.literal("admin"),
  z.literal("ai"),
  z.literal("ai+"),
]);

export type TPerms = z.infer<typeof SPerms> | (string & {});

export type TPermissionEntry = {
  id: number;
  username: string;
  perms: TPerms[];
  channel: string | undefined;
};

export const SUpdatePermissionsDto = z.object({
  id: z.number(),
  perms: z.array(SPerms),
});

export type TUpdatePermissionsDto = z.infer<typeof SUpdatePermissionsDto>;
