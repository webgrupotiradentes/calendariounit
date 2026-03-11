import { useMemo } from 'react';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent, Category } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  categories: Category[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  activeCategories: string[];
  onEventClick: (event: CalendarEvent) => void;
}

export function WeekView({
  currentDate, events, categories, selectedDate, onSelectDate, activeCategories, onEventClick,
}: WeekViewProps) {
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { locale: ptBR });
    const end = endOfWeek(currentDate, { locale: ptBR });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  const getEventsForDay = (day: Date) => {
    const y = day.getFullYear();
    const m = String(day.getMonth() + 1).padStart(2, '0');
    const d = String(day.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    return events.filter(event => {
      const inRange = dateStr >= event.date && dateStr <= (event.endDate || event.date);
      const matchesCat = activeCategories.length === 0 || activeCategories.includes(event.categoryId);
      return inRange && matchesCat;
    });
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-border/50">
        {weekDays.map((day) => {
          const isDayToday = isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={cn(
                "flex flex-col items-center py-3 transition-colors",
                "hover:bg-muted/50",
                isSelected && "bg-primary/5",
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {format(day, 'EEE', { locale: ptBR })}
              </span>
              <span className={cn(
                "text-lg font-bold mt-0.5",
                isDayToday ? "text-primary" : "text-foreground",
                isSelected && !isDayToday && "text-primary"
              )}>
                {format(day, 'd')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Events */}
      <div className="grid grid-cols-7 min-h-[350px]">
        {weekDays.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "p-1.5 border-r border-border/30 last:border-r-0",
                isSelected && "bg-primary/5"
              )}
            >
              <div className="space-y-1">
                {dayEvents.slice(0, 4).map((event) => {
                  const category = getCategoryById(event.categoryId);
                  return (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="w-full text-left p-1 rounded text-[10px] font-medium truncate transition-colors hover:opacity-80"
                      style={{
                        backgroundColor: category ? `hsl(${category.color} / 0.15)` : 'hsl(var(--muted))',
                        color: category ? `hsl(${category.color})` : 'hsl(var(--muted-foreground))'
                      }}
                    >
                      {event.title}
                    </button>
                  );
                })}
                {dayEvents.length > 4 && (
                  <span className="text-[10px] text-muted-foreground font-medium px-1">
                    +{dayEvents.length - 4}
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
