<script setup lang="ts">
import type { TSelectOption } from "~/types/ui.type";

defineProps<{
  icon?: string;
  options: TSelectOption[];
  actionIcon: string;
}>();

const emit = defineEmits<{
  (e: "click", v: string | number): void;
}>();

const target = ref(null);

const handleSelect = (option: TSelectOption) => {
  if (option.disabled) {
    return;
  }

  emit("click", option.value);
};

const optionsVisible = ref(false);

onClickOutside(target, () => {
  optionsVisible.value = false;
});
</script>

<template>
  <label
    class="select-button"
    @click="optionsVisible = !optionsVisible"
    ref="target"
  >
    <span class="select-button__label">
      Create new element
      <Icon name="material-symbols:add-box" />
    </span>
    <Transition>
      <ul
        class="select-button__options"
        v-if="optionsVisible"
      >
        <li
          v-for="option in options"
          @click="handleSelect(option)"
          :class="{ disabled: option.disabled }"
        >
          <span>
            {{ option.displayName }}
          </span>
          <span class="add-icon">
            <Icon :name="actionIcon" />
          </span>
        </li>
      </ul>
    </Transition>
  </label>
</template>

<style lang="scss" scoped>
.select-button {
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

      >.add-icon {
        opacity: 0;
      }

      &:hover {
        background: var(--background-dim);

        >.add-icon {
          opacity: 1;
        }
      }

      &.disabled {
        opacity: 0.5;

        &:hover {
          background: transparent;

          >.add-icon {
            opacity: 0;
          }
        }
      }


      display: flex;
      justify-content: space-between;
      align-items: center;

      >span {
        display: flex;
        justify-content: space-between;
        align-items: center;
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
