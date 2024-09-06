import type { StreamStats } from "@prisma/client";
import { useStorage } from "@vueuse/core";
import type { TSelectOption } from "~/types/ui.type";

export const useStatsChart = () => {
  const channel = useStorage("selectedChannel", undefined);

  const selectedStreamStorage = useStorage<string>("selectedStream", "");
  const selectedStream = ref<string>(selectedStreamStorage.value);

  const { data: stats, refresh: refreshStats } = useFetch(
    () => `/api/${channel.value}/stats/${selectedStream.value.replace("#", "__HASHTAG__")}`,
  );
  const { data: streams, refresh: refreshStreams } = useFetch(
    () => `/api/${channel.value}/stats/streams`,
  );

  const statsTimer = ref<NodeJS.Timeout>();
  const streamsTimer = ref<NodeJS.Timeout>();

  onMounted(() => {
    statsTimer.value = setInterval(refreshStats, 10000);
    streamsTimer.value = setInterval(refreshStreams, 10000);
  });

  const streamsSelectOptions = computed<TSelectOption[]>(() => {
    if (!streams.value) {
      return [];
    }

    return streams.value.map((el) => {
      return {
        value: el.unique_id,
        displayName: new Intl.DateTimeFormat(navigator.language).format(new Date(el.started_at)),
      };
    });
  });

  watch(
    streamsSelectOptions,
    (v) => {
      if (selectedStream.value.length) {
        return;
      }
      selectedStream.value = String(v[0]?.value || "");
    },
    { once: true },
  );

  watch(selectedStream, (v) => {
    selectedStreamStorage.value = v;
  });

  const reducedStats = computed<StreamStats[]>(() => {
    if (!stats.value) {
      return [];
    }

    const divider = Math.round(Math.round(stats.value.length) * 100);

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

  const chartCategories = computed(() => reducedStats.value.map((el) => fromNS(el.timestamp)));

  const dataSeries = computed(() => [
    {
      name: "viewers",
      data: reducedStats.value.map((el) => el.viewers),
    },
    {
      name: "messages",
      data: reducedStats.value.map((el) => el.messages),
    },
  ]);

  const chartData = computed(() => {
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
      series: dataSeries.value,
    };
  });

  return {
    chartData,
    selectedStream,
    streamsSelectOptions,
  };
};
