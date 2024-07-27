<script setup lang="ts">

definePageMeta({
  validate: () => {
    const perms = useAuth().session.value?.perms || [];
    return perms.includes('admin');
  }
})

useHead({
  title: 'AI Settings'
})
</script>


<template>
  ai</template>

<style lang="scss" scoped></style>
