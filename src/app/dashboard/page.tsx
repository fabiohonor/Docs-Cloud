
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ReportTable } from '@/components/dashboard/report-table';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';

export default function DashboardPage() {

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel</h1>
          <p className="text-muted-foreground">Gerencie e crie laudos médicos.</p>
        </div>
        <Link href="/dashboard/new-report">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Laudo
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border border-dashed p-4">
        <h2 className="text-lg font-semibold mb-2">Verificação da Logo</h2>
        <p className="text-sm text-muted-foreground mb-4">
          A imagem da sua logo deve aparecer aqui. Se ela não aparecer, significa que o arquivo não está no local correto.
          Por favor, certifique-se de que o arquivo <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">logo.png</code> está dentro de uma pasta chamada <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">public</code> na raiz do projeto.
        </p>
        <div className="bg-muted/50 p-4 rounded-md flex items-center justify-center min-h-[80px]">
          {/* O Next.js serve arquivos da pasta 'public' na raiz do site. */}
          <Image src="/logo.png" alt="Pré-visualização da Logo" width={160} height={48} className="max-h-12 w-auto object-contain" />
        </div>
      </div>

      <ReportTable />
    </div>
  );
}
