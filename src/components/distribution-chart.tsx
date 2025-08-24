
'use client';

import type { RollData, CombinedDistribution } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useMemo } from 'react';

interface DistributionChartProps {
  results: RollData[];
}

export function DistributionChart({ results }: DistributionChartProps) {
  const validResults = useMemo(() => results.filter(r => r.distribution && !r.error), [results]);

  const combinedData: CombinedDistribution = useMemo(() => {
    if (validResults.length === 0) return [];

    const valueMap = new Map<number, { value: number; [key: string]: number }>();
    let allValues = new Set<number>();

    validResults.forEach(result => {
      result.distribution?.forEach(point => {
        allValues.add(point.value);
      });
    });

    const sortedValues = Array.from(allValues).sort((a, b) => a - b);

    sortedValues.forEach(value => {
      valueMap.set(value, { value });
    });

    validResults.forEach(result => {
      const resultProbs = new Map(result.distribution?.map(p => [p.value, p.probability]));
      sortedValues.forEach(value => {
        const entry = valueMap.get(value);
        if (entry) {
          entry[result.definition] = resultProbs.get(value) || 0;
        }
      });
    });

    return Array.from(valueMap.values());
  }, [validResults]);

  if (validResults.length === 0) {
    return null;
  }

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={combinedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="value"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            type="number"
            domain={['dataMin', 'dataMax']}
            allowDataOverflow={true}
          />
          <YAxis
            label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', dy: 40 }}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickFormatter={(value) => `${value.toFixed(2)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number) => `${value.toFixed(2)}%`}
          />
          <Legend />
          {validResults.map((result) => (
            <Line
              key={result.id}
              type="monotone"
              dataKey={result.definition}
              stroke={result.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
