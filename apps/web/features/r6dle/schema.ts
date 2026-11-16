import {
  ER6DleOrg,
  ER6DleRegion,
  ER6DleRole,
  ER6DleSquad,
  ER6dleGender,
  SCreateR6DleOperator,
  SUpdateR6DleOperator,
  type TR6dleOperatorV2,
} from "r6dle"
import { z } from "zod"

/**
 * The operator schemas come from the shared `r6dle` package (same as Nuxt).
 * Tightened on top: `release` and `speed` must be integers (Int columns).
 */
export const SCreateOperator = SCreateR6DleOperator.extend({
  release: z.number().int().min(2015),
  speed: z.number().int().min(1).max(3),
})

export const SUpdateOperator = SUpdateR6DleOperator.extend({
  id: z.number().int().positive(),
  release: z.number().int().min(2015).optional(),
  speed: z.number().int().min(1).max(3).optional(),
})

export const SDeleteOperator = z.object({
  id: z.coerce.number().int().positive(),
})

/** Port of `TR6dleOperatorV2` (what the Nuxt GET returned: `role` split on ","). */
export type R6dleOperator = TR6dleOperatorV2

type Option<T> = { value: T; label: string }

function enumOptions<T extends string>(values: T[]): Option<T>[] {
  return values.map((value) => ({ value, label: value }))
}

/** Port of `composables/r6dleoperatorsmodal.ts`, same order and labels. */
export const SIDE_OPTIONS: Option<"Attack" | "Defence">[] = [
  { value: "Attack", label: "Attack" },
  { value: "Defence", label: "Defence" },
]

export const REGION_OPTIONS = enumOptions([
  ER6DleRegion.Asia,
  ER6DleRegion.Europe,
  ER6DleRegion.NorthAmerica,
  ER6DleRegion.SouthAmerica,
  ER6DleRegion.Africa,
  ER6DleRegion.Australia,
])

export const ORG_OPTIONS = enumOptions(Object.values(ER6DleOrg))

export const SQUAD_OPTIONS = enumOptions([
  ER6DleSquad.None,
  ER6DleSquad.Wolfguard,
  ER6DleSquad.Ghosteyes,
  ER6DleSquad.Viperstrike,
  ER6DleSquad.Redhammer,
  ER6DleSquad.Nightheaven,
  ER6DleSquad.KeresLegion,
])

export const RELEASE_OPTIONS: Option<number>[] = Array.from(
  { length: 2024 - 2015 + 1 },
  (_, i) => ({ value: 2015 + i, label: String(2015 + i) })
)

export const SPEED_OPTIONS: Option<number>[] = [
  { value: 1, label: "1 speed, 3 armor" },
  { value: 2, label: "2 speed, 2 armor" },
  { value: 3, label: "3 speed, 1 armor" },
]

export const ROLE_OPTIONS = enumOptions([
  ER6DleRole.Intel,
  ER6DleRole.MapControl,
  ER6DleRole.AntiEntry,
  ER6DleRole.AntiGadget,
  ER6DleRole.Breach,
  ER6DleRole.Trapper,
  ER6DleRole.CrowdControl,
  ER6DleRole.Support,
  ER6DleRole.FrontLine,
])

export const GENDER_OPTIONS = enumOptions([
  ER6dleGender.Male,
  ER6dleGender.Female,
  ER6dleGender.Other,
])

/** Defaults of `NewR6DleOperatorModal.vue`. */
export const NEW_OPERATOR_DEFAULTS = {
  gender: ER6dleGender.Other,
  side: "Attack" as const,
  org: ER6DleOrg.None,
  squad: ER6DleSquad.None,
  release: 2015,
  speed: 2,
  region: ER6DleRegion.Europe,
}
