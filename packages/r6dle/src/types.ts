import { z } from "zod";

export type TR6DleOperator = {
  sex: "Male" | "Female";
  side: "Attack" | "Defence";
  continent: "Europe" | "Asia" | "North America" | "South America" | "Australia" | "Africa";
  release_year: number;
  primary_options?: string[];
  secondary_image?: string;
  role: string[];
  speed: number;
  gadgets: string[];
};

export enum ER6DleRegion {
  Europe = "Europe",
  Asia = "Asia",
  NorthAmerica = "North America",
  SouthAmerica = "South America",
  Africa = "Africa",
  Australia = "Australia",
}

export enum ER6DleRole {
  Intel = "Intel",
  MapControl = "Map Control",
  AntiEntry = "Anti-Entry",
  AntiGadget = "Anti-Gadget",
  Breach = "Breach",
  Trapper = "Trapper",
  CrowdControl = "Crowd Control",
  Support = "Support",
  FrontLine = "Front Line",
}

export enum ER6DleOrg {
  None = "None",
  SAS = "SAS",
  FBISWAT = "FBI SWAT",
  GIGN = "GING",
  Spetsnaz = "Spetsnaz",
  GSG9 = "GSG 9",
  NavySEAL = "Navy SEALs",
  JTF2 = "JTF2",
  BOPE = "BOPE",
  SAT = "SAT",
  GEO = "GEO",
  SDU = "SDU",
  GROM = "GROM",
  th707SMB = "707th SMB",
  GIS = "GIS",
  DeltaForce = "DeltaForce",
  MPS = "MPS",
  GIGR = "GIGR",
  SASR = "SASR",
  JaegerCorps = "Jaeger Corps",
  SecretService = "Secret Service",
  APCA = "APCA",
  FES = "FES",
  Nightheaven = "Nightheaven",
  REU = "REU",
  ITF = "ITF",
  STARTNETAVIATION = "Star-Net Aviation",
  GARDAERU = "Garda ERU",
  SFG = "SFG",
  AFEAU = "AFEAU",
  COT = "COT",
}

export enum ER6DleSquad {
  Wolfguard = "Wolfguard",
  Ghosteyes = "Ghosteyes",
  Viperstrike = "Viperstrike",
  Redhammer = "Redhammer",
  Nightheaven = "Nightheaven",
  KeresLegion = "Keres Legion",
  None = "None",
}

export const SR6DleOperator = z.object({
  id: z.number(),
  enabled: z.boolean(),
  name: z.string().refine((v) => v.length > 0),
  role: z.array(z.nativeEnum(ER6DleRole)).refine((v) => v.length > 0),
  side: z.union([z.literal("Attack"), z.literal("Defence")]),
  country: z.string().refine((v) => v.length > 0),
  region: z.nativeEnum(ER6DleRegion),
  org: z.nativeEnum(ER6DleOrg),
  squad: z.nativeEnum(ER6DleSquad),
  release: z.number().refine((v) => v >= 2015),
  speed: z.number().refine((v) => v >= 1 && v <= 3),
});

export const SCreateR6DleOperator = SR6DleOperator.omit({ id: true });

export const SUpdateR6DleOperator = SR6DleOperator.partial().required({
  id: true,
});

export type TR6dleOperatorV2 = z.infer<typeof SR6DleOperator>;
export type TUpdateR6dleOperator = z.infer<typeof SUpdateR6DleOperator>;
export type TCreateR6DleOperator = z.infer<typeof SCreateR6DleOperator>;
