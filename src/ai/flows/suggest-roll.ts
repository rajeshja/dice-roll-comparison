'use server';

/**
 * @fileOverview Provides roll definition suggestions based on user-defined constraints.
 *
 * - suggestRollDefinitions - A function that suggests dice roll definitions.
 * - SuggestRollDefinitionsInput - The input type for the suggestRollDefinitions function.
 * - SuggestRollDefinitionsOutput - The return type for the suggestRollDefinitions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRollDefinitionsInputSchema = z.object({
  desiredAverage: z
    .number()
    .describe('The desired average roll result.'),
  maximumRoll: z
    .number()
    .describe('The maximum possible roll result.'),
});
export type SuggestRollDefinitionsInput = z.infer<
  typeof SuggestRollDefinitionsInputSchema
>;

const SuggestRollDefinitionsOutputSchema = z.object({
  rollDefinitions: z
    .array(z.string())
    .describe('An array of suggested dice roll definitions.'),
});
export type SuggestRollDefinitionsOutput = z.infer<
  typeof SuggestRollDefinitionsOutputSchema
>;

export async function suggestRollDefinitions(
  input: SuggestRollDefinitionsInput
): Promise<SuggestRollDefinitionsOutput> {
  return suggestRollDefinitionsFlow(input);
}

const simulateRolls = ai.defineTool({
  name: 'simulateRolls',
  description: 'Simulates many dice rolls and returns possible roll definitions that satisfy the constraints.',
  inputSchema: z.object({
    desiredAverage: z.number().describe('The desired average roll result.'),
    maximumRoll: z.number().describe('The maximum possible roll result.'),
  }),
  outputSchema: z.array(z.string()).describe('An array of roll definitions that satisfy the constraints.'),
}, async (input) => {
  // Placeholder implementation for roll simulation.  This would actually run simulations.
  // In a real application, this function would simulate various roll definitions
  // and return the ones that meet the specified average and maximum roll criteria.
  // For now, return some canned results:
  if (input.desiredAverage > 5 && input.maximumRoll > 10) {
    return ['2d6', '1d10+3'];
  } else {
    return [];
  }
});

const prompt = ai.definePrompt({
  name: 'suggestRollDefinitionsPrompt',
  tools: [simulateRolls],
  input: {schema: SuggestRollDefinitionsInputSchema},
  output: {schema: SuggestRollDefinitionsOutputSchema},
  prompt: `Suggest dice roll definitions that satisfy the following criteria:

Desired Average: {{{desiredAverage}}}
Maximum Roll: {{{maximumRoll}}}

Use the simulateRolls tool to find roll definitions that meet these criteria. Return ONLY the rollDefinitions that meet these criteria.`, // Ensure it only returns the roll definitions.
});

const suggestRollDefinitionsFlow = ai.defineFlow(
  {
    name: 'suggestRollDefinitionsFlow',
    inputSchema: SuggestRollDefinitionsInputSchema,
    outputSchema: SuggestRollDefinitionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      rollDefinitions: output!.rollDefinitions,
    };
  }
);
