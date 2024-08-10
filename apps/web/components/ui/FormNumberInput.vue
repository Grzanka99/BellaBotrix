<script setup lang="ts">
defineProps<{
  label?: string;
  error?: false | string;
  name: string;
  placeholder?: string;
  modelValue: number;
  disabled?: boolean;
  max?: number;
  min?: number;
}>();

const emit = defineEmits<(e: "update:modelValue", v: number) => void>();

const handleInput = (e: Event) => {
  emit("update:modelValue", Number((e.target as HTMLInputElement).value));
};
</script>

<template>
  <label class='form-text-input' :title="error || undefined">
    <span class="form-text-input__label" v-if="label">{{ label }}</span>
    <input class="form-text-input__input" :class="{ 'invalid': !!error }" :disabled="disabled"
      type="number" :name="name" :placeholder="placeholder" :value="modelValue"
      @input="handleInput" :min="min" :max="max" />
  </label>
</template>

<style lang="scss" scoped>
.form-text-input {
  display: flex;
  flex-direction: column;
  gap: 5px;

  &__input {
    background: transparent;
    border: 1px solid var(--stroke);
    border-radius: var(--radius);
    font-size: 1.6rem;
    padding: var(--padding-half);
    color: var(--text);

    &:focus {
      outline: 2px solid var(--stroke-light);
    }

    &.invalid {
      outline: 2px solid var(--error);
    }
  }
}
</style>
