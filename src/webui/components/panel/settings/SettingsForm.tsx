import { Context } from "elysia";
import { getSettings } from "services/settings";
import { TSettingOption } from "types/schema/settings.schema";
import { R_SETTINGS } from "webui/routes";

type TFormSectionProps = {
  name: string;
  children: JSX.Element | JSX.Element[];
};

type TLabelProps = {
  children: JSX.Element;
  label: string;
} & Omit<TSettingOption<unknown>, "value">;

const FormSection = ({ name, children }: TFormSectionProps) => (
  <section class="settings-form__section">
    <h3>{name}</h3>
    <div>{children}</div>
  </section>
);

const AdvancedInput = ({ children, vars, description, label }: TLabelProps) => (
  <div class="settings-form__ainput">
    <label class="settings-form__ainput__label">
      <div class="settings-form__ainput__label__label">{label}</div>
      <div class="settings-form__ainput__label__input">{children}</div>
    </label>
    <div class="settings-form__ainput__info">
      <div class="settings-form__ainput__info__desc">{description}</div>
      {vars ? (
        <code class="settings-form__ainput__info__vars">
          {Object.keys(vars).map((v) => (
            <span title={vars[v]}>${v}</span>
          ))}
        </code>
      ) : undefined}
    </div>
  </div>
);

export const SettingsForm = async (ctx: Context, error = false) => {
  const username = String(ctx.cookie.auth.value.username);
  const settings = await getSettings(username);

  return (
    <form
      class="settings-form"
      id="settings-form"
      hx-post={`${R_SETTINGS.PREFIX}${R_SETTINGS.UPDATE}`}
      hx-swap="outerHTML"
    >
      <button class="settings-form__save-button" type="submit">
        SAVE
      </button>

      {error ? <h2>Error occured when saving settings</h2> : undefined}

      <FormSection name="Commands">
        <AdvancedInput label="Enabled" {...settings.commands.enabled}>
          <input type="checkbox" name="commands.enabled" checked={settings.commands.enabled.value} />
        </AdvancedInput>
        <AdvancedInput label="Prefix" {...settings.commands.prefix}>
          <input type="text" name="commands.prefix" value={settings.commands.prefix.value} />
        </AdvancedInput>
      </FormSection>
      <FormSection name="Joning Messages">
        <AdvancedInput label="Enable for all users" {...settings.joinMessage.forAllUsers.enabled}>
          <input
            type="checkbox"
            name="joinMessage.forAllUsers.enabled"
            checked={settings.joinMessage.forAllUsers.enabled.value}
          />
        </AdvancedInput>
        <AdvancedInput label="Message to all users" {...settings.joinMessage.forAllUsers.message}>
          <textarea name="joinMessage.forAllUsers.message">
            {settings.joinMessage.forAllUsers.message.value}
          </textarea>
        </AdvancedInput>
        <AdvancedInput
          label="Enable for specific users"
          {...settings.joinMessage.forSpecificUsers.enabled}
        >
          <input
            type="checkbox"
            name="joinMessage.forSpecificUsers.enabled"
            checked={settings.joinMessage.forSpecificUsers.enabled.value}
          />
        </AdvancedInput>
        <AdvancedInput
          label="Message to specific users"
          {...settings.joinMessage.forSpecificUsers.message}
        >
          <textarea name="joinMessage.forSpecificUsers.message">
            {settings.joinMessage.forSpecificUsers.message.value}
          </textarea>
        </AdvancedInput>
        <AdvancedInput label="List of users" {...settings.joinMessage.forSpecificUsers.users}>
          <textarea name="joinMessage.forSpecificUsers.users">
            {settings.joinMessage.forSpecificUsers.users.value.join(", ")}
          </textarea>
        </AdvancedInput>
      </FormSection>
      <FormSection name="Points">
        <AdvancedInput label="enabled" {...settings.points.enabled}>
          <input type="checkbox" name="points.enabled" checked={settings.points.enabled.value} />
        </AdvancedInput>
        <AdvancedInput label="Auto increment" {...settings.points.autoIncrement}>
          <input
            type="number"
            name="points.autoIncrement"
            disabled
            value={String(settings.points.autoIncrement.value)}
          />
        </AdvancedInput>
        <AdvancedInput label="Chances offset" {...settings.points.chancesOffset}>
          <input
            type="number"
            name="points.chancesOffset"
            value={String(settings.points.chancesOffset.value)}
          />
        </AdvancedInput>
        <AdvancedInput label="Points per message" {...settings.points.pointsPerMessage}>
          <input
            type="number"
            name="points.pointsPerMessage"
            disabled
            value={String(settings.points.pointsPerMessage.value)}
          />
        </AdvancedInput>
      </FormSection>
      <FormSection name="Automod - Emotes (EXPERIMENTAL)">
        <AdvancedInput label="enabled" {...settings.automod.emotesLimit.enabled}>
          <input
            type="checkbox"
            name="automod.emotesLimit.enabled"
            checked={settings.automod.emotesLimit.enabled.value}
          />
        </AdvancedInput>
        <AdvancedInput label="Limit" {...settings.automod.emotesLimit.limit}>
          <input
            type="number"
            name="automod.emotesLimit.limit"
            value={String(settings.automod.emotesLimit.limit.value)}
          />
        </AdvancedInput>
        <AdvancedInput label="Sanctions" {...settings.automod.emotesLimit.sanctions}>
          <textarea name="automod.emotesLimit.sanctions">
            {JSON.stringify(settings.automod.emotesLimit.sanctions.value)}
          </textarea>
        </AdvancedInput>
        <AdvancedInput label="Warning message" {...settings.automod.emotesLimit.warningMessage}>
          <textarea name="automod.emotesLimit.warningMessage">
            {settings.automod.emotesLimit.warningMessage.value}
          </textarea>
        </AdvancedInput>
        <AdvancedInput label="Sancion applied message" {...settings.automod.emotesLimit.banMessage}>
          <textarea name="automod.emotesLimit.banMessage">
            {settings.automod.emotesLimit.banMessage.value}
          </textarea>
        </AdvancedInput>
      </FormSection>
    </form>
  );
};
