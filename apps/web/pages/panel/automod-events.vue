<script setup lang="ts">
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/Table";
import { useAutomodEventsStore } from "~/store/automod-events.store";

const s = useAutomodEventsStore();

onMounted(() => {
  s.startRefresh();
});

onUnmounted(() => {
  s.stopRefresh();
});

const gridTemplate = "3fr 1fr 1fr 1fr 1fr";

useHead({
  title: "Automod Events",
});
</script>

<template>
  <div id="automod-events-page">
    <div id="automod-events-page-controls"></div>
    <Table>
      <TableHead :grid-template="gridTemplate">
        <TableHeader>message</TableHeader>
        <TableHeader>target (user id)</TableHeader>
        <TableHeader>action taken</TableHeader>
        <TableHeader>duration (s)</TableHeader>
        <TableHeader>automod module</TableHeader>
      </TableHead>
      <TableBody>
        <template v-if="s.events.length">
          <TableRow
            v-for="(event, i in s.events"
            :grid-template="gridTemplate"
          >
            <TableCell>{{event.message}}</TableCell>
            <TableCell>{{event.target}}</TableCell>
            <TableCell>{{event.action}}</TableCell>
            <TableCell>{{event.duration === -1 ? "permanent" : event.duration}}</TableCell>
            <TableCell>{{event.handler}}</TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
