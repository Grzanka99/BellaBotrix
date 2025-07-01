<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  items: { id: string; text: string }[];
  modelValue: string;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'select', value: { id: string; text: string }): void;
}>();

function select(id: string) {
  const item = props.items.find(i => i.id === id);
  if (item) {
    emits('update:modelValue', id);
    emits('select', item);
  }
}
</script>

<template>
  <ul class="selector-list">
    <li v-for="item in items" :key="item.id" :class="{ selected: item.id === modelValue }" @click="select(item.id)">
      {{ item.text }}
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.selector-list {
  height: 100%;
  width: 100%;
  overflow-y: scroll;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--padding-half);

  li {
    margin: 0;
    border-radius: var(--radius);
    padding: var(--padding-quarter) var(--padding-half);
    border: 1px solid transparent;
    cursor: pointer;
    text-align: center;
    transition: background ease-out 200ms;

    &:hover {
      background: var(--background-light);
    }
  }

  .selected {
    border-color: var(--text);
  }
}
</style>
