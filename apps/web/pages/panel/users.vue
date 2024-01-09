<script setup lang="ts">
const channel = ref(1)

const { data } = useFetch(() => `/api/${channel.value}/users`);

</script>

<template>
  <input type="number" v-model="channel" />
  {{ data }}
</template>
