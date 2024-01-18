<script setup lang="ts">
defineProps<{
  open: boolean;
  header?: string;
  description?: string;
}>()

defineEmits(["close"])
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <div class="modal-backdrop" @click.stop="$emit('close')" v-if="open">
        <div class="modal">
          <div class="modal-header" v-if="header || description">
            <h3 v-if="header">{{ header }}</h3>
            <h5 v-if="description">{{ description }}</h5>
          </div>
          <slot />
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.modal-backdrop {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  backdrop-filter: blur(2px);
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
}

.modal {
  display: flex;
  width: fit-content;
  min-width: 100px;
  min-height: 100px;
  padding: var(--padding);
  height: fit-content;
  align-self: center;
  background: var(--background);
  border: 1px solid var(--stroke);
  border-radius: var(--radius);
  flex-direction: column;
  gap: var(--padding);
}

.modal-header {
  display: flex;
  flex-direction: column;
  gap: var(--padding-half);
  margin-bottom: var(--padding);

  h5 {
    font-weight: normal;
  }
}
</style>

