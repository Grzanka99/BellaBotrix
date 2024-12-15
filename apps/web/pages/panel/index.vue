<script setup lang="ts">
import { useStorage } from "@vueuse/core";
import IsLiveIcon from "~/components/dashboard/isLiveIcon.vue";
import CustomSelect from "~/components/ui/CustomSelect.vue";

const channel = useStorage("selectedChannel", undefined);
const { data, refresh } = useFetch(() => `/api/${channel.value}/islive`);

onMounted(() => {
  setInterval(refresh, 10000);
});

const status = computed(() => {
  return !!data.value;
});

const { chartData, selectedStream, streamsSelectOptions, streamData } = useStatsChart();

useHead({
  title: "Dashboard",
});
</script>

<template>
  <div class="dashboard">
    <div class="dashboard__header">
      <div class="dashboard__header__group">
        <IsLiveIcon :is-live="status" />
        <CustomSelect v-model="selectedStream" :options="streamsSelectOptions" />
      </div>
      <div class="dashboard__header__group stream-stats">
        <span class="single-stream-stat">
          average viewers: {{ streamData.avgViewers }}
        </span>
        <span class="single-stream-stat">
          max viewers: {{ streamData.maxViewers }}
        </span>
        <span class="single-stream-stat">
          average messages (per 30s): {{ streamData.avgMsg }}
        </span>
        <span class="single-stream-stat">
          total messages: {{ streamData.totalMsg }}
        </span>
      </div>
    </div>
    <ClientOnly>
      <div class="chart-container">
        <apexchart type="bar" :options="chartData.options" :series="chartData.series" />
      </div>
    </ClientOnly>
  </div>
</template>

<style lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--padding);

  &__header {
    display: flex;
    flex-grow: 0;
    gap: var(--padding);
    height: 40px;

    &__group {
      display: flex;
      gap: var(--padding);
    }
  }
}


.chart-container {
  padding: var(--padding);
  height: 300px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--stroke);
  border-radius: var(--radius);
}

.stream-stats {
  display: flex;
  flex-wrap: wrap;
  height: 100%;
  align-items: center;
  gap: 0;

  .single-stream-stat {
    display: flex;
    height: 50%;
    font-size: 1.8rem;
    padding: var(--padding-half);
    align-items: center;

    &:not(:last-child) {
      border-right: 1px solid var(--stroke);
    }
  }
}
</style>
