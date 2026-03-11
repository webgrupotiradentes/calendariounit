import { useMemo } from 'react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, isToday, format 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent, Category } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  categories: Category[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  activeCategories: string[];
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CalendarGrid({
  currentDate, events, categories, selectedDate, onSelectDate, onEventClick, activeCategories,
}: CalendarGridProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { locale: ptBR });
    const end = endOfWeek(endOfMonth(currentDate), { locale: ptBR });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  const getEventsForDay = (day: Date) => {
    const y = day.getFullYear();
    const m = String(day.getMonth() + 1).padStart(2, '0');
    const d = String(day.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    
    return events.filter(event => {
      const isInRange = dateStr >= event.date && dateStr <= (event.endDate || event.date);
      const matchesCat = activeCategories.length === 0 || activeCategories.includes(event.categoryId);
      return isInRange && matchesCat;
    });
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border/50">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-3 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isDayToday = isToday(day);

          return (
            <div
              key={index}
              onClick={() => onSelectDate(day)}
              className={cn(
                "relative min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 border-b border-r border-border/30 transition-colors text-left group cursor-pointer",
                "hover:bg-muted/50 focus-within:bg-muted/50",
                !isCurrentMonth && "opacity-30 bg-muted/20",
                isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/30",
              )}
            >
              <span
                className={cn(
                  "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium transition-transform group-hover:scale-110",
                  isDayToday && "bg-primary text-primary-foreground font-bold",
                  isSelected && !isDayToday && "bg-secondary text-foreground",
                  !isDayToday && !isSelected && "text-foreground"
                )}
              >
                {format(day, 'd')}
              </span>

              {/* Event indicators */}
              <div className="mt-0.5 space-y-0.5">
                {dayEvents.slice(0, 3).map((event, i) => {
                  const category = getCategoryById(event.categoryId);
                  return (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className="w-full text-[10px] leading-tight font-medium px-1.5 py-0.5 rounded truncate text-left transition-all hover:brightness-90 active:scale-95"
                      style={{
                        backgroundColor: category ? `hsl(${category.color} / 0.15)` : 'hsl(var(--muted))',
                        color: category ? `hsl(${category.color})` : 'hsl(var(--muted-foreground))'
                      }}
                    >
                      {event.title}
                    </button>
                  );
                })}
                {dayEvents.length > 3 && (
                  <span className="text-[9px] text-muted-foreground font-medium px-1.5 block">
                    +{dayEvents.length - 3} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
