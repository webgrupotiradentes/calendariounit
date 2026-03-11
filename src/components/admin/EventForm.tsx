import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, AlertTriangle } from 'lucide-react';
import { CalendarEvent, Category } from '@/types/calendar';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useMacros } from '@/hooks/useMacros';
import { useMicros } from '@/hooks/useMicros';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ptBR } from 'date-fns/locale';

interface EventFormProps {
  event?: CalendarEvent;
  categories: Category[];
  onSubmit: (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EventForm({ event, categories, onSubmit, onCancel, isLoading }: EventFormProps) {
  const { checkLocationAvailability } = useCalendarEvents();
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [date, setDate] = useState<Date | undefined>(() => {
    if (event?.date) {
      const [year, month, day] = event.date.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return undefined;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    if (event?.endDate) {
      const [year, month, day] = event.endDate.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return undefined;
  });
  const [categoryId, setCategoryId] = useState(event?.categoryId || (categories[0]?.id || ''));
  const [macroId, setMacroId] = useState<string>(event?.macroId || '');
  const [microId, setMicroId] = useState<string>(event?.microId || '');
  const [link, setLink] = useState(event?.link || '');
  const [allDay, setAllDay] = useState(event?.allDay ?? true);
  const [startTime, setStartTime] = useState(event?.startTime || '');
  const [endTime, setEndTime] = useState(event?.endTime || '');
  const [hasEndDate, setHasEndDate] = useState(!!event?.endDate);

  const { macros } = useMacros();
  const { micros } = useMicros();

  // Filter micros based on selected macro
  const availableMicros = useMemo(() => {
    if (!macroId) return [];
    return micros.filter(m => m.macroId === macroId);
  }, [micros, macroId]);

  // Reset micro if macro changes
  useEffect(() => {
    if (microId && !availableMicros.find(m => m.id === microId)) {
      setMicroId('');
    }
  }, [macroId, availableMicros, microId]);

  useEffect(() => {
    if (!categoryId && categories.length > 0) setCategoryId(categories[0].id);
  }, [categories, categoryId]);

  const formatDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check location conflicts
  const locationConflicts = useMemo(() => {
    if (!microId || !date) return [];
    const dateStr = formatDateString(date);
    const endDateStr = hasEndDate && endDate ? formatDateString(endDate) : undefined;
    return checkLocationAvailability(microId, dateStr, endDateStr, event?.id);
  }, [microId, date, endDate, hasEndDate, event?.id, checkLocationAvailability]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !categoryId) return;

    if (locationConflicts.length > 0) {
      return; // Prevent submission with conflicts
    }

    onSubmit({
      title,
      description,
      date: formatDateString(date),
      endDate: hasEndDate && endDate ? formatDateString(endDate) : undefined,
      startTime: allDay ? null : (startTime || null),
      endTime: allDay ? null : (endTime || null),
      categoryId,
      macroId: macroId || null,
      microId: microId || null,
      link: link || undefined,
      allDay,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Título do Evento *</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Início do Semestre Letivo" className="h-11 rounded-xl" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição detalhada..." className="min-h-[80px] rounded-xl resize-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Categoria *</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${cat.color})` }} />
                    <span>{cat.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>IES (Macro)</Label>
          <Select value={macroId} onValueChange={setMacroId}>
            <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Selecione a IES" /></SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              {macros.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data de Início *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full h-11 justify-start text-left font-normal rounded-xl", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "d 'de' MMMM, yyyy", { locale: ptBR }) : "Selecione"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover border border-border shadow-lg z-50" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="pointer-events-auto" locale={ptBR} />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Data de Término</Label>
            <Switch checked={hasEndDate} onCheckedChange={setHasEndDate} className="scale-90" />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" disabled={!hasEndDate} className={cn("w-full h-11 justify-start text-left font-normal rounded-xl", !endDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "d 'de' MMMM, yyyy", { locale: ptBR }) : "Selecione"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover border border-border shadow-lg z-50" align="start">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="pointer-events-auto" locale={ptBR} disabled={(d) => date ? d < date : false} />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Local (Micro) - Opcional</Label>
        <Select value={microId} onValueChange={setMicroId} disabled={!macroId || availableMicros.length === 0}>
          <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder={!macroId ? "Selecione uma IES primeiro" : "Selecione o Local"} /></SelectTrigger>
          <SelectContent className="bg-popover border border-border shadow-lg z-50">
            {availableMicros.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {locationConflicts.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-sm text-destructive">
              <p className="font-medium">Local indisponível nesta data!</p>
              <ul className="mt-1 space-y-0.5">
                {locationConflicts.map(c => (
                  <li key={c.id} className="text-xs">• {c.title} ({c.date}{c.endDate ? ` - ${c.endDate}` : ''})</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="link">Link (opcional)</Label>
        <Input id="link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className="h-11 rounded-xl" />
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
        <div>
          <Label htmlFor="allDay">Dia Inteiro</Label>
          <p className="text-xs text-muted-foreground mt-0.5">O evento ocorre durante todo o dia</p>
        </div>
        <Switch id="allDay" checked={allDay} onCheckedChange={setAllDay} />
      </div>

      {!allDay && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Hora de Início</Label>
            <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">Hora de Término</Label>
            <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-11 rounded-xl" />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-11 rounded-xl">Cancelar</Button>
        <Button type="submit" disabled={!title || !date || !categoryId || isLoading || locationConflicts.length > 0} className="flex-1 h-11 rounded-xl">
          {isLoading ? 'Salvando...' : event ? 'Atualizar' : 'Criar Evento'}
        </Button>
      </div>
    </form>
  );
}
