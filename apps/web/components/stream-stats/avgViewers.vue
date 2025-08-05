<script setup lang="ts">
import { useStorage } from "@vueuse/core";
import Loader from "../ui/Loader.vue";
const channel = useStorage("selectedChannel", undefined);

const props = defineProps<{
  value: string;
  month?: boolean;
}>();

const { data, status } = useFetch(() => {
  if (props.month) {
    return `/api/${channel.value}/stats/month/${props.value}`;
  }

  return `/api/${channel.value}/stats/${props.value.replace("#", "__HASHTAG__")}/avg`;
});

const formatted = computed<string | undefined>(() => {
  if (!data) {
    return undefined;
  }

  const str = data.value?.toFixed(2);

  return str;
});
</script>
<template>
  <span
    class="text-mono avg-viewers"
    title="avarage viewers on this stream"
  >
    <Loader v-if="status === 'pending'" />
    <template v-else-if="status === 'success' && formatted">
      {{ formatted }}
      <Icon name="material-symbols:person" />
    </template>
    <Icon
      v-else
      name="material-symbols:database-off"
    />
  </span>
</template>

<style scoped>
.avg-viewers {
  font-size: var(--font-tiny);
  color: var(--accent-dim);
  display: flex;
  gap: var(--padding-quarter);
  align-items: center;
  justify-content: flex-end;
  margin-left: var(--padding);

  height: 20px;
  min-width: 80px;
  overflow: hidden;
}
</style>
