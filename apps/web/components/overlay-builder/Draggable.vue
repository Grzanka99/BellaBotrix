<script setup lang="ts">
const props = defineProps<{
  canvas: HTMLDivElement | undefined;
  canvasH: number;
  canvasW: number;
  snapToGrid: number | undefined;
  defaultValues: {
    top: string;
    left: string;
  };
  focused: boolean;
}>();

const style = ref({
  top: props.defaultValues.top || "0px",
  left: props.defaultValues.left || "0px",
});

const emit = defineEmits<{
  (e: "save", v: { top: string; left: string }): void;
  (e: "focusElement"): void;
}>();

const element = ref<HTMLDivElement | undefined>(undefined);
const dragging = ref(false);
const offset = ref({ y: 0, x: 0 });

function handleMouseMove(e: MouseEvent) {
  if (!props.canvas || !element.value) {
    return;
  }

  e.preventDefault();

  const { offsetX, offsetY } = e;
  const { height, width } = element.value.getBoundingClientRect();

  let top = offsetY - offset.value.y;
  let left = offsetX - offset.value.x;

  if (top < 0) {
    top = 0;
  }

  if (top > props.canvasH - height) {
    top = props.canvasH - height;
  }

  if (left < 0) {
    left = 0;
  }

  if (left > props.canvasW - width) {
    left = props.canvasW - width;
  }

  if (props.snapToGrid) {
    left = Math.round(left / props.snapToGrid) * props.snapToGrid;
    top = Math.round(top / props.snapToGrid) * props.snapToGrid;
  }

  style.value.top = `${top}px`;
  style.value.left = `${left}px`;
}

function handleMouseDown(e: MouseEvent) {
  e.stopPropagation();
  if (!props.canvas || !element.value) {
    return;
  }

  dragging.value = true;
  emit("focusElement");

  offset.value.x = e.offsetX;
  offset.value.y = e.offsetY;

  props.canvas.addEventListener("mousemove", handleMouseMove, false);
  props.canvas.addEventListener("mouseup", () => {
    props.canvas?.removeEventListener("mousemove", handleMouseMove, false);
    dragging.value = false;
    emit("save", style.value);
  });
}

function handleMouseUp(e: MouseEvent) {
  e.stopPropagation();
  props.canvas?.removeEventListener("mousemove", handleMouseMove, false);
  dragging.value = false;
  emit("save", style.value);
}

const lineFromTop = computed(() => {
  if (!element.value) {
    return 0;
  }

  return `calc(${style.value.top} + ${element.value?.getBoundingClientRect().height / 2}px - 2px)`;
});

const lineFromLeft = computed(() => {
  if (!element.value) {
    return 0;
  }

  return `calc(${style.value.left} + ${element.value?.getBoundingClientRect().width / 2}px - 2px)`;
});
</script>

<template>
  <div
    ref="element"
    class="draggable"
    :class="{dragged: dragging || focused}"
    @mousedown="handleMouseDown"
    :style="style"
  >
    <slot />
  </div>
  <template v-if="focused">
    <div class="line-from-left" :style="{width: style.left, top: lineFromTop}">
      <div>
        {{style.left}}
      </div>
    </div>
    <div class="line-from-top" :style="{height: style.top, left: lineFromLeft}">
      <div>
        {{style.top}}
      </div>
    </div>
  </template>
  <div class="dummy" :style="{display: dragging ? 'block' : 'none'}" @mouseleave="handleMouseUp" />
</template>

<style>
.dummy {
  opacity: 0.9;
  width: 100%;
  height: 100%;
  z-index: 100;
}

.draggable {
  position: absolute;
  display: flex;
  background: red;
  border: 2px solid green;

  justify-content: center;
  align-items: center;
  cursor: grab;
  z-index: -1;
}

.dragged {
  outline: 5px solid cyan;
}

.line-from-top, .line-from-left {
  --size: 4px;

  position: absolute;
  opacity: 0.8;
  background: gray;
  display: flex;
  justify-content: center;
  align-items: center;
}

.line-from-left {
  position: absolute;
  left: 0;
  height: var(--size);

  > div {
    position: relative;
    top: -10px;
  }
}

.line-from-top {
  position: absolute;
  top: 0;
  width: var(--size);

  > div {
    position: relative;
    right: -10px;
    display: flex;
    transform: rotate(90deg);
  }
}
</style>
