import { useState, useEffect, useCallback } from 'react';
import { Micro } from '@/types/calendar';
import { supabase } from '@/integrations/supabase/client';


export function useMicros() {
    const [micros, setMicros] = useState<Micro[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    const fetchMicros = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('micros')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching micros:', error);
        } else {
            setMicros(
                (data || []).map((row) => ({
                    id: row.id,
                    name: row.name,
                    macroId: row.macro_id,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                }))
            );
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchMicros();
    }, [fetchMicros]);

    const addMicro = useCallback(async (micro: Omit<Micro, 'id' | 'createdAt' | 'updatedAt'>) => {
        const { data, error } = await supabase
            .from('micros')
            .insert({
                name: micro.name,
                macro_id: micro.macroId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding micro:', error);
            throw error;
        }
        if (data) {
            const newMicro: Micro = {
                id: data.id,
                name: data.name,
                macroId: data.macro_id,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            };
            setMicros((prev) => [...prev, newMicro]);

            return newMicro;
        }
    }, []);

    const updateMicro = useCallback(async (id: string, updates: Partial<Omit<Micro, 'id' | 'createdAt'>>) => {
        const updateData: any = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.macroId !== undefined) updateData.macro_id = updates.macroId;

        const { error } = await supabase
            .from('micros')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Error updating micro:', error);
            throw error;
        }
        const microName = micros.find(m => m.id === id)?.name || id;

        setMicros((prev) =>
            prev.map((m) =>
                m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
            )
        );
    }, [micros]);

    const deleteMicro = useCallback(async (id: string) => {
        const { error } = await supabase
            .from('micros')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting micro:', error);
            throw error;
        }
        const microName = micros.find(m => m.id === id)?.name || id;

        setMicros((prev) => prev.filter((m) => m.id !== id));
    }, [micros]);

    return {
        micros,
        isLoading,
        addMicro,
        updateMicro,
        deleteMicro,
        refetch: fetchMicros,
    };
}
