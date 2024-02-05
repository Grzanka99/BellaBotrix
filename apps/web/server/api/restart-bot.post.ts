import { exec } from "child_process";

// NOTE: Quick one just to allow quick restart till better approach
const ALLOWED = ["cezary", "Trejekk"];

export default defineEventHandler(async (event) => {
  const auth = await requireAuthSession(event);

  if (!auth || !ALLOWED.includes(auth.data.username)) {
    throw createError({
      statusCode: 401,
    });
  }

  try {
    exec("systemctl restart bellatrix-bot", (err, stdout, stderr) => {
      if (err) {
        console.log(`error: ${err.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
  } catch (_) {
    return {
      message: "not-ok",
    };
  }

  return {
    message: "ok",
  };
});
