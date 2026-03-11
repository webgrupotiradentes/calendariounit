import { format, startOfYear, endOfYear, eachMonthOfInterval, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface YearViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onDateClick: (date: Date) => void;
}

export function YearView({ currentDate, events, onDateClick }: YearViewProps) {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    const getEventsForDay = (day: Date) => {
        return events.filter(event => isSameDay(new Date(event.date), day));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10">
                {months.map((month) => {
                    const monthStart = startOfMonth(month);
                    const monthEnd = endOfMonth(month);
                    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

                    // Padding for start of week
                    const startDayOfWeek = monthStart.getDay();
                    const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

                    return (
                        <div key={month.toString()} className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80 px-1">
                                {format(month, 'MMMM', { locale: ptBR })}
                            </h3>

                            <div className="grid grid-cols-7 gap-1 text-[10px]">
                                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                                    <div key={i} className="text-center font-bold text-muted-foreground/50 h-5 flex items-center justify-center">
                                        {day}
                                    </div>
                                ))}

                                {paddingDays.map((i) => (
                                    <div key={`pad-${i}`} className="h-6" />
                                ))}

                                {days.map((day) => {
                                    const dayEvents = getEventsForDay(day);
                                    const hasEvents = dayEvents.length > 0;
                                    const isCurrentDay = isToday(day);

                                    return (
                                        <button
                                            key={day.toString()}
                                            onClick={() => onDateClick(day)}
                                            className={cn(
                                                "h-7 w-7 rounded-lg flex items-center justify-center transition-all relative group",
                                                isCurrentDay ? "bg-primary text-primary-foreground font-bold shadow-sm" : "hover:bg-muted font-medium",
                                                hasEvents && !isCurrentDay && "text-primary font-bold bg-primary/5"
                                            )}
                                        >
                                            {format(day, 'd')}
                                            {hasEvents && !isCurrentDay && (
                                                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
