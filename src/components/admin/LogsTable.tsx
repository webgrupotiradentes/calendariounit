import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ActivityLog } from '@/hooks/useLogs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LogsTableProps {
    logs: ActivityLog[];
    isLoading: boolean;
}

export function LogsTable({ logs, isLoading }: LogsTableProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
                <p>Nenhum log de atividade encontrado.</p>
            </div>
        );
    }

    const getActionBadge = (action: string) => {
        if (action.includes('Criou')) return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Criação</Badge>;
        if (action.includes('Atualizou')) return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">Edição</Badge>;
        if (action.includes('Excluiu')) return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20">Exclusão</Badge>;
        return <Badge variant="secondary">{action}</Badge>;
    };

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <ScrollArea className="h-[500px]">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[180px]">Data e Hora</TableHead>
                            <TableHead className="w-[120px]">Ação</TableHead>
                            <TableHead className="w-[100px]">Tipo</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Usuário</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                                <TableCell className="font-medium text-xs">
                                    {format(new Date(log.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </TableCell>
                                <TableCell>
                                    {log.action}
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">
                                        {log.entityType}
                                    </span>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {log.entityName || '-'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm">{log.userFullName || 'Sistema'}</span>
                                        <span className="text-xs text-muted-foreground">{log.userEmail || ''}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    );
}
