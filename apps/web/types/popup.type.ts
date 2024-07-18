export enum EPopupType {
  Error = "error",
  Warning = "warning",
  Info = "info",
  Success = "success",
}

export enum EPopupStatus {
  New = "new",
  Progress = "progress",
  Handled = "handled",
}

export type TPopup = {
  type: EPopupType;
  headline: string;
  details: string[];
  timeout: number;
};
