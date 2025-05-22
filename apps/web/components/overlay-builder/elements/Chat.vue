<script setup lang="ts">
import { watchDebounced, useStorage } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";

const messages = ref<Array<{ id: string; username: string; color: string; message: string }>>([]);

const height = ref(600);

function getRandomRgbColor() {
  // Generate a random integer between 0 and 255 for each color component
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  // Return the color in RGB string format
  return `rgb(${r}, ${g}, ${b})`;
}

watchDebounced(
  messages.value,
  () => {
    const chatbox = document.getElementById("chatbox");
    if (!chatbox) {
      return;
    }

    const children = chatbox.children;

    let combinedHeight = 0;

    for (const child of children) {
      if (child.classList.contains("chats-leave-active")) {
        continue;
      }
      const { height } = child.getBoundingClientRect();
      combinedHeight += height;
    }

    const avgHeigh = combinedHeight / children.length;

    if (combinedHeight + avgHeigh > height.value) {
      messages.value.shift();
    }
  },
  { debounce: 50, maxWait: 400 },
);

const timeoutV = useStorage("timeoutvalue", 1000);

function generateMessage() {
  // NOTE: I think it's good assumption that 50 is too much
  if (messages.value.length > 50) {
    messages.value.shift();
  }

  const id = uuidv4();

  messages.value.push({
    id,
    username: uuidv4().substring(0, 8),
    message: uuidv4(),
    color: getRandomRgbColor(),
  });
  setTimeout(generateMessage, Math.floor(Math.random() * timeoutV.value));
}

onMounted(() => {
  generateMessage();
});
</script>

<template>
  <div
    class="chat-element"
    :style="{ height: `${height}px` }"
  >
    <TransitionGroup
      name="chats"
      tag="ul"
      id="chatbox"
      class="chatbox"
      ref="chatbox"
    >
      <li
        v-for="msg in messages"
        :key="msg.message"
        class="entry"
      >
        <b :style="{color: msg.color}">{{ msg.username }}: </b> {{ msg.message }}
      </li>
    </TransitionGroup>
  </div>
</template>

<style>
.chat-element {
  padding: var(--padding);
  width: 400px;
  /* background: rgba(123, 123, 123, 0.5); */
  overflow: hidden;
  font-size: var(--font-size);
}

.chatbox {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.entry {
  /* display: inline-flex; */
  /* gap: var(--padding-half); */
  padding-top: var(--padding-half);
  width: 100%;

  /* 1 pixel black shadow to left, top, right and bottom */
  text-shadow: 1px 1px 1px var(--stroke);
  color: var(--text);

  .entry__username {
    text-wrap: nowrap;
    width: max-content;
  }

  .entry__message {}
}

.chats-move,
.chats-enter-active {
  transition: all 0.5s ease;
}



.chats-leave-active.chats-move {
  transition: all 0.3s ease;
}

.chats-leave-to {
  opacity: 0;
  transform: translateX(-50px) scale(0.9);
}

.chats-enter-from {
  opacity: 0.5;
  /* transform: translateY(100px); */
  transform: translateY(100px) scale(0);
}

.chats-leave-active {
  position: absolute !important;
}
</style>
