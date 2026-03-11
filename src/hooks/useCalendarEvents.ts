import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent, IES } from '@/types/calendar';
import { supabase } from '@/integrations/supabase/client';


function dbToEvent(row: any): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    date: row.date ? row.date.split('T')[0] : '',
    endDate: row.end_date ? row.end_date.split('T')[0] : undefined,
    startTime: row.start_time || null,
    endTime: row.end_time || null,
    categoryId: row.category_id || '',
    ies: undefined, // deprecated
    location: undefined, // deprecated
    macroId: row.macro_id || null,
    microId: row.micro_id || null,
    macroName: row.macros?.name || null,
    microName: row.micros?.name || null,
    link: row.link || undefined,
    allDay: row.all_day ?? (row.start_time ? false : true),
    createdBy: row.created_by || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*, macros (name), micros (name)')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents((data || []).map(dbToEvent));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const addEvent = useCallback(async (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: event.title,
        description: event.description || null,
        date: event.date,
        end_date: event.endDate || null,
        start_time: event.startTime || null,
        end_time: event.endTime || null,
        all_day: event.allDay,
        category_id: event.categoryId || null,
        macro_id: event.macroId || null,
        micro_id: event.microId || null,
        link: event.link || null,
        created_by: userData?.user?.id || null,
      })
      .select('*, macros (name), micros (name)')
      .single();

    if (error) {
      console.error('Error adding event:', error);
      throw error;
    }
    if (data) {
      const newEvent = dbToEvent(data);
      setEvents(prev => [...prev, newEvent]);

      return newEvent;
    }
  }, []);

  const updateEvent = useCallback(async (id: string, updates: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>) => {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate || null;
    if (updates.startTime !== undefined) updateData.start_time = updates.startTime || null;
    if (updates.endTime !== undefined) updateData.end_time = updates.endTime || null;
    if (updates.allDay !== undefined) updateData.all_day = updates.allDay;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId || null;
    if (updates.macroId !== undefined) updateData.macro_id = updates.macroId || null;
    if (updates.microId !== undefined) updateData.micro_id = updates.microId || null;
    if (updates.link !== undefined) updateData.link = updates.link || null;

    const { error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating event:', error);
      throw error;
    }
    const evtName = events.find(e => e.id === id)?.title || id;

    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e));
  }, [events]);

  const deleteEvent = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
    const evtName = events.find(e => e.id === id)?.title || id;

    setEvents(prev => prev.filter(e => e.id !== id));
  }, [events]);

  const getEventsByDate = useCallback((date: string) => {
    return events.filter(event => {
      const eventStart = event.date;
      const eventEnd = event.endDate || event.date;
      return date >= eventStart && date <= eventEnd;
    });
  }, [events]);

  const getEventsByMonth = useCallback((year: number, month: number) => {
    return events.filter(event => {
      const eventYear = Number(event.date.slice(0, 4));
      const eventMonth = Number(event.date.slice(5, 7)) - 1;
      return eventYear === year && eventMonth === month;
    });
  }, [events]);

  const filterEvents = useCallback((categories: string[], searchQuery: string, macroFilter: string[] = [], microFilter?: string) => {
    return events.filter(event => {
      const matchesCategory = categories.length === 0 || categories.includes(event.categoryId);
      const matchesMacro = macroFilter.length === 0 || (event.macroId && macroFilter.includes(event.macroId));
      const matchesSearch = searchQuery === '' ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMicro = !microFilter || event.microId === microFilter;
      return matchesCategory && matchesSearch && matchesMacro && matchesMicro;
    });
  }, [events]);

  const getLocations = useCallback(() => {
    // Deprecated, UI should use useMicros() instead
    const locs = new Set<string>();
    events.forEach(e => {
      if (e.microId) locs.add(e.microId);
    });
    return Array.from(locs).sort();
  }, [events]);

  const checkLocationAvailability = useCallback((microId: string, date: string, endDate?: string, excludeEventId?: string) => {
    const eventEnd = endDate || date;
    return events.filter(e => {
      if (excludeEventId && e.id === excludeEventId) return false;
      if (e.microId !== microId) return false;
      const eEnd = e.endDate || e.date;
      return date <= eEnd && eventEnd >= e.date;
    });
  }, [events]);

  return {
    events,
    isLoading,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsByDate,
    getEventsByMonth,
    filterEvents,
    getLocations,
    checkLocationAvailability,
    refetch: fetchEvents,
  };
}
