'use server';

import { generateReportDraft, GenerateReportDraftInput } from '@/ai/flows/generate-report-draft';
import { summarizeTechnicalDetails, SummarizeTechnicalDetailsInput } from '@/ai/flows/summarize-technical-details';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
    // Transforma o objeto JSON em uma string formatada para o textarea
    const draftString = JSON.stringify(result.reportData, null, 2);
    return { draft: draftString };
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


const userRoleSchema = z.object({
  uid: z.string(),
  role: z.enum(['admin', 'doctor']),
});

export async function updateUserRoleAction(input: { uid: string, role: 'admin' | 'doctor' }) {
    const parsedInput = userRoleSchema.safeParse(input);
    if (!parsedInput.success) {
      return { error: 'Dados de entrada inválidos.' };
    }
  
    try {
      if (!db) throw new Error('Conexão com o banco de dados falhou.');
      const userRef = doc(db, 'users', parsedInput.data.uid);
      await updateDoc(userRef, { role: parsedInput.data.role });
      return { success: true };
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'Falha ao atualizar a função do usuário.';
      return { error: errorMessage };
    }
}

const deleteUserSchema = z.object({
    uid: z.string(),
});

export async function deleteUserAction(input: { uid: string }) {
    const parsedInput = deleteUserSchema.safeParse(input);
    if (!parsedInput.success) {
        return { error: 'Dados de entrada inválidos.' };
    }

    try {
        if (!db) throw new Error('Conexão com o banco de dados falhou.');
        const userRef = doc(db, 'users', parsedInput.data.uid);
        await deleteDoc(userRef);
        return { success: true };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'Falha ao excluir o usuário.';
        return { error: errorMessage };
    }
}
