const SYNC_URL = process.env.SYNC_URL || "http://localhost:5000";
const SYNC_KEY = process.env.SYNC_KEY || "verysecurekey";

export async function indicateSettingsSync(channel: number): Promise<void> {
  const url = `${SYNC_URL}/settings/sync/${channel}`;

  await fetch(url, {
    method: "POST",
    body: `{"key": "${SYNC_KEY}"}`,
  });
}
