
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
  notes: z.string().describe('Anotações do médico para gerar o laudo.'),
  patientName: z.string().describe('O nome do paciente.'),
  reportType: z.string().describe('O tipo de laudo médico a ser gerado.'),
});
export type GenerateReportDraftInput = z.infer<
  typeof GenerateReportDraftInputSchema
>;

const GenerateReportDraftOutputSchema = z.object({
  reportData: z
    .record(z.any())
    .describe(
      'Um objeto JSON estruturado contendo os dados do laudo. As chaves devem ser os nomes das seções do laudo e os valores podem ser strings, números ou objetos aninhados.'
    ),
});
export type GenerateReportDraftOutput = z.infer<
  typeof GenerateReportDraftOutputSchema
>;

export async function generateReportDraft(
  input: GenerateReportDraftInput
): Promise<GenerateReportDraftOutput> {
  const result = await generateReportDraftFlow(input);
  if (!result.reportData) {
    throw new Error('A IA não conseguiu gerar dados de laudo estruturados.');
  }
  return result;
}

const generateReportDraftPrompt = ai.definePrompt({
  name: 'generateReportDraftPrompt',
  input: {schema: GenerateReportDraftInputSchema},
  output: {schema: GenerateReportDraftOutputSchema},
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `Você é um assistente de IA especialista em redigir laudos médicos detalhados e técnicos em Português do Brasil.

Sua tarefa é gerar um objeto JSON estruturado para o corpo de um laudo médico, com base no **Tipo de Laudo** e nas **Anotações do Médico**.

**Tipo de Laudo:** {{{reportType}}}
**Anotações do Médico:**
{{{notes}}}

**REGRAS ESTRITAS:**
1.  **ESTRUTURA JSON:** O resultado DEVE ser um único objeto JSON retornado no campo 'reportData'.
2.  **CONTEÚDO TÉCNICO:** Com base no 'Tipo de Laudo', crie uma estrutura JSON com seções e campos tecnicamente apropriados.
    *   **Exemplo para "Hemograma Completo":** O JSON deve ter chaves principais como "eritrograma", "leucograma", e "plaquetas". Cada chave deve conter um objeto com os respectivos exames e valores (ex: "hemoglobina", "leucocitos_totais", "observacoes").
    *   **Exemplo para "Ecocardiograma":** O JSON pode ter chaves como "analise_quantitativa", "interpretacao_clinica", e "conclusao".
3.  **USE AS ANOTAÇÕES:** Preencha os valores da estrutura JSON usando as informações das 'Anotações do Médico'. Se uma anotação não fornecer um valor para um campo técnico, você pode omiti-lo ou usar um valor padrão como "Não avaliado". NÃO INVENTE DADOS NUMÉRICOS.
4.  **SEM METADADOS:** O objeto JSON deve conter APENAS os dados técnicos do laudo. NÃO inclua nome do paciente, nome do médico, data ou qualquer outra informação de cabeçalho dentro do JSON.
5.  **IDIOMA:** Todo o texto (chaves e valores, quando aplicável) deve ser em Português do Brasil.

Gere o objeto JSON e retorne-o no campo 'reportData'.`,
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
