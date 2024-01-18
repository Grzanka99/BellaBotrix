<template>
  <div class="styled-table">
    <slot />
  </div>
</template>
<style scoped>
.styled-table {
  border: 1px solid var(--stroke);
  border-radius: var(--padding-half);
  max-width: 100%;
  height: 100%;
  overflow: hidden;
  padding-top: 50px;
  position: relative;
}
</style>
