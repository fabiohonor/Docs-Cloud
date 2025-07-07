
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
    try {
        return await generateReportImageFlow(input);
    } catch (error) {
        console.error("Erro ao gerar imagem para o laudo:", error);
        // Retorna com sucesso, mas sem URL, para não bloquear o processo principal.
        return { imageUrl: undefined };
    }
}

const generateReportImageFlow = ai.defineFlow(
  {
    name: 'generateReportImageFlow',
    inputSchema: GenerateReportImageInputSchema,
    outputSchema: GenerateReportImageOutputSchema,
  },
  async ({ reportType, notes }) => {
    // Lista de tipos de laudo que justificam uma imagem.
    const imageWorthyTypes = [
        'raio-x', 'raio x', 'radiografia', 'ressonância', 'tomografia', 
        'ultrassom', 'ecocardiograma', 'eletrocardiograma', 'ecg',
        'eletroencefalograma', 'eeg', 'endoscopia', 'dermatológico'
    ];

    const requiresImage = imageWorthyTypes.some(type => 
        reportType.toLowerCase().includes(type)
    );

    // Se o tipo de laudo não requer imagem, retorna sem gerar.
    if (!requiresImage) {
        return { imageUrl: undefined };
    }

    const { media } = await ai.generate({
      // IMPORTANTE: Somente este modelo pode gerar imagens.
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Crie uma imagem médica ilustrativa e estilizada que represente um laudo de "${reportType}".
      A imagem deve ser limpa, profissional e adequada para um documento médico. Não inclua texto na imagem.
      Use as seguintes anotações como contexto para o conteúdo da imagem, se relevante: "${notes}".
      Exemplos de estilo:
      - Para 'Eletrocardiograma': Ondas de ECG estilizadas em um fundo limpo.
      - Para 'Raio-X de fratura': Uma imagem estilizada de um osso com uma fratura claramente visível.
      - Para 'Ressonância Magnética do cérebro': Uma representação artística das varreduras cerebrais.
      - Para 'Eletroencefalograma': Ondas cerebrais estilizadas (alfa, beta, etc.) em um fundo limpo.
      - Para 'Endoscopia': Uma ilustração limpa do trato gastrointestinal.
      O estilo deve ser mais um diagrama ou ilustração do que uma foto real.`,
      config: {
        // É necessário fornecer ambos, 'TEXT' e 'IMAGE'.
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return { imageUrl: media?.url };
  }
);
