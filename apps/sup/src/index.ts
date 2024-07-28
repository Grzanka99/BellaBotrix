import { Elysia } from "elysia";
import { handleSettingsSync } from "lib/handle-settings-sync";

const SYNC_KEY = Bun.env.SYNC_KEY || "verysecurekey";
const app = new Elysia();

app.get("/", () => "Hello Elysia");
app.post("/settings/sync/:channel", ({ params, error, body }) => {
  const channel = Number(params.channel);
  const key = JSON.parse(body as string).key;

  handleSettingsSync(channel);

  if (!key || key !== SYNC_KEY) {
    return error(401);
  }
});

app.listen(5000);
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
