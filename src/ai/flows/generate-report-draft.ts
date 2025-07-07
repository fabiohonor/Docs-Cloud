'use server';

/**
 * @fileOverview AI agent to generate a draft medical report from shorthand notes.
 *
 * - generateReportDraft - A function that generates a draft medical report.
 * - GenerateReportDraftInput - The input type for the generateReportDraft function.
 * - GenerateReportDraftOutput - The return type for the generateReportDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReportDraftInputSchema = z.object({
  notes: z
    .string()
    .describe('Shorthand notes from the doctor to generate the report.'),
  patientName: z.string().describe('The name of the patient.'),
  reportType: z.string().describe('The type of medical report to generate.'),
});
export type GenerateReportDraftInput = z.infer<
  typeof GenerateReportDraftInputSchema
>;

const GenerateReportDraftOutputSchema = z.object({
  reportDraft: z.string().describe('The generated draft of the medical report.'),
});
export type GenerateReportDraftOutput = z.infer<
  typeof GenerateReportDraftOutputSchema
>;

export async function generateReportDraft(
  input: GenerateReportDraftInput
): Promise<GenerateReportDraftOutput> {
  return generateReportDraftFlow(input);
}

const generateReportDraftPrompt = ai.definePrompt({
  name: 'generateReportDraftPrompt',
  input: {schema: GenerateReportDraftInputSchema},
  output: {schema: GenerateReportDraftOutputSchema},
  prompt: `You are an AI assistant that helps doctors generate medical reports.

  Based on the shorthand notes provided, generate a draft of the medical report for the patient.
  The report should be comprehensive and well-structured.

  Patient Name: {{{patientName}}}
  Report Type: {{{reportType}}}
  Notes: {{{notes}}}

  Report Draft:`,
});

const generateReportDraftFlow = ai.defineFlow(
  {
    name: 'generateReportDraftFlow',
    inputSchema: GenerateReportDraftInputSchema,
    outputSchema: GenerateReportDraftOutputSchema,
  },
  async input => {
    const {output} = await generateReportDraftPrompt(input);
    return output!;
  }
);
