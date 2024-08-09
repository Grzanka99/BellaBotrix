<script setup lang="ts">
import { useStorage } from "@vueuse/core";
import isLiveIcon from "~/components/dashboard/isLiveIcon.vue";
import type { StreamStats } from "@prisma/client";
import CustomSelect from "~/components/ui/CustomSelect.vue";
import type { TSelectOption } from "~/types/ui.type";

const channel = useStorage("selectedChannel", undefined);
const { data, refresh } = useFetch(() => `/api/${channel.value}/islive`);

const selectedStream = ref<string>("");

const { data: stats, refresh: refreshStats } = useFetch(
  () => `/api/${channel.value}/stats/${selectedStream.value.replace("#", "__HASHTAG__")}`,
);
const { data: streams, refresh: refreshStreams } = useFetch(
  () => `/api/${channel.value}/stats/streams`,
);

onMounted(() => {
  setInterval(refresh, 10000);
  setInterval(refreshStats, 10000);
  setInterval(refreshStreams, 10000);
});

const status = computed(() => {
  return !!data.value;
});

useHead({
  title: "Dashboard",
});

const streamsSelectOptions = computed<TSelectOption[]>(() => {
  if (!streams.value) {
    return [];
  }

  return streams.value.map((el) => {
    console.log(el.unique_id);
    return {
      value: el.unique_id,
      displayName: new Intl.DateTimeFormat(navigator.language).format(new Date(el.started_at)),
    };
  });
});

watch(
  streamsSelectOptions,
  (v) => {
    selectedStream.value = String(v[0]?.value || "");
  },
  { once: true },
);

const reducedStats = computed<StreamStats[]>(() => {
  if (!stats.value) {
    return [];
  }

  const divider = Math.round(stats.value.length) * 100;
  console.log(divider, stats.value.length);

  const asd = stats.value.reduce((acc, curr) => {
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

const apexchartDataCategories = computed(() =>
  reducedStats.value.map((el) => fromNS(el.timestamp)),
);

const apexchartDataSeries = computed(() => [
  {
    name: "viewers",
    data: reducedStats.value.map((el) => el.viewers),
  },
  {
    name: "messages",
    data: reducedStats.value.map((el) => el.messages),
  },
]);

const apexchartData = computed(() => {
  return {
    options: {
      xaxis: {
        categories: apexchartDataCategories.value,
        labels: {
          show: true,
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
    series: apexchartDataSeries.value,
  };
});
</script>

<template>
  <div class="dashboard">
    <div class="dashboard__header">
      <isLiveIcon :is-live="status" />
      <CustomSelect v-model="selectedStream" :options="streamsSelectOptions" />
    </div>
    <ClientOnly>
      <div class="chart-container">
        <apexchart type="line" :options="apexchartData.options" :series="apexchartData.series" />
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
