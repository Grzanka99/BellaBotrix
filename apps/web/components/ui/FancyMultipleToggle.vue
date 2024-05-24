<script setup lang="ts">
import type { TSelectOption } from "~/types/ui.type";
const props = defineProps<{
  options: TSelectOption[];
  modelValue: string[];
  disabled?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const localValue = ref<string[]>(props.modelValue);
watch(localValue, () => {
  if (props.disabled) {
    return;
  }
  emit('update:modelValue', localValue.value);
})
</script>
<template>
  <div class="flex fancy-multiple-toggle"
    :class="{ 'fancy-toggle--disabled': disabled }">
    <template v-for="opt in options">
      <label>
        <div class="fancy-multiple-toggle__orb-wrapper"
          :class="{ 'fancy-multiple-toggle__orb-wrapper--on': localValue.includes(String(opt.value)) }">
          <div class="fancy-multiple-toggle__orb"
            :class="{ 'fancy-multiple-toggle__orb--on': localValue.includes(String(opt.value)) }"></div>
        </div>
        <input type="checkbox" :id="String(opt.value)" :value="String(opt.value)" v-model="localValue">
        <span>{{ opt.displayName }}</span>
      </label>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.fancy-multiple-toggle {
  --base: 20px;
  --offset: 3px;

  flex-direction: column;
  gap: var(--padding-half);

  >label {
    >input {
      display: none
    }

    display: flex;
    gap: var(--padding);
  }

  &__orb {
    // left: calc(var(--offset) / -2);
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

    &-wrapper {
      cursor: pointer;
      width: calc(var(--base) * 2);
      background: var(--background-light);
      box-shadow: inset 0px 0px 1px 1px var(--background-dim);

      border-radius: 20px;

      &--on {
        background: var(--text);
      }
    }
  }
}
</style>
