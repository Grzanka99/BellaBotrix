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
} as const;

export const R_USERS = {
  PREFIX: "/panel/users",
  ROOT: "/",
  LIST: "/htmx/list",
} as const;

export const R_SETTINGS = {
  PREFIX: "/panel/settings",
  ROOT: "/",
} as const;
