<script setup lang="ts">
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from '@/components/ui/Table';
import FormTextInput from '~/components/ui/FormTextInput.vue';
import FormButton from '~/components/ui/FormButton.vue';
import CommandMessage from '~/components/commands/CommandMessage.vue';
import { useStorage } from '@vueuse/core'

const channel = useStorage('selectedChannel', undefined);
const { data, refresh } = useFetch(() => `/api/${channel.value}/commands`);

const gridTemplate = "2fr 1fr 4fr 2fr 100px 100px";

const query = ref("");

const displayData = computed(() => {
  if (!query.value.length) {
    return data.value;
  }

  return data.value?.filter(el => el.name.includes(query.value) || el.alias.includes(query.value));
})

</script>

<template>
  <div id="commands-page">
    <div id="commands-page-controls">
      <div id="commands-page-controls__search">
        <FormTextInput placeholder="Search by name..." v-model="query" />
        <FormButton @click="query = ''">clear</FormButton>
      </div>
    </div>
    <Table>
      <TableHead :grid-template="gridTemplate">
        <TableHeader>name</TableHeader>
        <TableHeader>enabled</TableHeader>
        <TableHeader>message</TableHeader>
        <TableHeader>aliases</TableHeader>
      </TableHead>
      <TableBody>
        <TableRow v-for="command in displayData" :grid-template="gridTemplate">
          <TableCell>{{ command.name }}</TableCell>
          <TableCell>{{ command.enabled }}</TableCell>
          <TableCell>
            <CommandMessage :message="command.message" />
          </TableCell>
          <TableCell>{{ command.alias }}</TableCell>
          <TableCell centered>
            <FormButton>edit</FormButton>
          </TableCell>
          <TableCell centered><FormButton>delete</FormButton></TableCell>
        </TableRow>
      </TableBody>
    </Table>
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

  &__search {
    display: flex;
    width: 400px;
    gap: var(--padding);
  }
}
</style>
