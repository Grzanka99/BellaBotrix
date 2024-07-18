<script setup lang="ts">
import PopupOverlay from '~/components/popup-handler/PopupOverlay.vue';
</script>

<template>
  <PopupOverlay />
  <div id="login-layout">
    <slot />
  </div>
</template>

<style lang="scss">
#login-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100px;
  width: 100%;
}


#login-form {
  display: flex;
  flex-direction: column;

  gap: var(--padding);
}
</style>
