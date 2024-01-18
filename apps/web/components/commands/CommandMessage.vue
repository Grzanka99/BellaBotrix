<script setup lang="ts">
const props = defineProps<{
  message: Record<string, string>
}>()

const keys = computed(() => Object.keys(props.message))
</script>

<template>
  <ul class="command-message" v-if="keys.length > 1">
    <li v-for="key in keys">
      <code>{{ key }}</code>
      <span>{{ message[key] }}</span>
    </li>
  </ul>
  <div v-else class="command-message--single">{{ message.base }}</div>
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

    >span {
      font-size: 1.4rem;
    }

    &:hover {
      background: var(--background-light);
      cursor: pointer;
    }
  }

  &--single {
    padding: 0 var(--padding-half) ;
  }
}
</style>
