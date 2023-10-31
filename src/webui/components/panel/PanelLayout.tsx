import { R_COMMANDS, R_SETTINGS, R_SOLO, R_USERS } from "webui/routes";

type TPathPrefix =
  | typeof R_COMMANDS.PREFIX
  | typeof R_SETTINGS.PREFIX
  | typeof R_SOLO.PREFIX
  | typeof R_USERS.PREFIX;

type TPanelLayoutProps = {
  children?: JSX.Element;
  headers?: JSX.Element;
  current?: TPathPrefix;
};

type THeaderLinkProps = {
  href: string;
  text: string;
  current: TPathPrefix;
};

const HeaderLink = ({ href, text, current }: THeaderLinkProps) => {
  return (
    <li
      class={`panel-header__item ${
        current.length && href.startsWith(current) ? "panel-header__item--active" : ""
      }`}
    >
      <a href={href}>{text}</a>
    </li>
  );
};

export const PanelLayout = ({
  children,
  // @ts-ignore
  current = "",
  headers,
}: TPanelLayoutProps): JSX.Element => {
  return (
    <html lang="en">
      <head>
        <title>Bellatrix Bot</title>
        <script src="https://unpkg.com/htmx.org@1.9.6" />
        <link rel="stylesheet" href="/public/index.css" />
        <link rel="stylesheet" href="/public/panel-layout.css" />
        <link rel="stylesheet" href="/public/table.css" />
        {headers}
        <style />
      </head>
      <body>
        <header class="panel-header">
          <ul class="panel-header__list">
            <HeaderLink
              href={`${R_COMMANDS.PREFIX}${R_COMMANDS.ROOT}`}
              text="commands"
              current={current}
            />
            <HeaderLink href={`${R_SOLO.PREFIX}${R_SOLO.ROOT}`} text="solo" current={current} />
            <HeaderLink href={`${R_USERS.PREFIX}${R_USERS.ROOT}`} text="users" current={current} />
            <HeaderLink
              href={`${R_SETTINGS.PREFIX}${R_SETTINGS.ROOT}`}
              text="settings"
              current={current}
            />
            <HeaderLink href="/auth" text="authorize" current={current} />

            <HeaderLink href="/logout" text="logout" current={current} />
          </ul>
        </header>
        <main class="panel-content">{children}</main>
      </body>
    </html>
  );
};
