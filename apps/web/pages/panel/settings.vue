<script setup lang="ts">
import { useSettingsStore } from "~/store/settings.store";
import FancyToggle from "~/components/ui/FancyToggle.vue";
import FormTextInput from "~/components/ui/FormTextInput.vue";
import FormNumberInput from "~/components/ui/FormNumberInput.vue";
import FormTextarea from "~/components/ui/FormTextarea.vue";
import SettingsGroup from "~/components/settings/SettingsGroup.vue";
import SingleSetting from "~/components/settings/SingleSetting.vue";

const settings = useSettingsStore();

onMounted(settings.startRefresh);
onUnmounted(settings.stopRefresh);

const commands = computed(() => settings.settings?.commands);
const joinMessage = computed(() => settings.settings?.joinMessage);
const points = computed(() => settings.settings?.points);
const automod = computed(() => settings.settings?.automod);

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
          :model-value="points.autoIncrement.value"
          @update:model-value="(value) =>
            settings.handleUpdateDebounce({
              points: { autoIncrement: { value } },
            })
            " />
      </SingleSetting>
      <SingleSetting
        name="chances offset"
        :option="points.chancesOffset">
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
          :model-value="points.pointsPerMessage.value"
          @update:model-value="(value) =>
            settings.handleUpdateDebounce({
              points: { pointsPerMessage: { value } },
            })
            " />
      </SingleSetting>
    </SettingsGroup>
    <SettingsGroup group-name="Automod still work in progress">xD</SettingsGroup>
  </div>
</template>

<style lang="scss" scoped>
#settings-page {
  display: flex;
  flex-direction: column;
  gap: var(--padding);
}
</style>
