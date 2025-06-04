<script setup lang="ts">
import Canvas from "~/components/overlay-builder/Canvas.vue";
import { useStorage } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";
import { EElementType, type TOverlayLocalStorageSave } from "~/types/overlay.type";
import {
  LSK_OVERLAY_FOCUSED,
  LSK_OVERLAY_GRID,
  LSK_OVERLAY_H,
  LSK_OVERLAY_SAVE,
  LSK_OVERLAY_SCALE,
  LSK_OVERLAY_SNAP,
  LSK_OVERLAY_W,
} from "~/constants";
import FormButton from "~/components/ui/FormButton.vue";
import FormNumberInput from "~/components/ui/FormNumberInput.vue";
import FancyToggle from "~/components/ui/FancyToggle.vue";
import type { TSelectOption } from "~/types/ui.type";
import CustomSelect from "~/components/ui/CustomSelect.vue";
import SelectButton from "~/components/ui/SelectButton.vue";

const localSave = useStorage<Record<string, TOverlayLocalStorageSave>>(LSK_OVERLAY_SAVE, {});
const focused = useStorage(LSK_OVERLAY_FOCUSED, "");
const gridSize = useStorage(LSK_OVERLAY_GRID, 20);
const snapToGrid = useStorage(LSK_OVERLAY_SNAP, false);
const canvasWidth = useStorage(LSK_OVERLAY_W, 1920);
const canvasHeight = useStorage(LSK_OVERLAY_H, 1080);
const canvasScale = useStorage(LSK_OVERLAY_SCALE, 90);

function handleRemoveFocused() {
  if (focused.value in localSave.value) {
    delete localSave.value[focused.value];
  }
}

const popularOptions: TSelectOption[] = [
  { value: JSON.stringify({ width: 1920, height: 1080 }), displayName: "1920x1080" },
  { value: JSON.stringify({ width: 1280, height: 720 }), displayName: "1280x720" },
];

const canvasSize = computed(() => {
  return JSON.stringify({ width: canvasWidth.value, height: canvasHeight.value });
});

function handleCanvasSizeChange(v: string) {
  const { width, height } = JSON.parse(v) as { width: number; height: number };
  canvasHeight.value = height;
  canvasWidth.value = width;
}

const elementsOptions: TSelectOption<EElementType>[] = [
  { value: EElementType.Chat, displayName: "Chat" },
  { value: EElementType.Text, displayName: "Text" },
  { value: EElementType.Alert, displayName: "Alert", disabled: true },
  { value: EElementType.Image, displayName: "Image", disabled: true },
];

function handleAddNewElement(v: string | number) {
  console.log(v);
  localSave.value[uuidv4()] = {
    top: "100px",
    left: "0px",
    element: v as EElementType,
  };
}

useHead({ title: "Overlay Builder" });
definePageMeta({ layout: "overlay-builder" });
</script>

<template>
  <div id="overlay-builder">
    <Canvas
      :grid-size="gridSize"
      :snap-to-grid="snapToGrid"
      :width="canvasWidth"
      :height="canvasHeight"
      :scale="canvasScale"
    />
    <div class="overlay-controls">
      <SelectButton
        :options="elementsOptions"
        @click="handleAddNewElement"
        actionIcon="material-symbols:add-box"
      />
      <FormNumberInput
        name="grid-size"
        v-model="gridSize"
      />
      <FormNumberInput
        name="scale"
        v-model="canvasScale"
        :max="120"
        :min="50"
      />
      <FancyToggle
        :value="snapToGrid"
        @change="snapToGrid = !snapToGrid"
        label="snap to grid"
      />
      <FormButton
        type="button"
        @click="handleRemoveFocused"
        width="200px"
      >delete element</FormButton>
      <FormButton
        type="button"
        @click="focused = ''"
        width="100px"
        :disabled="focused === ''"
      >unfocus</FormButton>
      <CustomSelect
        :options="popularOptions"
        :model-value="canvasSize"
        @update:model-value="handleCanvasSizeChange"
      />
    </div>
  </div>
</template>

<style>
#overlay-builder {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  width: 100%;
  height: 100%;
}

.overlay-controls {
  display: flex;
  position: absolute;
  width: fit-content;
  justify-self: center;
  gap: var(--padding);
  box-shadow: var(--shadow);
  background: var(--background);

  padding: var(--padding);
  top: 0;
  z-index: 1;
}
</style>
