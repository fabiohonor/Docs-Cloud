
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
  // We remove output schema to get raw text and parse it.
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `Você é um especialista médico habilidoso em explicar detalhes médicos técnicos para pacientes de uma forma fácil de entender, em Português do Brasil.

Reescreva os seguintes detalhes técnicos em uma linguagem simples e clara.

Detalhes Técnicos: {{{technicalDetails}}}

**INSTRUÇÃO DE SAÍDA CRÍTICA:**
Sua resposta DEVE ser um objeto JSON, dentro de um bloco de código markdown, com uma única chave "patientFriendlySummary". Não inclua texto explicativo.
Exemplo:
\`\`\`json
{
  "patientFriendlySummary": "Seu exame mostrou que..."
}
\`\`\`
`,
});

const summarizeTechnicalDetailsFlow = ai.defineFlow(
  {
    name: 'summarizeTechnicalDetailsFlow',
    inputSchema: SummarizeTechnicalDetailsInputSchema,
    outputSchema: SummarizeTechnicalDetailsOutputSchema,
  },
  async (input) => {
    const response = await prompt(input);
    const rawText = response.text;
    
    if (!rawText) {
      throw new Error('A IA não conseguiu gerar um resumo válido.');
    }

    try {
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : rawText;
      const parsedData = JSON.parse(jsonString);

      // Validate against the Zod schema
      return SummarizeTechnicalDetailsOutputSchema.parse(parsedData);
    } catch (e) {
      console.error("Falha ao analisar JSON de resumo da IA:", e);
      console.error("Saída bruta da IA:", rawText);
      throw new Error("A IA retornou um formato JSON de resumo inválido.");
    }
  }
);
