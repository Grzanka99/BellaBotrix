"use client"

import { PageHeader } from "@/components/page-header"
import { RequirePerms } from "@/components/require-perms"
import { useAutoRefresh } from "@/hooks/use-auto-refresh"

import {
  formatUsersList,
  parseUsersList,
  SNumberValue,
  SPrefixValue,
  SR6dleNumberValue,
  SSettings,
  SStringValue,
} from "../schema"
import { settingsStore, type SettingsProps } from "../store"
import {
  ListSetting,
  NumberSetting,
  SelectSetting,
  SwitchSetting,
  TextSetting,
} from "./setting-controls"
import { SettingsGroup } from "./setting-row"

const SUsersValue =
  SSettings.shape.joinMessage.shape.forSpecificUsers.shape.users.shape.value

/** Port of `pages/panel/settings.vue`. */
export function SettingsView(props: SettingsProps) {
  // Same cadence as the Nuxt settings store.
  useAutoRefresh(10_000)

  return (
    <settingsStore.Provider props={props}>
      <PageHeader
        title="Settings"
        description="Update of settings may take up to 10 seconds."
      />
      <div className="flex flex-col gap-6">
        <CommandsGroup />
        <TriggerWordsGroup />
        <R6dleGroup />
        <JoinMessagesGroup />
        <PointsGroup />
        <OllamaAIGroup />
        <AutomodGroup />
      </div>
    </settingsStore.Provider>
  )
}

function useSettings() {
  return settingsStore.useStore((state) => state.settings)
}

function CommandsGroup() {
  const { commands } = useSettings()

  return (
    <SettingsGroup title="Commands">
      <SwitchSetting
        id="commands-enabled"
        label="enabled"
        option={commands.enabled}
        toUpdate={(value) => ({ commands: { enabled: { value } } })}
      />
      <TextSetting
        id="commands-prefix"
        label="prefix"
        option={commands.prefix}
        schema={SPrefixValue}
        toUpdate={(value) => ({ commands: { prefix: { value } } })}
      />
    </SettingsGroup>
  )
}

function TriggerWordsGroup() {
  const { triggerWords } = useSettings()

  return (
    <SettingsGroup title="Trigger Words">
      <SwitchSetting
        id="trigger-words-enabled"
        label="enabled"
        option={triggerWords.enabled}
        toUpdate={(value) => ({ triggerWords: { enabled: { value } } })}
      />
    </SettingsGroup>
  )
}

function R6dleGroup() {
  const { r6dle } = useSettings()

  return (
    <SettingsGroup title="R6dle">
      <SwitchSetting
        id="r6dle-enabled"
        label="enabled"
        option={r6dle.enabled}
        toUpdate={(value) => ({ r6dle: { enabled: { value } } })}
      />
      <NumberSetting
        id="r6dle-max-points"
        label="r6dle max"
        option={r6dle.maxPoints}
        schema={SR6dleNumberValue}
        toUpdate={(value) => ({ r6dle: { maxPoints: { value } } })}
      />
      <NumberSetting
        id="r6dle-modifier"
        label="r6dle modifier"
        option={r6dle.modifier}
        schema={SR6dleNumberValue}
        toUpdate={(value) => ({ r6dle: { modifier: { value } } })}
      />
    </SettingsGroup>
  )
}

function JoinMessagesGroup() {
  const { forAllUsers, forSpecificUsers } = useSettings().joinMessage

  return (
    <SettingsGroup title="Join messages">
      <SwitchSetting
        id="join-all-enabled"
        label="Enable for all users"
        option={forAllUsers.enabled}
        toUpdate={(value) => ({
          joinMessage: { forAllUsers: { enabled: { value } } },
        })}
      />
      <TextSetting
        id="join-all-message"
        label="message to all users"
        multiline
        option={forAllUsers.message}
        disabled={!forAllUsers.enabled.value}
        schema={SStringValue}
        toUpdate={(value) => ({
          joinMessage: { forAllUsers: { message: { value } } },
        })}
      />
      <SwitchSetting
        id="join-specific-enabled"
        label="Enable for specific users"
        option={forSpecificUsers.enabled}
        toUpdate={(value) => ({
          joinMessage: { forSpecificUsers: { enabled: { value } } },
        })}
      />
      <TextSetting
        id="join-specific-message"
        label="message to specific users"
        multiline
        option={forSpecificUsers.message}
        disabled={!forSpecificUsers.enabled.value}
        schema={SStringValue}
        toUpdate={(value) => ({
          joinMessage: { forSpecificUsers: { message: { value } } },
        })}
      />
      <ListSetting
        id="join-specific-users"
        label="list of users"
        option={forSpecificUsers.users}
        disabled={!forSpecificUsers.enabled.value}
        schema={SUsersValue}
        format={formatUsersList}
        parse={parseUsersList}
        toUpdate={(value) => ({
          joinMessage: { forSpecificUsers: { users: { value } } },
        })}
      />
    </SettingsGroup>
  )
}

function PointsGroup() {
  const { points } = useSettings()

  return (
    <SettingsGroup title="Points">
      <SwitchSetting
        id="points-enabled"
        label="enabled"
        option={points.enabled}
        toUpdate={(value) => ({ points: { enabled: { value } } })}
      />
      {/* Read-only on the Nuxt page as well. */}
      <NumberSetting
        id="points-auto-increment"
        label="auto increment"
        option={points.autoIncrement}
        disabled
        schema={SNumberValue}
        toUpdate={(value) => ({ points: { autoIncrement: { value } } })}
      />
      <NumberSetting
        id="points-chances-offset"
        label="chances offset"
        option={points.chancesOffset}
        schema={SNumberValue}
        toUpdate={(value) => ({ points: { chancesOffset: { value } } })}
      />
      <NumberSetting
        id="points-per-message"
        label="points per message"
        option={points.pointsPerMessage}
        disabled
        schema={SNumberValue}
        toUpdate={(value) => ({ points: { pointsPerMessage: { value } } })}
      />
    </SettingsGroup>
  )
}

function OllamaAIGroup() {
  const { ollamaAI } = useSettings()
  const aiModels = settingsStore.useStore((state) => state.aiModels)

  // Nuxt: enabled models as "name, provider"; with none (or no permission to
  // list them) only the current model is offered.
  const modelItems = aiModels.length
    ? aiModels.map((model) => ({
        value: model.name,
        label: `${model.name}, ${model.provider}`,
      }))
    : [
        {
          value: ollamaAI.model.value || "none",
          label: ollamaAI.model.value || "none",
        },
      ]

  return (
    <RequirePerms require={["ai", "ai+"]} mode="block" className="w-full">
      <SettingsGroup title="Ollama AI Responses">
        <SwitchSetting
          id="ollama-enabled"
          label="enabled"
          option={ollamaAI.enabled}
          toUpdate={(value) => ({ ollamaAI: { enabled: { value } } })}
        />
        <RequirePerms require={["ai+"]}>
          <SelectSetting
            id="ollama-model"
            label="model"
            option={ollamaAI.model}
            items={modelItems}
            toUpdate={(value) => ({ ollamaAI: { model: { value } } })}
          />
        </RequirePerms>
        <TextSetting
          id="ollama-language"
          label="reply language"
          option={ollamaAI.language}
          schema={SStringValue}
          toUpdate={(value) => ({ ollamaAI: { language: { value } } })}
        />
        <RequirePerms require={["ai+"]}>
          <NumberSetting
            id="ollama-keep-history"
            label="keep history"
            option={ollamaAI.keepHistory}
            schema={SNumberValue}
            toUpdate={(value) => ({ ollamaAI: { keepHistory: { value } } })}
          />
        </RequirePerms>
        <TextSetting
          id="ollama-entry-prompt"
          label="entry prompt"
          multiline
          option={ollamaAI.entryPrompt}
          schema={SStringValue}
          toUpdate={(value) => ({ ollamaAI: { entryPrompt: { value } } })}
        />
      </SettingsGroup>
    </RequirePerms>
  )
}

function AutomodGroup() {
  const { automod } = useSettings()

  return (
    <RequirePerms require={["automod"]}>
      <SettingsGroup title="Automod AI">
        <SwitchSetting
          id="automod-enabled"
          label="enabled"
          option={automod.enabled}
          toUpdate={(value) => ({ automod: { enabled: { value } } })}
        />
      </SettingsGroup>
    </RequirePerms>
  )
}
