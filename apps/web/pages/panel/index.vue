<script setup lang="ts">
const auth = useAuth();

useHead({
  title: "Dashboard",
});
</script>

<template>
  <h1>
    Hey <i>{{ auth.session.value?.username }}</i
    >! welcome to Bellatrix panel!
  </h1>
</template>
