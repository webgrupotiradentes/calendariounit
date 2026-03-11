import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarViewType } from './ViewSelector';

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onClear: () => void;
  viewType?: CalendarViewType;
}

export function CalendarHeader({
  currentDate, onPreviousMonth, onNextMonth, onToday, onClear, viewType = 'month',
}: CalendarHeaderProps) {
  const getHeaderText = () => {
    switch (viewType) {
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: ptBR });
      case 'week': {
        const ws = startOfWeek(currentDate, { locale: ptBR });
        const we = endOfWeek(currentDate, { locale: ptBR });
        return `${format(ws, 'd MMM', { locale: ptBR })} - ${format(we, 'd MMM yyyy', { locale: ptBR })}`;
      }
      case 'day':
        return format(currentDate, "d 'de' MMMM yyyy", { locale: ptBR });
      case 'year':
        return format(currentDate, 'yyyy');
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold tracking-tight capitalize text-foreground">
          {getHeaderText()}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="h-7 text-xs font-medium rounded-md"
        >
          Hoje
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="h-7 text-xs font-medium rounded-md"
        >
          Limpar
        </Button>
      </div>

      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousMonth}
          className="h-8 w-8 rounded-lg"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          className="h-8 w-8 rounded-lg"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div >
  );
}
