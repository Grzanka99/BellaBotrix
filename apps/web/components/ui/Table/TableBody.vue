<template>
  <ul class="styled-table-body">
    <slot />
  </ul>
</template>
<style lang="scss" scoped>
.styled-table-body {
  height: 100%;
  overflow-y: scroll;
  background: var(--background);

  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
