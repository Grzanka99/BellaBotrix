import { html } from "@elysiajs/html";
import staticPlugin from "@elysiajs/static";
import { Elysia } from "elysia";
import { prisma } from "services/db";
import {
  getChannelRefreshKey,
  validateToken,
} from "services/twitch-api/api-connector";
import { AuthForm } from "./components/auth/AuthForm";
import { AddCommand } from "./components/commands/AddCommand";
import { EditCommand } from "./components/commands/EditCommandForm";
import { SaveCommand } from "./components/commands/SaveCommand";
import { Layout } from "./components/layout";
import { TNewUiCommand, TSingleUiCommand } from "./types";

const app = new Elysia();

app.use(html());
app.use(
  staticPlugin({
    assets: "src/webui/public",
  }),
);

app.group("/panel", (panel) =>
  panel
    .get("/", Layout)
    .post(
      "/add-command",
      async (req) => await AddCommand(req.body as TNewUiCommand),
    )
    .post("/edit-command", (req) => EditCommand(req.body as TSingleUiCommand))
    .post("/save-command", async (req) =>
      SaveCommand(req.body as TSingleUiCommand),
    ),
);

app.get("/auth", AuthForm);
app.get("/", async (req) => {
  const code = req.query.code;
  const error = req.query.error;

  if (!code || error) {
    return new Response("Something went wrong");
  }

  const res = await getChannelRefreshKey(code);

  if (!res) {
    return new Response("Something went wrong");
  }

  const validated = await validateToken(res.access_token);

  if (!validated) {
    return new Response("Something went wrong");
  }

  await prisma.channel.upsert({
    where: {
      channel_id: validated.user_id,
    },
    update: {
      token: res.refresh_token,
    },
    create: {
      name: validated.login,
      channel_id: validated.user_id,
      token: res.refresh_token,
      enabled: true,
    },
  });

  return new Response("Authorized");
});

export function startWebui() {
  app.listen(Bun.env.WEBUI_PORT || 3000);
}
