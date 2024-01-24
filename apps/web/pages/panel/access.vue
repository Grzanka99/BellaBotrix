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

const store = useChaccStore();

const gridTemplate = "1fr 120px 120px";

useHead({
  title: "Access",
});
</script>

<template>
  <h2 :style="{ paddingBottom: 'var(--padding)' }">
    You will manage access only to your own channel!
  </h2>
  <div id="access-page">
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
