<script setup lang="ts">
import type { TSettingOption } from "bellatrix";

defineProps<{
  name: string;
  option: TSettingOption<unknown>;
  disabled?: boolean;
}>();

</script>

<template>
  <div class="single-setting" :class="{ 'single-setting--disabled': disabled }">
    <span class="single-setting__name">
      {{ name }}
    </span>
    <div class="single-setting__controller">
      <span v-if="disabled">{{ option.value }}</span>
      <slot v-else />
    </div>
    <div class="single-setting__desc">
      <span>
        {{ option.description }}
      </span>
      <div v-if="option.vars">
        <code v-for="key in Object.keys(option.vars)">
          <span :title="option.vars[key]">${{ key }}</span>
        </code>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.single-setting {
  display: grid;
  align-items: center;
  padding: var(--padding-half) var(--padding);
  border-top: 1px solid var(--stroke);
  gap: var(--padding);
  min-height: 75px;

  grid-template-columns: minmax(175px, 1fr) minmax(200px, 450px) 4fr;

  &:last-child {
    border-bottom: 1px solid var(--stroke);
  }

  &--disabled {
    cursor: not-allowed;
    opacity: 50%;
  }

  &__desc {
    display: flex;
    flex-direction: column;
    gap: var(--padding);

    code {
      font-size: 1.5rem;
      font-weight: 200;
      cursor: help;
    }
  }
}
</style>
