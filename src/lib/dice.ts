
import type { RollStats } from '@/types';

const SIMULATIONS = 10000;

export interface ParsedRoll {
  count: number;
  sides: number;
  multiplier: number;
  bonus: number;
}

export function parseRoll(definition: string): ParsedRoll {
    const cleanedDef = definition.toLowerCase().trim();
    // This regex now supports multipliers with "x" or "*" and handles optional spacing
    const mainPartMatch = cleanedDef.match(/^(\d*)d(\d+)/);
  
    if (!mainPartMatch) {
      throw new Error('Invalid format. Use "XdY".');
    }
  
    const count = mainPartMatch[1] ? parseInt(mainPartMatch[1], 10) : 1;
    const sides = parseInt(mainPartMatch[2], 10);
  
    if (isNaN(count) || isNaN(sides) || count <= 0 || sides <= 0 || count > 100 || sides > 1000) {
      throw new Error('Invalid dice. Use 1-100 dice with 1-1000 sides.');
    }
  
    let rest = cleanedDef.substring(mainPartMatch[0].length).trim();
  
    let multiplier = 1;
    const multiplierMatch = rest.match(/^[x*]\s*(\d+)/);
    if (multiplierMatch) {
      multiplier = parseInt(multiplierMatch[1], 10);
      rest = rest.substring(multiplierMatch[0].length).trim();
    }
  
    let bonus = 0;
    const bonusMatch = rest.match(/^([+-])\s*(\d+)/);
    if (bonusMatch) {
      bonus = parseInt(bonusMatch[1] + bonusMatch[2], 10);
      rest = rest.substring(bonusMatch[0].length).trim();
    }
  
    if (rest.length > 0) {
      throw new Error(`Unexpected characters: "${rest}"`);
    }
  
    return { count, sides, multiplier, bonus };
}

export function simulateRoll(parsedRoll: ParsedRoll): number[] {
  const results: number[] = [];
  for (let i = 0; i < SIMULATIONS; i++) {
    let sum = 0;
    for (let j = 0; j < parsedRoll.count; j++) {
      sum += Math.floor(Math.random() * parsedRoll.sides) + 1;
    }
    results.push(sum * parsedRoll.multiplier + parsedRoll.bonus);
  }
  return results;
}

export function calculateStats(data: number[]): RollStats {
  if (data.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0, mode: [], stdDev: 0, p90: 0 };
  }

  const sortedData = [...data].sort((a, b) => a - b);
  const sum = data.reduce((acc, val) => acc + val, 0);
  const mean = sum / data.length;

  const min = sortedData[0];
  const max = sortedData[sortedData.length - 1];

  const mid = Math.floor(sortedData.length / 2);
  const median =
    sortedData.length % 2 !== 0
      ? sortedData[mid]
      : (sortedData[mid - 1] + sortedData[mid]) / 2;

  const p90Index = Math.floor(sortedData.length * 0.9);
  const p90 = sortedData[p90Index];

  const counts = new Map<number, number>();
  data.forEach((n) => counts.set(n, (counts.get(n) || 0) + 1));

  let maxCount = 0;
  counts.forEach((count) => {
    if (count > maxCount) {
      maxCount = count;
    }
  });

  const mode: number[] = [];
  if (maxCount > 1) { // Only consider a mode if a value repeats
    for (const [num, count] of counts.entries()) {
      if (count === maxCount) {
        mode.push(num);
      }
    }
  }

  const variance = data.reduce((acc, val) => acc + (val - mean) ** 2, 0) / data.length;
  const stdDev = Math.sqrt(variance);

  return {
    min,
    max,
    mean: parseFloat(mean.toFixed(2)),
    median,
    mode: mode.sort((a, b) => a - b),
    stdDev: parseFloat(stdDev.toFixed(2)),
    p90,
  };
}

export function createDistribution(
  data: number[]
): { value: number; probability: number }[] {
  const counts = new Map<number, number>();
  data.forEach((n) => counts.set(n, (counts.get(n) || 0) + 1));

  return Array.from(counts.entries())
    .map(([value, count]) => ({
      value,
      probability: parseFloat(((count / SIMULATIONS) * 100).toFixed(2)),
    }))
    .sort((a, b) => a.value - b.value);
}
