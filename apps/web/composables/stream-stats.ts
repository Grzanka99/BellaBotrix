import type { StreamStats, Streams } from "@prisma/client";
import { useStorage } from "@vueuse/core";
import type { TSelectOption } from "~/types/ui.type";
import { formatDayTime, formatYearMonth } from "~/utils/prettytime";
import { roundtoprecision, avarage } from "#imports";

export function useStreamStats() {
  const channel = useStorage("selectedChannel", undefined);
  const lsSelectedMonthKey = `${channel.value}-stats-selected-month`;
  const lsSelectedStreamKey = `${channel.value}-stats-selected-stream`;

  const selectedMonth = useStorage<string | undefined>(lsSelectedMonthKey, undefined);
  const selectedStream = useStorage<string | undefined>(lsSelectedStreamKey, undefined);

  const { data: isLive, refresh: refreshIsLive } = useFetch(() => `/api/${channel.value}/islive`);
  const { data: streams, refresh: refreshStreams } = useFetch(
    () => `/api/${channel.value}/stats/streams`,
  );
  const { data: stats, refresh: refreshStats } = useFetch<StreamStats[]>(
    () =>
      `/api/${String(channel.value)}/stats/${selectedStream.value?.replace("#", "__HASHTAG__")}`,
  );

  const allStreams = computed<Streams[]>(() => {
    if (!streams.value) {
      return [];
    }

    return streams.value;
  });

  const isLiveRT = ref<NodeJS.Timeout>();
  const streamsRT = ref<NodeJS.Timeout>();
  const statsRT = ref<NodeJS.Timeout>();

  const startRefresh = () => {
    isLiveRT.value = setInterval(refreshIsLive, 10000);
    streamsRT.value = setInterval(() => {
      if (isLive) {
        refreshStreams();
      }
    }, 10000);

    statsRT.value = setInterval(() => {
      if (isLive) {
        refreshStats();
      }
    }, 30000);
  };

  const stopRefresh = () => {
    clearInterval(isLiveRT.value);
    clearInterval(streamsRT.value);
    clearInterval(statsRT.value);

    isLiveRT.value = undefined;
    streamsRT.value = undefined;
    statsRT.value = undefined;
  };

  const takeMonths = computed<TSelectOption<string>[]>(() => {
    const months: string[] = [];

    for (const stream of allStreams.value) {
      const month = stream.started_at.substring(0, 7);
      if (months.includes(month)) {
        continue;
      }

      months.push(month);
    }

    return months.map((el) => {
      // const date = new Intl.DateTimeFormat(navigator.language).format(new Date(el.started_at));

      return {
        value: el,
        displayName: formatYearMonth(el),
      };
    });
  });

  watch(takeMonths, () => {
    if (!selectedMonth.value) {
      selectedMonth.value = takeMonths.value[0].value;
    }
  });

  const takeDays = computed<TSelectOption<string>[]>(() => {
    if (!selectedMonth.value) {
      return [];
    }

    const filtered = allStreams.value.filter((el) => {
      return el.started_at.substring(0, 7) === selectedMonth.value;
    });

    return filtered.map((el) => ({
      displayName: formatDayTime(el.started_at),
      value: el.unique_id,
    }));
  });

  watch(takeDays, () => {
    if (selectedMonth.value && !selectedStream.value) {
      selectedStream.value = takeDays.value[0].value;
    }
  });

  watch(selectedMonth, () => {
    selectedStream.value = takeDays.value[0].value;
  });

  const streamData = computed(() => {
    const viewers: number[] = stats.value?.map((el) => el.viewers) || [];
    const messages: number[] = stats.value?.map((el) => el.messages) || [];

    return {
      avgViewers: roundtoprecision(avarage(viewers)),
      maxViewers: Math.max(...viewers),
      avgMsg: roundtoprecision(avarage(messages)),
      totalMsg: sumarr(messages),
    };
  });

  return {
    isLive,
    startRefresh,
    stopRefresh,
    allStreams,
    takeDays,
    takeMonths,
    selectedStream,
    selectedMonth,
    stats,
    streamData,
  };
}
