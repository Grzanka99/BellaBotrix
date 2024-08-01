import type { TAuthSession } from "~/types/auth.type";
import type { TPerms } from "~/types/permissions.type";

export async function getUserPerms(authData: TAuthSession): Promise<TPerms[]> {
  if (!authData.id) {
    return [];
  }

  const res = await prisma.webuiUser.findUnique({
    where: { id: Number(authData.id) },
    select: { perms: true },
  });

  if (!res) {
    return [];
  }

  return res.perms.split(",") as TPerms[];
}

export function checkPerms(userRoles: TPerms[], requiredRoles: TPerms[]): boolean {
  for (const role of requiredRoles) {
    if (userRoles.includes(role)) {
      return true;
    }
  }

  return false;
}
