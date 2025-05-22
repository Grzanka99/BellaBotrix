import { z } from "zod";

export enum EElementType {
  Chat = "chat",
  Text = "text",
  Alert = "alert",
  Image = "image",
}

export type TOverlayLocalStorageSave = {
  top: string;
  left: string;
  element: EElementType;
  [key: string]: string;
};

export enum EAlertType {
  All = "ALL",
  Subscribtion = "SUBSCRIBTION",
  Follow = "FOLLOW",
  Raid = "RAID",
  Donate = "DONATE",
  Other = "OTHER",
}

const SPosition = z.object({
  top: z.string().refine((el) => el.endsWith("px")),
  left: z.string().refine((el) => el.endsWith("px")),
});

const SSize = z.object({
  width: z.string().refine((el) => el.endsWith("px")),
  height: z.string().refine((el) => el.endsWith("px")),
});

const SOverlayElement = z.discriminatedUnion("element", [
  z.object({
    element: z.literal(EElementType.Chat),
    uuid: z.string().uuid(),
    position: SPosition,
    size: SSize,
  }),
  z.object({
    element: z.literal(EElementType.Text),
    uuid: z.string().uuid(),
    position: SPosition,
    size: SSize,
    content: z.string(),
  }),
  z.object({
    element: z.literal(EElementType.Alert),
    uuid: z.string().uuid(),
    position: SPosition,
    size: SSize,
    alertType: z.nativeEnum(EAlertType),
  }),
  z.object({
    element: z.literal(EElementType.Image),
    uuid: z.string().uuid(),
    position: SPosition,
    size: SSize,
    src: z.string(),
  }),
]);

export const SOverlaySave = z.array(SOverlayElement);

export type TOverlaySaveElement = z.infer<typeof SOverlayElement>;
export type TOverlaySave = z.infer<typeof SOverlaySave>;
