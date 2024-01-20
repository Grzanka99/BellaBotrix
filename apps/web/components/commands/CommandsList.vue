<script setup lang="ts">
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from '@/components/ui/Table';
import FormButton from '~/components/ui/FormButton.vue';
import CommandMessage from './CommandMessage.vue';
import EditCommandModal from './EditCommandModal.vue'
import FancyToggle from '../ui/FancyToggle.vue';
import type { Commands } from '@prisma/client';

defineProps<{
  commands: Commands[]
}>()

defineEmits<{
  (e: 'delete', id: number): void,
  (e: 'toggle', id: number, value: boolean): void,
}>()

const gridTemplate = "75px 2fr 4fr 2fr 100px 100px";
const toEdit = ref<Commands | undefined>(undefined);

const onCancel = () => {
  toEdit.value = undefined;
}
</script>

<template>
  <EditCommandModal v-if="toEdit" :original-command="toEdit" @cancel="onCancel" />
  <Table>
    <TableHead :grid-template="gridTemplate">
      <TableHeader></TableHeader>
      <TableHeader>name</TableHeader>
      <TableHeader>message</TableHeader>
      <TableHeader>aliases</TableHeader>
    </TableHead>
    <TableBody>
      <template v-if="commands.length">
        <TableRow v-for="command in commands" :grid-template="gridTemplate">
          <TableCell centered>
            <FancyToggle :value="command.enabled" @change="(v) => $emit('toggle', command.id, v)" />
          </TableCell>
          <TableCell>{{ command.name }}</TableCell>
          <TableCell>
            <CommandMessage :message="command.message" />
          </TableCell>
          <TableCell>{{ command.alias }}</TableCell>
          <TableCell centered>
            <FormButton type="button" @click.native="toEdit = command" smaller>edit</FormButton>
          </TableCell>
          <TableCell centered>
            <FormButton @click.native="$emit('delete', command.id)" type="button" smaller>delete</FormButton>
          </TableCell>
        </TableRow>
      </template>
      <TableCell v-else>Found 0 commands</TableCell>
    </TableBody>
  </Table>
</template>
