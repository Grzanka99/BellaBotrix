<script setup lang="ts">
import type { TRoute } from "~/types/ui.type";

defineProps<TRoute>();
</script>

<template>
  <NuxtLink
    :to="to"
    class="nav-link"
    :class="`nav-link${to.replaceAll('/', '_')}`"
  >
    <Icon :name="icon" />
    {{ displayName }}
  </NuxtLink>
</template>

<style lang="scss" scoped>
.nav-link {
  padding: var(--padding-half) var(--padding);
  text-decoration: none;
  color: var(--text);
  font-weight: bold;

  width: 100%;
  cursor: pointer;
  transition: background 200ms;
  border-radius: var(--radius);

  &:hover {
    background: var(--background-light);
  }

  display: flex;
  align-items: center;
  gap: var(--padding-half);

  > svg {
    fill: var(--text);
  }
}

.router-link-active,
.router-link-exac-active {
  background: var(--background-light);
}
</style>
