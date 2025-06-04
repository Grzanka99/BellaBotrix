<script setup lang="ts">
const resizable = ref<HTMLDivElement | undefined>(undefined);

const resizing = ref(false);

function handleMouseDown(event: MouseEvent) {
  event.stopPropagation();
  resizing.value = true;
  console.log("test");
}

function handleMouseUp(event: MouseEvent) {
  event.stopPropagation();
  resizing.value = false;
}
</script>

<template>
  <div
    class="resizable"
    ref="resizable"
  >
    <slot />

    <button
      class="resizable__button"
      @mousedown="handleMouseDown"
    >
      <Icon name="material-symbols:south-east" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.resizable {
  min-width: var(--font-big);
  min-height: var(--font-big);

  position: relative;
  background-color: red;

  &__button {
    margin: 0;
    padding: 0;
    background: transparent;
    border: none;
    outline: none;

    width: var(--font-big);
    height: var(--font-big);

    position: absolute;
    right: 0;
    bottom: 0;

    >svg {
      width: 100%;
      height: 100%;
    }

    &:hover {
      >svg {
        animation-name: scaling;
        animation-duration: 1s;
        animation-iteration-count: infinite;
      }
    }
  }
}

@keyframes scaling {
  0% {
    transform: translate(-1%, -1%)
  }

  70% {
    transform: translate(10%, 10%)
  }

  100% {
    transform: translate(0, 0);
  }
}
</style>
