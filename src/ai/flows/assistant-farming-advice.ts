'use server';

/**
 * @fileOverview Provides farming advice based on user questions and current weather conditions.
 *
 * - askAssistant - A function that takes a question and provides farming advice.
 * - AssistantInput - The input type for the askAssistant function.
 * - AssistantOutput - The return type for the askAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssistantInputSchema = z.object({
  question: z.string().describe('The user question about farming.'),
  weather: z.string().describe('The current weather conditions.'),
  language: z.enum(['en', 'hi', 'mr', 'ta', 'te', 'kn', 'bn', 'pa', 'gu']).describe('The selected language for the response.'),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

const AssistantOutputSchema = z.object({
  advice: z.string().describe('The actionable farming advice provided by the AI.'),
});
export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;

export async function askAssistant(input: AssistantInput): Promise<AssistantOutput> {
  return assistantFlow(input);
}

const model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

const prompt = ai.definePrompt({
  name: 'assistantPrompt',
  input: {schema: AssistantInputSchema},
  output: {schema: AssistantOutputSchema},
  prompt: `You are KisanAI. Based on the user’s question, current weather, give short, actionable farming advice in the selected language ({language}).

Weather: {{{weather}}}

Question: {{{question}}}`,
  model,
});

const assistantFlow = ai.defineFlow(
  {
    name: 'assistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
