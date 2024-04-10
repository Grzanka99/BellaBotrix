<script setup lang="ts">
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/Table";
import FancyToggle from "~/components/ui/FancyToggle.vue";
import FormTextInput from "~/components/ui/FormTextInput.vue";
import FormButton from "~/components/ui/FormButton.vue";
import NewTriggerWordForm from "~/components/trigger-words/NewTriggerWordForm.vue";
import TriggerWordsEditForm from "~/components/trigger-words/TriggerWordsEditForm.vue";
import type { TriggerWords } from '@prisma/client';
import { useTriggerWordsStore } from '~/store/trigger-words.store';

const s = useTriggerWordsStore();
onMounted(() => {
  s.startRefresh();
})
onUnmounted(() => {
  s.stopRefresh();
})

const gridTemplate = "100px 1fr 1fr 120px 120px";

const toEdit = ref<TriggerWords | undefined>(undefined);
const newTriggerWordForm = ref(false);

useHead({
  title: 'Trigger Words'
})
</script>

<template>
  <TriggerWordsEditForm
    v-if="toEdit"
    :original-trigger="toEdit"
    @cancel="toEdit = undefined" />
  <NewTriggerWordForm v-if="newTriggerWordForm" @cancel="newTriggerWordForm = false" />
  <div id="trigger-words-page">
    <div id="trigger-words-page-controls">
      <div id="trigger-words-page-controls__search">
        <FormTextInput
          name="query"
          placeholder="Search by trigger..."
          v-model="s.queryFilter" />
        <FormButton type="button" @click="s.queryFilter = ''">clear</FormButton>
      </div>
      <div id="trigger-words-page-controls__new-timer">
        <FormButton @click="newTriggerWordForm = true" type="button">Add new trigger</FormButton>
      </div>
    </div>
    <Table>
      <TableHead :grid-template="gridTemplate">
        <TableHeader></TableHeader>
        <TableHeader>triggers</TableHeader>
        <TableHeader>response</TableHeader>
        <TableHeader></TableHeader>
        <TableHeader></TableHeader>
      </TableHead>
      <TableBody>
        <template v-if="s.triggerWords.length">
          <TableRow v-for="trigger in s.filtered" :grid-template="gridTemplate">
            <TableCell centered>
              <FancyToggle
                :value="trigger.enabled"
                @change="(enabled) => s.handleUpdate({ id: trigger.id, enabled })
                  " />
            </TableCell>
            <TableCell>{{ trigger.triggers }}</TableCell>
            <TableCell>{{ trigger.response }}</TableCell>
            <TableCell centered>
              <FormButton type="button" smaller @click="toEdit = trigger">
                <Icon name="material-symbols:edit" />
                edit
              </FormButton>
            </TableCell>
            <TableCell centered>
              <FormButton
                type="button"
                smaller
                @click="s.handleDelete(trigger.id)">
                <Icon name="material-symbols:delete-forever" />
                delete
              </FormButton>
            </TableCell>
          </TableRow>
        </template>
        <TableCell></TableCell>
      </TableBody>
    </Table>
  </div>
</template>

<style lang="scss" scoped>
#trigger-words-page {
  display: flex;
  flex-direction: column;
  gap: var(--padding);

  height: 100%;
}

#trigger-words-page-controls {
  display: flex;
  justify-content: space-between;

  &__search {
    display: flex;
    width: 400px;
    gap: var(--padding);
  }

  &__new-timer {
    display: flex;
    width: 200px;
  }
}
</style>
