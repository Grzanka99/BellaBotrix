import { html } from "@elysiajs/html";
import staticPlugin from "@elysiajs/static";
import { Elysia, t } from "elysia";
import { prisma } from "services/db";
import { getChannelRefreshKey, validateToken } from "services/twitch-api/api-connector";
import { AuthForm } from "./components/auth/AuthForm";
import { LoginForm } from "./components/login/LoginForm";
import { RegisterForm } from "./components/login/RegisterForm";
import { loginAuth } from "./components/login/login-auth";
import { registerAuth } from "./components/login/register-auth";
import { PanelLayout } from "./components/panel/PanelLayout";
import { CommandsLayout } from "./components/panel/commands/CommandsLayout";
import { AddCommand } from "./components/panel/commands/actions/AddCommand";
import { DeleteCommand } from "./components/panel/commands/actions/DeleteCommand";
import { EditCommand } from "./components/panel/commands/actions/EditCommandForm";
import { SaveCommand } from "./components/panel/commands/actions/SaveCommand";
import { UsersLayout } from "./components/panel/users/UsersLayout";
import { R_COMMANDS, R_USERS } from "./routes";
import { TNewUiCommand, TSingleUiCommand } from "./types";
import { SingleChannelUserList } from "./components/panel/users/SingleChannelUsers";
import { CancelCommand } from "./components/panel/commands/actions/CancelCommand";

const UNAUTHORIZED = "Unauthorized";

const app = new Elysia();

app.use(html());
app.use(
  staticPlugin({
    assets: "src/webui/public",
  }),
);

app.get("/login", LoginForm);
app.post("/login/auth", loginAuth);
app.get("/login/register", RegisterForm);
app.post("/login/register/auth", registerAuth);

app.guard(
  {
    beforeHandle: async (req) => {
      const authCookie = req.cookie.auth.value as {
        username?: string;
        key?: string;
      };

      if (!authCookie || !authCookie.username || !authCookie.key) {
        req.set.redirect = "/login";
        return UNAUTHORIZED;
      }

      const res = await prisma.webuiUser.findUnique({ where: { username: authCookie.username } });
      if (!res) {
        req.set.redirect = "/login";
        return UNAUTHORIZED;
      }

      if (res.token !== authCookie.key) {
        req.set.redirect = "/login";
        return UNAUTHORIZED;
      }
    },
  },
  (app) => {
    app.get("/panel", () => <PanelLayout />);

    app.group(R_COMMANDS.PREFIX, (commands) =>
      commands
        .get(R_COMMANDS.ROOT, CommandsLayout)
        .post(R_COMMANDS.ADD, async (req) => await AddCommand(req.body as TNewUiCommand))
        .post(R_COMMANDS.EDIT, (req) => EditCommand(req.body as TSingleUiCommand))
        .post(R_COMMANDS.SAVE, async (req) => SaveCommand(req.body as TSingleUiCommand))
        .post(R_COMMANDS.DELETE, async (req) => DeleteCommand(req.body as TSingleUiCommand))
        .post(R_COMMANDS.CANCEL, async (req) => CancelCommand(req.body as TSingleUiCommand)),
    );

    app.group(R_USERS.PREFIX, (users) =>
      users
        .get(R_USERS.ROOT, UsersLayout)
        .get(R_USERS.LIST, async (ctx) => await SingleChannelUserList(ctx)),
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

    return app;
  },
);

export function startWebui() {
  app.listen(Bun.env.WEBUI_PORT || 3000);
}
