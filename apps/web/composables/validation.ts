import type { ZodIssue } from "zod";

type TLoseAutocomplete<T extends string> = T | (string & {});

export function useValidation<T extends string = string,>() {
  const errors = ref<ZodIssue[]>([]);

  watch(errors, () => {
    console.log(errors.value);
  });

  const validate = (field: TLoseAutocomplete<T>): string | undefined => {
    const error = errors.value.find((e) => {
      return e.path.includes(field);
    });

    return error?.message;
  };

  const isInvalid = computed(() => !!errors.value.length);

  return {
    validate,
    isInvalid,
    errors,
  };
}
