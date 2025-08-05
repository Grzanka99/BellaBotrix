<script setup lang="ts">
import type { TSelectOption } from "~/types/ui.type";

const props = defineProps<{
  icon?: string;
  modelValue: string | number;
  options: TSelectOption[];
}>();

const emit = defineEmits(["update:modelValue"]);

const val = computed(() => props.options.find((el) => el.value === props.modelValue));

const target = ref(null);

const search = ref("");

const filteredOptions = computed(() => {
  if (!search.value || !search.value.length) {
    return props.options;
  }
  return props.options.filter(
    (el) =>
      el.displayName.toLowerCase().includes(search.value.toLowerCase()) ||
      el.value.toString().toLowerCase().includes(search.value.toLowerCase()),
  );
});

const optionsVisible = ref(false);
const handleChange = (option: string | number) => {
  const found = props.options.find((el) => el.value === option);
  if (found) {
    optionsVisible.value = false;
    search.value = found.displayName;
  }
  emit("update:modelValue", option);
};

onClickOutside(target, () => {
  optionsVisible.value = false;
});
</script>

<template>
  <label
    class="search-select"
    @click="optionsVisible = !optionsVisible"
    ref="target"
  >
    <input
      class="search-select__input"
      type="text"
      v-model="search"
    />
    <Transition>
      <ul
        class="search-select__options"
        v-if="optionsVisible"
      >
        <li
          v-for="option in filteredOptions"
          @click="handleChange(option.value)"
        >
          {{ option.displayName }}
        </li>
      </ul>
    </Transition>
  </label>
</template>

<style lang="scss" scoped>
.search-select {
  display: inline-flex;
  cursor: pointer;
  position: relative;
  border-radius: var(--radius);
  border: 1px solid var(--stroke-light);
  min-width: 200px;
  height: 40px;

  transition: background 100ms ease-in-out;

  &:hover,
  &:active {
    background: var(--background-dim);
  }

  &__input {
    border-radius: var(--radius);
    padding: var(--padding-half) var(--padding);
    width: 100%;
    height: 100%;
    background: transparent;
    color: var(--text);
    outline: none;
    border: none;
  }

  &__label {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    font-weight: bold;
    gap: var(--padding-half);
    align-items: center;
  }

  &__options {
    position: absolute;
    background: var(--background);
    border: 1px solid var(--stroke-light);
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    border-radius: var(--radius);
    padding: var(--padding-half);
    top: calc(100% + var(--padding-half));
    left: 0;
    z-index: 1;

    display: flex;
    flex-direction: column;
    gap: var(--padding-quarter);

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
