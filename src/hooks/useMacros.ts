import { useState, useEffect, useCallback } from 'react';
import { Macro } from '@/types/calendar';
import { supabase } from '@/integrations/supabase/client';


export function useMacros() {
    const [macros, setMacros] = useState<Macro[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    const fetchMacros = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('macros')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching macros:', error);
        } else {
            setMacros(
                (data || []).map((row) => ({
                    id: row.id,
                    name: row.name,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                }))
            );
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchMacros();
    }, [fetchMacros]);

    const addMacro = useCallback(async (macro: Omit<Macro, 'id' | 'createdAt' | 'updatedAt'>) => {
        const { data, error } = await supabase
            .from('macros')
            .insert({
                name: macro.name,
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding macro:', error);
            throw error;
        }
        if (data) {
            const newMacro: Macro = {
                id: data.id,
                name: data.name,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            };
            setMacros((prev) => [...prev, newMacro]);

            return newMacro;
        }
    }, []);

    const updateMacro = useCallback(async (id: string, updates: Partial<Omit<Macro, 'id' | 'createdAt'>>) => {
        const updateData: any = {};
        if (updates.name !== undefined) updateData.name = updates.name;

        const { error } = await supabase
            .from('macros')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Error updating macro:', error);
            throw error;
        }
        const macName = macros.find(m => m.id === id)?.name || id;

        setMacros((prev) =>
            prev.map((m) =>
                m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
            )
        );
    }, [macros]);

    const deleteMacro = useCallback(async (id: string) => {
        const { error } = await supabase
            .from('macros')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting macro:', error);
            throw error;
        }
        const macName = macros.find(m => m.id === id)?.name || id;

        setMacros((prev) => prev.filter((m) => m.id !== id));
    }, [macros]);

    return {
        macros,
        isLoading,
        addMacro,
        updateMacro,
        deleteMacro,
        refetch: fetchMacros,
    };
}
