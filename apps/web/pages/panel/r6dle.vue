<script setup lang="ts">
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/Table";
import type { TCreateR6DleOperator, TR6dleOperatorV2 } from "r6dle";
import FancyToggle from "~/components/ui/FancyToggle.vue";
import FormButton from "~/components/ui/FormButton.vue";
import { useR6DleOperatorsStore } from '~/store/r6dle-operators.store';
import NewR6DleOperatorModal from "~/components/r6dle/NewR6DleOperatorModal.vue";
import FormTextInput from "~/components/ui/FormTextInput.vue";
import EditR6DleOperatorModal from "~/components/r6dle/EditR6DleOperatorModal.vue";


const s = useR6DleOperatorsStore();

onMounted(() => {
  s.startRefresh();
})
onUnmounted(() => {
  s.stopRefresh();
})

const toEdit = ref<TR6dleOperatorV2 | undefined>(undefined);
const newOperatorModalOpen = ref(false)

const gridTemplate = "120px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 120px 120px 120px";

const handleCreate = (v: TCreateR6DleOperator) => {
  newOperatorModalOpen.value = false;
  s.handleCreate(v);
}

useHead({
  title: "R6Dle Operators"
})
</script>

<template>
  <div id="r6dle-page">
    <EditR6DleOperatorModal v-if="toEdit" :original-operator="toEdit" @submit="s.handleUpdate"
      @cancel='toEdit = undefined' />
    <NewR6DleOperatorModal :open="newOperatorModalOpen" @submit="handleCreate" @cancel="newOperatorModalOpen = false" />
    <div id="r6dle-page-controls">
      <div id="r6dle-page-controls__search">
        <FormTextInput
          name="query"
          placeholder="Search by name..."
          v-model="s.queryFilter" />
        <FormButton type="button" @click="s.queryFilter = ''">
          clear
        </FormButton>
      </div>
      <div id="r6dle-page-controls__new-cmd">
        <FormButton type="button" @click="newOperatorModalOpen = true">
          Add new command
        </FormButton>
      </div>
    </div>
    <Table>
      <TableHead :grid-template="gridTemplate">
        <TableHeader></TableHeader>
        <TableHeader>name</TableHeader>
        <TableHeader>role</TableHeader>
        <TableHeader>side</TableHeader>
        <TableHeader>country</TableHeader>
        <TableHeader>org</TableHeader>
        <TableHeader>squad</TableHeader>
        <TableHeader>release</TableHeader>
        <TableHeader>speed</TableHeader>
        <TableHeader></TableHeader>
        <TableHeader></TableHeader>
      </TableHead>
      <TableBody>
        <template v-if="s.operators.length">
          <TableRow v-for="operator in s.filteredOperators" :grid-template="gridTemplate">
            <TableCell>
              <FancyToggle :value="operator.enabled"
                @change="(enabled) => s.handleUpdate({ id: operator.id, enabled })" />
            </TableCell>
            <TableCell>{{ operator.name }}</TableCell>
            <TableCell>{{ operator.role }}</TableCell>
            <TableCell>{{ operator.side }}</TableCell>
            <TableCell>{{ operator.country }}</TableCell>
            <TableCell>{{ operator.org }}</TableCell>
            <TableCell>{{ operator.squad }}</TableCell>
            <TableCell>{{ operator.release }}</TableCell>
            <TableCell>{{ operator.speed }}</TableCell>
            <TableCell centered>
              <FormButton type="button" smaller @click="toEdit = operator">
                <Icon name="material-symbols:edit" />
                edit
              </FormButton>
            </TableCell>
            <TableCell centered>
              <FormButton
                type="button"
                smaller
                @click="s.handleDelete(operator.id)">
                <Icon name="material-symbols:delete-forever" />
                delete
              </FormButton>
            </TableCell>
          </TableRow>
        </template>
        <TableCell v-else>Found 0 operators</TableCell>
      </TableBody>
    </Table>
  </div>
</template>

<style lang="scss" scoped>
#r6dle-page {
  display: flex;
  flex-direction: column;
  gap: var(--padding);

  height: 100%;
}

#r6dle-page-controls {
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
