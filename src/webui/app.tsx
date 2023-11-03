import { html } from "@elysiajs/html";
import staticPlugin from "@elysiajs/static";
import { Elysia, t } from "elysia";
import { prisma } from "services/db";
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
import {
  R_AUTH,
  R_COMMANDS,
  R_LOGIN,
  R_PANEL,
  R_ROOT,
  R_SETTINGS,
  R_SOLO,
  R_USERS,
} from "./routes";
import { TNewUiCommand, TSingleUiCommand, TSingleUiSoloReq } from "./types";
import { SingleChannelUserList } from "./components/panel/users/SingleChannelUsers";
import { CancelCommand } from "./components/panel/commands/actions/CancelCommand";
import { SoloLayout } from "./components/panel/solo/SoloLayout";
import { SoloListContent } from "./components/panel/solo/SoloListContent";
import { SoloClose } from "./components/panel/solo/SoloClose";
import { logger } from "utils/logger";
import { authorizeApp } from "./services/authapp.service";
import { SettingsLayout } from "./components/panel/settings/SettingsLyaout";
import { UpdateSettings } from "./components/panel/settings/UpdateSettings";
import { CommandsList } from "./components/panel/commands/CommandsList";

const UNAUTHORIZED = "Unauthorized";

const app = new Elysia();

app.use(html());
app.use(
  staticPlugin({
    assets: "src/webui/public",
  }),
);

app.group(R_LOGIN.PREFIX, (login) =>
  login
    .get(R_LOGIN.ROOT, LoginForm)
    .post(R_LOGIN.LOGIN_AUTH, loginAuth)
    .get(R_LOGIN.REGISTER, RegisterForm)
    .post(R_LOGIN.REGISTER_AUTH, registerAuth),
);

app.get("/logout", (ctx) => {
  ctx.cookie.auth.value = undefined;
  ctx.set.redirect = "/login";
});

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
    app.get(R_PANEL, () => <PanelLayout />);

    app.group(R_COMMANDS.PREFIX, (commands) =>
      commands
        .get(R_COMMANDS.ROOT, CommandsLayout)
        .post(R_COMMANDS.ADD,AddCommand)
        .post(R_COMMANDS.EDIT, EditCommand)
        .post(R_COMMANDS.SAVE, SaveCommand)
        .post(R_COMMANDS.DELETE, DeleteCommand)
        .post(R_COMMANDS.CANCEL, CancelCommand)
        .get(R_COMMANDS.LIST, CommandsList),
    );

    app.group(R_USERS.PREFIX, (users) =>
      users
        .get(R_USERS.ROOT, UsersLayout)
        .get(R_USERS.LIST, async (ctx) => await SingleChannelUserList(ctx)),
    );

    app.group(R_SOLO.PREFIX, (solo) =>
      solo
        .get(R_SOLO.ROOT, SoloLayout)
        .get(R_SOLO.LIST, async (ctx) => await SoloListContent(ctx))
        .post(R_SOLO.CLOSE, async (ctx) => SoloClose(ctx.body as TSingleUiSoloReq)),
    );

    app.group(R_SETTINGS.PREFIX, (settings) =>
      settings.get(R_SETTINGS.ROOT, SettingsLayout).post(R_SETTINGS.UPDATE, UpdateSettings),
    );

    app.get(R_AUTH, AuthForm);
    app.get(R_ROOT, authorizeApp);

    return app;
  },
);

export function startWebui() {
  app.listen(Bun.env.WEBUI_PORT || 3000);
  logger.info(`WebUI Started at ${Bun.env.WEBUI_PORT || 3000}`);
}
