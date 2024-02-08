<script lang="ts" setup>
const props = defineProps<{
  message: string,
}>()

const splitted = computed(() => props.message.split(" "));

</script>

<template>
  <div class="command-message__message">
    <template v-for="word in splitted">
      <img v-if="word.startsWith('emoteurl:')" :src="`https://${word.slice(9)}`" />
      <template v-else>{{ word }}{{ " " }}</template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.command-message__message {
  font-size: 1.4rem;

  >img {
    height: 2rem;
  }
}
</style>
