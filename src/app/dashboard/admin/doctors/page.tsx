import { UserTable } from '@/components/admin/user-table';

export default function ManageDoctorsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Médicos</h1>
        <p className="text-muted-foreground">
          Atualize funções e gerencie o acesso dos usuários ao sistema.
        </p>
      </div>
      <UserTable />
    </div>
  );
}
