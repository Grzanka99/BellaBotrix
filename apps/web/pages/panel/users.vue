<script setup lang="ts">
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from '@/components/ui/Table';
import FormTextInput from '~/components/ui/FormTextInput.vue';
import FormButton from '~/components/ui/FormButton.vue';
import FancyToggle from '~/components/ui/FancyToggle.vue';
import { useStorage } from '@vueuse/core'

const channel = useStorage('selectedChannel', undefined);
const { data, refresh } = await useFetch(() => `/api/${channel.value}/users`);

const refreshInterval = ref<NodeJS.Timeout>();
onMounted(() => {
  refreshInterval.value = setInterval(refresh, 10000)
})
onUnmounted(() => {
  clearInterval(refreshInterval.value)
})

const gridTemplate = "100px 4fr 1fr 1fr";

const query = ref("");

const displayData = computed(() => {
  if (!query.value.length) {
    return data.value;
  }

  return data.value?.filter(el => el.username.includes(query.value));
})
</script>

<template>
  <div id="users-page">
    <div id="users-page-controls">
      <div id="users-page-controls__search">
        <FormTextInput name="query" placeholder="Search by username..." v-model="query" />
        <FormButton type="button" @click="query = ''">clear</FormButton>
      </div>
    </div>
    <Table>
      <TableHead :grid-template="gridTemplate">
        <TableHeader>is bot</TableHeader>
        <TableHeader>username</TableHeader>
        <TableHeader>sent</TableHeader>
        <TableHeader>points</TableHeader>
      </TableHead>
      <TableBody>
        <template v-if="data?.length">
          <TableRow v-for="user in displayData?.toReversed()" :grid-template="gridTemplate"
            :class="{ isBot: user.isBot }">
            <TableCell centered>
              <FancyToggle :value="user.isBot" />
            </TableCell>
            <TableCell>
              <span :title="user.userid">
                {{ user.username }}
              </span>
            </TableCell>
            <TableCell>{{ user.sentMessages }}</TableCell>
            <TableCell>{{ user.points }}</TableCell>
          </TableRow>
        </template>
        <TableCell v-else>Found 0 users</TableCell>
      </TableBody>
    </Table>
  </div>
</template>
<style lang="scss" scoped>
#users-page {
  display: flex;
  flex-direction: column;
  gap: var(--padding);

  height: 100%;
}

#users-page-controls {
  display: flex;
  justify-content: space-between;

  &__search {
    display: flex;
    width: 400px;
    gap: var(--padding);
  }
}
</style>
