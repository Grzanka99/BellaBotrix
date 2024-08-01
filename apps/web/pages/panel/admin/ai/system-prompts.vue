<script setup lang="ts">
import Table from '~/components/ui/Table/Table.vue';
import TableHead from '~/components/ui/Table/TableHead.vue';
import TableRow from '~/components/ui/Table/TableRow.vue';
import TableBody from '~/components/ui/Table/TableBody.vue';
import TableCell from '~/components/ui/Table/TableCell.vue';
import TableHeader from '~/components/ui/Table/TableHeader.vue';
import FormButton from '~/components/ui/FormButton.vue';
import FancyToggle from '~/components/ui/FancyToggle.vue';
import FancyOrderButton from '~/components/ui/FancyOrderButton.vue';
import { useAISystemPromptsStore } from '~/store/ai-system-prompts.store';
import type { OllamaAISetupPrompts } from '@prisma/client';
import EditSystemPrompt from '~/components/ai-settings/EditSystemPrompt.vue';

definePageMeta({
  validate: () => {
    const perms = useAuth().session.value?.perms || [];
    return perms.includes('admin');
  }
})

const s = useAISystemPromptsStore();

const gridTemplate = "100px 1fr 4fr 120px 120px 120px";

const toEdit = ref<OllamaAISetupPrompts | undefined>(undefined);

onMounted(() => {
  s.startRefresh();
})

onUnmounted(() => {
  s.stopRefresh();
})

useHead({
  title: 'AI System Prompts',
})
</script>


<template>
  <EditSystemPrompt v-if="toEdit"
    :original-prompt="toEdit"
    @cancel="toEdit = undefined" />
  <div class="ai-settings-page">
    <div class="ai-settings-page-controls">
      <div></div>
      <div class="ai-settings-page-controls__new-prompt">
        <FormButton @click="s.handleCreate" type="button">Add new prompt</FormButton>
      </div>
    </div>
    <Table>
      <TableHead :grid-template="gridTemplate">
        <TableHeader>enabled</TableHeader>
        <TableHeader>name</TableHeader>
        <TableHeader>text</TableHeader>
        <TableHeader></TableHeader>
        <TableHeader></TableHeader>
        <TableHeader></TableHeader>
      </TableHead>
      <TableBody>
        <TableRow v-for="(prompt, i) in s.prompts" :grid-template="gridTemplate" :key="prompt.id">
          <TableCell centered>
            <FancyToggle :value="prompt.enabled" @change="(enabled) => s.handleUpdate({
              id: prompt.id,
              enabled
            })" />
          </TableCell>
          <TableCell>{{ prompt.name }}</TableCell>
          <TableCell>{{ prompt.text }}</TableCell>
          <TableCell centered>
            <FormButton type="button" smaller @click="toEdit = prompt">
              <Icon name="material-symbols:edit" />
              edit
            </FormButton>
          </TableCell>
          <TableCell centered>
            <FormButton
              type="button"
              smaller
              @click="s.handleDelete(prompt.id)">
              <Icon name="material-symbols:delete-forever" />
              delete
            </FormButton>
          </TableCell>
          <TableCell centered>
            <FancyOrderButton @change="(direction) => s.handleUpdate({
              id: prompt.id,
              orderDirection: direction,
            })"
              :no-up="i === 0"
              :no-down="i === s.prompts.length - 1" />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<style lang="scss" scoped>
.ai-settings-page {
  display: flex;
  flex-direction: column;
  gap: var(--padding);

  height: 100%;

  &-controls {
    display: flex;
    justify-content: space-between;

    &__new-prompt {
      display: flex;
      width: 200px;
    }
  }
}
</style>
