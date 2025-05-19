import { EventSubEvents } from "common";

type TPayload = {
  subscription: {
    [key: string]: unknown;
    type: string;
  };
  event: {
    [key: string]: unknown;
  };
};

export function handleEvents(payload: TPayload) {
  console.log(payload);
  switch (payload.subscription.type) {
    case EventSubEvents.StreamOnline: {
      console.log("stream started");
      break;
    }
    case EventSubEvents.ChannelSubscribe: {
      console.log("Received subscription");
      break;
    }
    case EventSubEvents.ChannelFollow: {
      console.log("Received new follower");
      break;
    }
    case EventSubEvents.ChannelRaid: {
      console.log("Someoen raided your channel!");
      break;
    }
    case EventSubEvents.ChannelCheer: {
      console.log("Someone just cheered!");
      break;
    }
  }
}
