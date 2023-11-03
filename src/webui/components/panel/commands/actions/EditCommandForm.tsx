import { Context } from "elysia";
import { dbCommandToCommand } from "services/commands/commands.transform";
import { prisma } from "services/db";
import { CommandFromDBSchema, CommandSchema } from "types/schema/commands.schema";
import { R_COMMANDS } from "webui/routes";
import { getCommandFromDbByUniqueName } from "../helpers";

type TBody = {
  uniqueName: string | undefined;
};

export const EditCommand = async (ctx: Context) => {
  const { uniqueName } = ctx.body as TBody;

  if (!uniqueName) {
    ctx.set.status = "Bad Request";
    return;
  }

  const data =await  getCommandFromDbByUniqueName(uniqueName);

  if (!data) {
    ctx.set.status = "Internal Server Error";
    return;
  }

  return (
    <ul id={`command-row-${data.name}`} class="command-row--edit-mode">
      <input type="hidden" name="uniqueName" value={uniqueName} />
      <li>{data.name}</li>
      <li>
        <input type="checkbox" name="enabled" checked={data.enabled} />
      </li>
      <li class="command-row__messages">
        <ul class="command-row__messages__msg-list">
          {Object.keys(data.message).map((key) => (
            <li>
              <code>{key}</code>
              <textarea name={`message.${key}`}>{data.message[key] || ""}</textarea>
            </li>
          ))}
        </ul>
      </li>
      <li>
        <input type="text" value={data.alias ? data.alias.join(", ") : ""} name="alias" />
      </li>
      <li>
        <button
          type="button"
          hx-post={`${R_COMMANDS.PREFIX}${R_COMMANDS.SAVE}`}
          hx-target={`#command-row-${data.name}`}
          hx-swap="outerHTML"
          hx-include={`#command-row-${data.name}`}
        >
          save
        </button>
      </li>
      <li>
        <button
          type="button"
          hx-post={`${R_COMMANDS.PREFIX}${R_COMMANDS.CANCEL}`}
          hx-target={`#command-row-${data.name}`}
          hx-swap="outerHTML"
          hx-include={`#command-row-${data.name}`}
        >
          cancel
        </button>
      </li>
    </ul>
  );
};
