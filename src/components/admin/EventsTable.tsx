import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Edit2, Trash2, MoreVertical,
  ArrowUpDown, ArrowUp, ArrowDown,
  X, Filter, Calendar,
} from 'lucide-react';
import { CalendarEvent, Category } from '@/types/calendar';
import { parseYmdToLocalDate } from '@/lib/date';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type SortField = 'title' | 'date' | 'category' | 'ies';
type SortDir = 'asc' | 'desc';

interface EventsTableProps {
  events: CalendarEvent[];
  categories: Category[];
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
}

export function EventsTable({ events, categories, onEdit, onDelete, onBulkDelete }: EventsTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterText, setFilterText] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  // Derive unique months/years for period filter
  const periods = useMemo(() => {
    const seen = new Set<string>();
    return events
      .map(e => {
        const d = parseYmdToLocalDate(e.date);
        return { value: `${d.getFullYear()}-${d.getMonth()}`, label: format(d, "MMMM 'de' yyyy", { locale: ptBR }) };
      })
      .filter(p => { if (seen.has(p.value)) return false; seen.add(p.value); return true; })
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [events]);

  // Apply filters
  const filtered = useMemo(() => {
    return events.filter(evt => {
      if (filterCategory !== 'all' && evt.categoryId !== filterCategory) return false;
      if (filterText) {
        const q = filterText.toLowerCase();
        if (!evt.title.toLowerCase().includes(q) && !(evt.description || '').toLowerCase().includes(q)) return false;
      }
      if (filterPeriod !== 'all') {
        const d = parseYmdToLocalDate(evt.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (key !== filterPeriod) return false;
      }
      return true;
    });
  }, [events, filterCategory, filterText, filterPeriod]);

  // Apply sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'title':
          cmp = a.title.localeCompare(b.title, 'pt-BR');
          break;
        case 'date':
          cmp = parseYmdToLocalDate(a.date).getTime() - parseYmdToLocalDate(b.date).getTime();
          break;
        case 'category': {
          const ca = getCategoryById(a.categoryId)?.name || '';
          const cb = getCategoryById(b.categoryId)?.name || '';
          cmp = ca.localeCompare(cb, 'pt-BR');
          break;
        }
        case 'ies':
          cmp = (a.macroName || '').localeCompare(b.macroName || '', 'pt-BR');
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir, categories]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-40" />;
    return sortDir === 'asc'
      ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-primary" />
      : <ArrowDown className="w-3.5 h-3.5 ml-1 text-primary" />;
  };

  // Selection helpers
  const allSelected = sorted.length > 0 && sorted.every(e => selected.has(e.id));
  const someSelected = sorted.some(e => selected.has(e.id));
  const isIndeterminate = someSelected && !allSelected;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(sorted.map(e => e.id)));
  };

  const toggleOne = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setFilterCategory('all');
    setFilterText('');
    setFilterPeriod('all');
  };

  const hasFilters = filterCategory !== 'all' || filterText !== '' || filterPeriod !== 'all';
  const selectedCount = selected.size;
  const activeFiltersCount = [filterCategory !== 'all', filterText !== '', filterPeriod !== 'all'].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* ── Filter Bar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Text search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Filtrar por título..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            className="h-9 pl-8 text-sm rounded-xl"
          />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:bg-muted rounded-full p-0.5 transition-colors"
              aria-label="Limpar busca"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-9 w-[160px] rounded-xl text-sm">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border shadow-lg z-50">
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.id}>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(${c.color})` }} />
                  {c.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Period filter */}
        <Select value={filterPeriod} onValueChange={setFilterPeriod}>
          <SelectTrigger className="h-9 w-[170px] rounded-xl text-sm">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border shadow-lg z-50">
            <SelectItem value="all">Todos os períodos</SelectItem>
            {periods.map(p => (
              <SelectItem key={p.value} value={p.value} className="capitalize">{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 rounded-xl text-xs gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <X className="w-3 h-3" />
            Limpar {activeFiltersCount > 1 ? `(${activeFiltersCount})` : ''}
          </Button>
        )}

        <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap font-medium">
          {sorted.length} de {events.length} evento{events.length !== 1 && 's'}
        </span>
      </div>

      {/* ── Bulk Action Bar ─────────────────────────────────────── */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="font-medium text-primary">{selectedCount} evento{selectedCount !== 1 && 's'} selecionado{selectedCount !== 1 && 's'}</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
              className="h-7 rounded-lg text-xs hover:bg-primary/10"
            >
              Desmarcar
            </Button>
            {onBulkDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => { onBulkDelete([...selected]); setSelected(new Set()); }}
                className="h-7 rounded-lg text-xs gap-1.5"
              >
                <Trash2 className="w-3 h-3" />
                Excluir {selectedCount > 1 ? 'selecionados' : ''}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="glass rounded-2xl overflow-hidden shadow-apple">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              {/* Select all */}
              <TableHead className="w-10 pl-4">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Selecionar todos"
                  className={cn(
                    'transition-all duration-200',
                    isIndeterminate && 'data-[state=checked]:bg-primary/50'
                  )}
                  ref={(el) => {
                    if (el) {
                      (el as any).indeterminate = isIndeterminate;
                    }
                  }}
                />
              </TableHead>
              {/* Sortable columns */}
              <TableHead>
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center font-semibold text-foreground hover:text-primary transition-colors text-sm group"
                >
                  Evento <SortIcon field="title" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center font-semibold text-foreground hover:text-primary transition-colors text-sm group"
                >
                  Categoria <SortIcon field="category" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('ies')}
                  className="flex items-center font-semibold text-foreground hover:text-primary transition-colors text-sm group"
                >
                  IES <SortIcon field="ies" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center font-semibold text-foreground hover:text-primary transition-colors text-sm group"
                >
                  Data <SortIcon field="date" />
                </button>
              </TableHead>
              <TableHead className="hidden md:table-cell font-semibold text-foreground">Local</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((event) => {
              const category = getCategoryById(event.categoryId);
              const isSelected = selected.has(event.id);
              return (
                <TableRow
                  key={event.id}
                  className={cn(
                    'border-border/50 transition-colors duration-150',
                    isSelected && 'bg-primary/5 hover:bg-primary/8'
                  )}
                >
                  <TableCell className="pl-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleOne(event.id)}
                      aria-label={`Selecionar ${event.title}`}
                      className="transition-all duration-200"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{event.title}</p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[220px] mt-0.5">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {category && (
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm"
                        style={{ backgroundColor: `hsl(${category.color})`, color: 'white' }}
                      >
                        {category.name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground">{event.macroName || '—'}</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="text-sm text-foreground font-medium">
                      {format(parseYmdToLocalDate(event.date), "d MMM yyyy", { locale: ptBR })}
                    </span>
                    {event.endDate && (
                      <span className="text-xs text-muted-foreground block mt-0.5">
                        até {format(parseYmdToLocalDate(event.endDate), "d MMM", { locale: ptBR })}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">{event.microName || '—'}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-popover border border-border shadow-lg z-50">
                        <DropdownMenuItem onClick={() => onEdit(event)} className="cursor-pointer">
                          <Edit2 className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(event.id)}
                          className="text-destructive focus:text-destructive cursor-pointer"
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

        {sorted.length === 0 && (
          <div className="text-center py-14">
            <p className="text-muted-foreground text-sm">
              {hasFilters ? 'Nenhum evento encontrado com os filtros atuais.' : 'Nenhum evento cadastrado.'}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-2 text-primary text-xs hover:underline font-medium"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}