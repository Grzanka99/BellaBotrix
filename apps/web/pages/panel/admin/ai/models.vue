<script lang="ts" setup>
import Table from "~/components/ui/Table/Table.vue";
import TableHead from "~/components/ui/Table/TableHead.vue";
import TableRow from "~/components/ui/Table/TableRow.vue";
import TableBody from "~/components/ui/Table/TableBody.vue";
import TableCell from "~/components/ui/Table/TableCell.vue";
import TableHeader from "~/components/ui/Table/TableHeader.vue";
import FormButton from "~/components/ui/FormButton.vue";
import FancyToggle from "~/components/ui/FancyToggle.vue";
import EditModelModal from "~/components/ai-settings/EditModelModal.vue";
import NewModelModal from "~/components/ai-settings/NewModelModal.vue";

import type { OllamaAIModels } from "@prisma/client";
import { useAIModelsStore } from "~/store/ai-models.store";

definePageMeta({
  validate: () => {
    const perms = useAuth().session.value?.perms || [];
    return perms.includes("admin");
  },
});

const s = useAIModelsStore();

const gridTemplate = "100px 1fr 3fr 120px 120px";

const toEdit = ref<OllamaAIModels | undefined>(undefined);

const newForm = ref(false);

onMounted(() => {
  s.startRefresh();
});

onUnmounted(() => {
  s.stopRefresh();
});

useHead({
  title: "AI Models",
});
</script>

<template>
  <NewModelModal :open="newForm" @cancel="newForm = false" />
  <EditModelModal v-if="toEdit" :original-model="toEdit" @cancel="toEdit = undefined" />
  <div class="ai-models-page">
    <div class="ai-models-page-controls">
      <div></div>
      <div class="ai-models-page-controls__new-model">
        <FormButton type="button" @click="newForm = true">Add new model</FormButton>
      </div>
    </div>
    <Table>
      <TableHead :grid-template="gridTemplate">
        <TableHeader></TableHeader>
        <TableHeader>name</TableHeader>
        <TableHeader>description</TableHeader>
        <TableHeader></TableHeader>
        <TableHeader></TableHeader>
      </TableHead>
      <TableBody>
        <TableRow v-for="model in s.models" :grid-template="gridTemplate" :key="model.id">
          <TableCell centered>
            <FancyToggle
              :value="model.enabled"
              @change="enabled => s.handleUpdate({
                id: model.id,
                enabled
              })" />
          </TableCell>
          <TableCell>{{ model.name }}</TableCell>
          <TableCell>{{ model.description }}</TableCell>
          <TableCell centered>
            <FormButton type="button" smaller @click="toEdit = model">
              <Icon name="material-symbols:edit" />
              edit
            </FormButton>
          </TableCell>
          <TableCell centered>
            <FormButton
              type="button"
              smaller
              @click="s.handleDelete(model.id)">
              <Icon name="material-symbols:delete-forever" />
              delete
            </FormButton>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<style lang="scss" scoped>
.ai-models-page {
  display: flex;
  flex-direction: column;
  gap: var(--padding);

  height: 100%;

  &-controls {
    display: flex;
    justify-content: space-between;

    &__new-model {
      display: flex;
      width: 200px;
    }
  }
}
</style>
