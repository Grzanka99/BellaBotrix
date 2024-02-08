<script setup lang="ts">
import { useSevenTvintegrationStore } from '~/store/7tv-integration.store';
import MessageWithEmotes from './MessageWithEmotes.vue';

const props = defineProps<{
  message: Record<string, string>
}>()

// NOTE: As for now it's only integration, it will remain with this name
const seventTvInteg = useSevenTvintegrationStore();

const keys = computed(() => Object.keys(props.message))
</script>

<template>
  <ul class="command-message" v-if="keys.length > 1">
    <li v-for="key in keys">
      <code>{{ key }}</code>
      <MessageWithEmotes
        :message="seventTvInteg.interpolate(message[key])" />
    </li>
  </ul>
  <MessageWithEmotes v-else class="command-message--single"
    :message="seventTvInteg.interpolate(message.base)" />
</template>

<style lang="scss" scoped>
.command-message {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--padding-half);

  >li {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: var(--padding-half);
    gap: var(--padding-quarter);

    >code {
      font-weight: bold;
      font-family: 'Source Code Pro', monospace;
    }

    &:hover {
      background: var(--background-light);
      cursor: pointer;
    }
  }

  &--single {
    padding: 0 var(--padding-half);
  }
}
</style>
