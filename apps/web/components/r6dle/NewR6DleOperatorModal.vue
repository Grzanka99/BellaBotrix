<script setup lang="ts">
import { type TCreateR6DleOperator, SCreateR6DleOperator, ER6DleRole, ER6DleOrg, ER6DleSquad, ER6DleRegion } from 'r6dle';
import Modal from '../ui/Modal.vue';
import FormTextInput from '../ui/FormTextInput.vue';
import CustomSelect from '../ui/CustomSelect.vue';
import FancyMultipleToggle from '../ui/FancyMultipleToggle.vue';
import FormButton from '../ui/FormButton.vue';

const emit = defineEmits<{
  (e: 'submit', payload: TCreateR6DleOperator): void,
  (e: 'cancel'): void,
}>()

defineProps<{
  open: boolean;
}>()

const alreadyExists = ref(false);

const name = ref('');
const role = ref<ER6DleRole[]>([]);
const side = ref<"Attack" | "Defence">('Attack');
const country = ref('');
const org = ref<ER6DleOrg>(ER6DleOrg.None)
const squad = ref<ER6DleSquad>(ER6DleSquad.None);
const release = ref(2015);
const speed = ref(2);
const region = ref<ER6DleRegion>(ER6DleRegion.Europe);

const handleCancel = () => {
  name.value = "";
  role.value = [];
  side.value = 'Attack';
  country.value = '';
  org.value = ER6DleOrg.None;
  squad.value = ER6DleSquad.None;
  release.value = 2015;
  speed.value = 2;
  region.value = ER6DleRegion.Europe;

  emit('cancel');
}

const parsed = computed(() => {
  const payload = {
    name: name.value,
    role: [...role.value],
    side: side.value,
    country: country.value,
    org: org.value,
    squad: squad.value,
    release: release.value,
    speed: speed.value,
    enabled: true,
    region: region.value
  }

  return SCreateR6DleOperator.safeParse(payload);
});

const { validate, isInvalid, errors } = useValidation<keyof TCreateR6DleOperator>();

watch(parsed, () => {
  errors.value = [];
  if (!parsed.value.success) {
    errors.value = parsed.value.error.errors;
  }
})

const handleAddOperator = async () => {
  if (!parsed.value.success) {
    return;
  }

  emit('submit', parsed.value.data);
  handleCancel();
}

const h = useR6DleOperatorsModal();
</script>

<template>
  <Modal
    :open="open"
    @close="handleCancel"
    header="Add new operator"
    description="Add new operator into r6dle game">
    <h4 v-if="alreadyExists">Operator of name: {{ name }} already exists</h4>
    <form
      @submit.prevent="handleAddOperator" class="r6dle-form">
      <div class="row">
        <FormTextInput
          name="name"
          v-model="name"
          placeholder="name"
          label="operator name"
          :error="validate('name')" />
        <CustomSelect v-model="side" :options="h.sideSelectOptions" />
      </div>
      <div class="row">
        <FormTextInput
          name="country"
          v-model="country"
          placeholder="country"
          label="country"
          :error="validate('country')" />
        <CustomSelect v-model="region" :options="h.regionSelectOptions" />
      </div>
      <div class="row">
        <CustomSelect v-model="squad" :options="h.squadSelectOptions" />
        <CustomSelect v-model="org" :options="h.orgSelectOptions" />
      </div>
      <div class="row">
        <CustomSelect v-model="speed" :options="h.speedSelectOptions" />
        <CustomSelect v-model="release" :options="h.releaseSelectOptions" />
      </div>
      <FancyMultipleToggle :options="h.roleOptions" v-model="role" />

      <div class="r6dle-form__controls">
        <FormButton type="button" @click="handleCancel">Cancel</FormButton>
        <FormButton type="submit" :disabled="isInvalid">Add</FormButton>
      </div>
    </form>
  </Modal>
</template>

<style lang="scss" scoped>
.r6dle-form {
  min-width: 25vw;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  gap: var(--padding);

  &__controls {
    display: flex;
    gap: var(--padding);
  }
}

.row {
  display: flex;
  gap: var(--padding);
  height: fit-content;
  justify-content: space-between;

  .custom-select {
    height: 38px;
    align-self: flex-end;
  }
}

h4 {
  color: var(--error);
}
</style>
