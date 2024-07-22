<script setup lang="ts">
import type { TSettingOption } from "bellatrix";
import type { TPerms } from "~/types/permissions.type";

const props = defineProps<{
  name: string;
  option: TSettingOption<unknown>;
  disabled?: boolean;
  requiredPerms?: TPerms[],
  notAllowedMessage?: string,
}>();

const auth = useAuth();

const canEdit = computed(() => {
  if (!props.requiredPerms) {
    return true;
  }

  const userRoles = auth.session.value?.perms || [];

  for (const role of userRoles) {
    if (props.requiredPerms.includes(role)) {
      return true;
    }
  }

  return false;
})
</script>

<template>
  <div class="single-setting" :class="{ 'single-setting--disabled': disabled || !canEdit }">
    <span class="single-setting__name">
      {{ name }}
      <span v-if="!canEdit"><i>{{ notAllowedMessage }}</i></span>
    </span>
    <div class="single-setting__controller">
      <span v-if="disabled || !canEdit">{{ option.value }}</span>
      <slot v-else />
    </div>
    <div class="single-setting__desc">
      <span>
        {{ option.description }}
      </span>
      <div v-if="option.vars">
        <code v-for="key in Object.keys(option.vars)">
          <span :title="option.vars[key]">${{ key }}</span>
        </code>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.single-setting {
  display: grid;
  align-items: center;
  padding: var(--padding-half) var(--padding);
  border-top: 1px solid var(--stroke);
  gap: var(--padding);
  min-height: 75px;

  grid-template-columns: minmax(175px, 1fr) minmax(200px, 450px) 4fr;

  &:last-child {
    border-bottom: 1px solid var(--stroke);
  }

  &--disabled {
    cursor: not-allowed;
    opacity: 50%;
  }

  &__desc {
    display: flex;
    flex-direction: column;
    gap: var(--padding);

    code {
      font-size: 1.5rem;
      font-weight: 200;
      cursor: help;
    }
  }
}
</style>
