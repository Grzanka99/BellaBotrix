<script setup lang="ts">
defineProps<{
  label?: string,
  error?: false | string,
  name: string;
  placeholder?: string,
  modelValue: string,
  disabled?: boolean,
}>()

const emit = defineEmits(['update:modelValue']);

const handleInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
}
</script>

<template>
  <label class="form-textarea" :title="error || undefined">
    <span class="form-textarea__label" v-if="label">{{ label }}</span>
    <textarea class="form-textarea__input" :class="{ 'invalid': !!error }" :disabled="disabled" :name="name"
      :placeholder="placeholder" :value="modelValue" @input="handleInput" />
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
</style>
