import { Category, IES, IES_OPTIONS } from '@/types/calendar';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface CalendarLegendProps {
  categories: Category[];
  activeCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  activeIES: IES[];
  onToggleIES: (ies: IES) => void;
  locations?: string[];
  activeLocation?: string;
  onSelectLocation?: (location: string | undefined) => void;
}

export function CalendarLegend({
  categories = [], activeCategories = [], onToggleCategory,
  activeIES = [], onToggleIES,
  locations = [], activeLocation, onSelectLocation
}: CalendarLegendProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 space-y-5">
      {/* Categorias */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Categorias</h3>
        <div className="space-y-1">
          {categories.map((category) => {
            const isActive = activeCategories.length === 0 || activeCategories.includes(category.id);
            return (
              <button
                key={category.id}
                onClick={() => onToggleCategory(category.id)}
                className={cn(
                  "flex items-center gap-2.5 w-full p-2 rounded-lg transition-all text-sm",
                  isActive ? "bg-muted/50 hover:bg-muted" : "opacity-35 hover:opacity-60"
                )}
              >
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: `hsl(${category.color})` }} />
                <span className="font-medium text-foreground">{category.name}</span>
              </button>
            );
          })}
        </div>
        {activeCategories.length > 0 && (
          <button onClick={() => activeCategories.forEach(cat => onToggleCategory(cat))} className="mt-2 text-xs text-primary font-medium hover:underline">
            Limpar filtros
          </button>
        )}
      </div>

      {/* IES - Toggle switches */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">IES</h3>
        <div className="space-y-2">
          {IES_OPTIONS.map((option) => {
            const isActive = activeIES.includes(option.value);
            return (
              <div key={option.value} className="flex items-center justify-between p-1.5 rounded-lg">
                <span className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>{option.label}</span>
                <Switch
                  checked={isActive}
                  onCheckedChange={() => onToggleIES(option.value)}
                  className="scale-75"
                />
              </div>
            );
          })}
        </div>
        {activeIES.length > 0 && (
          <button onClick={() => activeIES.forEach(ies => onToggleIES(ies))} className="mt-2 text-xs text-primary font-medium hover:underline">
            Limpar filtros
          </button>
        )}
      </div>

      {/* Location filter */}
      {locations.length > 0 && onSelectLocation && (
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Local</h3>
          <div className="space-y-1">
            <button
              onClick={() => onSelectLocation(undefined)}
              className={cn(
                "flex items-center gap-2 w-full p-2 rounded-lg transition-all text-sm",
                !activeLocation ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
              )}
            >
              Todos os locais
            </button>
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => onSelectLocation(activeLocation === loc ? undefined : loc)}
                className={cn(
                  "flex items-center gap-2 w-full p-2 rounded-lg transition-all text-sm truncate",
                  activeLocation === loc ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                )}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
