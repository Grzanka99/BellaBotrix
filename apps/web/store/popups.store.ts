import { EPopupStatus, EPopupType, type TPopup } from "~/types/popup.type";

type TPopupInner = TPopup & {
  id: number;
  status: EPopupStatus;
};

function sorter(a: TPopup, b: TPopup) {
  if (a.type === EPopupType.Error && b.type !== EPopupType.Error) {
    return 1;
  }

  if (a.type === EPopupType.Error && b.type === EPopupType.Error) {
    return 0;
  }

  if (a.type !== EPopupType.Error && b.type === EPopupType.Error) {
    return -1;
  }

  return 0;
}

export const usePopupsStore = defineStore("popups", () => {
  const popups = ref<TPopupInner[]>([]);
  const id = ref<number>(0);

  const add = (popup: TPopup) => {
    const localId = id.value + 1;

    popups.value = [
      ...popups.value,
      {
        ...popup,
        id: localId,
        status: EPopupStatus.Progress,
      },
    ];

    console.log(popup.timeout);
    id.value = localId;
    if (popup.timeout <= 0) {
      return;
    }

    setTimeout(() => {
      handle(localId);
    }, popup.timeout);
  };

  const handle = (id: number) => {
    popups.value = popups.value.map((el) => {
      if (el.id !== id) {
        return el;
      }

      return { ...el, status: EPopupStatus.Handled };
    });
  };

  const queue = computed(() => popups.value.filter((el) => el.status === EPopupStatus.Progress));

  return {
    add,
    handle,
    popups: () => popups.value,
    queue,
  };
});
