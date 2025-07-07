// src/ai/flows/summarize-technical-details.ts
'use server';
/**
 * @fileOverview Rewrites technical medical details into patient-friendly language.
 *
 * - summarizeTechnicalDetails - A function that summarizes technical details for patients.
 * - SummarizeTechnicalDetailsInput - The input type for the summarizeTechnicalDetails function.
 * - SummarizeTechnicalDetailsOutput - The return type for the summarizeTechnicalDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTechnicalDetailsInputSchema = z.object({
  technicalDetails: z
    .string()
    .describe('The technical medical details to summarize.'),
});
export type SummarizeTechnicalDetailsInput = z.infer<
  typeof SummarizeTechnicalDetailsInputSchema
>;

const SummarizeTechnicalDetailsOutputSchema = z.object({
  patientFriendlySummary: z
    .string()
    .describe('A patient-friendly summary of the technical details.'),
});
export type SummarizeTechnicalDetailsOutput = z.infer<
  typeof SummarizeTechnicalDetailsOutputSchema
>;

export async function summarizeTechnicalDetails(
  input: SummarizeTechnicalDetailsInput
): Promise<SummarizeTechnicalDetailsOutput> {
  return summarizeTechnicalDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTechnicalDetailsPrompt',
  input: {schema: SummarizeTechnicalDetailsInputSchema},
  output: {schema: SummarizeTechnicalDetailsOutputSchema},
  prompt: `You are a medical expert skilled at explaining technical medical details to patients in a way that is easy to understand.

  Please rewrite the following technical details in a patient-friendly way:
  {{{technicalDetails}}}`,
});

const summarizeTechnicalDetailsFlow = ai.defineFlow(
  {
    name: 'summarizeTechnicalDetailsFlow',
    inputSchema: SummarizeTechnicalDetailsInputSchema,
    outputSchema: SummarizeTechnicalDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
