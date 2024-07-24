<script setup lang="ts">
import FormTextInput from '~/components/ui/FormTextInput.vue';
import FormButton from '~/components/ui/FormButton.vue';
import Table from '~/components/ui/Table/Table.vue';
import TableHead from '~/components/ui/Table/TableHead.vue';
import TableRow from '~/components/ui/Table/TableRow.vue';
import TableBody from '~/components/ui/Table/TableBody.vue';
import TableCell from '~/components/ui/Table/TableCell.vue';
import TableHeader from '~/components/ui/Table/TableHeader.vue';
import EditPermissionsForm from '~/components/permissions/EditPermissionsForm.vue'
import { usePermissionsStore } from '~/store/permissions.store';
import type { TPermissionEntry } from '~/types/permissions.type';

definePageMeta({
  validate: () => {
    const perms = useAuth().session.value?.perms || [];
    return perms.includes('admin');
  }
})

const s = usePermissionsStore();

const gridTemplate = "100px 1fr 3fr 1fr 120px 120px";

const toEdit = ref<TPermissionEntry | undefined>(undefined);

useHead({
  title: 'Permissions'
})
</script>

<template>
  <EditPermissionsForm v-if="toEdit" :original-perms="toEdit" @submit="s.handleUpdate" @cancel="toEdit = undefined" />
  <div class="permissions-page">
    <div class="permissions-page-controls">
      <div class="permissions-page-controls__search">
        <FormTextInput
          name="query"
          placeholder="Search by username..."
          v-model="s.queryFilter" />
        <FormButton type="button" @click="s.queryFilter = ''">claer</FormButton>
      </div>
    </div>
    <Table>
      <TableHead :grid-template="gridTemplate">
        <TableHeader>id</TableHeader>
        <TableHeader>username</TableHeader>
        <TableHeader>permssions</TableHeader>
        <TableHeader>channel</TableHeader>
        <TableHeader></TableHeader>
        <TableHeader></TableHeader>
      </TableHead>
      <TableBody>
        <template v-if="s.filtered.length">
          <TableRow v-for="user in s.filtered" :grid-template="gridTemplate">
            <TableCell>{{ user.id }}</TableCell>
            <TableCell>{{ user.username }}</TableCell>
            <TableCell>{{ user.perms.join(', ') }}</TableCell>
            <TableCell>{{ user.channel }}</TableCell>
            <TableCell>
              <FormButton
                type="button"
                smaller
                @click="toEdit = user">
                <Icon name="material-symbols:delete-forever" />
                edit
              </FormButton>
            </TableCell>
            <TableCell>
              <FormButton
                type="button"
                smaller
                disabled
                @click="console.log(user.id)">
                <Icon name="material-symbols:delete-forever" />
                delete
              </FormButton>
            </TableCell>
          </TableRow>
        </template>
        <TableCell v-else>Found 0 users</TableCell>
      </TableBody>
    </Table>
  </div>
</template>

<style lang="scss" scoped>
.permissions-page {
  display: flex;
  flex-direction: column;
  gap: var(--padding);
  height: 100%;
}

.permissions-page-controls {
  display: flex;
  justify-content: space-between;

  &__search {
    display: flex;
    width: 400px;
    gap: var(--padding);
  }

  &__form {
    display: flex;
    width: 100px;
    gap: var(--padding);
  }
}
</style>
