export function parseBadges(badges: string[]): Record<string, boolean> {
  const decoded: Record<string, boolean> = {};

  for (let i = 0; i < badges.length; i++) {
    const [badge, status] = badges[i].split("/");
    decoded[badge] = status === "1";
  }

  return decoded;
}
