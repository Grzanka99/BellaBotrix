<script setup lang="ts">
defineProps<{
  isLive: boolean;
}>();
</script>
<template>
  <div class="isliveicon">
    <div class="isliveicon__icon" :data-live="isLive"></div>
    <span class="isliveicon__text">
      {{ isLive ? 'live' : 'offline' }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.isliveicon {
  width: 125px;
  border: 1px solid var(--stroke);
  border-radius: var(--radius);
  padding: var(--padding);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--padding);

  &__icon {
    position: relative;
    width: 11px;
    height: 11px;
    border-radius: 50%;

    &[data-live=true] {
      --base-color: red;
    }

    &[data-live=false] {
      --base-color: gray;
    }

    background: var(--base-color);

    &[data-live=true]::before {
      width: 100%;
      height: 100%;
      content: "";
      display: block;
      position: absolute;
      z-index: -1;

      animation-name: pulse;
      animation-duration: 2s;
      animation-iteration-count: infinite;

      border-radius: 50%;
      background: var(--base-color);
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(100%);
    opacity: 0.5;
  }

  70% {
    opacity: 0.4;
  }

  100% {
    transform: scale(200%);
    opacity: 0;
  }
}
</style>
