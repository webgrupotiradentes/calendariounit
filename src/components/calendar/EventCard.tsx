import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, MapPin, Clock } from 'lucide-react';
import { CalendarEvent, Category } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { parseYmdToLocalDate } from '@/lib/date';

interface EventCardProps {
  event: CalendarEvent;
  category?: Category;
  onClick?: () => void;
  compact?: boolean;
}

export function EventCard({ event, category, onClick, compact = false }: EventCardProps) {
  const dotStyle = category ? { backgroundColor: `hsl(${category.color})` } : {};

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left p-2.5 rounded-lg transition-all",
          "hover:bg-muted/50 active:scale-[0.99]",
          "border border-border/30"
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-7 rounded-full flex-shrink-0" style={dotStyle} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {format(parseYmdToLocalDate(event.date), "d 'de' MMM", { locale: ptBR })}
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl transition-all",
        "hover:bg-muted/50 active:scale-[0.99]",
        "border border-border/30 bg-card"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-1 h-full min-h-[50px] rounded-full flex-shrink-0" style={dotStyle} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {category && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white uppercase tracking-wide"
                style={dotStyle}
              >
                {category.name}
              </span>
            )}
          </div>

          <h4 className="text-sm font-semibold text-foreground mb-1">{event.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{event.description}</p>

          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              <span>
                {format(parseYmdToLocalDate(event.date), "d 'de' MMMM", { locale: ptBR })}
                {event.endDate && ` — ${format(parseYmdToLocalDate(event.endDate), "d 'de' MMMM", { locale: ptBR })}`}
              </span>
            </div>
            {(event.macroName || event.microName) && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>
                  {[event.macroName, event.microName].filter(Boolean).join(' - ')}
                </span>
              </div>
            )}
            {!event.allDay && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Horário específico</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
