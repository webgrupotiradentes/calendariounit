import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { addMonths, subMonths } from 'date-fns';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { EventList } from '@/components/calendar/EventList';
import { EventDetailModal } from '@/components/calendar/EventDetailModal';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useCategories } from '@/hooks/useCategories';
import { CalendarEvent } from '@/types/calendar';
import { Button } from '@/components/ui/button';

const LocationCalendar = () => {
  const { location } = useParams<{ location: string }>();
  const decodedLocation = decodeURIComponent(location || '');
  const { events, filterEvents } = useCalendarEvents();
  const { categories } = useCategories();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const locationEvents = filterEvents([], '', [], decodedLocation);
  const selectedCategory = selectedEvent ? categories.find(c => c.id === selectedEvent.categoryId) : undefined;

  const handlePrevious = useCallback(() => setCurrentDate(prev => subMonths(prev, 1)), []);
  const handleNext = useCallback(() => setCurrentDate(prev => addMonths(prev, 1)), []);
  const handleToday = useCallback(() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }, []);
  const handleSelectDate = useCallback((date: Date) => { setSelectedDate(date); setCurrentDate(date); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 lg:py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{decodedLocation}</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {locationEvents.length} evento{locationEvents.length !== 1 && 's'} neste local
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <div className="space-y-3">
              <CalendarHeader
                currentDate={currentDate}
                onPreviousMonth={handlePrevious}
                onNextMonth={handleNext}
                onToday={handleToday}
                viewType="month"
              />
              <CalendarGrid
                currentDate={currentDate}
                events={locationEvents}
                categories={categories}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                activeCategories={[]}
              />
            </div>
          </div>
          <aside className="lg:col-span-4">
            <EventList
              events={locationEvents}
              categories={categories}
              selectedDate={selectedDate}
              activeCategories={[]}
              onEventClick={setSelectedEvent}
            />
          </aside>
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

export default LocationCalendar;
