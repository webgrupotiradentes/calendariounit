import { CalendarDays, CalendarRange, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CalendarViewType = 'month' | 'week' | 'day' | 'year';

interface ViewSelectorProps {
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
}

const views: { type: CalendarViewType; label: string; icon: React.ReactNode }[] = [
  { type: 'month', label: 'Mês', icon: <Calendar className="w-3.5 h-3.5" /> },
  { type: 'week', label: 'Semana', icon: <CalendarRange className="w-3.5 h-3.5" /> },
  { type: 'day', label: 'Dia', icon: <CalendarDays className="w-3.5 h-3.5" /> },
  { type: 'year', label: 'Ano', icon: <Calendar className="w-3.5 h-3.5" /> },
];

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border/50 bg-card p-0.5">
      {views.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => onViewChange(type)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
            currentView === type
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
