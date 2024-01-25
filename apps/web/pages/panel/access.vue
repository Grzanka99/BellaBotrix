<script setup lang="ts">
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/Table";
import FormButton from "~/components/ui/FormButton.vue";
import { useChaccStore } from "~/store/chacc.store";
import ChaccForm from "~/components/chacc/ChaccForm.vue";

const store = useChaccStore();

const gridTemplate = "1fr 120px 120px";

useHead({
  title: "Access",
});

const isOpen = ref(false);

</script>

<template>
  <ChaccForm v-if="isOpen" @cancel='isOpen = false' />
  <div id="access-page">
    <div id="access-page-controls">
      <h3>
        You will manage access only to your own channel!
      </h3>
      <FormButton type="button" @click="isOpen = true">Grant access</FormButton>
    </div>
    <Table>
      <TableHead :grid-template="gridTemplate">
        <TableHeader>username</TableHeader>
        <TableHeader>access</TableHeader>
        <TableHeader></TableHeader>
      </TableHead>
      <TableBody>
        <template v-if="store.chacc.length">
          <TableRow v-for="chacc in store.chacc" :grid-template="gridTemplate">
            <TableCell>{{ chacc.username }}</TableCell>
            <TableCell>{{ chacc.accessLevel }}</TableCell>
            <TableCell>
              <FormButton
                type="button"
                smaller
                @click="store.handleDelete(chacc.userid)"
                :disabled="chacc.userid === $auth.session.value?.id">
                <Icon name="material-symbols:delete-forever" />
                delete
              </FormButton>
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>

<style lang="scss" scoped>
#access-page {
  display: flex;
  flex-direction: column;
  gap: var(--padding);
  height: 100%;
}

#access-page-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    padding: 0;
  }

  button {
    width: 300px;
  }
}
</style>
