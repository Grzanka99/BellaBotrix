type SevenTVEmoteData = {
  id: string;
  name: string;
  flags: number;
  lifecycle: number;
  state: string[];
  listed: boolean;
  animated: boolean;
  owner: SevenTVUser;
  host?: SevenTVHost;
};

type SevenTVUser = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  style: unknown; // Adjust based on expected properties
  roles: string[];
};

type SevenTVFiel = {
  name: string;
  static_name: string;
  width: number;
  height: number;
  frame_count: number;
  size: number;
  format: string;
};

type SevenTVHost = {
  url: string;
  files?: SevenTVFiel[];
};

export type SevenTVSingleEmote = {
  id: string;
  name: string;
  flags: number;
  timestamp: number;
  actor_id: string | null;
  data: SevenTVEmoteData;
};
