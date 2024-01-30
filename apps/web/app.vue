<script setup lang="ts">
useDark();

const auth = useAuth();
const route = useRoute();

watch(auth.loggedIn, () => {
  if (!auth.loggedIn.value && route.path !== "/login") {
    // @ts-expect-error
    window.location = "/login";
  }
});

onBeforeMount(() => {
  if (!auth.loggedIn.value && route.path !== "/login") {
    // @ts-expect-error
    window.location = "/login";
  }
});
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
