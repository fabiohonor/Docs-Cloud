
'use server';

import { generateReportDraft, GenerateReportDraftInput } from '@/ai/flows/generate-report-draft';
import { summarizeTechnicalDetails, SummarizeTechnicalDetailsInput } from '@/ai/flows/summarize-technical-details';
import { generateReportImage } from '@/ai/flows/generate-report-image';
import { db, storage } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, setDoc, collection } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { z } from 'zod';
import type { Report } from '@/lib/types';

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

// Esquema para o novo laudo que será salvo
const newReportSchema = z.object({
    patientId: z.string(),
    patientName: z.string(),
    reportType: z.string(),
    notes: z.string(),
    draft: z.string(),
    authorInfo: z.object({
        name: z.string(),
        specialty: z.string(),
        crm: z.string(),
        signature: z.string().nullable(),
    }),
});

export async function submitReportAction(reportData: z.infer<typeof newReportSchema>) {
    const parsedInput = newReportSchema.safeParse(reportData);
    if (!parsedInput.success) {
        return { error: 'Dados de entrada para o laudo são inválidos.' };
    }

    try {
        if (!db || !storage) throw new Error("A conexão com o banco de dados ou armazenamento não foi estabelecida.");

        const newReportRef = doc(collection(db, 'reports'));

        const imageResult = await generateReportImage({
            reportType: parsedInput.data.reportType,
            notes: parsedInput.data.notes,
        });

        let finalImageUrl: string | null = null;
        if (imageResult.imageUrl) {
            try {
                const storageRef = ref(storage, `reports/${newReportRef.id}/illustration.png`);
                const uploadTask = await uploadString(storageRef, imageResult.imageUrl, 'data_url');
                finalImageUrl = await getDownloadURL(uploadTask.ref);
            } catch (e) {
                console.error("Falha ao fazer upload da imagem para o Storage:", e);
                finalImageUrl = null;
            }
        }

        const newReport: Omit<Report, 'id'> = {
            patientId: parsedInput.data.patientId,
            patientName: parsedInput.data.patientName,
            reportType: parsedInput.data.reportType,
            date: new Date().toISOString(),
            status: 'Pendente',
            content: parsedInput.data.draft,
            notes: parsedInput.data.notes,
            authorInfo: parsedInput.data.authorInfo,
            approverInfo: null,
            imageUrl: finalImageUrl,
        };

        await setDoc(newReportRef, newReport);

        return { success: true };

    } catch (e) {
        console.error("Falha ao criar o laudo:", e);
        const errorMessage = e instanceof Error ? e.message : 'Não foi possível salvar o laudo.';
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
