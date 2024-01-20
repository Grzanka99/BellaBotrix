<template>
  <li class="styled-table-header">
    <div class="styled-table-header__content">
      <slot />
    </div>
  </li>
</template>

<style lang="scss" scoped>
.styled-table-header {
  border: none;
  position: relative;
  min-width: 0;

  &:not(:last-child) {
    // border-right: 1px solid var(--stroke);
  }

  &__content {
    overflow: hidden;
    min-width: 0;
    padding: var(--padding);
    width: 100%;
    height: 100%;
    font-weight: bold;
  }
}
</style>
