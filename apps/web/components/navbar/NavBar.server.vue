<script setup lang="ts">
import type { TRoute } from "~/types/ui.type";
import NavigationLink from "../ui/NavigationLink.vue";
import FormButton from "../ui/FormButton.vue";
import SpacerWithTitle from "../ui/SpacerWithTitle.vue";
import { useStorage } from "@vueuse/core";
import RequirePerms from "../auth/RequirePerms.server.vue";

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
    to: "/panel/trigger-words",
    displayName: "trigger words",
    icon: "material-symbols:match-word-rounded",
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
    to: "/panel/automod-events",
    displayName: "automod events",
    icon: "material-symbols:robot",
  },
  {
    to: "/panel/settings",
    displayName: "settings",
    icon: "material-symbols:settings",
  },
]);

const accountOnlyRoutes = [
  {
    to: "/panel/access",
    displayName: "access",
    icon: "material-symbols:security",
  },
];

const channelName = useStorage<string | undefined>("selectedChannelName", undefined);

// NOTE: Admin only
const globalSettings = [
  {
    to: "/panel/r6dle",
    displayName: "r6dle",
    icon: "material-symbols:person",
    adminType: "r6dleadmin",
  },
];

const adminSettings = [
  {
    to: "/panel/admin/permissions",
    displayName: "permissions",
    icon: "material-symbols:user-attributes-outline",
    adminType: "admin",
  },
  {
    to: "/panel/admin/ai/system-prompts",
    displayName: "AI S. Prompts",
    icon: "material-symbols:network-intelligence",
    adminType: "admin",
  },
  {
    to: "/panel/admin/ai/models",
    displayName: "AI Models",
    icon: "material-symbols:network-intelligence",
    adminType: "admin",
  },
];

const handleAuthRefirect = () => {
  // @ts-ignore
  window.location = "/api/auth-redirect";
};
</script>
<template>
  <nav id="navbar">
    <div class="routes">
      <SpacerWithTitle :text="`Channel: #${channelName}`" />
      <NavigationLink
        v-for="route in routes"
        :to="route.to"
        :display-name="route.displayName"
        :icon="route.icon" />
      <RequirePerms :require="['r6dleadmin']" type="hide">
        <SpacerWithTitle text="Global settings" />
        <template v-for="route in globalSettings">
          <RequirePerms :require="[route.adminType]" type="hide">
            <NavigationLink
              :to="route.to"
              :display-name="route.displayName"
              :icon="route.icon" />
          </RequirePerms>
        </template>
      </RequirePerms>
      <RequirePerms :require="[]" type="hide">
        <SpacerWithTitle text="Admin settings" />
        <template v-for="route in adminSettings">
          <NavigationLink
            :to="route.to"
            :display-name="route.displayName"
            :icon="route.icon" />
        </template>
      </RequirePerms>
      <SpacerWithTitle text="User-only settings" />
      <NavigationLink v-for="route in accountOnlyRoutes" :to="route.to" :display-name="route.displayName"
        :icon="route.icon" />
    </div>
    <div class="routes control-buttons">
      <FormButton type="button" @click="handleAuthRefirect">
        <Icon name="material-symbols:security" />
        authorize
      </FormButton>
      <FormButton type="button" @click="authLogout()">
        <Icon name="material-symbols:logout" />
        Logout
      </FormButton>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
#navbar {
  padding: var(--padding-half);
  border-right: 1px solid var(--stroke);
  justify-content: space-between;
}

.navbar {
  &__split {
    display: flex;
    flex-direction: column;
  }
}

#navbar,
.routes {
  display: flex;
  flex-direction: column;
  gap: var(--padding-quarter);
}

.control-buttons {
  >button {
    >svg {
      position: absolute;
      left: var(--padding-double);
      font-size: 1.6rem;
    }
  }
}
</style>
