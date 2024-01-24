<script setup lang="ts">
import FormTextInput from "~/components/ui/FormTextInput.vue";
import FormButton from "~/components/ui/FormButton.vue";
import NewCommandModal from "~/components/commands/NewCommandModal.vue";
import CommandsList from "~/components/commands/CommandsList.vue";
import { useCommandsStore } from "~/store/commands.store";

const commands = useCommandsStore();

onMounted(() => {
  commands.startRefresh();
});
onUnmounted(() => {
  commands.stopRefresh();
});

const newCommandModalOpen = ref(false);

useHead({
  title: "Commands",
});
</script>

<template>
  <div id="commands-page">
    <NewCommandModal
      :open="newCommandModalOpen"
      @submit="
        (p) => {
          commands.handleCreate(p);
          newCommandModalOpen = false;
        }
      "
      @cancel="newCommandModalOpen = false"
    />
    <div id="commands-page-controls">
      <div id="commands-page-controls__search">
        <FormTextInput
          name="query"
          placeholder="Search by name..."
          v-model="commands.queryFileter"
        />
        <FormButton type="button" @click="commands.queryFileter = ''">
          clear
        </FormButton>
      </div>
      <div id="commands-page-controls__new-cmd">
        <FormButton type="button" @click="newCommandModalOpen = true">
          Add new command
        </FormButton>
      </div>
    </div>
    <CommandsList :commands="commands.filteredCommands" />
  </div>
</template>

<style lang="scss" scoped>
#commands-page {
  display: flex;
  flex-direction: column;
  gap: var(--padding);

  height: 100%;
}

#commands-page-controls {
  display: flex;
  justify-content: space-between;

  &__search {
    display: flex;
    width: 400px;
    gap: var(--padding);
  }

  &__new-cmd {
    display: flex;
    width: 200px;
  }
}
</style>
