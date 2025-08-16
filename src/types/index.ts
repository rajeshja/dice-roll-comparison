

export interface RollStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  mode: number[];
  stdDev: number;
  p90: number;
}

export interface DistributionPoint {
  value: number;
  count: number;
  probability: number;
}

export interface Distribution {
  stats: RollStats;
  points: DistributionPoint[];
}

export interface RollData {
  id: string;
  definition: string;
  color: string;
  stats?: RollStats;
  distribution?: DistributionPoint[];
  error?: string;
}

export type CombinedDistribution = {
  value: number;
  [rollDefinition: string]: number; // probability for each roll
}[];
