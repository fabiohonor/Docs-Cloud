'use server';

import { generateReportDraft, GenerateReportDraftInput } from '@/ai/flows/generate-report-draft';
import { summarizeTechnicalDetails, SummarizeTechnicalDetailsInput } from '@/ai/flows/summarize-technical-details';
import { generateReportImage } from '@/ai/flows/generate-report-image';
import { db, storage } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { z } from 'zod';
import type { Report, Appointment } from '@/lib/types';

// --- Report Actions ---

const generateDraftSchema = z.object({
  notes: z.string(),
  patientName: z.string(),
  reportType: z.string(),
  generateTable: z.boolean(),
  generateInterpretation: z.boolean(),
});

export async function generateDraftAction(input: z.infer<typeof generateDraftSchema>) {
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
    let errorMessage = 'Falha ao se comunicar com a IA. Por favor, tente novamente.';
    if (e instanceof Error) {
        if (e.message.includes('503') || e.message.toLowerCase().includes('overloaded')) {
            errorMessage = 'O serviço de IA está sobrecarregado no momento. Por favor, tente novamente em alguns instantes.';
        } else {
            errorMessage = e.message;
        }
    } else {
        errorMessage = 'Falha ao gerar o rascunho.';
    }
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
        let errorMessage = 'Falha ao se comunicar com a IA. Por favor, tente novamente.';
        if (e instanceof Error) {
            if (e.message.includes('503') || e.message.toLowerCase().includes('overloaded')) {
                errorMessage = 'O serviço de IA está sobrecarregado no momento. Por favor, tente novamente em alguns instantes.';
            } else {
                errorMessage = e.message;
            }
        } else {
            errorMessage = 'Falha ao gerar o resumo.';
        }
        return { error: errorMessage };
    }
}

const newReportSchema = z.object({
    patientId: z.string(),
    patientName: z.string(),
    reportType: z.string(),
    notes: z.string(),
    draft: z.string(),
    generateImage: z.boolean(),
    authorInfo: z.object({
        uid: z.string(),
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

    let imageWarning: string | undefined = undefined;

    try {
        if (!db || !storage) throw new Error("A conexão com o banco de dados ou armazenamento não foi estabelecida.");

        const newReportRef = doc(collection(db, 'reports'));

        let finalImageUrl: string | null = null;
        if (parsedInput.data.generateImage) {
            try {
                const imageResult = await generateReportImage({
                    reportType: parsedInput.data.reportType,
                    notes: parsedInput.data.notes,
                });
        
                if (imageResult?.imageUrl) {
                    const storageRef = ref(storage, `reports/${newReportRef.id}/illustration.png`);
                    const uploadTask = await uploadString(storageRef, imageResult.imageUrl, 'data_url');
                    finalImageUrl = await getDownloadURL(uploadTask.ref);
                } else {
                    imageWarning = "A IA não conseguiu gerar uma imagem para este laudo.";
                }
            } catch (e) {
                console.error("Falha ao gerar ou fazer upload da imagem:", e);
                finalImageUrl = null;
                let errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido ao gerar a imagem.';
                if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded')) {
                    imageWarning = 'O serviço de IA está sobrecarregado e não pôde gerar a imagem. O laudo foi salvo sem ela.';
                } else if (errorMessage.toLowerCase().includes('finish reason: safety')) {
                    imageWarning = 'A imagem não pôde ser gerada devido aos filtros de segurança da IA. O laudo foi salvo sem ela.';
                } else {
                    imageWarning = "Falha ao gerar a imagem do laudo, mas o laudo foi salvo.";
                }
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

        return { success: true, warning: imageWarning };

    } catch (e) {
        console.error("Falha ao criar o laudo:", e);
        const errorMessage = e instanceof Error ? e.message : 'Não foi possível salvar o laudo.';
        return { error: errorMessage };
    }
}

const deleteReportSchema = z.object({
    reportId: z.string(),
    imageUrl: z.string().nullable().optional(),
});

export async function deleteReportAction(input: z.infer<typeof deleteReportSchema>) {
    const parsedInput = deleteReportSchema.safeParse(input);
    if (!parsedInput.success) {
        return { error: 'Dados de entrada inválidos para excluir o laudo.' };
    }

    try {
        if (!db || !storage) throw new Error("A conexão com o banco de dados ou armazenamento não foi estabelecida.");

        const { reportId, imageUrl } = parsedInput.data;

        if (imageUrl) {
            try {
                const imageRef = ref(storage, imageUrl);
                await deleteObject(imageRef);
            } catch (error: any) {
                if (error.code !== 'storage/object-not-found') {
                    console.warn("Falha ao excluir a imagem do laudo, mas prosseguindo para excluir o documento:", error);
                }
            }
        }
        
        const reportRef = doc(db, 'reports', reportId);
        await deleteDoc(reportRef);

        return { success: true };

    } catch (e) {
        console.error("Falha ao excluir o laudo:", e);
        const errorMessage = e instanceof Error ? e.message : 'Não foi possível excluir o laudo.';
        return { error: errorMessage };
    }
}


// --- User Management Actions ---

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

// --- Appointment Actions ---

const appointmentSchema = z.object({
    patientName: z.string().min(1, "O nome do paciente é obrigatório."),
    doctorUid: z.string().min(1, "Selecione um médico."),
    date: z.string().min(1, "A data é obrigatória."),
    time: z.string().min(1, "A hora é obrigatória."),
});

export async function addAppointmentAction(data: z.infer<typeof appointmentSchema>, doctorName: string) {
    const parsedInput = appointmentSchema.safeParse(data);
    if (!parsedInput.success) {
      return { error: 'Dados de entrada inválidos.' };
    }

    try {
        if (!db) throw new Error("A conexão com o banco de dados não foi estabelecida.");

        const newAppointment: Omit<Appointment, 'id'> = {
            ...parsedInput.data,
            doctorName,
            status: 'Agendada',
            createdAt: new Date().toISOString(),
        };

        await addDoc(collection(db, 'appointments'), newAppointment);
        return { success: true };
    } catch (e) {
        console.error("Falha ao criar o agendamento:", e);
        const errorMessage = e instanceof Error ? e.message : 'Não foi possível salvar o agendamento.';
        return { error: errorMessage };
    }
}

const updateStatusSchema = z.object({
    id: z.string(),
    status: z.enum(['Agendada', 'Atendida', 'Adiada', 'Cancelada']),
});

export async function updateAppointmentStatusAction(input: z.infer<typeof updateStatusSchema>) {
    const parsedInput = updateStatusSchema.safeParse(input);
    if (!parsedInput.success) {
      return { error: 'Dados de entrada inválidos.' };
    }
    try {
      if (!db) throw new Error("A conexão com o banco de dados não foi estabelecida.");
      const appointmentRef = doc(db, 'appointments', parsedInput.data.id);
      await updateDoc(appointmentRef, { status: parsedInput.data.status });
      return { success: true };
    } catch (e) {
      console.error("Falha ao atualizar o status do agendamento:", e);
      const errorMessage = e instanceof Error ? e.message : 'Não foi possível atualizar o status.';
      return { error: errorMessage };
    }
}
