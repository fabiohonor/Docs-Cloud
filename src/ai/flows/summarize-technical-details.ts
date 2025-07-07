'use server';
/**
 * @fileOverview Reescreve detalhes médicos técnicos em uma linguagem amigável para o paciente.
 *
 * - summarizeTechnicalDetails - Uma função que resume detalhes técnicos para pacientes.
 * - SummarizeTechnicalDetailsInput - O tipo de entrada para a função summarizeTechnicalDetails.
 * - SummarizeTechnicalDetailsOutput - O tipo de retorno para a função summarizeTechnicalDetails.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTechnicalDetailsInputSchema = z.object({
  technicalDetails: z
    .string()
    .describe('Os detalhes médicos técnicos a serem resumidos.'),
});
export type SummarizeTechnicalDetailsInput = z.infer<
  typeof SummarizeTechnicalDetailsInputSchema
>;

const SummarizeTechnicalDetailsOutputSchema = z.object({
  patientFriendlySummary: z
    .string()
    .describe('Um resumo dos detalhes técnicos amigável para o paciente.'),
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
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `Você é um especialista médico habilidoso em explicar detalhes médicos técnicos para pacientes de uma forma fácil de entender.

  Por favor, reescreva os seguintes detalhes técnicos de uma forma amigável para o paciente e retorne o resultado no formato JSON solicitado.
  
  Detalhes Técnicos: {{{technicalDetails}}}`,
});

const summarizeTechnicalDetailsFlow = ai.defineFlow(
  {
    name: 'summarizeTechnicalDetailsFlow',
    inputSchema: SummarizeTechnicalDetailsInputSchema,
    outputSchema: SummarizeTechnicalDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('A IA não conseguiu gerar um resumo válido.');
    }
    return output;
  }
);
