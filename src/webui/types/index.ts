export type TSingleUiCommand = {
  id: number;
  name: string;
  message: string | null;
  enabled: boolean;
  alias: string;
};

export type TNewUiCommand = {
  name: string | undefined;
  message: string | undefined;
};
