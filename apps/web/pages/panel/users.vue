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
import CustomSelect from "~/components/ui/CustomSelect.vue";
import { useChattersStore } from "~/store/chatters.store";
import type { User } from "@prisma/client";

const s = useChattersStore();
onMounted(() => {
  s.startRefresh();
});
onUnmounted(() => {
  s.stopRefresh();
});

const totalPoints = computed(() => {
  return s.chatters.reduce((prev, cur) => {
    if (cur.isBot) {
      return prev;
    }
    const sum = prev + cur.points;
    return sum;
  }, 0);
});

const totalNonBotUsers = computed(() => {
  return s.chatters.filter(el => !el.isBot).length;
})

const gridTemplate = "100px 4fr 1fr 1fr";

const meanMeaningfullPoints = computed(() => {
  let sum = 0;
  let total = 0;
  for (const u of s.chatters) {
    if (u.isBot) {
      continue;
    }

    total += 1;
    sum += u.points;
  }

  return sum / total;
})

const canItBeBot = (user: User) => {
  if (user.points < meanMeaningfullPoints.value || user.sentMessages > 0) {
    return false;
  }

  if (user.points > meanMeaningfullPoints.value && user.sentMessages === 0) {
    return true;
  }

  return false;
}


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
          v-model="s.queryFilter" />
        <FormButton type="button" @click="s.queryFilter = ''">clear</FormButton>
        <CustomSelect :options="s.sortOptions" v-model="s.sortedOption" icon="material-symbols:sort" />
      </div>
      <div id="users-page-controls__info">
        <h5>Total users: {{ totalNonBotUsers }}</h5>
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
        <template v-if="s.chatters.length">
          <TableRow
            v-for="user in s.sorted"
            :grid-template="gridTemplate"
            :class="{ isBot: user.isBot, canBeBot: !user.isBot && canItBeBot(user) }">
            <TableCell centered>
              <FancyToggle
                :value="user.isBot"
                @change="
                  s.handleUpdate({
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
    // width: 400px;
    gap: var(--padding);


    .form-button {
      width: 140px;
    }

    .custom-select {
      width: fit-content;
      flex-shrink: 0;
    }
  }

  &__info {
    display: flex;
    gap: var(--padding);
    align-items: center;
    padding: var(--padding-half);
  }
}

.canBeBot {
  --color: rgba(255, 193, 0, 0.3);
  background-image: linear-gradient(var(--color), var(--color));
}
</style>
