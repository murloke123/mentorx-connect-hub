import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/types/database';

// Export Category type for external use
export type { Category } from '@/types/database';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Buscar todas as categorias ativas
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as categorias."
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar todas as categorias (incluindo inativas) - para admin
  const fetchAllCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar todas as categorias:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as categorias."
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Criar nova categoria
    const createCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'slug'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!"
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar a categoria."
      });
      throw error;
    }
  };

  // Atualizar categoria
  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => 
        prev.map(cat => cat.id === id ? { ...cat, ...data } : cat)
      );
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!"
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar a categoria."
      });
      throw error;
    }
  };

  // Deletar categoria (exclusão real)
  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir a categoria."
      });
      throw error;
    }
  };

  // Alternar status da categoria
  const toggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ is_active: !currentStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => 
        prev.map(cat => cat.id === id ? { ...cat, ...data } : cat)
      );
      toast({
        title: "Sucesso",
        description: `Categoria ${!currentStatus ? 'ativada' : 'desativada'} com sucesso!`
      });
      return data;
    } catch (error) {
      console.error('Erro ao alterar status da categoria:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível alterar o status da categoria."
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    fetchCategories,
    fetchAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
  };
}; 