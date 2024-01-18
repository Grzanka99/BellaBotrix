<script setup lang="ts">
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from '@/components/ui/Table';
import FormButton from '~/components/ui/FormButton.vue';
import CommandMessage from './CommandMessage.vue';
import type { Commands } from '@prisma/client';

defineProps<{
  commands: Commands[]
}>()

defineEmits<{
  (e: 'delete', id: number): void
}>()

const gridTemplate = "2fr 1fr 4fr 2fr 100px 100px";
</script>

<template>
  <Table>
    <TableHead :grid-template="gridTemplate">
      <TableHeader>name</TableHeader>
      <TableHeader>enabled</TableHeader>
      <TableHeader>message</TableHeader>
      <TableHeader>aliases</TableHeader>
    </TableHead>
    <TableBody>
      <template v-if="commands.length">
        <TableRow v-for="command in commands" :grid-template="gridTemplate">
          <TableCell>{{ command.name }}</TableCell>
          <TableCell>{{ command.enabled }}</TableCell>
          <TableCell>
            <CommandMessage :message="command.message" />
          </TableCell>
          <TableCell>{{ command.alias }}</TableCell>
          <TableCell centered>
            <FormButton type="button">edit</FormButton>
          </TableCell>
          <TableCell centered>
            <FormButton @click.native="$emit('delete', command.id)" type="button">delete</FormButton>
          </TableCell>
        </TableRow>
      </template>
      <TableCell v-else>Found 0 commands</TableCell>
    </TableBody>
  </Table>
</template>
