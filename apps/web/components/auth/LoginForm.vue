<script setup lang="ts">
import FormButton from '../ui/FormButton.vue';
import FormTextInput from '../ui/FormTextInput.vue';
import { SDtoUser, type TDtoUser } from '~/types/auth.type';

const username = ref("");
const password = ref("");

const parsed = computed(() => SDtoUser.safeParse({
  username: username.value,
  password: password.value
}))

const { validate, isInvalid, errors } = useValidation<keyof TDtoUser>()

watchEffect(() => {
  errors.value = [];
  if (!username.value.length || !password.value.length) {
    return;
  }

  if (!parsed.value.success) {
    errors.value = parsed.value.error.errors;
  }
})

const onSubmit = () => {
  if (parsed.value.success) {
    authLogin(parsed.value.data.username, parsed.value.data.password);
  }
}

</script>
<template>
  <form id="login-form" @submit.prevent="onSubmit">
    <FormTextInput label="Username" name="username" placeholder="username" v-model="username"
      :error="validate('username')" />
    <FormTextInput label="Password" name="password" placeholder="password" v-model="password"
      :error="validate('password')" password />
    <FormButton type="submit" :disabled="isInvalid">Login</FormButton>
  </form>
</template>
