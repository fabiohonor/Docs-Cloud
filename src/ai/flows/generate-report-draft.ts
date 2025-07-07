
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
  prompt: `Você é um assistente de IA especialista em redigir laudos médicos em Português do Brasil.

Sua única tarefa é redigir o **corpo do laudo médico** com base nas anotações fornecidas, em formato de texto corrido.

**REGRAS ESTRITAS:**
1.  **Foco no Conteúdo:** O texto gerado deve conter APENAS a análise técnica e as conclusões médicas. Comece diretamente com o texto do laudo.
2.  **NÃO INCLUA METADADOS:** É proibido adicionar qualquer tipo de cabeçalho, título, nome de paciente, data, nome de médico, CRM ou campos para assinatura. O sistema cuidará disso.
3.  **FORMATAÇÃO LIMPA:** Escreva em parágrafos claros. Não use formatação especial como asteriscos (*), negrito, ou listas com marcadores. Apenas texto puro.
4.  **IDIOMA:** O laudo deve ser inteiramente em Português do Brasil (pt-BR).
5.  **NÃO INVENTE INFORMAÇÕES:** Utilize APENAS o que está nas anotações.

**Anotações do Médico para usar como base:**
{{{notes}}}

Gere o rascunho do corpo do laudo e retorne-o no campo 'reportDraft' do JSON.`,
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
