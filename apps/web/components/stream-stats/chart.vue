<script setup lang="ts">
import type { StreamStats } from "@prisma/client";

const props = defineProps<{
  data: StreamStats[];
}>();

const reducedStats = computed<StreamStats[]>(() => {
  if (!props.data) {
    return [];
  }

  const divider = Math.round(Math.round(props.data.length) * 500);

  const asd = props.data.reduce((acc, curr) => {
    const element = Math.round(Number(curr.timestamp) / divider);

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

const chartCategories = computed(() => reducedStats.value.map((el) => fromNS(el.timestamp)));

const viewsSeries = computed(() => [
  {
    name: "viewers",
    data: reducedStats.value.map((el) => el.viewers),
  },
]);

const commentsSeries = computed(() => [
  {
    name: "messages",
    color: "var(--warn)",
    data: reducedStats.value.map((el) => el.messages),
  },
]);

function chartOptions(series: unknown[]) {
  return {
    options: {
      xaxis: {
        categories: chartCategories.value,
        labels: {
          show: false,
          rotate: 0,
          trim: false,
          rotateAlways: false,
          hideOverlappingLabels: true,
          style: {
            cssClass: "apexcharts-xaxis-label",
          },
        },
      },
      theme: { mode: "dark", palette: "palette1" },
      chart: {
        toolbar: { show: false, autoSelected: false },
        animations: { enabled: false },
        background: "transparent",
        width: "100%",
        height: "100%",
      },
      stroke: {
        show: true,
        curve: "smooth",
        width: 3,
      },
    },
    series: series,
  };
}

const viewersData = computed(() => {
  return chartOptions(viewsSeries.value);
});

const commentsData = computed(() => {
  return chartOptions(commentsSeries.value);
});
</script>

<template>
  <ClientOnly>
    <div class="charts">
      <div class="chart-wrapper">
        <apexchart
          type="area"
          :options="viewersData.options"
          :series="viewersData.series"
        />
      </div>
      <div class="chart-wrapper">
        <apexchart
          type="area"
          :options="commentsData.options"
          :series="commentsData.series"
        />
      </div>
    </div>
  </ClientOnly>
</template>

<style scoped>
.charts {
  display: flex;
  flex-grow: 0;
  flex-direction: column;
  height: 100%;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
  gap: var(--padding-half);
}

.chart-wrapper {
  height: 50%;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--stroke);
  border-radius: var(--radius);
}
</style>
