<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { TOption } from '~/types/ui.type';
import CustomSelect from '~/components/ui/CustomSelect.vue';

const channel = useStorage<number | undefined>('selectedChannel', undefined);
const channelName = useStorage<string | undefined>('selectedChannelName', undefined);

const { data, refresh } = await useFetch('/api/chacc');

const options = computed<TOption[]>(() => {
  if (!data.value) {
    return [];
  }

  return data.value?.map(el => ({
    value: el.id,
    displayName: el.name
  }))
})

watchEffect(() => {
  if (!data.value || !data.value.length) {
    return;
  }

  if (!channel.value) {
    channel.value = data.value[0].id
  }

  if (!channelName.value) {
    channelName.value = data.value?.find(el => el.id === Number(channel.value))?.name
  }
})

const isDark = useDark();
const toggleDark = useToggle(isDark);

</script>

<template>
  <header id="topbar">
    <button @click="toggleDark()" type="button">{{ isDark ? 'Dark' : 'Light' }}</button>
    <CustomSelect :options="options" v-model="channel" class="channel-select" @click.native="refresh()" />
  </header>
</template>

<style lang="scss" scoped>
#topbar {
  display: flex;
  border-bottom: 1px solid var(--stroke);
  align-items: center;
}

.channel-select {
  position: absolute;
  right: var(--padding-half);
}
</style>
