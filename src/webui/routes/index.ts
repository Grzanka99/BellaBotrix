export const R_ROOT = "/";
export const R_PANEL = "/panel";
export const R_AUTH = "/auth";

export const R_COMMANDS = {
  PREFIX: "/panel/commands",
  ROOT: "/",
  ADD: "/htmx/add",
  EDIT: "/htmx/edit",
  SAVE: "/htmx/save",
  DELETE: "/htmx/delete",
  CANCEL: "/htmx/cancel",
} as const;

export const R_SOLO = {
  PREFIX: "/panel/solo",
  ROOT: "/",
  LIST: "/htmx/list",
  CLOSE: "/htmx/close",
} as const;

export const R_USERS = {
  PREFIX: "/panel/users",
  ROOT: "/",
  LIST: "/htmx/list",
} as const;

export const R_SETTINGS = {
  PREFIX: "/panel/settings",
  ROOT: "/",
  UPDATE: "/htmx/update",
  RESET: "/htmx/reset",
  FORM: "htmx/settings",
} as const;

export const R_LOGIN = {
  PREFIX: "/login",
  ROOT: "/",
  LOGIN_AUTH: "/auth",
  REGISTER: "/register",
  REGISTER_AUTH: "/register/auth",
  LOGOUT: "/logout",
} as const;
