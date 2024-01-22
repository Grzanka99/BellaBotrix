<script setup lang="ts">
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from '@/components/ui/Table';
import FancyToggle from '~/components/ui/FancyToggle.vue';
import FormTextInput from '~/components/ui/FormTextInput.vue';
import FormButton from '~/components/ui/FormButton.vue';
import { useSoloStore } from '~/store/solo.store';

const solos = useSoloStore();
onMounted(() => {
  solos.startRefresh();
})
onUnmounted(() => {
  solos.stopRefresh();
})

const gridTemplate = "100px 2fr 2fr 1fr 2fr";

const finishedSolos = computed(() => {
  return solos.solos.filter(el => !!el.winner).length;
})
</script>

<template>
  <div id="solos-page">
    <div id="solos-page-controls">
      <div id="solos-page-controls__search">
        <FormTextInput
          name="query"
          placeholder="Search by username..."
          v-model="solos.queryFilter" />
        <FormButton
          type="button"
          @click="solos.queryFilter = ''">clear</FormButton>
      </div>
      <div id="solos-page-controls__info">
        <h5>Total solos: {{ solos.solos.length }}</h5>
        <h5>Finished solos: {{ finishedSolos }}</h5>
      </div>
    </div>
    <Table>
      <TableHead :grid-template="gridTemplate">
        <TableHeader>finished</TableHeader>
        <TableHeader>user 1</TableHeader>
        <TableHeader>user 2</TableHeader>
        <TableHeader>points</TableHeader>
        <TableHeader>winner</TableHeader>
      </TableHead>
      <TableBody>
        <template v-if="solos.solos.length">
          <TableRow
            v-for="solo in solos.filtered.toReversed()"
            :grid-template="gridTemplate">
            <TableCell centered>
              <FancyToggle :value="!solo.inProgress" :disabled="!solo.inProgress" />
            </TableCell>
            <TableCell>{{ solo.user1 }}</TableCell>
            <TableCell>{{ solo.user2 }}</TableCell>
            <TableCell>{{ solo.points }}</TableCell>
            <TableCell>{{ solo.winner }}</TableCell>
          </TableRow>
        </template>
        <TableCell v-else>Found 0 solos</TableCell>
      </TableBody>
    </Table>
  </div>
</template>

<style lang="scss" scoped>
#solos-page {
  display: flex;
  flex-direction: column;
  gap: var(--padding);

  height: 100%;
}

#solos-page-controls {
  display: flex;
  justify-content: space-between;

  &__search {
    display: flex;
    width: 400px;
    gap: var(--padding);
  }

  &__info {
    display: flex;
    gap: var(--padding);
    align-items: center;
    padding: var(--padding-half);
  }
}
</style>
