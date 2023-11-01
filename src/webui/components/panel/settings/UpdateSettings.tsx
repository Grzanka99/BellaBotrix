import { Context } from "elysia";
import { SettingsForm } from "./SettingsForm";
import { getSettings, updateSettings } from "services/settings";
import { SettingSchema, SettingUpdateSchema } from "types/schema/settings.schema";

const dbfc = (v: "on" | "off" | undefined) => v === "on";

export const UpdateSettings = async (ctx: Context) => {
  const username = String(ctx.cookie.auth.value.username);
  const settings = await getSettings(username);

  const beforeTransform = SettingUpdateSchema.safeParse(ctx.body);
  if (!beforeTransform.success) {
    return await SettingsForm(ctx, true);
  }

  const { data } = beforeTransform;

  try {
    settings.commands.value = dbfc(data.commands);

    settings.joinMessage.forAllUsers.enabled.value = dbfc(data["joinMessage.forAllUsers.enabled"]);
    settings.joinMessage.forAllUsers.message.value = data["joinMessage.forAllUsers.message"];
    settings.joinMessage.forSpecificUsers.enabled.value = dbfc(
      data["joinMessage.forSpecificUsers.enabled"],
    );
    settings.joinMessage.forSpecificUsers.message.value =
      data["joinMessage.forSpecificUsers.message"];
    settings.joinMessage.forSpecificUsers.users.value = data["joinMessage.forSpecificUsers.users"]
      .split(",")
      .map((e) => e.trim());

    settings.points.enabled.value = dbfc(data["points.enabled"]);
    settings.points.autoIncrement.value = data["points.autoIncrement"];
    settings.points.chancesOffset.value = data["points.chancesOffset"];
    settings.points.pointsPerMessage.value = data["points.pointsPerMessage"];

    settings.automod.emotesLimit.enabled.value = dbfc(data["automod.emotesLimit.enabled"]);
    settings.automod.emotesLimit.limit.value = data["automod.emotesLimit.limit"];
    settings.automod.emotesLimit.sanctions.value = JSON.parse(
      data["automod.emotesLimit.sanctions"],
    );
    settings.automod.emotesLimit.warningMessage.value = data["automod.emotesLimit.warningMessage"];
    settings.automod.emotesLimit.banMessage.value = data["automod.emotesLimit.banMessage"];

    const parsed = SettingSchema.safeParse(settings);

    if (!parsed.success) {
      return await SettingsForm(ctx, true);
    }


    const res = await updateSettings(username, parsed.data);

    if (!res) {
      return await SettingsForm(ctx, true);
    }

    return await SettingsForm(ctx);
  } catch (e) {
    return await SettingsForm(ctx, true);
  }
};
