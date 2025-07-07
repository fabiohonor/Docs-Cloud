'use server';

/**
 * @fileOverview Agente de IA para gerar um rascunho de laudo médico a partir de anotações.
 *
 * - generateReportDraft - Uma função que gera um rascunho de laudo médico.
 * - GenerateReportDraftInput - O tipo de entrada para a função generateReportDraft.
 * - GenerateReportDraftOutput - O tipo de retorno para a função generateReportDraft.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReportDraftInputSchema = z.object({
  notes: z
    .string()
    .describe('Anotações do médico para gerar o laudo.'),
  patientName: z.string().describe('O nome do paciente.'),
  reportType: z.string().describe('O tipo de laudo médico a ser gerado.'),
});
export type GenerateReportDraftInput = z.infer<
  typeof GenerateReportDraftInputSchema
>;

const GenerateReportDraftOutputSchema = z.object({
  reportDraft: z.string().describe('O rascunho gerado do laudo médico.'),
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
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `Você é um assistente de IA que ajuda médicos a gerar laudos médicos.

  Sua tarefa é gerar um rascunho de laudo médico abrangente e bem estruturado com base nas informações fornecidas.

  Informações para o Laudo:
  - Nome do Paciente: {{{patientName}}}
  - Tipo de Laudo: {{{reportType}}}
  - Anotações do Médico: {{{notes}}}

  Gere o rascunho do laudo e retorne-o no formato JSON solicitado.`,
});

const generateReportDraftFlow = ai.defineFlow(
  {
    name: 'generateReportDraftFlow',
    inputSchema: GenerateReportDraftInputSchema,
    outputSchema: GenerateReportDraftOutputSchema,
  },
  async input => {
    const {output} = await generateReportDraftPrompt(input);
    if (!output) {
      throw new Error('A IA não conseguiu gerar um rascunho de laudo válido.');
    }
    return output;
  }
);
