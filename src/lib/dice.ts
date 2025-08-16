
import type { RollStats, Distribution } from '@/types';

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

/**
 * Calculates the exact distribution of outcomes for a given number of dice and sides.
 * @returns A Map where keys are the possible sums and values are the number of ways to achieve that sum.
 */
function calculateCombinations(count: number, sides: number): Map<number, number> {
  let distributions = new Map<number, number>();
  distributions.set(0, 1);

  for (let i = 0; i < count; i++) {
    const newDistributions = new Map<number, number>();
    for (let d = 1; d <= sides; d++) {
      for (const [sum, num] of distributions.entries()) {
        const newSum = sum + d;
        newDistributions.set(newSum, (newDistributions.get(newSum) || 0) + num);
      }
    }
    distributions = newDistributions;
  }
  return distributions;
}


export function getDistribution(parsedRoll: ParsedRoll): Distribution {
  const { count, sides, multiplier, bonus } = parsedRoll;

  // Combination limit to prevent performance issues with very large numbers of dice
  // e.g. 100d1000 has too many combinations to calculate in a reasonable time.
  if (count * sides > 5000) {
    throw new Error('Roll is too complex to calculate all outcomes. Please use fewer dice/sides.');
  }

  const combinations = calculateCombinations(count, sides);

  const outcomes = new Map<number, number>();
  let totalCombinations = 0;
  for (const [sum, num] of combinations.entries()) {
    const finalValue = sum * multiplier + bonus;
    outcomes.set(finalValue, (outcomes.get(finalValue) || 0) + num);
    totalCombinations += num;
  }

  const distribution = Array.from(outcomes.entries())
    .map(([value, count]) => ({
      value,
      count,
      probability: parseFloat(((count / totalCombinations) * 100).toFixed(4)),
    }))
    .sort((a, b) => a.value - b.value);

  const values = distribution.map(d => d.value);
  const totalSum = distribution.reduce((acc, d) => acc + d.value * d.count, 0);
  
  const mean = totalSum / totalCombinations;

  // Median
  let cumulativeCount = 0;
  let median = 0;
  const medianPoint1 = Math.floor((totalCombinations -1) / 2);
  const medianPoint2 = Math.ceil((totalCombinations -1) / 2);
  let medianVal1: number | null = null;
  let medianVal2: number | null = null;
  
  for(const point of distribution) {
      cumulativeCount += point.count;
      if (medianVal1 === null && cumulativeCount > medianPoint1) {
          medianVal1 = point.value;
      }
      if (medianVal2 === null && cumulativeCount > medianPoint2) {
          medianVal2 = point.value;
      }
      if(medianVal1 !== null && medianVal2 !== null) break;
  }
  median = (medianVal1! + medianVal2!) / 2;


  // Mode
  const maxCount = Math.max(...distribution.map(d => d.count));
  const mode = distribution.filter(d => d.count === maxCount).map(d => d.value);

  // Std Dev
  const variance = distribution.reduce((acc, d) => acc + ((d.value - mean) ** 2) * d.count, 0) / totalCombinations;
  const stdDev = Math.sqrt(variance);

  // P90
  const p90Threshold = totalCombinations * 0.9;
  let p90 = 0;
  let cumulativeForP90 = 0;
  for (const point of distribution) {
      cumulativeForP90 += point.count;
      if (cumulativeForP90 >= p90Threshold) {
          p90 = point.value;
          break;
      }
  }

  const stats: RollStats = {
    min: Math.min(...values),
    max: Math.max(...values),
    mean: parseFloat(mean.toFixed(2)),
    median,
    mode: mode.sort((a,b) => a - b),
    stdDev: parseFloat(stdDev.toFixed(2)),
    p90,
  };

  return {
    stats,
    points: distribution
  };
}
