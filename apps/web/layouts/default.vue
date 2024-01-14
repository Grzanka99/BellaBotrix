<script setup lang="ts">
import NavBar from '~/components/navbar/NavBar.vue';
import TopBar from '~/components/navbar/TopBar.vue';
</script>

<template>
  <div id="panel">
    <NavBar />
    <ClientOnly>
      <TopBar />
      <div id="panel-content">
        <slot />
      </div>
    </ClientOnly>
  </div>
</template>

<style lang="scss">
#panel {
  display: grid;
  grid-template-areas: "info info" "nav content";
  grid-template-rows: 75px calc(100vh - 75px);
  grid-template-columns: 250px calc(100% - 250px);
}

#navbar {
  grid-area: nav;
}

#topbar {
  grid-area: info;
}

#panel-content {
  padding: var(--padding);
  height: 100%;
  grid-area: content;
  overflow-y: auto;
}
</style>
