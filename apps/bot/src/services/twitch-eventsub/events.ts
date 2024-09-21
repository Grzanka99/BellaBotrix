import { EEventSubEvents } from "./types";

type TPayload = {
  subscription: {
    [key: string]: unknown;
    type: EEventSubEvents;
  };
  event: {
    [key: string]: unknown;
  };
};

export function handleEvents(payload: TPayload) {
  console.log(payload.subscription.transport);
  switch (payload.subscription.type) {
    case EEventSubEvents.StreamOnline: {
      console.log("stream started");
    }
  }
}
