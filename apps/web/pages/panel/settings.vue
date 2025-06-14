<script setup lang="ts">
import { useSettingsStore } from "~/store/settings.store";
import FancyToggle from "~/components/ui/FancyToggle.vue";
import FormTextInput from "~/components/ui/FormTextInput.vue";
import FormNumberInput from "~/components/ui/FormNumberInput.vue";
import FormTextarea from "~/components/ui/FormTextarea.vue";
import SettingsGroup from "~/components/settings/SettingsGroup.vue";
import SingleSetting from "~/components/settings/SingleSetting.vue";
import CustomSelect from "~/components/ui/CustomSelect.vue";
import RequirePerms from "~/components/auth/RequirePerms.server.vue";
import { useAIModelsStore } from "~/store/ai-models.store";
import type { TSelectOption } from "~/types/ui.type";

const settings = useSettingsStore();
const modelsStore = useAIModelsStore();

onMounted(() => {
  settings.startRefresh();
  modelsStore.startRefresh();
});

onUnmounted(() => {
  settings.stopRefresh();
  modelsStore.startRefresh();
});

const commands = computed(() => settings.settings?.commands);
const triggerWords = computed(() => settings.settings?.triggerWords);
const joinMessage = computed(() => settings.settings?.joinMessage);
const points = computed(() => settings.settings?.points);
const r6dle = computed(() => settings.settings?.r6dle);
const ollamaAI = computed(() => settings.settings?.ollamaAI);
const automod = computed(() => settings.settings?.automod);

const aiModelsOptions = computed<TSelectOption<string>[]>(() => {
  const res = modelsStore.enabled.map((el) => ({
    value: el.name,
    displayName: `${el.name}, ${el.description}`,
  }));

  if (!res.length) {
    return [
      {
        value: ollamaAI.value?.model.value || "none",
        displayName: ollamaAI.value?.model.value || "none",
      },
    ];
  }

  return res;
});

useHead({
  title: "Settings",
});
</script>

<template>
  <div id="settings-page">
    <h3>Update of settings may take up to 10 seconds</h3>
    <SettingsGroup group-name="Commands" v-if="commands">
      <SingleSetting name="enabled" :option="commands.enabled">
        <FancyToggle
          :value="commands.enabled.value"
          @change="(value) =>
            settings.handleUpdate({
              commands: { enabled: { value } },
            })
            " />
      </SingleSetting>
      <SingleSetting name="prefix" :option="commands.prefix">
        <FormTextInput
          name="commands-enabled"
          :model-value="commands.prefix.value"
          @update:model-value="(value) =>
            settings.handleUpdateDebounce({
              commands: { prefix: { value } },
            })
            " />
      </SingleSetting>
    </SettingsGroup>
    <SettingsGroup group-name="Trigger Words" v-if="triggerWords?.enabled">
      <SingleSetting name="enabled" :option="triggerWords.enabled">
        <FancyToggle
          :value="triggerWords.enabled.value"
          @change="(value) =>
            settings.handleUpdate({
              triggerWords: { enabled: { value } },
            })
            " />
      </SingleSetting>
    </SettingsGroup>
    <SettingsGroup group-name="R6dle" v-if="r6dle?.enabled">
      <SingleSetting name="enabled" :option="r6dle.enabled">
        <FancyToggle
          :value="r6dle.enabled.value"
          @change="(value) =>
            settings.handleUpdate({
              r6dle: { enabled: { value } },
            })
            " />
      </SingleSetting>
      <SingleSetting name="r6dle max" :option="r6dle.maxPoints">
        <FormNumberInput
          name="r6dle maxpoints"
          :model-value="r6dle.maxPoints.value"
          @update:model-value="(value) =>
            settings.handleUpdateDebounce({
              r6dle: { maxPoints: { value } },
            })
            " />
      </SingleSetting>
      <SingleSetting name="r6dle modifier" :option="r6dle.modifier">
        <FormNumberInput
          name="r6dle modifier"
          :model-value="r6dle.modifier.value"
          @update:model-value="(value) =>
            settings.handleUpdateDebounce({
              r6dle: { modifier: { value } },
            })
            " />
      </SingleSetting>
    </SettingsGroup>
    <SettingsGroup group-name="Join messages" v-if="joinMessage">
      <SingleSetting
        name="Enable for all users"
        :option="joinMessage.forAllUsers.enabled">
        <FancyToggle
          :value="joinMessage.forAllUsers.enabled.value"
          @change="(value) =>
            settings.handleUpdate({
              joinMessage: { forAllUsers: { enabled: { value } } },
            })
            " />
      </SingleSetting>
      <SingleSetting
        :disabled="!joinMessage.forAllUsers.enabled.value"
        name="message to all users"
        :option="joinMessage.forAllUsers.message">
        <FormTextarea
          name="message-for-all-users"
          :model-value="joinMessage.forAllUsers.message.value"
          @update:model-value="(value) =>
            settings.handleUpdateDebounce({
              joinMessage: { forAllUsers: { message: { value } } },
            })
            " />
      </SingleSetting>
      <SingleSetting
        name="Enable for specific users"
        :option="joinMessage.forSpecificUsers.enabled">
        <FancyToggle
          :value="joinMessage.forSpecificUsers.enabled.value"
          @change="(value) =>
            settings.handleUpdate({
              joinMessage: { forSpecificUsers: { enabled: { value } } },
            })
            " />
      </SingleSetting>
      <SingleSetting
        :disabled="!joinMessage.forSpecificUsers.enabled.value"
        name="message to specific users"
        :option="joinMessage.forSpecificUsers.message">
        <FormTextarea
          name="message-for-specific-users"
          :model-value="joinMessage.forSpecificUsers.message.value"
          @update:model-value="(value) =>
            settings.handleUpdateDebounce({
              joinMessage: { forSpecificUsers: { message: { value } } },
            })
            " />
      </SingleSetting>
      <SingleSetting
        :disabled="!joinMessage.forSpecificUsers.enabled.value"
        name="list of users"
        :option="joinMessage.forSpecificUsers.users">
        <FormTextarea
          name="list-of-users"
          :model-value="joinMessage.forSpecificUsers.users.value.join(', ')"
          @update:model-value="(value) =>
            settings.handleUpdateDebounce({
              joinMessage: {
                forSpecificUsers: {
                  users: { value: value.split(',') },
                },
              },
            })
            " />
      </SingleSetting>
    </SettingsGroup>
    <SettingsGroup group-name="Points" v-if="points">
      <SingleSetting name="enabled" :option="points.enabled">
        <FancyToggle
          :value="points.enabled.value"
          @change="(value) =>
            settings.handleUpdate({
              points: { enabled: { value } },
            })
            " />
      </SingleSetting>
      <SingleSetting
        name="auto increment"
        disabled
        :option="points.autoIncrement">
        <FormNumberInput
          name="points.autoIncrement"
          :model-value="points.autoIncrement.value"
          @update:model-value="(value) =>
            settings.handleUpdateDebounce({
              points: { autoIncrement: { value } },
            })
            " />
      </SingleSetting>
      <SingleSetting name="chances offset" :option="points.chancesOffset">
        <FormNumberInput
          name="chances-offset"
          :model-value="points.chancesOffset.value"
          @update:model-value="(value) =>
            settings.handleUpdateDebounce({
              points: { chancesOffset: { value } },
            })
            " />
      </SingleSetting>
      <SingleSetting
        name="auto increment"
        disabled
        :option="points.pointsPerMessage">
        <FormNumberInput
          name="autoIncrement"
          :model-value="points.pointsPerMessage.value"
          @update:model-value="(value) =>
            settings.handleUpdateDebounce({
              points: { pointsPerMessage: { value } },
            })
            " />
      </SingleSetting>
    </SettingsGroup>
    <RequirePerms :require="['ai', 'ai+']" type='block'>
      <SettingsGroup group-name="Ollama AI Reponses" v-if="ollamaAI">
        <SingleSetting name="enabled" :option="ollamaAI.enabled">
          <FancyToggle
            :value="ollamaAI.enabled.value"
            @change="(value) => settings.handleUpdate({ ollamaAI: { enabled: { value } } })" />
        </SingleSetting>
        <RequirePerms :require="['ai+']" type='hide'>
          <SingleSetting name="model" :option="ollamaAI.model">
            <CustomSelect
              :options="aiModelsOptions"
              @update:model-value="(value) => settings.handleUpdateDebounce({
                ollamaAI: { model: { value } }
              })"
              :model-value="ollamaAI.model.value" />
          </SingleSetting>
        </RequirePerms>
        <SingleSetting name="reply language" :option="ollamaAI.language">
          <FormTextInput
            name="ollamaai-reply-lang"
            :model-value="ollamaAI.language.value"
            @update:model-value="(value) =>
              settings.handleUpdateDebounce({
                ollamaAI: { language: { value } },
              })
              " />
        </SingleSetting>
        <RequirePerms :require="['ai+']" type='hide'>
          <SingleSetting name="keep history" :option="ollamaAI.keepHistory">
            <FormNumberInput
              name="ollamaai-history"
              :model-value="ollamaAI.keepHistory.value"
              @update:model-value="(value) =>
                settings.handleUpdateDebounce({
                  ollamaAI: { keepHistory: { value } },
                })
                " />
          </SingleSetting>
        </RequirePerms>
        <SingleSetting name="entry prompt" :option="ollamaAI.entryPrompt">
          <FormTextarea
            name="ollamaai-entry-promp"
            :model-value="ollamaAI.entryPrompt.value"
            @update:model-value="(value) =>
              settings.handleUpdateDebounce({
                ollamaAI: { entryPrompt: { value } },
              })
              " />
        </SingleSetting>
      </SettingsGroup>
    </RequirePerms>
    <RequirePerms :require="['automod']" type='hide'>
      <SettingsGroup group-name="Automod AI" v-if="automod">
        <SingleSetting name="enabled" :option="automod.enabled">
          <FancyToggle
            :value="automod.enabled.value"
            @change="(value) => settings.handleUpdate({ automod: { enabled: { value } } })" />
        </SingleSetting>
      </SettingsGroup>
    </RequirePerms>
  </div>
</template>

<style lang="scss" scoped>
#settings-page {
  display: flex;
  flex-direction: column;
  gap: var(--padding);

  .custom-select {
    width: 100%;
  }
}
</style>
