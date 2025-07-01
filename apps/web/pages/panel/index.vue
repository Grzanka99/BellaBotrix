<script setup lang="ts">
import { ref } from 'vue';
import { useStorage } from "@vueuse/core";
import IsLiveIcon from "~/components/dashboard/isLiveIcon.vue";
import VerticalList from "~/components/dashboard/verticalList.vue";
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

// INFO: DUMMY START
const DUMMY_ITEMS_MON = [
  { id: '001', text: '2025-01' },
  { id: '002', text: '2025-02' },
  { id: '003', text: '2025-03' },
  { id: '004', text: '2025-04' },
  { id: '005', text: '2025-05' },
  { id: '006', text: '2025-06' },
  { id: '007', text: '2025-07' },
  { id: '008', text: '2025-08' },
  { id: '009', text: '2025-09' },
  { id: '010', text: '2025-10' },
  { id: '011', text: '2025-11' },
  { id: '012', text: '2025-12' },
  { id: '101', text: '2026-01' },
  { id: '102', text: '2026-02' },
  { id: '103', text: '2026-03' },
  { id: '104', text: '2026-04' },
  { id: '105', text: '2026-05' },
  { id: '106', text: '2026-06' },
  { id: '107', text: '2026-07' },
  { id: '108', text: '2026-08' },
  { id: '109', text: '2026-09' },
  { id: '110', text: '2026-10' },
  { id: '111', text: '2026-11' },
  { id: '112', text: '2026-12' },
  { id: '201', text: '2025-01' },
  { id: '202', text: '2025-02' },
  { id: '203', text: '2025-03' },
  { id: '204', text: '2025-04' },
  { id: '205', text: '2025-05' },
  { id: '206', text: '2025-06' },
  { id: '207', text: '2025-07' },
  { id: '208', text: '2025-08' },
  { id: '209', text: '2025-09' },
  { id: '210', text: '2025-10' },
  { id: '211', text: '2025-11' },
  { id: '212', text: '2025-12' },
  { id: '301', text: '2026-01' },
  { id: '302', text: '2026-02' },
  { id: '303', text: '2026-03' },
  { id: '304', text: '2026-04' },
  { id: '305', text: '2026-05' },
  { id: '306', text: '2026-06' },
  { id: '307', text: '2026-07' },
  { id: '308', text: '2026-08' },
  { id: '309', text: '2026-09' },
  { id: '310', text: '2026-10' },
  { id: '311', text: '2026-11' },
  { id: '312', text: '2026-12' },
];

const colA = ref(null);
const colB = ref(null);

function handleSelect(item) {
  console.log('Selected item object:', item);
}
// INFO: DUMMY END


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
    </div>

    <ClientOnly>
      <div class="dashboard__content">
        <div class="dashboard__vertical">
          <VerticalList v-model="colA" :items="DUMMY_ITEMS_MON" @select="handleSelect" />
        </div>
        <div class="dashboard__vertical">
          <VerticalList v-model="colB" :items="DUMMY_ITEMS_MON" @select="handleSelect" />
        </div>
        <div class="dashboard__chart">
          Chart
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<style lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--padding);
  height: 100%;

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

  &__content {
    display: flex;
    flex: 1;
    gap: var(--padding-half);
    max-height: 90%;
  }

  &__vertical {
    min-width: 200px;
    padding: var(--padding-half);
    border-radius: var(--radius);
    border: 1px solid var(--stroke-light);
  }

  &__chart {
    flex: 1;
  }
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
