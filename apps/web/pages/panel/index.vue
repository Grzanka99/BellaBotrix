<script setup lang="ts">
import { useStorage } from "@vueuse/core";
import isLiveIcon from "~/components/dashboard/isLiveIcon.vue";
import { Line } from "vue-chartjs";
import {
  type ChartData,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Chart,
  Tooltip,
} from "chart.js";
import type { StreamStats } from "@prisma/client";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

const channel = useStorage("selectedChannel", undefined);
const { data, refresh } = useFetch(() => `/api/${channel.value}/islive`);

const { data: stats, refresh: refreshStats } = useFetch(() => `/api/${channel.value}/stats`);

onMounted(() => {
  setInterval(refresh, 10000);
  setInterval(refreshStats, 10000);
});

const status = computed(() => {
  return !!data.value;
});

useHead({
  title: "Dashboard",
});

const reducedStats = computed<StreamStats[]>(() => {
  if (!stats.value) {
    return [];
  }

  const asd = stats.value.reduce((acc, curr) => {
    const element = Math.round(Number(curr.timestamp) / 60_000 / 2);

    const value = acc.get(element);

    if (value) {
      acc.set(element, {
        ...value,
        messages: value.messages + curr.messages,
      });
    } else {
      acc.set(element, curr);
    }

    return acc;
  }, new Map<number, StreamStats>());

  return Array.from(asd, ([_, v]) => {
    return v;
  });
});

watch(reducedStats, () => {
  console.log(reducedStats.value);
});

const chartData = computed<ChartData<"line">>(() => {
  return {
    labels: reducedStats.value.map((el) => {
      return fromNS(el.timestamp);
    }),
    datasets: [
      {
        label: "viewers",
        data: reducedStats.value.map((el) => el.viewers),
        fill: false,
        borderColor: "hsl(0, 93.5%, 81.8%)",
        tension: 0.2,
        pointStyle: false,
      },
      {
        label: "messages",
        data: reducedStats.value.map((el) => el.messages),
        fill: false,
        borderColor: "hsl(30.7, 97.2%, 72.4%)",
        tension: 0.2,
        pointStyle: false,
      },
    ],
  };
});
</script>

<template>
  <isLiveIcon :is-live="status" />
  <div class="chart-container">
    <Line :data="chartData" :options="{
      responsive: true, maintainAspectRatio: false
    }" />
  </div>
</template>

<style lang="scss" scoped>
.chart-container {
  display: flex;
  padding: var(--padding);
  height: 300px;
  width: 100%;
}
</style>
