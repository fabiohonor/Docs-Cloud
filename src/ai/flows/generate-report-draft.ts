
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
  // We are removing output schema to get raw text and parse it ourselves.
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `Você é um assistente de IA especialista em redigir laudos médicos detalhados e técnicos em Português do Brasil.

Sua tarefa é gerar um objeto JSON para o corpo de um laudo médico, com base no **Tipo de Laudo** e nas **Anotações do Médico**.

**Tipo de Laudo:** {{{reportType}}}
**Anotações do Médico:**
{{{notes}}}

**REGRAS ESTRITAS:**
1.  **ESTRUTURA JSON:** O resultado DEVE ser um único objeto JSON.
2.  **CONTEÚDO TÉCNICO E ESTRUTURA:** Com base no 'Tipo de Laudo', crie uma estrutura JSON com seções e campos tecnicamente apropriados.
    *   **PARA RESULTADOS TABULARES (COMO HEMOGRAMA):** Para seções que contêm uma lista de exames com valores (como "Eritrograma" ou "Leucograma"), a estrutura DEVE ser um objeto onde cada chave é o nome do exame (ex: "Hemácias"). O valor para cada exame DEVE ser outro objeto contendo as chaves \`valor_encontrado\` e \`valor_referencia\`.
        *   **Exemplo de Estrutura Tabular para "Eritrograma":**
            \`"eritrograma": { "Hemácias": { "valor_encontrado": "4.5 milhões/mm³", "valor_referencia": "4.2 - 5.4 milhões/mm³" }, "Hemoglobina": { "valor_encontrado": "14.0 g/dL", "valor_referencia": "12.0 - 15.5 g/dL" } }\`
    *   **PARA SEÇÕES DE TEXTO (COMO CONCLUSÃO):** Para seções descritivas, o valor pode ser uma string simples ou um objeto com pares chave-valor.
        *   **Exemplo para "Conclusão":** \`"conclusao": "Paciente apresenta quadro anêmico."\`
3.  **USE AS ANOTAÇÕES:** Preencha os valores da estrutura JSON usando as informações das 'Anotações do Médico'. Se uma anotação não fornecer um valor para um campo técnico, você pode omiti-lo ou usar um valor padrão como "Não avaliado". NÃO INVENTE DADOS NUMÉRICOS.
4.  **SEM METADADOS:** O objeto JSON deve conter APENAS os dados técnicos do laudo. NÃO inclua nome do paciente, nome do médico, data, tipo de laudo ou qualquer outra informação de cabeçalho dentro do JSON.
5.  **IDIOMA:** Todo o texto (chaves e valores, quando aplicável) deve ser em Português do Brasil.
6.  **SEM FORMATAÇÃO:** Não use markdown, asteriscos ou qualquer outra formatação especial nos valores de texto.

**INSTRUÇÃO DE SAÍDA CRÍTICA:**
Sua resposta DEVE ser SOMENTE o objeto JSON, dentro de um bloco de código markdown. Não inclua texto explicativo antes ou depois.
Exemplo:
\`\`\`json
{
  "chave": "valor"
}
\`\`\`
`,
});

const generateReportDraftFlow = ai.defineFlow(
  {
    name: 'generateReportDraftFlow',
    inputSchema: GenerateReportDraftInputSchema,
    outputSchema: GenerateReportDraftOutputSchema,
  },
  async (input) => {
    const response = await generateReportDraftPrompt(input);
    const rawText = response.text;

    if (!rawText) {
      throw new Error('A IA não conseguiu gerar um rascunho de laudo válido.');
    }

    try {
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : rawText;
      const parsedData = JSON.parse(jsonString);
      return { reportData: parsedData };
    } catch (e) {
      console.error("Falha ao analisar JSON da IA:", e);
      console.error("Saída bruta da IA:", rawText);
      throw new Error("A IA retornou um formato JSON inválido. Verifique o console para a saída bruta.");
    }
  }
);
