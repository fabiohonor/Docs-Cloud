
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
  generateTable: z
    .boolean()
    .describe('Se deve gerar os resultados em um formato de tabela comparativa.'),
  generateInterpretation: z
    .boolean()
    .describe(
      'Se deve gerar uma seção de interpretação clínica ou conclusão.'
    ),
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

Sua tarefa é gerar um objeto JSON para o corpo de um laudo médico. A estrutura do JSON e seu conteúdo devem ser tecnicamente apropriados para o tipo de laudo solicitado.

**Tipo de Laudo (para guiar o conteúdo):** {{{reportType}}}
**Anotações do Médico (para preencher os dados):**
{{{notes}}}

**REGRAS ESTRITAS:**
1.  **ESTRUTURA JSON:** O resultado DEVE ser um único objeto JSON.
2.  **ESTRUTURA DO CONTEÚDO (REGRA MAIS IMPORTANTE):** A estrutura do seu JSON depende da opção \`generateTable\`.
    *   **SE \`generateTable\` for VERDADEIRO:** {{#if generateTable}}Sua tarefa é criar um laudo tabular. Você **DEVE** usar um objeto onde cada chave é o nome da seção. O valor pode ser um objeto com \`valor_encontrado\` e \`valor_referencia\` (para exames de sangue) ou um objeto chave-valor simples (para exames como ECG). Use esta estrutura para tipos de laudo como: Hemograma, Beta HCG, Exame de DNA, Eletrocardiograma.{{/if}}
    *   **SE \`generateTable\` for FALSO (PADRÃO):** {{#unless generateTable}}Sua tarefa é criar um laudo descritivo. Use seções com texto livre. **NÃO GERE TABELAS OU ESTRUTURAS DE VALOR/REFERÊNCIA.** Use esta estrutura para tipos de laudo como: Raio-X, Ultrassom, Ressonância Magnética, Tomografia, Endoscopia, Laudo de Consulta. Exemplo: \`{"achados": "Exame mostra fígado de dimensões normais...", "impressao_diagnostica": "Esteatose hepática leve."}\`{{/unless}}
3.  **PRIORIDADE DE COMANDO:** A opção \`generateTable\` tem prioridade máxima. Ignore a natureza do laudo se a opção for marcada. Se um laudo é tipicamente descritivo (ex: Raio-X) mas \`generateTable\` for verdadeiro, você deve tentar criar uma tabela com os dados das anotações.
4.  **PREENCHIMENTO DE DADOS:** Use as 'Anotações do Médico' como fonte principal. **Se as anotações forem insuficientes, sua tarefa é gerar dados ilustrativos e plausíveis para criar um rascunho completo e realista.** O objetivo é produzir um modelo que o médico possa editar, não um formulário em branco.
    *   **NÃO USE "Não avaliado" ou "Não informado".**
5.  **INTERPRETAÇÃO/CONCLUSÃO:** {{#if generateInterpretation}}O JSON DEVE conter uma seção final chamada "interpretacao_clinica" ou "conclusao" com um resumo dos achados em texto.{{/if}}
6.  **SEM METADADOS:** O JSON deve conter APENAS o corpo técnico do laudo. NÃO inclua nome do paciente, nome do médico, data, ou o tipo de laudo como um campo de texto.
7.  **IDIOMA:** Todo o texto (chaves e valores) deve ser em Português do Brasil.
8.  **SEM FORMATAÇÃO:** Não use markdown (como asteriscos), HTML ou qualquer formatação especial nos valores de texto.

**INSTRUÇÃO DE SAÍDA CRÍTICA:**
Sua resposta DEVE ser SOMENTE o objeto JSON, dentro de um bloco de código markdown. Não inclua texto explicativo antes ou depois.
Exemplo:
\`\`\`json
{
  "secao_1": "valor da seção 1",
  "secao_2": { "sub_chave": "sub_valor" }
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
