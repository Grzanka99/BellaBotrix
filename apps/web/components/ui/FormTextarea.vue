<script setup lang="ts">
defineProps<{
  label?: string;
  error?: false | string;
  name: string;
  placeholder?: string;
  modelValue: string;
  disabled?: boolean;
  restore?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
}>();

const handleInput = (e: Event) => {
  emit("update:modelValue", (e.target as HTMLInputElement).value);
};
</script>

<template>
  <label class="form-textarea" :title="error || undefined">
    <div class="form-textarea__label-wrapper" v-if="label || restore">
      <span class="form-textarea__label" v-if="label">{{ label }}</span>
      <button
        v-if="restore && restore !== modelValue"
        type="button"
        @click="$emit('update:modelValue', restore)">
        restore
      </button>
    </div>
    <textarea
      class="form-textarea__input"
      :class="{ invalid: !!error }"
      :disabled="disabled"
      :name="name"
      :placeholder="placeholder"
      :value="modelValue"
      @input="handleInput" />
  </label>
</template>

<style lang="scss" scoped>
.form-textarea {
  display: flex;
  flex-direction: column;
  gap: 5px;

  &__input {
    max-width: 100%;
    min-height: 50px;
    background: transparent;
    border: 1px solid var(--stroke);
    border-radius: var(--radius);
    font-size: 1.6rem;
    padding: var(--padding-half);
    color: var(--text);
    resize: vertical;

    &:focus {
      outline: 2px solid var(--stroke-light);
    }

    &.invalid {
      outline: 2px solid var(--error);
    }
  }
}

.form-textarea__label-wrapper {
  display: flex;
  gap: var(--padding);
  height: 23px;
  align-items: center;

  >button {
    margin: 0;
    padding: var(--padding-quarter) var(--padding-half);
    background: var(--text);
    border: none;
    outline: none;
    color: var(--background);

    cursor: pointer;
    transition: background 200ms;
    border-radius: var(--radius);

    &:hover:not(:disabled) {
      background: var(--text-darker);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.8;
    }
  }
}
</style>
