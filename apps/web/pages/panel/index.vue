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

const { chartData, selectedStream, streamsSelectOptions } = useStatsChart();

useHead({
  title: "Dashboard",
});
</script>

<template>
  <div class="dashboard">
    <div class="dashboard__header">
      <IsLiveIcon :is-live="status" />
      <CustomSelect v-model="selectedStream" :options="streamsSelectOptions" />
    </div>
    <ClientOnly>
      <div class="chart-container">
        <apexchart type="line" :options="chartData.options" :series="chartData.series" />
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
    gap: var(--padding);
  }
}


.chart-container {
  padding: var(--padding);
  height: 300px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--stroke);
  border-radius: var(--radius);
  // background: red;
}
</style>
