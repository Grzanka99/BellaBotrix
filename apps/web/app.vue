<script setup lang="ts">
useHead({
  htmlAttrs: {
    class:"dark"
  }
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style lang="scss">
@import url("./assets/index.scss");

body {
  font-size: 1.6rem;
}

body,
#__nuxt {
  width: 100%;
  height: 100vh;
}
</style>
