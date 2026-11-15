import type { Elysia, MergeSchema, UnwrapRoute } from "elysia";

// The instance type that `new Elysia().group(prefix, run)` passes to `run`.
// `group()` joins the prefix with a leading "/".
export type TGroupApp<Prefix extends string> = Elysia<
  `/${Prefix}`,
  { decorator: {}; store: {}; derive: {}; resolve: {} },
  { typebox: {}; error: {} },
  {
    schema: MergeSchema<UnwrapRoute<{}, {}>, {}>;
    standaloneSchema: UnwrapRoute<{}, {}>;
    macro: {};
    macroFn: {};
    parser: {};
    response: {};
  }
>;
