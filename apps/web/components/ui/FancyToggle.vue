<script setup lang="ts">
const props = defineProps<{
  value: boolean;
  disabled?: boolean;
}>()

const emit = defineEmits<{
  (e: 'change', v: boolean): void;
}>()

const handleClick = (e: MouseEvent) => {
  if (props.disabled) {
    e.preventDefault();
    return;
  }

  emit('change', !props.value);
};
</script>

<template>
  <label class="flex fancy-toggle" :class="{ 'fancy-toggle--disabled': disabled, 'fancy-toggle--on': value }"
    @click="handleClick">
    <div class="fancy-toggle__orb" :class="{ 'fancy-toggle__orb--on': value }"></div>
  </label>
</template>

<style lang="scss" scoped>
.fancy-toggle {
  --base: 20px;
  --offset: 3px;

  width: calc(var(--base) * 2);
  height: var(--base);
  align-items: center;

  position: relative;

  cursor: pointer;

  background: var(--background-light);
  box-shadow: inset 0px 0px 1px 1px var(--background-dim);

  border-radius: 20px;

  &--disabled {
    .fancy-toggle__orb {
      background: var(--background-dim);
    }
  }

  &--on {
    background: var(--text);
  }

  &:hover {
    .fancy-toggle__orb {
      background: var(--background-dim);
    }
  }

  &__orb {
    left: calc(var(--offset) / -2);
    position: absolute;
    height: calc(var(--base) + var(--offset));
    width: calc(var(--base) + var(--offset));
    background: var(--background-dark);

    border-radius: var(--radius-round);
    box-shadow: 0 0 1px var(--background-light);
    border: 1px solid var(--background-dim);

    transition: transform var(--default-transition);

    &--on {
      transform: translateX(var(--base));
    }
  }
}
</style>
