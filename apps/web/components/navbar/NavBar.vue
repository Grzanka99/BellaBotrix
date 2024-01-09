<script setup lang="ts">
import type { TRoute } from '~/types/ui.type';
import NavigationLink from '../ui/NavigationLink.vue';

const routes = computed<TRoute[]>(() => [
  { to: '/panel/commands', displayName: 'commands' },
  { to: '/panel/solo', displayName: 'solo' },
  { to: '/panel/users', displayName: 'users' },
  { to: '/panel/timers', displayName: 'timers' },
])

</script>
<template>
  <nav id="navbar">
    <NavigationLink v-for="route in routes" :to="route.to" :display-name="route.displayName" />
  </nav>
</template>

<style lang="scss" scoped>
#navbar {
  display: flex;
  flex-direction: column;
  padding: var(--padding-half);
  gap: var(--padding-quarter);
  border-right: 1px solid var(--stroke);
  border-top: 1px solid var(--stroke);
}
</style>
