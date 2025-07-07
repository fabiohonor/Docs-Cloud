'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, FileText, Loader2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { generateDraftAction, summarizeAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const formSchema = z.object({
  patientName: z.string().min(2, { message: 'Patient name is required.' }),
  reportType: z.string().min(2, { message: 'Report type is required.' }),
  notes: z.string().min(10, { message: 'Please provide some notes to generate a draft.' }),
  draft: z.string(),
});

export default function NewReportPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [patientSummary, setPatientSummary] = useState('');
  const [technicalDetails, setTechnicalDetails] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      reportType: '',
      notes: '',
      draft: '',
    },
  });

  const handleGenerateDraft = async () => {
    const { patientName, reportType, notes } = form.getValues();
    if (!patientName || !reportType || !notes) {
      form.trigger(['patientName', 'reportType', 'notes']);
      return;
    }
    setIsGenerating(true);
    const result = await generateDraftAction({ patientName, reportType, notes });
    setIsGenerating(false);

    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else if (result.draft) {
      form.setValue('draft', result.draft);
      toast({ title: 'Success', description: 'Report draft generated successfully.' });
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    const result = await summarizeAction({ technicalDetails });
    setIsSummarizing(false);
    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else if (result.summary) {
      setPatientSummary(result.summary);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // In a real app, this would save to a database
    console.log('Submitting report:', values);
    toast({ title: 'Report Submitted', description: 'The new report has been saved as a draft.' });
    router.push('/dashboard');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Report</h1>
        <p className="text-muted-foreground">Use AI to assist in drafting and simplifying reports.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
              <CardDescription>Enter patient and report information.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Name</FormLabel>
                    <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Type</FormLabel>
                    <FormControl><Input placeholder="e.g., Cardiology Report" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Draft Generation</CardTitle>
              <CardDescription>Provide shorthand notes and let AI generate a structured draft.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shorthand Notes</FormLabel>
                    <FormControl><Textarea placeholder="pt presents w/ chest pain, ECG shows normal sinus rhythm..." {...field} rows={5} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" onClick={handleGenerateDraft} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Draft with AI
              </Button>
              <Separator />
              <FormField
                control={form.control}
                name="draft"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Generated Draft</FormLabel>
                    <FormControl><Textarea placeholder="AI-generated report content will appear here." {...field} rows={15} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Summarize for Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Patient-Friendly Summary</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 items-start">
                  <div className="space-y-2">
                    <Label htmlFor="technical-details">Technical Details</Label>
                    <Textarea
                      id="technical-details"
                      placeholder="Paste or write technical text here..."
                      value={technicalDetails}
                      onChange={(e) => setTechnicalDetails(e.target.value)}
                      rows={10}
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="patient-summary">Patient Summary</Label>
                    <Textarea
                        id="patient-summary"
                        readOnly
                        value={patientSummary}
                        placeholder="Simplified summary will appear here."
                        rows={10}
                        className="bg-muted"
                      />
                  </div>
                </div>
                 <Button type="button" onClick={handleSummarize} disabled={isSummarizing}>
                  {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate Summary
                </Button>
              </DialogContent>
            </Dialog>

            <Button type="submit" disabled={!form.getValues('draft')}>
              Submit for Approval
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
