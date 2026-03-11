import { useState, useEffect, useCallback } from 'react';
import { Category } from '@/types/calendar';
import { supabase } from '@/integrations/supabase/client';


function dbToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories((data || []).map(dbToCategory));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = useCallback(async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        color: category.color,
        description: category.description || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      throw error;
    }
    if (data) {
      const newCat = dbToCategory(data);
      setCategories(prev => [...prev, newCat]);

      return newCat;
    }
  }, []);

  const updateCategory = useCallback(async (id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>) => {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.description !== undefined) updateData.description = updates.description || null;

    const { error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }
    const catName = categories.find(c => c.id === id)?.name || id;

    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
  }, [categories]);

  const deleteCategory = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
    const catName = categories.find(c => c.id === id)?.name || id;

    setCategories(prev => prev.filter(c => c.id !== id));
  }, [categories]);

  const getCategoryById = useCallback((id: string) => {
    return categories.find(category => category.id === id);
  }, [categories]);

  return {
    categories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    refetch: fetchCategories,
  };
}
