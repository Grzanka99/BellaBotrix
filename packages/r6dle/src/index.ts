import type { TR6DleOperator } from "./types";

export const R6DleOperators: Record<string, TR6DleOperator> = {
  SLEDGE: {
    sex: "Male",
    side: "Attack",
    continent: "Europe",
    release_year: 1,
    primary_options: ["AR", "Shotgun"],
    role: ["Soft Breach"],
    speed: 1,
    gadgets: ["Frag", "Stun", "Impact EMP"],
  },
  THATCHER: {
    sex: "Male",
    side: "Attack",
    continent: "Europe",
    release_year: 1,
    primary_options: ["AR", "Shotgun"],
    role: ["Utility Clear"],
    speed: 1,
    gadgets: ["Breach Charge", "Claymore"],
  },
  ASH: {
    sex: "Female",
    side: "Attack",
    continent: "Asia",
    release_year: 1,
    primary_options: ["AR"],
    role: ["Entry Fragger", "Soft Breach"],
    speed: 3,
    gadgets: ["Claymore", "Soft Breach"],
  },
  THERMITE: {
    sex: "Male",
    side: "Attack",
    continent: "North America",
    release_year: 1,
    primary_options: ["AR", "Shotgun"],
    role: ["Hard Breach"],
    speed: 2,
    gadgets: ["Smoke", "Flash"],
  },
  TWITCH: {
    sex: "Female",
    side: "Attack",
    continent: "Europe",
    release_year: 1,
    primary_options: ["AR", "Marksman Rifle", "Shotgun"],
    role: ["Intel Gathering", "Utility Clear"],
    speed: 2,
    gadgets: ["Claymore", "Smoke"],
  },
  MONTAGNE: {
    sex: "Male",
    side: "Attack",
    continent: "Europe",
    release_year: 1,
    primary_options: ["None"],
    role: ["Intel Gatherer", "Area Denial"],
    speed: 1,
    gadgets: ["Smoke", "Hard Breach", "Impact EMP"],
  },
  GLAZ: {
    sex: "Male",
    side: "Attack",
    continent: "Asia",
    release_year: 1,
    primary_options: ["Marksman Rifle"],
    role: ["Angle Watch", "Entry Fragger"],
    speed: 3,
    gadgets: ["Smoke", "Frag", "Claymore"],
  },
  FUZE: {
    sex: "Male",
    side: "Attack",
    continent: "Asia",
    release_year: 1,
    secondary_image: "",
    role: ["Area Denial", "Utility Clear"],
    speed: 1,
    gadgets: ["Hard Breach", "Soft Breach", "Smoke"],
  },
  BLITZ: {
    sex: "Male",
    side: "Attack",
    continent: "Europe",
    release_year: 1,
    secondary_image: "",
    role: ["Entry Fragger"],
    speed: 2,
    gadgets: ["Smoke", "Soft Breach"],
  },
  IQ: {
    sex: "Female",
    side: "Attack",
    continent: "Europe",
    release_year: 1,
    secondary_image: "",
    role: ["Utility Clear", "Intel Gatherer"],
    speed: 3,
    gadgets: ["Soft Breach", "Claymore"],
  },
  BUCK: {
    sex: "Male",
    side: "Attack",
    continent: "North America",
    release_year: 1,
    secondary_image: "",
    role: ["Soft Breach"],
    speed: 2,
    gadgets: ["Hard Breach", "Flash"],
  },
  BLACKBEARD: {
    sex: "Male",
    side: "Attack",
    continent: "North America",
    release_year: 1,
    secondary_image: "",
    role: ["Angle Watch"],
    speed: 2,
    gadgets: ["Flash", "Claymore", "Impact EMP"],
  },
  CAPITAO: {
    sex: "Male",
    side: "Attack",
    continent: "South America",
    release_year: 1,
    secondary_image: "",
    role: ["Area Denial"],
    speed: 3,
    gadgets: ["Claymore", "Hard Breach"],
  },
  HIBANA: {
    sex: "Female",
    side: "Attack",
    continent: "Asia",
    release_year: 1,
    secondary_image: "",
    role: ["Hard Breach"],
    speed: 3,
    gadgets: ["Flash", "Soft Breach"],
  },
  JACKAL: {
    sex: "Male",
    side: "Attack",
    continent: "Europe",
    release_year: 2,
    secondary_image: "",
    role: ["Intel Gatherer", "Entry Fragger"],
    speed: 2,
    gadgets: ["Claymore", "Smoke"],
  },
  YING: {
    sex: "Female",
    side: "Attack",
    continent: "Asia",
    release_year: 2,
    secondary_image: "",
    role: ["Entry Fragger"],
    speed: 2,
    gadgets: ["Smoke", "Hard Breach"],
  },
  ZOFIA: {
    sex: "Female",
    side: "Attack",
    continent: "Europe",
    release_year: 2,
    secondary_image: "",
    role: ["Entry Fragger", "Soft Breach"],
    speed: 1,
    gadgets: ["Claymore", "Soft Breach"],
  },
  DOKKAEBI: {
    sex: "Female",
    side: "Attack",
    continent: "Asia",
    release_year: 2,
    secondary_image: "",
    role: ["Intel Gatherer"],
    speed: 3,
    gadgets: ["Flash", "Smoke", "Impact EMP"],
  },
  LION: {
    sex: "Male",
    side: "Attack",
    continent: "Europe",
    release_year: 3,
    secondary_image: "",
    role: ["Intel Gatherer"],
    speed: 2,
    gadgets: ["Flash", "Claymore", "Impact EMP"],
  },
  FINKA: {
    sex: "Female",
    side: "Attack",
    continent: "Europe",
    release_year: 3,
    secondary_image: "",
    role: ["Entry Fragger"],
    speed: 2,
    gadgets: ["Smoke", "Flash"],
  },
  MAVERICK: {
    sex: "Male",
    side: "Attack",
    continent: "North America",
    release_year: 3,
    secondary_image: "",
    role: ["Hard Breach"],
    speed: 3,
    gadgets: ["Flash", "Claymore"],
  },
  NOMAD: {
    sex: "Female",
    side: "Attack",
    continent: "Africa",
    release_year: 3,
    secondary_image: "",
    role: ["Angle Watch", "Area Denial"],
    speed: 2,
    gadgets: ["Flash", "Soft Breach"],
  },
  GRIDLOCK: {
    sex: "Female",
    side: "Attack",
    continent: "Australia",
    release_year: 4,
    secondary_image: "",
    role: ["Area Denial", "Angle Watch"],
    speed: 1,
    gadgets: ["Soft Breach", "Smoke", "Impact EMP"],
  },
  NOKK: {
    sex: "Female",
    side: "Attack",
    continent: "Europe",
    release_year: 4,
    secondary_image: "",
    role: ["Entry Fragger"],
    speed: 2,
    gadgets: ["Frag", "Hard Breach", "Impact EMP"],
  },
  AMARU: {
    sex: "Female",
    side: "Attack",
    continent: "South America",
    release_year: 4,
    secondary_image: "",
    role: ["Entry Fragger"],
    speed: 2,
    gadgets: ["Flash", "Hard Breach"],
  },
  KALI: {
    sex: "Female",
    side: "Attack",
    continent: "Asia",
    release_year: 4,
    secondary_image: "",
    role: ["Utility Clear", "Angle Watch"],
    speed: 2,
    gadgets: ["Claymore", "Soft Breach"],
  },
  IANA: {
    sex: "Female",
    side: "Attack",
    continent: "Europe",
    release_year: 5,
    secondary_image: "",
    role: ["Entry Fragger", "Intel Gatherer"],
    speed: 2,
    gadgets: ["Frag", "Smoke"],
  },
  ACE: {
    sex: "Male",
    side: "Attack",
    continent: "Europe",
    release_year: 5,
    secondary_image: "",
    role: ["hard Breach"],
    speed: 2,
    gadgets: ["Claymore", "Soft Breach"],
  },
  ZERO: {
    sex: "Male",
    side: "Attack",
    continent: "North America",
    release_year: 5,
    secondary_image: "",
    role: ["Intel Gatherer", "Utility Clear"],
    speed: 3,
    gadgets: ["Claymore", "Hard Breach"],
  },
  FLORES: {
    sex: "Male",
    side: "Attack",
    continent: "South America",
    release_year: 6,
    secondary_image: "",
    role: ["Utility Clear", "Soft Breach"],
    speed: 2,
    gadgets: ["Claymore", "Flash"],
  },
  OSA: {
    sex: "Female",
    side: "Attack",
    continent: "Europe",
    release_year: 6,
    secondary_image: "",
    role: ["Angle Watch"],
    speed: 1,
    gadgets: ["Claymore", "Smoke", "Impact EMP"],
  },
  SENS: {
    sex: "Female",
    side: "Attack",
    continent: "Europe",
    release_year: 7,
    secondary_image: "",
    role: ["Area Denial", "Angle Watch"],
    speed: 3,
    gadgets: ["Hard Breach", "Claymore"],
  },
  GRIM: {
    sex: "Male",
    side: "Attack",
    continent: "Asia",
    release_year: 7,
    secondary_image: "",
    role: ["Intel Gatherer", "Angle Watch"],
    speed: 3,
    gadgets: ["Claymore", "Soft Breach"],
  },
  BRAVA: {
    sex: "Female",
    side: "Attack",
    continent: "South America",
    release_year: 8,
    secondary_image: "",
    role: ["Utility Clear", "Intel Gatherer"],
    speed: 3,
    gadgets: ["Claymore", "Smoke"],
  },
  SMOKE: {
    sex: "Male",
    side: "Defence",
    continent: "Europe",
    release_year: 1,
    secondary_image: "",
    role: ["Area Denial"],
    speed: 2,
    gadgets: ["Deployable Shield", "Barbed Wire"],
  },
  MUTE: {
    sex: "Male",
    side: "Defence",
    continent: "Europe",
    release_year: 1,
    secondary_image: "",
    role: ["Anti-Intel", "Roamer", "Breach Denial"],
    speed: 1,
    gadgets: ["Bulletproof Cam", "C4"],
  },
  CASTLE: {
    sex: "Male",
    side: "Defence",
    continent: "North America",
    release_year: 1,
    secondary_image: "",
    role: ["Area Denial"],
    speed: 2,
    gadgets: ["Bulletproof Cam", "Proximity Alarm"],
  },
  PULSE: {
    sex: "Male",
    side: "Defence",
    continent: "North America",
    release_year: 1,
    secondary_image: "",
    role: ["Roamer", "Intel Gathering"],
    speed: 3,
    gadgets: ["C4", "Barbed Wire"],
  },
  DOC: {
    sex: "Male",
    side: "Defence",
    continent: "Europe",
    release_year: 1,
    secondary_image: "",
    role: ["Support"],
    speed: 1,
    gadgets: ["Barbed Wire", "Bulletproof Cam"],
  },
  ROOK: {
    sex: "Male",
    side: "Defence",
    continent: "Europe",
    release_year: 1,
    secondary_image: "",
    role: ["Support"],
    speed: 1,
    gadgets: ["Impacts", "Proximity Alarm"],
  },
  KAPKAN: {
    sex: "Male",
    side: "Defence",
    continent: "Asia",
    release_year: 1,
    secondary_image: "",
    role: ["Trapper"],
    speed: 2,
    gadgets: ["C4", "Impacts"],
  },
  TACHANKA: {
    sex: "Male",
    side: "Defence",
    continent: "Europe",
    release_year: 1,
    secondary_image: "",
    role: ["Area Denial"],
    speed: 1,
    gadgets: ["Barbed Wire", "Deployable Shield"],
  },
  JAGER: {
    sex: "Male",
    side: "Defence",
    continent: "Europe",
    release_year: 1,
    secondary_image: "",
    role: ["Support", "Roamer"],
    speed: 2,
    gadgets: ["Barbed Wire", "Bulletproof Cam"],
  },
  BANDIT: {
    sex: "Male",
    side: "Defence",
    continent: "Europe",
    release_year: 1,
    secondary_image: "",
    role: ["Breach Denial"],
    speed: 3,
    gadgets: ["Barbed Wire", "C4"],
  },
  FROST: {
    sex: "Female",
    side: "Defence",
    continent: "North America",
    release_year: 1,
    secondary_image: "",
    role: ["Trapper"],
    speed: 2,
    gadgets: ["Deployable Shield", "Bulletproof Cam"],
  },
  VALKYRIE: {
    sex: "Female",
    side: "Defence",
    continent: "North America",
    release_year: 1,
    secondary_image: "",
    role: ["Intel Gatherer"],
    speed: 2,
    gadgets: ["C4", "Impacts"],
  },
  CAVEIRA: {
    sex: "Female",
    side: "Defence",
    continent: "South America",
    release_year: 1,
    secondary_image: "",
    role: ["Roamer", "Intel Gatherer"],
    speed: 3,
    gadgets: ["Impacts", "Proximity Alarm"],
  },
  ECHO: {
    sex: "Male",
    side: "Defence",
    continent: "Asia",
    release_year: 1,
    secondary_image: "",
    role: ["Support", "Intel Gatherer"],
    speed: 2,
    gadgets: ["Impacts", "Deployable Shield"],
  },
  MIRA: {
    sex: "Female",
    side: "Defence",
    continent: "Europe",
    release_year: 2,
    secondary_image: "",
    role: ["Support", "Area Denial"],
    speed: 1,
    gadgets: ["C4", "Proximity Alarm"],
  },
  LESION: {
    sex: "Male",
    side: "Defence",
    continent: "Asia",
    release_year: 2,
    secondary_image: "",
    role: ["Trapper", "Roamer"],
    speed: 2,
    gadgets: ["Impacts", "Bulletproof Cam"],
  },
  ELA: {
    sex: "Female",
    side: "Defence",
    continent: "Europe",
    release_year: 2,
    secondary_image: "",
    role: ["Trapper", "Roamer"],
    speed: 2,
    gadgets: ["Barbed Wire", "Deployable Shield"],
  },
  VIGIL: {
    sex: "Male",
    side: "Defence",
    continent: "Asia",
    release_year: 2,
    secondary_image: "",
    role: ["Roamer", "Anti-Intel"],
    speed: 3,
    gadgets: ["Impacts", "Bulletproof Cam"],
  },
  MAESTRO: {
    sex: "Male",
    side: "Defence",
    continent: "Europe",
    release_year: 3,
    secondary_image: "",
    role: ["Intel Gatherer"],
    speed: 1,
    gadgets: ["Impacts", "Barbed Wire"],
  },
  ALIBI: {
    sex: "Female",
    side: "Defence",
    continent: "Africa",
    release_year: 3,
    secondary_image: "",
    role: ["Intel Gatherer", "Trapper"],
    speed: 3,
    gadgets: ["Impacts", "Deployable Shield"],
  },
  CLASH: {
    sex: "Female",
    side: "Defence",
    continent: "Europe",
    release_year: 3,
    secondary_image: "",
    role: ["Area Denial"],
    speed: 1,
    gadgets: ["Barbed Wire", "Impacts"],
  },
  KAID: {
    sex: "Male",
    side: "Defence",
    continent: "Africa",
    release_year: 3,
    secondary_image: "",
    role: ["Breach Denial"],
    speed: 1,
    gadgets: ["Barbed Wire", "C4"],
  },
  MOZZIE: {
    sex: "Male",
    side: "Defence",
    continent: "Australia",
    release_year: 4,
    secondary_image: "",
    role: ["Anti-Intel", "Intel Gatherer", "Roamer"],
    speed: 2,
    gadgets: ["C4", "Barbed Wire"],
  },
  WARDEN: {
    sex: "Male",
    side: "Defence",
    continent: "North America",
    release_year: 4,
    secondary_image: "",
    role: ["Intel Gatherer"],
    speed: 2,
    gadgets: ["C4", "Deployable Shield"],
  },
  GOYO: {
    sex: "Male",
    side: "Defence",
    continent: "North America",
    release_year: 4,
    secondary_image: "",
    role: ["Area Denial", "Trapper"],
    speed: 2,
    gadgets: ["C4", "Proximity Alarm"],
  },
  WAMAI: {
    sex: "Male",
    side: "Defence",
    continent: "Africa",
    release_year: 4,
    secondary_image: "",
    role: ["Support"],
    speed: 2,
    gadgets: ["Proximity Alarm", "Impacts"],
  },
  ORYX: {
    sex: "Male",
    side: "Defence",
    continent: "Asia",
    release_year: 5,
    secondary_image: "",
    role: ["Roamer"],
    speed: 2,
    gadgets: ["Proximity Alarm", "Barbed Wire"],
  },
  MELUSI: {
    sex: "Female",
    side: "Defence",
    continent: "Africa",
    release_year: 5,
    secondary_image: "",
    role: ["Area Denial", "Intel Gatherer"],
    speed: 1,
    gadgets: ["Impacts", "Bulletproof Cam"],
  },
  ARUNI: {
    sex: "Female",
    side: "Defence",
    continent: "Asia",
    release_year: 5,
    secondary_image: "",
    role: ["Area Denial", "Support"],
    speed: 2,
    gadgets: ["Bulletproof Cam", "Barbed Wire"],
  },
  THUNDERBIRD: {
    sex: "Female",
    side: "Defence",
    continent: "North America",
    release_year: 6,
    secondary_image: "",
    role: ["Support"],
    speed: 2,
    gadgets: ["Impacts", "C4"],
  },
  THORN: {
    sex: "Female",
    side: "Defence",
    continent: "Europe",
    release_year: 6,
    secondary_image: "",
    role: ["Trapper"],
    speed: 2,
    gadgets: ["Barbed Wire", "Deployable Shield"],
  },
  AZAMI: {
    sex: "Female",
    side: "Defence",
    continent: "Asia",
    release_year: 7,
    secondary_image: "",
    role: ["Support", "Area Denial"],
    speed: 2,
    gadgets: ["Impacts", "Barbed Wire"],
  },
  SOLIS: {
    sex: "Female",
    side: "Defence",
    continent: "South America",
    release_year: 7,
    secondary_image: "",
    role: ["Intel Gatherer", "Roamer", "Support"],
    speed: 2,
    gadgets: ["Impacts", "Bulletproof Cam"],
  },
};
