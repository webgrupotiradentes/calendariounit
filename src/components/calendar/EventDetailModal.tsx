import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, MapPin, Clock, ExternalLink, Calendar } from 'lucide-react';
import { CalendarEvent, Category } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { parseYmdToLocalDate } from '@/lib/date';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EventDetailModalProps {
  event: CalendarEvent | null;
  category?: Category;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailModal({ event, category, isOpen, onClose }: EventDetailModalProps) {
  if (!event) return null;

  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description || '');
    const location = encodeURIComponent([event.macroName, event.microName].filter(Boolean).join(' - '));

    // Format: YYYYMMDDTHHmmSSZ
    const formatDate = (dateStr: string, timeStr?: string | null) => {
      const date = new Date(dateStr);
      if (timeStr) {
        const [hours, minutes] = timeStr.split(':');
        date.setHours(parseInt(hours), parseInt(minutes));
      }
      return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    const start = formatDate(event.date, event.startTime);
    const end = event.endDate ? formatDate(event.endDate, event.endTime) : formatDate(event.date, event.endTime || event.startTime);

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            {category && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded text-white uppercase tracking-wide"
                style={{ backgroundColor: `hsl(${category.color})` }}
              >
                {category.name}
              </span>
            )}
          </div>
          <DialogTitle className="text-lg font-bold text-foreground pr-8">
            {event.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-muted">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {format(parseYmdToLocalDate(event.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                {event.endDate && (
                  <p className="text-muted-foreground text-xs">
                    até {format(parseYmdToLocalDate(event.endDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>
            </div>

            {(event.macroName || event.microName) && (
              <div className="flex items-center gap-2.5 text-sm">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-muted">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p className="text-foreground text-sm">
                  {[event.macroName, event.microName].filter(Boolean).join(' - ')}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2.5 text-sm">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-muted">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-foreground text-sm">
                {event.allDay ? 'Dia inteiro' : (() => {
                  const formatTime = (t?: string | null) => {
                    if (!t) return '';
                    const parts = t.split(':');
                    if (parts.length < 2) return t;
                    return `${parts[0]}h${parts[1]}`;
                  };
                  return `${formatTime(event.startTime)}${event.endTime ? ' - ' + formatTime(event.endTime) : ''}`;
                })()}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {event.link && (
              <Button
                className="w-full justify-start gap-2"
                variant="outline"
                onClick={() => window.open(event.link!, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                Acessar Link do Evento
              </Button>
            )}
            <Button
              className="w-full justify-start gap-2"
              onClick={() => window.open(getGoogleCalendarUrl(), '_blank')}
            >
              <Calendar className="w-4 h-4" />
              Adicionar ao Google Agenda
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
