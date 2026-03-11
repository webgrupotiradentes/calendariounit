import { useMemo } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { CalendarEvent, Category } from '@/types/calendar';
import { Button } from '@/components/ui/button';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  categories: Category[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  activeCategories: string[];
  onEventClick: (event: CalendarEvent) => void;
}

export function DayView({
  currentDate, events, categories, selectedDate, onSelectDate, activeCategories, onEventClick,
}: DayViewProps) {
  const displayDate = selectedDate || currentDate;
  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  const dayEvents = useMemo(() => {
    const y = displayDate.getFullYear();
    const m = String(displayDate.getMonth() + 1).padStart(2, '0');
    const d = String(displayDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    return events.filter(event => {
      const inRange = dateStr >= event.date && dateStr <= (event.endDate || event.date);
      const matchesCat = activeCategories.length === 0 || activeCategories.includes(event.categoryId);
      return inRange && matchesCat;
    });
  }, [displayDate, events, activeCategories]);

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 sm:p-5">
      {/* Day Navigation */}
      <div className="flex items-center justify-between mb-5">
        <Button variant="ghost" size="icon" onClick={() => onSelectDate(subDays(displayDate, 1))} className="h-8 w-8 rounded-lg">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">{format(displayDate, 'd', { locale: ptBR })}</h2>
          <p className="text-xs text-muted-foreground capitalize">
            {format(displayDate, 'EEEE, MMMM yyyy', { locale: ptBR })}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onSelectDate(addDays(displayDate, 1))} className="h-8 w-8 rounded-lg">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Events */}
      {dayEvents.length > 0 ? (
        <div className="space-y-2">
          {dayEvents.map((event) => {
            const category = getCategoryById(event.categoryId);
            return (
              <button
                key={event.id}
                onClick={() => onEventClick(event)}
                className="w-full text-left p-3 rounded-lg transition-colors hover:bg-muted/50 border border-border/30"
                style={{
                  borderLeftColor: category ? `hsl(${category.color})` : undefined,
                  borderLeftWidth: '3px'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {category && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-white uppercase"
                      style={{ backgroundColor: `hsl(${category.color})` }}>
                      {category.name}
                    </span>
                  )}
                  {event.allDay && <span className="text-[10px] text-muted-foreground">Dia inteiro</span>}
                </div>
                <p className="font-semibold text-sm text-foreground">{event.title}</p>
                {event.location && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />{event.location}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">Nenhum evento neste dia</p>
        </div>
      )}
    </div>
  );
}
