export type TRoute = {
  to: string;
  displayName: string;
  icon: string;
};

export type TSelectOption<T = string | number> = {
  value: T;
  displayName: string;
  disabled?: boolean;
};
