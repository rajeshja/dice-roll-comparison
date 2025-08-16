
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { suggestRollDefinitions } from '@/ai/flows/suggest-roll';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Wand2, Loader2, List, AlertCircle } from 'lucide-react';

const formSchema = z.object({
  desiredAverage: z.coerce.number().min(1, 'Must be at least 1').max(100),
  maximumRoll: z.coerce.number().min(1, 'Must be at least 1').max(200),
});

type FormValues = z.infer<typeof formSchema>;

export function RollSuggester() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      desiredAverage: 10,
      maximumRoll: 20,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const result = await suggestRollDefinitions(data);
      if (result.rollDefinitions && result.rollDefinitions.length > 0) {
        setSuggestions(result.rollDefinitions);
      } else {
        setError("No suggestions found for the given criteria. Try different values.");
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred while fetching suggestions.');
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Wand2 className="h-6 w-6 text-accent" />
          <CardTitle>AI Roll Suggester</CardTitle>
        </div>
        <CardDescription>
          Let AI suggest dice rolls based on your desired outcomes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="desiredAverage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desired Average</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maximumRoll"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Roll</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suggesting...
                </>
              ) : (
                'Suggest Rolls'
              )}
            </Button>
          </form>
        </Form>
        {error && (
          <Alert variant="destructive" className="mt-6">
             <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {suggestions.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 flex items-center gap-2 font-semibold">
              <List className="h-5 w-5" />
              Suggestions
            </h3>
            <ul className="space-y-2 rounded-md border bg-secondary/50 p-4">
              {suggestions.map((s, i) => (
                <li key={i} className="font-mono text-secondary-foreground">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
