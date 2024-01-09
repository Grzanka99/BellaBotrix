<script setup lang="ts">

const { data } = useFetch('/api/users');

definePageMeta({
  auth: true
})
</script>

<template>
  Hey there
    <li>
      <button type="button" @click="async () => await authLogout()">logout</button>
    </li>
  <ul>
    <li v-for="user in data">
      {{ user.id }} - {{ user.userid }}
    </li>
  </ul>
</template>

<style lang="scss" scoped>
ul {
  color: var(--text);
}
</style>
