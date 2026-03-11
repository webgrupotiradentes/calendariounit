import { CalendarEvent, Category } from '@/types/calendar';
import { Calendar } from 'lucide-react';

interface AdminStatsProps {
  events: CalendarEvent[];
  categories: Category[];
}

export function AdminStats({ events, categories }: AdminStatsProps) {
  const categoryCounts = events.reduce((acc, event) => {
    acc[event.categoryId] = (acc[event.categoryId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <div className="glass rounded-2xl p-4 shadow-apple">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{events.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      {categories.slice(0, 5).map((category) => (
        <div key={category.id} className="glass rounded-2xl p-4 shadow-apple">
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ backgroundColor: `hsl(${category.color} / 0.15)` }}
            >
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: `hsl(${category.color})` }}
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {categoryCounts[category.id] || 0}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-[80px]">{category.name}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
