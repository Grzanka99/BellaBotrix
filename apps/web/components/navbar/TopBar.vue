<script setup lang="ts">
import { useStorage } from "@vueuse/core";
import type { TSelectOption } from "~/types/ui.type";
import CustomSelect from "~/components/ui/CustomSelect.vue";
import FormButton from "../ui/FormButton.vue";

const channel = useStorage<number | undefined>("selectedChannel", undefined);
const channelName = useStorage<string | undefined>("selectedChannelName", undefined);
const channelId = useStorage<string | undefined>("selectedChannelId", undefined);

const { data, refresh } = await useFetch("/api/chacc");
const auth = useAuth();

onBeforeMount(() => {
  if (!channel.value) {
    channel.value = auth.session.value?.id;
  }
});

const options = computed<TSelectOption[]>(() => {
  if (!data.value) {
    return [];
  }

  return data.value?.map((el) => ({
    value: String(el.id),
    displayName: el.name,
  }));
});

watchEffect(() => {
  if (!data.value || !data.value.length) {
    return;
  }

  const currOne = data.value?.find((el) => el.id === Number(channel.value));
  channelName.value = currOne?.name;
  channelId.value = currOne?.channel_id;
});
const isDark = useDark();
const toggleDark = useToggle(isDark);

watch(channel, () => {
  window.localStorage.removeItem("selectedStream");
  window.location.reload();
});
</script>

<template>
  <header id="topbar">
    <CustomSelect
      icon="material-symbols:video-library"
      :options="options"
      v-model="channel"
      class="channel-select"
      @click.native="refresh()" />
    <FormButton @click="toggleDark()" type="button" width="50px">
      <Icon v-if="isDark" name="material-symbols:dark-mode" />
      <Icon v-else name="material-symbols:light-mode"></Icon>
    </FormButton>
    <div class="perms-list" v-if="auth.session.value?.perms.includes('admin')">
      <span v-for="el in auth.session.value.perms">{{ el }}, </span>
    </div>
  </header>
</template>

<style lang="scss" scoped>
#topbar {
  display: flex;
  border-bottom: 1px solid var(--stroke);
  align-items: center;
  justify-content: flex-start;
  gap: var(--padding);
  padding: var(--padding);
}
</style>
