import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { Layout } from "./components/layout";
import { AddCommand } from "./components/commands/AddCommand";

const app = new Elysia();

app.use(html());
app.get("/panel", Layout);
app.post("/panel/add-command", async (req) => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return await AddCommand(req.body as any);
});

app.listen(3000);
