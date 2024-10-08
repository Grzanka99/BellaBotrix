const SYNC_URL = process.env.SYNC_URL || "http://localhost:5000";
const SYNC_KEY = process.env.SYNC_KEY || "verysecurekey";

export async function indicateSettingsSync(channel: number): Promise<void> {
  const url = `${SYNC_URL}/settings/sync/${channel}`;

  await fetch(url, {
    method: "POST",
    body: `{"key": "${SYNC_KEY}"}`,
  });
}

export async function indicateAIModelsSync(): Promise<void> {
  const url = `${SYNC_URL}/aimodels/sync`;

  await fetch(url, {
    method: "POST",
    body: `{"key": "${SYNC_KEY}"}`,
  });
}

export async function isLive(ch: string): Promise<boolean> {
  const url = `${SYNC_URL}/islive/${ch}`;

  const res = await (await fetch(url)).json();

  if (typeof res === "boolean" && res) {
    return true;
  }

  return false;
}
