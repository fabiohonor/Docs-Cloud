'use server';

import { generateReportDraft, GenerateReportDraftInput } from '@/ai/flows/generate-report-draft';
import { summarizeTechnicalDetails, SummarizeTechnicalDetailsInput } from '@/ai/flows/summarize-technical-details';
import { z } from 'zod';

const generateDraftSchema = z.object({
  notes: z.string(),
  patientName: z.string(),
  reportType: z.string(),
});

export async function generateDraftAction(input: GenerateReportDraftInput) {
  const parsedInput = generateDraftSchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: 'Dados de entrada inválidos.' };
  }
  try {
    const result = await generateReportDraft(parsedInput.data);
    return { draft: result.reportDraft };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'Falha ao gerar o rascunho.';
    return { error: errorMessage };
  }
}

const summarizeSchema = z.object({
  technicalDetails: z.string(),
});

export async function summarizeAction(input: SummarizeTechnicalDetailsInput) {
    const parsedInput = summarizeSchema.safeParse(input);
    if (!parsedInput.success) {
      return { error: 'Dados de entrada inválidos.' };
    }
    if (!parsedInput.data.technicalDetails.trim()) {
      return { summary: '' };
    }
  
    try {
      const result = await summarizeTechnicalDetails(parsedInput.data);
      return { summary: result.patientFriendlySummary };
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'Falha ao gerar o resumo.';
      return { error: errorMessage };
    }
}
