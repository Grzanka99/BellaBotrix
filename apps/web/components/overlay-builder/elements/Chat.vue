<script setup lang="ts">
import { watchDebounced, useStorage } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";

const messages = ref<Array<{ username: string; color: string; message: string }>>([]);

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

  messages.value.push({
    username: uuidv4().substring(0, 10),
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
        <span
          :style="{ color: msg.color }"
          class="entry__username"
        >
          <b>
            {{ msg.username }}:
          </b>
        </span>
        <span class="entry__message">{{ msg.message }}</span>
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
  color: red;
}

.chatbox {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.entry {
  display: inline-flex;
  gap: var(--padding-half);
  padding-top: var(--padding-half);
  width: 100%;

  .entry__username {
    text-wrap: nowrap;
    width: max-content;
  }
}

.chats-move,
.chats-enter-active,
.chats-leave-active {
  transition: all 0.5s ease;
}

.chats-enter-from,
.chats-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.chats-leave-active {
  position: absolute !important;
}
</style>
