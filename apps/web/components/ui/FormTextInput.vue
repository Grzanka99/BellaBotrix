<script setup lang="ts">
defineProps<{
  label?: string,
  error?: false | string,
  name: string;
  placeholder?: string,
  modelValue: string,
  password?: boolean,
  disabled?: boolean,
}>()

const emit = defineEmits(['update:modelValue']);

const handleInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
}
</script>

<template>
  <label class='form-text-input' :title="error || undefined">
    <span class="form-text-input__label" v-if="label">{{ label }}</span>
    <input class="form-text-input__input" :class="{ 'invalid': !!error }" :disabled="disabled"
      :type="password ? 'password' : 'text'" :name="name" :placeholder="placeholder" :value="modelValue"
      @input="handleInput" />
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
