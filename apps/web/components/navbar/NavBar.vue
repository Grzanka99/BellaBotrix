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

const handleAuthRefirect = () => {
  // @ts-ignore
  window.location = "/api/auth-redirect";
}

const auth = useAuth();
// NOTE: Quick one just to allow quick restart till better approach
const ALLOWED = ["Trejekk", "cezary"];
const isAllowed = computed(() =>
  ALLOWED.includes(auth.session.value?.username || ""),
);

const isBlocked = ref(false);
const callRestart = async () => {
  if (isAllowed) {
    isBlocked.value = true;
    await $fetch("/api/restart-bot", { method: "POST" });
    isBlocked.value = false;
  }
};


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
    <div class="routes control-buttons">
      <FormButton
        v-if="isAllowed"
        type="button"
        @click="callRestart"
        :disabled="isBlocked"
        :not-allowed="isBlocked">
        <Icon name="material-symbols:refresh" />
        restart
      </FormButton>
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
