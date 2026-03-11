import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent, Category } from '@/types/calendar';
import { EventCard } from './EventCard';
import { CalendarX } from 'lucide-react';

interface EventListProps {
  events: CalendarEvent[];
  categories: Category[];
  selectedDate: Date | null;
  activeCategories: string[];
  onEventClick?: (event: CalendarEvent) => void;
}

export function EventList({ events, categories, selectedDate, activeCategories, onEventClick }: EventListProps) {
  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  const formatDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filteredEvents = events.filter(event => {
    const matchesCat = activeCategories.length === 0 || activeCategories.includes(event.categoryId);
    if (selectedDate) {
      const sel = formatDateString(selectedDate);
      return matchesCat && sel >= event.date && sel <= (event.endDate || event.date);
    }
    return matchesCat;
  });

  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
        {selectedDate 
          ? `Eventos — ${format(selectedDate, "d 'de' MMMM", { locale: ptBR })}`
          : 'Próximos Eventos'
        }
      </h3>

      {sortedEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CalendarX className="w-10 h-10 text-muted-foreground/30 mb-2" />
          <p className="text-xs text-muted-foreground">
            {selectedDate ? 'Nenhum evento nesta data' : 'Nenhum evento encontrado'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
          {sortedEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              category={getCategoryById(event.categoryId)}
              onClick={() => onEventClick?.(event)}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}
