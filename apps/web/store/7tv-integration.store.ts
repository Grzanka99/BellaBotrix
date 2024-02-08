import { useStorage } from "@vueuse/core";
import type { SevenTVSingleEmote } from "~/types/emote-integration.type";

export const useSevenTVIntegrationStore = defineStore("7tv-integration", () => {
  const channelId = useStorage<string | undefined>("selectedChannelId", undefined);

  const emotes = ref<SevenTVSingleEmote[]>([]);

  const { data } = useFetch(() => `https://7tv.io/v3/users/twitch/${channelId.value}`);

  watch(data, () => {
    // @ts-expect-error
    const rawEmotes = data.value?.emote_set?.emotes as SevenTVSingleEmote[];
    emotes.value = rawEmotes;
  });

  const mapped = computed(() => {
    const filtered = emotes.value.filter((emote) => !!emote.data.host?.files?.length);

    const theMap = new Map<string, string>();

    for (const el of filtered) {
      theMap.set(el.name, `${el.data.host?.url}/${el.data.host?.files?.[1].name}`.slice(2));
    }

    return theMap;
  });

  function interpolate(value: string) {
    let newVal = value;
    const words = value.split(" ");
    for (const word of words) {
      const el = mapped.value.get(word);
      if (el) {
        newVal = newVal.replaceAll(word, `emoteurl:${el} `);
      }
    }

    return newVal;
  }

  return {
    emotes,
    mapped,
    interpolate,
  };
});
