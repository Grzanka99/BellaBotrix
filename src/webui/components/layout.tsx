import { AddCommandForm } from "./panel/commands/AddCommandForm";
import { CommandsList } from "./panel/commands/CommandsList";

export const Layout = async () => (
  <html lang="en">
    <head>
      <title>Bellatrix Bot</title>
      <script src="https://unpkg.com/htmx.org@1.9.6" />
      <link rel="stylesheet" href="/public/index.css" />
      <style />
    </head>
    <body>
      <div>
        <h1>Commands</h1>
        {await CommandsList()}
        <AddCommandForm />
      </div>
    </body>
  </html>
);
