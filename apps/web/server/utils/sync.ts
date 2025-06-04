import ky from "ky";

const SYNC_URL = process.env.SYNC_URL || "http://localhost:5000";
const SYNC_KEY = process.env.SYNC_KEY || "verysecurekey";

export async function indicateSettingsSync(channel: number): Promise<void> {
  const url = `${SYNC_URL}/api/v1/unsafe/${channel}/settings/sync`;
  await ky.post(url, { json: { key: SYNC_KEY } });
}

export async function indicateAIModelsSync(): Promise<void> {
  const url = `${SYNC_URL}/api/v1/unsafe/aimodels/sync`;
  await ky.post(url, { json: { key: SYNC_KEY } });
}

export async function isLive(ch: string): Promise<boolean> {
  const url = `${SYNC_URL}/api/v1/unsafe/${ch}/islive`;
  const res = await ky.get(url).json<{ islive: boolean }>();
  return res.islive;
}

export async function indicateChannelsListUpdate(): Promise<void> {
  const url = `${SYNC_URL}/api/v1/unsafe/channelslistupdate`;
  await ky.get(url);
}
