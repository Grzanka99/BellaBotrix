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
import CommandMessage from "./CommandMessage.vue";
import EditCommandModal from "./EditCommandModal.vue";
import FancyToggle from "../ui/FancyToggle.vue";
import { useCommandsStore } from "~/store/commands.store";
import type { TCommandWithSubCommands } from "~/types/commands.type";

defineProps<{
  commands: TCommandWithSubCommands[];
}>();

const s = useCommandsStore();

const gridTemplate = "100px 1.5fr 2fr 4fr 2fr 120px 120px";
const toEdit = ref<TCommandWithSubCommands | undefined>(undefined);

const onCancel = () => {
  toEdit.value = undefined;
};
</script>

<template>
  <EditCommandModal
    v-if="toEdit"
    :original-command="toEdit"
    @cancel="onCancel"
  />
  <Table>
    <TableHead :grid-template="gridTemplate">
      <TableHeader></TableHeader>
      <TableHeader>name</TableHeader>
      <TableHeader>price</TableHeader>
      <TableHeader>message</TableHeader>
      <TableHeader>aliases</TableHeader>
    </TableHead>
    <TableBody>
      <template v-if="commands.length">
        <TableRow
          v-for="command in commands"
          :grid-template="gridTemplate"
        >
          <TableCell centered>
            <FancyToggle
              :value="command.enabled"
              @change="(enabled) => s.handleUpdate(command.id, { enabled })"
            />
          </TableCell>
          <TableCell>
            {{ command.name }}
            <template v-if="command.subCommands.length">
              <b>({{ command.subCommands.length }} sub.)</b>
            </template>
          </TableCell>
          <TableCell>
            {{ command.paid ? `${command.price} points` : 'free' }}
          </TableCell>
          <TableCell>
            <CommandMessage :message="command.message" />
          </TableCell>
          <TableCell>{{ command.alias }}</TableCell>
          <TableCell centered>
            <FormButton
              type="button"
              @click.native="toEdit = command"
              smaller
            >
              <Icon name="material-symbols:edit" />
              edit
            </FormButton>
          </TableCell>
          <TableCell centered>
            <FormButton
              @click.native="s.handleDelete(command.id)"
              type="button"
              smaller
            >
              <Icon name="material-symbols:delete-forever" />
              delete
            </FormButton>
          </TableCell>
        </TableRow>
      </template>
      <TableCell v-else>Found 0 commands</TableCell>
    </TableBody>
  </Table>
</template>
