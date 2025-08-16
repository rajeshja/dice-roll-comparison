
'use client';

import type { RollData } from '@/types';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface StatisticsTableProps {
  results: RollData[];
}

export function StatisticsTable({ results }: StatisticsTableProps) {
  const validResults = results.filter((r) => r.stats && !r.error);

  if (validResults.length === 0) {
    return null;
  }

  const formatMode = (mode: number[]) => {
    if (!mode || mode.length === 0) return 'N/A';
    // For uniform distributions (like 1d12), every value is a mode.
    // Instead of a long list, we can call it uniform.
    if (mode.length > 2) return 'Uniform';
    return mode.join(', ');
  }

  return (
    <TooltipProvider>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Roll</TableHead>
              <TableHead>Min</TableHead>
              <TableHead>Max</TableHead>
              <TableHead>Average</TableHead>
              <TableHead>Median</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Std. Dev</TableHead>
              <TableHead>P90</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {validResults.map((result) => (
              <TableRow key={result.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: result.color }}
                    ></span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">{result.definition}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{result.definition}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell>{result.stats?.min}</TableCell>
                <TableCell>{result.stats?.max}</TableCell>
                <TableCell>{result.stats?.mean}</TableCell>
                <TableCell>{result.stats?.median}</TableCell>
                <TableCell>{formatMode(result.stats?.mode || [])}</TableCell>
                <TableCell>{result.stats?.stdDev}</TableCell>
                <TableCell>{result.stats?.p90}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
