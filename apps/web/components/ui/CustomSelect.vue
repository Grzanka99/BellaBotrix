<script setup lang="ts">
import type { TOption } from '~/types/ui.type';

const props = defineProps<{
  modelValue: string | number,
  options: TOption[],
}>()

const emit = defineEmits(['update:modelValue'])

const val = computed(() => props.options.find(el => el.value === Number(props.modelValue)))

const handleChange = (option: string | number) => {
  emit('update:modelValue', option)
}

const optionsVisible = ref(false);
</script>

<template>
  <label class="custom-select" @click="optionsVisible = !optionsVisible">
    <span class="custom-select__label">

      {{ val?.displayName }}
    </span>
    <Transition>
      <ul class="custom-select__options" v-if="optionsVisible">
        <li v-for="option in options" @click="handleChange(option.value)">{{ option.displayName }}</li>
      </ul>
    </Transition>
  </label>
</template>

<style lang="scss" scoped>
.custom-select {
  display: inline-flex;
  cursor: pointer;
  padding: var(--padding-half) var(--padding);
  position: relative;
  border-radius: var(--radius);
  border: 1px solid var(--stroke-light);
  min-width: 200px;

  transition: background 100ms ease-in-out;

  &:hover,
  &:active {
    background: var(--background-dim);
  }

  &__label {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    font-weight: bold;
  }

  &__options {
    position: absolute;
    background: var(--background);
    border: 1px solid var(--stroke-light);
    width: 100%;
    border-radius: var(--radius);
    padding: var(--padding-half);
    top: calc(100% + var(--padding-half));
    left: 0;

    display: flex;
    flex-direction: column;
    gap: var(--padding-quarter);
    overflow: hidden;

    >li {
      padding: var(--padding-half);
      border-radius: var(--radius-half);

      &:hover {
        background: var(--background-dim);
      }
    }
  }
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.1s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
