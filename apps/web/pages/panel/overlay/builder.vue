<script setup lang="ts">
import Canvas from "~/components/overlay-builder/Canvas.vue";
import { useStorage } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";
import type { TOverlayLocalStorageSave } from "~/types/overlay.type";
import {
  LSK_OVERLAY_FOCUSED,
  LSK_OVERLAY_GRID,
  LSK_OVERLAY_SAVE,
  LSK_OVERLAY_SNAP,
} from "~/constants";
import FormButton from "~/components/ui/FormButton.vue";
import FormNumberInput from "~/components/ui/FormNumberInput.vue";
import FancyToggle from "~/components/ui/FancyToggle.vue";

const localSave = useStorage<Record<string, TOverlayLocalStorageSave>>(LSK_OVERLAY_SAVE, {});
const focused = useStorage(LSK_OVERLAY_FOCUSED, "");

const gridSize = useStorage(LSK_OVERLAY_GRID, 20);
const snapToGrid = useStorage(LSK_OVERLAY_SNAP, false);

function handleAddNewElement() {
  localSave.value[uuidv4()] = {
    top: "100px",
    left: "0px",
  };
}

function handleRemoveFocused() {
  if (focused.value in localSave.value) {
    // localSave.value[focused.value] = null;
    delete localSave.value[focused.value];
  }
}

useHead({ title: "Overlay Builder" });
definePageMeta({ layout: "overlay-builder" });
</script>

<template>
  <div id="overlay-builder">
    <Canvas :grid-size="gridSize" :snap-to-grid="snapToGrid" />
    <div class="overlay-controls">
      <FormButton type="button" @click="handleAddNewElement" width="150px">add new element</FormButton>
      <FormNumberInput name="grid-size" v-model="gridSize" />
      <FancyToggle :value="snapToGrid" @change="snapToGrid = !snapToGrid" label="snap to grid" />
      <FormButton type="button" @click="handleRemoveFocused" width="250px">remove focused element</FormButton>
      <FormButton type="button" @click="focused = ''" width="150px">remove focus</FormButton>
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
  background: ;
  gap: var(--padding);
  box-shadow: var(--shadow);
  background: var(--background);

  padding: var(--padding);
  top: 0;
  z-index: 1;
}
</style>
