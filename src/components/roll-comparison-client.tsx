
'use client';

import { useState, useTransition, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dices, Plus, Trash2, Loader2, Swords, AlertCircle } from 'lucide-react';
import { getDistribution, parseRoll } from '@/lib/dice';
import type { RollData } from '@/types';
import { StatisticsTable } from './statistics-table';
import { DistributionChart } from './distribution-chart';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

const CHART_COLORS = [
  'hsl(var(--accent))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff8042',
  '#00C49F',
  '#FFBB28',
];

const INITIAL_ROLLS: RollData[] = [
  { id: uuidv4(), definition: '2d6', color: CHART_COLORS[0] },
  { id: uuidv4(), definition: '1d12', color: CHART_COLORS[1] },
];

export function RollComparisonClient() {
  const [rolls, setRolls] = useState<RollData[]>(INITIAL_ROLLS);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleUpdateDefinition = (id: string, definition: string) => {
    setRolls((prev) =>
      prev.map((roll) => (roll.id === id ? { ...roll, definition, error: undefined, stats: undefined, distribution: undefined } : roll))
    );
  };

  const handleAddRoll = () => {
    if (rolls.length >= CHART_COLORS.length) {
      toast({
        title: "Maximum rolls reached",
        description: `You can compare up to ${CHART_COLORS.length} rolls at a time.`,
        variant: 'destructive',
      });
      return;
    }
    const newRoll: RollData = {
      id: uuidv4(),
      definition: '',
      color: CHART_COLORS[rolls.length % CHART_COLORS.length],
    };
    setRolls((prev) => [...prev, newRoll]);
  };

  const handleRemoveRoll = (id: string) => {
    setRolls((prev) => prev.filter((roll) => roll.id !== id));
  };
  
  const handleCompare = useCallback(() => {
    startTransition(() => {
      let hasError = false;
      const newRolls = rolls.map((roll) => {
        if (!roll.definition.trim()) {
          return { ...roll, error: 'Empty definition.' };
        }
        try {
          const parsed = parseRoll(roll.definition);
          const { stats, points } = getDistribution(parsed);
          return { ...roll, stats, distribution: points, error: undefined };
        } catch (e: any) {
          hasError = true;
          return { ...roll, error: e.message || 'Invalid format', stats: undefined, distribution: undefined };
        }
      });
      setRolls(newRolls);
      if(hasError) {
        toast({
          title: "Invalid Roll Detected",
          description: "Please check the highlighted fields for errors.",
          variant: 'destructive'
        })
      }
    });
  }, [rolls, toast]);

  const hasResults = rolls.some(r => r.stats && !r.error);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Define Your Rolls</CardTitle>
          <CardDescription>Enter dice roll definitions to compare. Format: 2d6, 1d20+5, 3d8x2, etc.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rolls.map((roll, index) => (
            <div key={roll.id} className="flex items-center gap-2">
              <div className="h-6 w-1 rounded-full" style={{ backgroundColor: roll.color }}></div>
              <div className="flex-grow">
                <Input
                  type="text"
                  aria-label={`Dice roll ${index + 1}`}
                  placeholder="e.g., 2d6+3"
                  value={roll.definition}
                  onChange={(e) => handleUpdateDefinition(roll.id, e.target.value)}
                  className={roll.error ? 'border-destructive ring-2 ring-destructive/50' : ''}
                />
                {roll.error && <p className="mt-1 text-xs text-destructive">{roll.error}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleRemoveRoll(roll.id)} disabled={rolls.length <= 1}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove roll</span>
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-4 pt-4">
             <Button onClick={handleAddRoll}>
              <Plus className="mr-2 h-4 w-4" /> Add Roll
            </Button>
            <Button onClick={handleCompare} variant="secondary" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rolling...
                </>
              ) : (
                <>
                  <Swords className="mr-2 h-4 w-4" /> Compare
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {hasResults && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
            <CardDescription>Here's how your dice rolls stack up against each other.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <StatisticsTable results={rolls} />
            <DistributionChart results={rolls} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
