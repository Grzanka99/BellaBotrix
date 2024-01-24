<script setup lang="ts">
import type { TRoute } from "~/types/ui.type";
import NavigationLink from "../ui/NavigationLink.vue";
import FormButton from "../ui/FormButton.vue";

const routes = computed<TRoute[]>(() => [
  {
    to: "/panel",
    displayName: "dashboard",
    icon: "material-symbols:dashboard",
  },
  {
    to: "/panel/commands",
    displayName: "commands",
    icon: "material-symbols:android-messages",
  },
  {
    to: "/panel/solo",
    displayName: "solo",
    icon: "material-symbols:local-fire-department-rounded",
  },
  {
    to: "/panel/users",
    displayName: "users",
    icon: "material-symbols:person",
  },
  {
    to: "/panel/timers",
    displayName: "timers",
    icon: "material-symbols:alarm",
  },
  {
    to: "/panel/settings",
    displayName: "settings",
    icon: "material-symbols:settings",
  },
  {
    to: "/panel/access",
    displayName: "access",
    icon: "material-symbols:security",
  },
]);
</script>
<template>
  <nav id="navbar">
    <div class="routes">
      <NavigationLink
        v-for="route in routes"
        :to="route.to"
        :display-name="route.displayName"
        :icon="route.icon" />
    </div>
    <FormButton type="button" @click="authLogout()">
      <Icon name="material-symbols:logout" />
      Logout
    </FormButton>
  </nav>
</template>

<style lang="scss" scoped>
#navbar {
  padding: var(--padding-half);
  border-right: 1px solid var(--stroke);
  justify-content: space-between;
}

#navbar,
.routes {
  display: flex;
  flex-direction: column;
  gap: var(--padding-quarter);
}
</style>
