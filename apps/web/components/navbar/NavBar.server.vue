<script setup lang="ts">
import type { TRoute } from "~/types/ui.type";
import NavigationLink from "../ui/NavigationLink.vue";
import FormButton from "../ui/FormButton.vue";
import SpacerWithTitle from "../ui/SpacerWithTitle.vue";
import { useStorage } from "@vueuse/core";

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
    icon: "material-symbols:match-word-rounded"
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
]);


const accountOnlyRoutes = [
  {
    to: "/panel/access",
    displayName: "access",
    icon: "material-symbols:security",
  },
]


const auth = useAuth();
const isGlobalAdmin = computed(() => auth.session.value?.perms?.includes('admin'));
const canAccessGlobalSettings = computed(() => isGlobalAdmin.value || auth.session.value?.perms?.includes('r6dleadmin'));

const channelName = useStorage<string | undefined>(
  "selectedChannelName",
  undefined,
);

// NOTE: Admin only
const globalSettings = [
  {
    to: "/panel/r6dle",
    displayName: "r6dle",
    icon: 'material-symbols:person',
    adminType: 'r6dleadmin',
  },
  {
    to: "/panel/permissions",
    displayName: "permissions",
    icon: 'material-symbols:user-attributes-outline',
    adminType: 'admin',
  }
]



const handleAuthRefirect = () => {
  // @ts-ignore
  window.location = "/api/auth-redirect";
}

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
      <template v-if="canAccessGlobalSettings">
        <SpacerWithTitle text="Global/Admin settings" />
        <template
          v-for="route in globalSettings">
          <NavigationLink
            v-if="isGlobalAdmin || $auth.session.value?.perms?.includes(route.adminType)"
            :to="route.to"
            :display-name="route.displayName"
            :icon="route.icon" />
        </template>
      </template>
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
