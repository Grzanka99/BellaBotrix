<script setup lang="ts">
import { ER6DleRole, ER6DleOrg, ER6DleSquad, ER6DleRegion, type TUpdateR6dleOperator, type TR6dleOperatorV2, SUpdateR6DleOperator } from 'r6dle';
import Modal from '../ui/Modal.vue';
import FormTextInput from '../ui/FormTextInput.vue';
import CustomSelect from '../ui/CustomSelect.vue';
import FancyMultipleToggle from '../ui/FancyMultipleToggle.vue';
import FormButton from '../ui/FormButton.vue';

const emit = defineEmits<{
  (e: 'submit', payload: TUpdateR6dleOperator): void,
  (e: 'cancel'): void,
}>()

const props = defineProps<{
  originalOperator: TR6dleOperatorV2;
}>()

const alreadyExists = ref(false);

const role = ref<ER6DleRole[]>(props.originalOperator.role);
const side = ref<"Attack" | "Defence">(props.originalOperator.side);
const country = ref(props.originalOperator.country);
const org = ref<ER6DleOrg>(props.originalOperator.org)
const squad = ref<ER6DleSquad>(props.originalOperator.squad);
const release = ref(props.originalOperator.release);
const speed = ref(props.originalOperator.speed);
const region = ref<ER6DleRegion>(props.originalOperator.region);

const handleCancel = () => {
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
    id: props.originalOperator.id,
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

  const res = SUpdateR6DleOperator.safeParse(payload);
  return res;
});

const { validate, isInvalid, errors } = useValidation<keyof TUpdateR6dleOperator>();

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
    :open="!!originalOperator"
    @close="handleCancel"
    :header="`Edit properties of: ${props.originalOperator.name}`"
    description="Add new operator into r6dle game">
    <h4 v-if="alreadyExists">Operator of name: {{ props.originalOperator.name }} already exists</h4>
    <form
      @submit.prevent="handleAddOperator" class="r6dle-form">
      <CustomSelect v-model="side" :options="h.sideSelectOptions" />
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
        <FormButton type="submit" :disabled="isInvalid">Save</FormButton>
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
