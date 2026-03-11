import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit2, Trash2, MoreVertical } from 'lucide-react';
import { CalendarEvent, Category } from '@/types/calendar';
import { parseYmdToLocalDate } from '@/lib/date';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EventsTableProps {
  events: CalendarEvent[];
  categories: Category[];
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

export function EventsTable({ events, categories, onEdit, onDelete }: EventsTableProps) {
  const sortedEvents = [...events].sort(
    (a, b) => parseYmdToLocalDate(a.date).getTime() - parseYmdToLocalDate(b.date).getTime()
  );

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  return (
    <div className="glass rounded-2xl overflow-hidden shadow-apple">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="font-semibold text-foreground">Evento</TableHead>
            <TableHead className="font-semibold text-foreground">Categoria</TableHead>
            <TableHead className="font-semibold text-foreground">IES</TableHead>
            <TableHead className="font-semibold text-foreground">Data</TableHead>
            <TableHead className="font-semibold text-foreground hidden md:table-cell">Local</TableHead>
            <TableHead className="font-semibold text-foreground w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEvents.map((event) => {
            const category = getCategoryById(event.categoryId);
            return (
              <TableRow key={event.id} className="border-border/50">
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                      {event.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {category && (
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: `hsl(${category.color})`,
                        color: 'white'
                      }}
                    >
                      {category.name}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-foreground">
                    {event.macroName || '—'}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className="text-sm text-foreground">
                    {format(parseYmdToLocalDate(event.date), "d MMM yyyy", { locale: ptBR })}
                  </span>
                  {event.endDate && (
                    <span className="text-xs text-muted-foreground block">
                      até {format(parseYmdToLocalDate(event.endDate), "d MMM", { locale: ptBR })}
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {event.microName || '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-popover border border-border shadow-lg z-50">
                      <DropdownMenuItem onClick={() => onEdit(event)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(event.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {sortedEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum evento cadastrado</p>
        </div>
      )}
    </div>
  );
}
