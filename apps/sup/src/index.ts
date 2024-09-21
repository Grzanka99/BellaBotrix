import { Elysia } from "elysia";
import { APIV1_UNSAFE_GROUP } from "routes/unsafe/types";
import { UnsafeRoutes } from "routes/unsafe";
import { APIV1_SAFE_GROUP } from "routes/protected/types";
import { ProtectedRoutes } from "routes/protected";

const app = new Elysia();

app.group(APIV1_UNSAFE_GROUP, UnsafeRoutes);
app.group(APIV1_SAFE_GROUP, ProtectedRoutes);

app.listen(5000);
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
