import { ER6DleOrg, ER6DleRegion, ER6DleRole, ER6DleSquad, ER6dleGender } from "r6dle";
import type { TSelectOption } from "~/types/ui.type";

export function useR6DleOperatorsModal() {
  const sideSelectOptions: TSelectOption[] = [
    {
      value: "Attack",
      displayName: "Attack",
    },
    {
      value: "Defence",
      displayName: "Defence",
    },
  ];

  const regionSelectOptions: TSelectOption[] = [
    {
      value: ER6DleRegion.Asia,
      displayName: ER6DleRegion.Asia,
    },

    {
      value: ER6DleRegion.Europe,
      displayName: ER6DleRegion.Europe,
    },
    {
      value: ER6DleRegion.NorthAmerica,
      displayName: ER6DleRegion.NorthAmerica,
    },
    {
      value: ER6DleRegion.SouthAmerica,
      displayName: ER6DleRegion.SouthAmerica,
    },
    {
      value: ER6DleRegion.Africa,
      displayName: ER6DleRegion.Africa,
    },
    {
      value: ER6DleRegion.Australia,
      displayName: ER6DleRegion.Australia,
    },
  ];

  const orgSelectOptions: TSelectOption[] = [
    { value: ER6DleOrg.None, displayName: ER6DleOrg.None },
    { value: ER6DleOrg.SAS, displayName: ER6DleOrg.SAS },
    { value: ER6DleOrg.FBISWAT, displayName: ER6DleOrg.FBISWAT },
    { value: ER6DleOrg.GIGN, displayName: ER6DleOrg.GIGN },
    { value: ER6DleOrg.Spetsnaz, displayName: ER6DleOrg.Spetsnaz },
    { value: ER6DleOrg.GSG9, displayName: ER6DleOrg.GSG9 },
    { value: ER6DleOrg.NavySEAL, displayName: ER6DleOrg.NavySEAL },
    { value: ER6DleOrg.JTF2, displayName: ER6DleOrg.JTF2 },
    { value: ER6DleOrg.BOPE, displayName: ER6DleOrg.BOPE },
    { value: ER6DleOrg.SAT, displayName: ER6DleOrg.SAT },
    { value: ER6DleOrg.GEO, displayName: ER6DleOrg.GEO },
    { value: ER6DleOrg.SDU, displayName: ER6DleOrg.SDU },
    { value: ER6DleOrg.GROM, displayName: ER6DleOrg.GROM },
    { value: ER6DleOrg.th707SMB, displayName: ER6DleOrg.th707SMB },
    { value: ER6DleOrg.GIS, displayName: ER6DleOrg.GIS },
    { value: ER6DleOrg.DeltaForce, displayName: ER6DleOrg.DeltaForce },
    { value: ER6DleOrg.MPS, displayName: ER6DleOrg.MPS },
    { value: ER6DleOrg.GIGR, displayName: ER6DleOrg.GIGR },
    { value: ER6DleOrg.SASR, displayName: ER6DleOrg.SASR },
    { value: ER6DleOrg.JaegerCorps, displayName: ER6DleOrg.JaegerCorps },
    { value: ER6DleOrg.SecretService, displayName: ER6DleOrg.SecretService },
    { value: ER6DleOrg.APCA, displayName: ER6DleOrg.APCA },
    { value: ER6DleOrg.FES, displayName: ER6DleOrg.FES },
    { value: ER6DleOrg.Nightheaven, displayName: ER6DleOrg.Nightheaven },
    { value: ER6DleOrg.REU, displayName: ER6DleOrg.REU },
    { value: ER6DleOrg.ITF, displayName: ER6DleOrg.ITF },
    { value: ER6DleOrg.STARTNETAVIATION, displayName: ER6DleOrg.STARTNETAVIATION },
    { value: ER6DleOrg.GARDAERU, displayName: ER6DleOrg.GARDAERU },
    { value: ER6DleOrg.SFG, displayName: ER6DleOrg.SFG },
    { value: ER6DleOrg.AFEAU, displayName: ER6DleOrg.AFEAU },
    { value: ER6DleOrg.COT, displayName: ER6DleOrg.COT },
    { value: ER6DleOrg.CB35TH, displayName: ER6DleOrg.CB35TH },
    { value: ER6DleOrg.DAE, displayName: ER6DleOrg.DAE },
    { value: ER6DleOrg.ROS, displayName: ER6DleOrg.ROS },
  ];

  const squadSelectOptions: TSelectOption[] = [
    {
      value: ER6DleSquad.None,
      displayName: ER6DleSquad.None,
    },
    {
      value: ER6DleSquad.Wolfguard,
      displayName: ER6DleSquad.Wolfguard,
    },
    {
      value: ER6DleSquad.Ghosteyes,
      displayName: ER6DleSquad.Ghosteyes,
    },
    {
      value: ER6DleSquad.Viperstrike,
      displayName: ER6DleSquad.Viperstrike,
    },
    {
      value: ER6DleSquad.Redhammer,
      displayName: ER6DleSquad.Redhammer,
    },
    {
      value: ER6DleSquad.Nightheaven,
      displayName: ER6DleSquad.Nightheaven,
    },
    {
      value: ER6DleSquad.KeresLegion,
      displayName: ER6DleSquad.KeresLegion,
    },
  ];

  const releaseSelectOptions: TSelectOption[] = [
    { value: 2015, displayName: "2015" },
    { value: 2016, displayName: "2016" },
    { value: 2017, displayName: "2017" },
    { value: 2018, displayName: "2018" },
    { value: 2019, displayName: "2019" },
    { value: 2020, displayName: "2020" },
    { value: 2021, displayName: "2021" },
    { value: 2022, displayName: "2022" },
    { value: 2023, displayName: "2023" },
    { value: 2024, displayName: "2024" },
  ];

  const speedSelectOptions: TSelectOption[] = [
    { value: 1, displayName: "1 speed, 3 armor" },
    { value: 2, displayName: "2 speed, 2 armor" },
    { value: 3, displayName: "3 speed, 1 armor" },
  ];

  const roleOptions: TSelectOption[] = [
    { value: ER6DleRole.Intel, displayName: ER6DleRole.Intel },
    { value: ER6DleRole.MapControl, displayName: ER6DleRole.MapControl },
    { value: ER6DleRole.AntiEntry, displayName: ER6DleRole.AntiEntry },
    { value: ER6DleRole.AntiGadget, displayName: ER6DleRole.AntiGadget },
    { value: ER6DleRole.Breach, displayName: ER6DleRole.Breach },
    { value: ER6DleRole.Trapper, displayName: ER6DleRole.Trapper },
    { value: ER6DleRole.CrowdControl, displayName: ER6DleRole.CrowdControl },
    { value: ER6DleRole.Support, displayName: ER6DleRole.Support },
    { value: ER6DleRole.FrontLine, displayName: ER6DleRole.FrontLine },
  ];

  const genderOptions: TSelectOption[] = [
    { value: ER6dleGender.Male, displayName: ER6dleGender.Male },
    { value: ER6dleGender.Female, displayName: ER6dleGender.Female },
    { value: ER6dleGender.Other, displayName: ER6dleGender.Other },
  ];

  return {
    sideSelectOptions,
    regionSelectOptions,
    orgSelectOptions,
    squadSelectOptions,
    releaseSelectOptions,
    speedSelectOptions,
    roleOptions,
    genderOptions,
  };
}
