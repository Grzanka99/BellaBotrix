import { Elysia } from "elysia";
import { handleAIModelsSync } from "lib/handle-aimodels-sync";
import { handleSettingsSync } from "lib/handle-settings-sync";

const SYNC_KEY = Bun.env.SYNC_KEY || "verysecurekey";
const app = new Elysia();

app.get("/", () => "Hello Elysia");
app.post("/settings/sync/:channel", ({ params, error, body }) => {
  const channel = Number(params.channel);
  const key = JSON.parse(body as string).key;

  if (!key || key !== SYNC_KEY) {
    return error(401);
  }

  handleSettingsSync(channel);

  return true;
});
app.post("/aimodels/sync", ({ error, body }) => {
  const key = JSON.parse(body as string).key;

  if (!key || key !== SYNC_KEY) {
    return error(401);
  }

  handleAIModelsSync();

  return true;
});

app.listen(5000);
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
