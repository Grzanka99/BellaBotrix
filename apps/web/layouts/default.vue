<script setup lang="ts">
import NavBar from '~/components/navbar/NavBar.vue';
</script>

<template>
  <div id="panel">
    <NavBar />
    <div id="infobar">some info</div>
    <div id="panel-content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
#panel {
  display: grid;
  grid-template-areas: "info info" "nav content";
  grid-template-rows: 50px calc(100vh - 50px);
  grid-template-columns: 250px calc(100% - 250px);
}

#navbar {
  grid-area: nav;
}

#infobar {
  grid-area: info;
}

#panel-content {
  grid-area: content;
}
</style>
