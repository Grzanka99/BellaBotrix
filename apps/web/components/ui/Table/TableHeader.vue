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
  vertical-align: top;

  &:not(:last-child) {
    border-right: 1px solid var(--stroke);
  }

  &__content {
    padding: var(--padding);
    width: 100%;
    height: 100%;
    font-weight: bold;
  }
}
</style>
