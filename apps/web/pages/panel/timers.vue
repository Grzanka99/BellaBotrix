<script setup lang="ts">
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/Table";
import FormTextInput from "~/components/ui/FormTextInput.vue";
import FormButton from "~/components/ui/FormButton.vue";
import { useTimersStore } from "~/store/timers.store";
import { type Timers } from "@prisma/client";
import TimerEditForm from "~/components/timers/TimerEditForm.vue";
import NewTimerForm from "~/components/timers/NewTimerForm.vue";

const timers = useTimersStore();
onMounted(() => {
  timers.startRefresh();
});
onUnmounted(() => {
  timers.stopRefresh();
});

const gridTemplate = "1fr 150px 120px 120px";

const toEdit = ref<Timers | undefined>(undefined);

const newTimerForm = ref(false);

useHead({
  title: "Timers",
});
</script>

<template>
  <TimerEditForm
    v-if="toEdit"
    :original-timer="toEdit"
    @cancel="toEdit = undefined"
  />
  <NewTimerForm v-if="newTimerForm" @cancel="newTimerForm = false" />
  <div id="timers-page">
    <div id="timers-page-controls">
      <div id="timers-page-controls__search">
        <FormTextInput
          name="query"
          placeholder="Search by username..."
          v-model="timers.queryFilter"
        />
        <FormButton type="button" @click="timers.queryFilter = ''"
          >clear</FormButton
        >
      </div>
      <div id="timers-page-controls__new-timer">
        <FormButton @click="newTimerForm = true" type="button"
          >Add new timer</FormButton
        >
      </div>
    </div>
    <Table>
      <TableHead :grid-template="gridTemplate">
        <TableHeader>message</TableHeader>
        <TableHeader>timeout</TableHeader>
        <TableHeader></TableHeader>
        <TableHeader></TableHeader>
      </TableHead>
      <TableBody>
        <template v-if="timers.timers.length">
          <TableRow
            v-for="timer in timers.filtered"
            :grid-template="gridTemplate"
          >
            <TableCell>{{ timer.message }}</TableCell>
            <TableCell>{{ timer.timeout }}</TableCell>
            <TableCell centered>
              <FormButton type="button" smaller @click="toEdit = timer">
                <Icon name="material-symbols:edit" />
                edit
              </FormButton>
            </TableCell>
            <TableCell centered>
              <FormButton
                type="button"
                smaller
                @click="timers.handleDelete(timer.id)"
              >
                <Icon name="material-symbols:delete-forever" />
                delete
              </FormButton>
            </TableCell>
          </TableRow>
        </template>
        <TableCell v-else>Found 0 solos</TableCell>
      </TableBody>
    </Table>
  </div>
</template>

<style lang="scss" scoped>
#timers-page {
  display: flex;
  flex-direction: column;
  gap: var(--padding);

  height: 100%;
}

#timers-page-controls {
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
