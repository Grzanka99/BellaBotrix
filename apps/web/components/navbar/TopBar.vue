<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { TOption } from '~/types/ui.type';
import CustomSelect from '~/components/ui/CustomSelect.vue';

const channel = useStorage<number | undefined>('selectedChannel', undefined);
const { data, refresh } = await useFetch('/api/chacc');

const options = computed<TOption[]>(() => {
  if (!data.value) {
    return [];
  }

  return data.value.map(el => ({
    value: el.id,
    displayName: el.name
  }))
})

</script>

<template>
  <header id="topbar">
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

