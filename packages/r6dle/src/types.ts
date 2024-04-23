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
