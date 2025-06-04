<script setup lang="ts">
import PopupOverlay from "~/components/popup-handler/PopupOverlay.vue";
</script>

<template>
  <PopupOverlay />
  <div id="overlay-builder-layout">
    <slot />
  </div>
</template>

<style>
#overlay-builder-layout {
  overflow: scroll;

  width: 100%;
  height: 100vh;
  background: var(--background-dark);
}
</style>
