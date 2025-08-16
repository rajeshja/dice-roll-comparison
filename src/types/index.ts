
export interface RollStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  mode: number[];
  stdDev: number;
  p90: number;
}

export interface RollData {
  id: string;
  definition: string;
  color: string;
  stats?: RollStats;
  distribution?: { value: number; probability: number }[];
  error?: string;
}

export type CombinedDistribution = {
  value: number;
  [rollDefinition: string]: number; // probability for each roll
}[];
