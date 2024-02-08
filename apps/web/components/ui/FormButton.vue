<script setup lang="ts">
defineProps<{
  type: "submit" | "button";
  disabled?: boolean;
  notAllowed?: boolean;
  width?: `${string}px`;
  smaller?: boolean;
}>();
</script>

<template>
  <button
    class="form-button"
    :class="{
      'form-button--smaller': smaller,
      'form-button--not-allowed': notAllowed,
    }"
    :type="type"
    :disabled="disabled"
    :style="{ width }">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.form-button {
  margin: 0;
  width: 100%;
  padding: var(--padding-half);
  background: var(--text);
  border: none;
  outline: none;
  color: var(--background);
  font-weight: bold;

  cursor: pointer;
  transition: background 200ms;
  border-radius: var(--radius);

  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--padding-half);

  &--smaller {
    padding: var(--padding-quarter);
  }

  &--not-allowed {
    background: var(--warn);
  }

  &:hover:not(:disabled) {
    background: var(--text-darker);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }
}
</style>
