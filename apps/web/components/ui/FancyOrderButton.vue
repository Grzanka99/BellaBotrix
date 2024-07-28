<script lang="ts" setup>

defineProps<{
  disabled?: boolean;
  noUp?: boolean;
  noDown?: boolean;
}>()

const emit = defineEmits<{
  (e: 'change', v: 'up' | 'down'): void
}>()

const handleClick = (d: 'up' | 'down') => {
  emit('change', d);
}

</script>

<template>
  <div class="fancy-order-button" :class="{ 'fancy-order-button--disabled': disabled }">
    <button @click="handleClick('up')" v-if="!noUp">
      <Icon name="material-symbols:arrow-drop-up" />
    </button>
    <button @click="handleClick('down')" v-if="!noDown">
      <Icon name="material-symbols:arrow-drop-down" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.fancy-order-button {
  display: flex;
  flex-direction: row;
  height: 24px;
  gap: 1px;

  width: 100%;

  &>button {
    margin: 0;
    width: 100%;
    height: 100%;
    padding: 0;

    background: var(--text);
    border: none;
    outline: none;
    color: var(--background);
    font-weight: bold;

    cursor: pointer;
    transition: background 200ms;

    &:first-child {
      border-top-left-radius: var(--radius);
      border-bottom-left-radius: var(--radius);
    }

    &:last-child {
      border-top-right-radius: var(--radius);
      border-bottom-right-radius: var(--radius);
    }

    display: flex;
    align-items: center;
    justify-content: center;

    &:hover:not(:disabled) {
      background: var(--text-darker);
    }

    &>svg {
      height: 24px;
      width: 24px;
    }
  }
}
</style>
