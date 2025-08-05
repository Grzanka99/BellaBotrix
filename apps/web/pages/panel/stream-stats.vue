<script setup lang="ts">
import IsLiveIcon from "~/components/dashboard/isLiveIcon.vue";
import AvgViewers from "~/components/stream-stats/avgViewers.vue";
import Chart from "~/components/stream-stats/chart.vue";
import ScrollableList from "~/components/ui/ScrollableList.vue";

const {
  isLive,
  startRefresh,
  stopRefresh,
  takeMonths,
  takeDays,
  selectedStream,
  selectedMonth,
  stats,
  streamData,
} = useStreamStats();

onMounted(() => {
  startRefresh();
});

onUnmounted(() => {
  stopRefresh();
});

useHead({
  title: "Stream Stats",
});
definePageMeta({ layout: false });
</script>

<template>
  <NuxtLayout name="default">
    <template #navigation>
      <ScrollableList
        :items="takeMonths"
        :selected="selectedMonth"
        @select="(v) => selectedMonth = v"
      >
        <template #additional="{ value }">
          <AvgViewers
            :value="value"
            month
          />
        </template>
      </ScrollableList>
      <ScrollableList
        mono
        :items="takeDays"
        :selected="selectedStream"
        @select="(v) => selectedStream = v"
      >
        <template #additional="{ value }">
          <AvgViewers :value="value" />
        </template>
      </ScrollableList>
    </template>

    <div
      class="stream-stats"
      v-if="selectedMonth && selectedStream"
    >
      <div class="stream-stats__data">
        <span class="single-stream-stat">
          <IsLiveIcon :is-live="!!isLive" />
        </span>
        <span class="single-stream-stat">
          avg. viewers: {{ streamData.avgViewers }}
        </span>
        <span class="single-stream-stat">
          max viewers: {{ streamData.maxViewers }}
        </span>
        <span class="single-stream-stat">
          avg. messages (per 30s): {{ streamData.avgMsg }}
        </span>
        <span class="single-stream-stat">
          total messages: {{ streamData.totalMsg }}
        </span>
      </div>
      <Chart
        v-if="stats"
        :data="stats"
      />
    </div>
  </NuxtLayout>
</template>

<style scoped>
.stream-stats {
  position: relative;
  display: grid;
  width: 100%;
  max-height: 100%;
  height: 100%;
  gap: var(--padding-half);

  grid-template-rows: 50px calc(100% - 50px);
}

.stream-stats__data {
  border: 1px solid var(--stroke);
  border-radius: var(--radius);
  display: flex;
  flex-wrap: wrap;
  height: 100%;
  align-items: center;
  gap: 0;

  .single-stream-stat {
    display: flex;
    height: 50%;
    font-size: var(--font-tiny);
    padding: var(--padding-half);
    align-items: center;
    width: 20%;

    &:not(:last-child) {
      border-right: 1px solid var(--stroke);
    }
  }
}
</style>
