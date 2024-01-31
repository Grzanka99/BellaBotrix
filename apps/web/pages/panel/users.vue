<script setup lang="ts">
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/Table";
import FormTextInput from "~/components/ui/FormTextInput.vue";
import FormButton from "~/components/ui/FormButton.vue";
import FancyToggle from "~/components/ui/FancyToggle.vue";
import { useChattersStore } from "~/store/chatters.store";

const chatters = useChattersStore();
onMounted(() => {
  chatters.startRefresh();
});
onUnmounted(() => {
  chatters.stopRefresh();
});

const totalPoints = computed(() => {
  return chatters.chatters.reduce((prev, cur) => {
    if (cur.isBot) {
      return prev;
    }
    const sum = prev + cur.points;
    return sum;
  }, 0);
});

const gridTemplate = "100px 4fr 1fr 1fr";

useHead({
  title: "Users",
});
</script>

<template>
  <div id="users-page">
    <div id="users-page-controls">
      <div id="users-page-controls__search">
        <FormTextInput
          name="query"
          placeholder="Search by username..."
          v-model="chatters.queryFilter" />
        <FormButton type="button" @click="chatters.queryFilter = ''">clear</FormButton>
      </div>
      <div id="users-page-controls__info">
        <h5>Total users: {{ chatters.chatters.length }}</h5>
        <h5>Total points: {{ totalPoints }}</h5>
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
        <template v-if="chatters.chatters.length">
          <TableRow
            v-for="user in chatters.filtered.toReversed()"
            :grid-template="gridTemplate"
            :class="{ isBot: user.isBot }">
            <TableCell centered>
              <FancyToggle
                :value="user.isBot"
                @change="
                  chatters.handleUpdate({
                    id: user.id,
                    isBot: !user.isBot,
                  })
                  " />
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

  &__info {
    display: flex;
    gap: var(--padding);
    align-items: center;
    padding: var(--padding-half);
  }
}
</style>
