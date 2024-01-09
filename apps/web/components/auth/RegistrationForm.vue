<script setup lang="ts">
import { SDtoCreateUser, type TDtoCreateUser } from '~/types/auth.type';

const username = ref("");
const password = ref("");
const passwordConfirmation = ref("");
const regToken = ref("");

const passwordConfirmed = computed(() => passwordConfirmation.value === password.value);

const parsed = computed(() =>
  SDtoCreateUser.safeParse({
    username: username.value,
    password: password.value,
    regToken: regToken.value
  })
)

const { validate, isInvalid, errors } = useValidation<keyof TDtoCreateUser>();

watchEffect(() => {
  errors.value = [];
  if (!username.value.length || !password.value.length || !regToken.value.length) {
    return;
  }

  if (!parsed.value.success) {
    errors.value = parsed.value.error.errors;
  }
})

const register = async () => {
  if (parsed.value.success) {
    await authRegister(parsed.value.data);
  }
}

</script>
<template>
  <form id="login-form" @submit.prevent="register">
    <UiFormTextInput label="Username" name="username" placeholder="username" v-model="username"
      :error="validate('username')" />
    <UiFormTextInput label="Password" name="password" placeholder="password" v-model="password"
      :error="validate('password')" password />
    <UiFormTextInput label="Confirm password" name="passwordConfirmation" placeholder="confirm password"
      v-model="passwordConfirmation" :error="validate('password')" password />
    <UiFormTextInput label="Registration token" name="regToken" placeholder="registration token" v-model="regToken"
      :error="validate('regToken')" />
    <UiFormButton type="submit" :disabled="!passwordConfirmed || isInvalid">Register</UiFormButton>
  </form>
</template>
