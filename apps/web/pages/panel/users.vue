<script setup lang="ts">
import { useStorage } from '@vueuse/core'

const channel = useStorage('selectedChannel', undefined);
const { data } = useFetch(() => `/api/${channel.value}/users`);
</script>

<template>
  {{ data }}
</template>
