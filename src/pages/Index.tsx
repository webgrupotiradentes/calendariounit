import { useState, useCallback } from 'react';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, addYears, subYears } from 'date-fns';
import { X, ChevronDown } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { EventList } from '@/components/calendar/EventList';
import { EventDetailModal } from '@/components/calendar/EventDetailModal';
import { SearchBar } from '@/components/calendar/SearchBar';
import { ViewSelector, CalendarViewType } from '@/components/calendar/ViewSelector';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';
import { YearView } from '@/components/calendar/YearView';
import { PdfCalendarGenerator } from '@/components/calendar/PdfCalendarGenerator';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useCategories } from '@/hooks/useCategories';
import { useMacros } from '@/hooks/useMacros';
import { useMicros } from '@/hooks/useMicros';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

const Index = () => {
  const { events, filterEvents } = useCalendarEvents();
  const { categories } = useCategories();
  const { macros } = useMacros();
  const { micros } = useMicros();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeMacros, setActiveMacros] = useState<string[]>([]);
  const [activeMicro, setActiveMicro] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentView, setCurrentView] = useState<CalendarViewType>('month');

  // Filter micros based on selected macros (if any)
  const availableMicros = activeMacros.length > 0
    ? micros.filter(m => activeMacros.includes(m.macroId))
    : micros;

  const handlePrevious = useCallback(() => {
    setCurrentDate(prev => {
      switch (currentView) {
        case 'month': return subMonths(prev, 1);
        case 'week': return subWeeks(prev, 1);
        case 'day': return subDays(prev, 1);
        case 'year': return subYears(prev, 1);
      }
    });
  }, [currentView]);

  const handleNext = useCallback(() => {
    setCurrentDate(prev => {
      switch (currentView) {
        case 'month': return addMonths(prev, 1);
        case 'week': return addWeeks(prev, 1);
        case 'day': return addDays(prev, 1);
        case 'year': return addYears(prev, 1);
      }
    });
  }, [currentView]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  }, []);

  const handleToggleCategory = useCallback((categoryId: string) => {
    setActiveCategories(prev =>
      prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]
    );
  }, []);

  const handleToggleMacro = useCallback((macroId: string) => {
    setActiveMacros(prev => {
      if (prev.includes(macroId)) return [];
      return [macroId];
    });
    // Clear active micro since we are changing the parent macro (IES)
    setActiveMicro(undefined);
  }, []);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
  }, []);

  const clearAllFilters = () => {
    setActiveCategories([]);
    setActiveMacros([]);
    setActiveMicro(undefined);
    setSearchQuery('');
  };

  const handleClearCalendar = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(null);
    setCurrentView('month');
    clearAllFilters();
  }, []);

  const hasActiveFilters = activeCategories.length > 0 || activeMacros.length > 0 || activeMicro || searchQuery;

  const filteredEvents = filterEvents(activeCategories, searchQuery, activeMacros, activeMicro);
  const selectedCategory = selectedEvent ? categories.find(c => c.id === selectedEvent.categoryId) : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 lg:py-8">
        {/* ── Page title row ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Calendário Acadêmico
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe todas as datas importantes do ano letivo
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PdfCalendarGenerator events={events} categories={categories} />
            <ViewSelector currentView={currentView} onViewChange={setCurrentView} />
          </div>
        </div>

        {/* ── Filter bar ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mb-4">

          {/* Search */}
          <SearchBar value={searchQuery} onChange={setSearchQuery} className="w-48" />

          {/* Categories dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex items-center h-9 gap-1.5 px-3.5 rounded-full text-sm font-medium border transition-all',
                  activeCategories.length > 0
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-muted/60 text-foreground border-border hover:bg-muted'
                )}
              >
                Categorias
                {activeCategories.length > 0 && (
                  <span className="ml-1 bg-white/30 text-white rounded-full text-xs px-1.5 py-0.5 leading-none">
                    {activeCategories.length}
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 bg-popover shadow-lg border-border z-50">
              {categories.map(cat => (
                <DropdownMenuCheckboxItem
                  key={cat.id}
                  checked={activeCategories.includes(cat.id)}
                  onCheckedChange={() => handleToggleCategory(cat.id)}
                  className="gap-2"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                    style={{ backgroundColor: `hsl(${cat.color})` }}
                  />
                  {cat.name}
                </DropdownMenuCheckboxItem>
              ))}
              {activeCategories.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveCategories([])} className="text-destructive text-xs">
                    Limpar seleção
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* IES (Macros) - Toggle Group UI */}
          <div className="flex bg-muted/40 p-1 rounded-2xl border border-border/40 gap-1.5 max-w-full overflow-x-auto hide-scrollbar">
            {macros.map(mac => {
              const isActive = activeMacros.includes(mac.id);
              return (
                <button
                  key={mac.id}
                  onClick={() => handleToggleMacro(mac.id)}
                  className={cn(
                    'relative h-8 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300',
                    isActive
                      ? 'bg-card text-primary shadow-apple border border-border/40 scale-105'
                      : 'text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {mac.name}
                </button>
              );
            })}
          </div>

          {/* Locations dropdown */}
          {micros.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex items-center h-9 gap-1.5 px-3.5 rounded-full text-sm font-medium border transition-all',
                    activeMicro
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-muted/60 text-foreground border-border hover:bg-muted'
                  )}
                >
                  Local
                  {activeMicro && (
                    <span className="ml-1 text-xs opacity-80 max-w-[80px] truncate">
                      · {micros.find(m => m.id === activeMicro)?.name}
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 bg-popover shadow-lg border-border z-50">
                {activeMicro && (
                  <>
                    <DropdownMenuItem onClick={() => setActiveMicro(undefined)} className="text-destructive text-xs">
                      Limpar local
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {availableMicros.map(micro => (
                  <DropdownMenuCheckboxItem
                    key={micro.id}
                    checked={activeMicro === micro.id}
                    onCheckedChange={() => setActiveMicro(activeMicro === micro.id ? undefined : micro.id)}
                  >
                    {micro.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Active filter pills */}
          {activeCategories.map(catId => {
            const cat = categories.find(c => c.id === catId);
            if (!cat) return null;
            return (
              <span
                key={catId}
                className="flex items-center gap-1 h-7 px-2.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: `hsl(${cat.color})` }}
              >
                {cat.name}
                <button onClick={() => handleToggleCategory(catId)} className="hover:opacity-70 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {/* Active filter pills for Macros removed since they are visible as toggle buttons */}

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="h-7 px-3 rounded-full text-xs text-muted-foreground hover:text-destructive border border-border hover:border-destructive/40 transition-colors"
            >
              Limpar tudo
            </button>
          )}

          {/* Event count */}
          <span className="ml-auto text-xs text-muted-foreground">
            {filteredEvents.length} evento{filteredEvents.length !== 1 && 's'}
          </span>
        </div>

        {/* ── Full-width calendar ─────────────────────────────────── */}
        <div className="space-y-3">
          <CalendarHeader
            currentDate={currentDate}
            onPreviousMonth={handlePrevious}
            onNextMonth={handleNext}
            onToday={handleToday}
            onClear={handleClearCalendar}
            viewType={currentView}
          />

          {currentView === 'month' && (
            <CalendarGrid
              currentDate={currentDate}
              events={filteredEvents}
              categories={categories}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onEventClick={setSelectedEvent}
              activeCategories={activeCategories}
            />
          )}

          {currentView === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={filteredEvents}
              categories={categories}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              activeCategories={activeCategories}
              onEventClick={setSelectedEvent}
            />
          )}

          {currentView === 'day' && (
            <DayView
              currentDate={currentDate}
              events={filteredEvents}
              categories={categories}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              activeCategories={activeCategories}
              onEventClick={setSelectedEvent}
            />
          )}

          {currentView === 'year' && (
            <YearView
              currentDate={currentDate}
              events={filteredEvents}
              onDateClick={(date) => {
                handleSelectDate(date);
                setCurrentView('day');
              }}
            />
          )}
        </div>

        {/* ── Event list below calendar ───────────────────────────── */}
        <div className="mt-6">
          <EventList
            events={filteredEvents}
            categories={categories}
            selectedDate={selectedDate}
            activeCategories={activeCategories}
            onEventClick={setSelectedEvent}
          />
        </div>
      </main>

      <EventDetailModal
        event={selectedEvent}
        category={selectedCategory}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};

export default Index;
