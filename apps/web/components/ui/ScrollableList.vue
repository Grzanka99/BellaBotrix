<script setup lang="ts">
import type { TSelectOption } from "~/types/ui.type";

defineProps<{
  items: TSelectOption<string>[];
  selected?: string | undefined;
  mono?: boolean;
}>();

defineEmits<{
  (e: "select", v: string): void;
}>();
</script>

<template>
  <div class="scrollable-list">
    <template v-for="item, e in items">
      <div
        class="scrollable-list-item"
        @click="$emit('select', item.value)"
        :class="{ 'scrollable-list-item--selected': item.value === selected, 'text-mono': mono }"
      >
        <span
          class="scrollable-list-item-content"
          :class="{ 'text-mono': mono }"
        >
          {{ item.displayName }}
        </span>
        <span class="scrollable-list-item-additional">
          <slot name="additional" :value="item.value" />
          <slot
            name="firstonly"
            v-if="e === 0"
          />
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.scrollable-list {
  overflow-y: scroll;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: fit-content;
  border-right: 1px solid var(--stroke);
  padding: var(--padding-half);
  gap: var(--padding-quarter);
}

.scrollable-list-item {
  background: var(--background);
  padding: var(--padding-half) var(--padding);
  text-decoration: none;
  color: var(--text);

  width: 100%;
  cursor: pointer;
  transition: background 100ms;
  border-radius: var(--radius);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--padding);

  &:hover {
    background: var(--background-light);
  }

}

.scrollable-list-item--selected {
  background: var(--stroke);
}

.scrollable-list-item-additional {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--padding-half);
}
</style>
