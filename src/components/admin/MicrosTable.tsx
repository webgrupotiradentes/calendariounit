import { Edit2, Trash2, MapPin } from 'lucide-react';
import { Micro, Macro } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MicrosTableProps {
    micros: Micro[];
    macros: Macro[];
    onEdit: (micro: Micro) => void;
    onDelete: (id: string) => void;
}

export function MicrosTable({ micros, macros, onEdit, onDelete }: MicrosTableProps) {
    if (micros.length === 0) {
        return (
            <div className="bg-muted/30 rounded-2xl p-8 text-center sm:p-12 border border-border">
                <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum local micro encontrado</p>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Nome</th>
                            <th className="px-6 py-4 font-semibold">IES (Macro)</th>
                            <th className="px-6 py-4 font-semibold hidden sm:table-cell">Criado em</th>
                            <th className="px-6 py-4 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {micros.map((micro) => {
                            const macro = macros.find(m => m.id === micro.macroId);
                            return (
                                <tr key={micro.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-foreground">{micro.name}</span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {macro?.name || 'Desconhecido'}
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell text-muted-foreground">
                                        {format(new Date(micro.createdAt), "d 'de' MMM, yyyy", { locale: ptBR })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(micro)}
                                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDelete(micro.id)}
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
