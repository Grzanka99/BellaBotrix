<script setup lang="ts">
import FormTextInput from '~/components/ui/FormTextInput.vue';
import FormButton from '~/components/ui/FormButton.vue';
import NewCommandModal from '~/components/commands/NewCommandModal.vue';
import CommandsList from '~/components/commands/CommandsList.vue';
import { useStorage } from '@vueuse/core'

const channel = useStorage('selectedChannel', undefined);
const { data, refresh } = useFetch(() => `/api/${channel.value}/commands`);

const refreshInterval = ref<NodeJS.Timeout>();
onMounted(() => {
  refreshInterval.value = setInterval(refresh, 10000)
})
onUnmounted(() => {
  clearInterval(refreshInterval.value)
})

const query = ref("");

const displayData = computed(() => {
  if (!query.value.length) {
    return data.value;
  }

  return data.value?.filter(el => el.name.includes(query.value) || el.alias.includes(query.value));
})

const newCommandModalOpen = ref(false);
const handleNewCommandSuccess = () => {
  refresh();
  newCommandModalOpen.value = false
}

const handleDelete = async (id: number) => {
  await $fetch(`/api/${channel.value}/commands`, {
    method: 'DELETE',
    body: { id }
  })

  refresh();
}

</script>

<template>
  <div id="commands-page">
    <NewCommandModal :open="newCommandModalOpen" @success="handleNewCommandSuccess" />
    <div id="commands-page-controls">
      <div id="commands-page-controls__search">
        <FormTextInput name="query" placeholder="Search by name..." v-model="query" />
        <FormButton type="button" @click="query = ''">clear</FormButton>
      </div>
      <div id="commands-page-controls__new-cmd">
        <FormButton type="button" @click="newCommandModalOpen = true">Add new command</FormButton>
      </div>
    </div>
    <CommandsList :commands="displayData || []" @delete="(id) => handleDelete(id)" />
  </div>
</template>

<style lang="scss" scoped>
#commands-page {
  display: flex;
  flex-direction: column;
  gap: var(--padding);

  height: 100%;
}

#commands-page-controls {
  display: flex;
  justify-content: space-between;

  &__search {
    display: flex;
    width: 400px;
    gap: var(--padding);
  }

  &__new-cmd {
    display: flex;
    width: 200px;
  }
}
</style>
