<script setup lang="ts">
import { useStorage } from "@vueuse/core";
import Draggable from "./Draggable.vue";
import type { TOverlayLocalStorageSave } from "~/types/overlay.type";
import { LSK_OVERLAY_FOCUSED, LSK_OVERLAY_SAVE } from "~/constants";
import Chat from "./elements/Chat.vue";

const localSave = useStorage<Record<string, TOverlayLocalStorageSave>>(LSK_OVERLAY_SAVE, {});

const props = defineProps<{
  snapToGrid: boolean;
  gridSize: number;
  width: number;
  height: number;
  scale: number;
}>();

function handleSave(itemId: string, values: TOverlayLocalStorageSave) {
  localSave.value[itemId] = values;
}

onMounted(() => {
  for (const key of Object.keys(localSave.value)) {
    console.log(localSave.value[key]);
  }
});

const canvas = ref<HTMLDivElement | undefined>(undefined);

const gridStyle = computed(() => {
  return {
    backgroundSize: `${props.gridSize}px ${props.gridSize}px`,
    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent ${props.gridSize - 1}px, rgba(0, 0, 0, 0.1) ${props.gridSize}px),repeating-linear-gradient(90deg, transparent, transparent ${props.gridSize - 1}px, rgba(0, 0, 0, 0.1) ${props.gridSize}px)`,
  };
});

const focused = useStorage(LSK_OVERLAY_FOCUSED, "");

watch(focused, () => {
  console.log(focused.value);
});
</script>

<template>
  <div
    id="canvas"
    ref="canvas"
    :style="{
      width: `${props.width}px`,
      height: `${props.height}px`,
      transform: `scale(${scale / 100})`,
      ...gridStyle
    }"
  >
    <Draggable
      v-for="key in Object.keys(localSave)"
      :key="key"
      :canvas="canvas"
      :canvasH="props.height"
      :canvasW="props.width"
      :snapToGrid="snapToGrid ? gridSize : undefined"
      :default-values="localSave[key]"
      @save="v => handleSave(key, v)"
      @focusElement="focused = key"
      :focused="focused === key"
    >
      <Chat />
    </Draggable>
  </div>
</template>

<style>
#canvas {
  position: relative;
  background-color: white;
  z-index: 1;
}
</style>
