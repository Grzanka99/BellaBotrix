<script setup lang="ts">
import type { TDtoUser } from '~/types/auth.type';

const username = ref("");
const password = ref("");

const onSubmit = (e: Event) => {
  const data: TDtoUser = {
    username: username.value,
    password: password.value
  }
  console.log(data);
  authLogin(data.username, data.password)
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <input type="text" name="username" v-model="username">
    <input type="text" name="password" v-model="password">
    <button type="submit">login</button>
  </form>
</template>
