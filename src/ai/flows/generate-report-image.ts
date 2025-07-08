
'use server';
/**
 * @fileOverview Gera uma imagem médica estilizada para um laudo.
 *
 * - generateReportImage - Gera uma imagem com base no tipo de laudo e nas anotações.
 * - GenerateReportImageInput - O tipo de entrada para a função.
 * - GenerateReportImageOutput - O tipo de retorno para a função.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateReportImageInputSchema = z.object({
  reportType: z.string().describe('O tipo de laudo, ex: Raio-X de Tórax.'),
  notes: z.string().describe('Anotações médicas para dar contexto à imagem.'),
});
export type GenerateReportImageInput = z.infer<typeof GenerateReportImageInputSchema>;

const GenerateReportImageOutputSchema = z.object({
  imageUrl: z.string().optional().describe('A URL da imagem gerada como um data URI.'),
});
export type GenerateReportImageOutput = z.infer<typeof GenerateReportImageOutputSchema>;


export async function generateReportImage(
  input: GenerateReportImageInput
): Promise<GenerateReportImageOutput> {
    // A captura de erro foi movida para a action que chama esta função,
    // para que o usuário possa ser notificado em caso de falha.
    // Se a geração da imagem falhar, a criação do laudo ainda pode prosseguir.
    return await generateReportImageFlow(input);
}

const generateReportImageFlow = ai.defineFlow(
  {
    name: 'generateReportImageFlow',
    inputSchema: GenerateReportImageInputSchema,
    outputSchema: GenerateReportImageOutputSchema,
  },
  async ({ reportType, notes }) => {
    // A decisão de gerar uma imagem agora é controlada pelo checkbox na UI,
    // que chama esta função seletivamente. A lógica interna para decidir
    // se uma imagem é necessária foi removida para respeitar a escolha do usuário.

    const { media } = await ai.generate({
      // IMPORTANTE: Somente este modelo pode gerar imagens.
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Crie uma imagem médica ilustrativa e estilizada que represente um laudo de "${reportType}".
      A imagem deve ser limpa, profissional e adequada para um documento médico. Não inclua texto, números ou legendas na imagem.
      Use as seguintes anotações como contexto para o conteúdo da imagem, se relevante: "${notes}".
      O estilo deve ser mais um diagrama ou ilustração do que uma foto real, com um fundo limpo e neutro.

      Exemplos de estilo:
      - Para 'Eletrocardiograma (ECG)': Ondas de um exame de ECG, com os complexos P, QRS e T claramente visíveis, mas de forma estilizada.
      - Para 'Raio-X de fratura': Uma imagem estilizada de um osso com uma fratura claramente visível.
      - Para 'Ressonância Magnética do cérebro': Uma representação artística das varreduras cerebrais.
      - Para 'Eletroencefalograma': Ondas cerebrais estilizadas (alfa, beta, etc.).
      - Para 'Endoscopia': Uma ilustração limpa do trato gastrointestinal.
      - Para 'Hemograma' ou 'Exame de Sangue': Uma ilustração artística de glóbulos vermelhos, glóbulos brancos e plaquetas em uma corrente sanguínea.
      - Para 'Ultrassom' ou 'Ecografia': Uma imagem estilizada em tons de cinza, semelhante a uma ultrassonografia, mostrando a área relevante (ex: um feto, um órgão como o fígado).`,
      config: {
        // É necessário fornecer ambos, 'TEXT' e 'IMAGE'.
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return { imageUrl: media?.url };
  }
);
