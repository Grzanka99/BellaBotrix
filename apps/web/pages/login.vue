<script setup lang="ts">
import LoginForm from '~/components/auth/LoginForm.vue';
import RegistrationForm from '~/components/auth/RegistrationForm.vue';

const formType = ref<"login" | "register">("login");

definePageMeta({
  layout: "login"
})
</script>

<template>
  <div class="tabs">
    <button type="button" class="tabs__tab" :class="{ 'tabs__tab--curr': formType === 'login' }"
      @click="formType = 'login'">Login</button>
    <button type="button" class="tabs__tab" :class="{ 'tabs__tab--curr': formType === 'register' }"
      @click="formType = 'register'">Register</button>
  </div>
  <div id="login-page-card">
    <h2 v-if="formType === 'login'">Login to existing account</h2>
    <h2 v-else>Create new account</h2>
    <LoginForm v-if="formType === 'login'" />
    <RegistrationForm v-else />
  </div>
</template>

<style lang="scss" scoped>
$width: 400px;

#login-page-card {
  color: var(--text);
  width: $width;

  padding: var(--padding);
  border-radius: var(--radius);
  border: 1px solid var(--stroke);

  display: flex;
  flex-direction: column;

  gap: var(--padding-double);
}

.tabs {
  width: $width;
  padding: var(--padding-quarter);
  gap: var(--padding-quarter);

  border-radius: var(--radius);
  border: 1px solid var(--stroke-light);
  background: var(--background-light);

  margin-bottom: var(--padding-quarter);

  display: flex;

  &__tab {
    margin: 0;
    padding: var(--padding-half);
    background: transparent;
    border: none;
    outline: none;
    color: var(--text);
    font-weight: bold;

    width: 100%;
    cursor: pointer;
    transition: background 200ms;
    border-radius: var(--radius);

    &--curr {
      background: var(--background-dim);
    }
  }
}
</style>
