/**
 * ===============================================================================
 * 📚 MÓDULO SERVICE - Gerenciamento de Módulos de Cursos
 * ===============================================================================
 * 
 * 🎯 OBJETIVO: Gerenciar módulos dentro dos cursos (estrutura hierárquica)
 * 
 * 📋 MÉTODOS DISPONÍVEIS:
 * 
 * 🔍 CONSULTA DE MÓDULOS:
 * • getModulosByCursoId() - Lista todos os módulos de um curso
 * • getModuloById() - Busca módulo específico por ID
 * 
 * ✏️ CRIAÇÃO E EDIÇÃO:
 * • criarModulo() - Cria novo módulo em um curso
 * • editarModulo() - Edita módulo existente (interface específica)
 * • atualizarModulo() - Atualiza módulo existente (interface flexível)
 * 
 * 🗑️ EXCLUSÃO E ORGANIZAÇÃO:
 * • deletarModulo() - Remove módulo do curso
 * • reordenarModulos() - Reordena lista de módulos por drag&drop
 * 
 * 🔧 RECURSOS:
 * • Sistema automático de ordenação (order_index)
 * • Gestão automática da próxima ordem disponível
 * • Toast notifications para feedback do usuário
 * • Tratamento robusto de erros
 * • TypeScript completo com interfaces tipadas
 * • Validação automática de dados
 * 
 * 📝 ESTRUTURA HIERÁRQUICA:
 * • Curso → Módulo → Conteúdo
 * • Módulos organizam conteúdos em seções lógicas
 * • Order_index determina ordem de exibição
 * 
 * 💡 INTERFACES:
 * • Modulo - Estrutura completa do módulo
 * • CriarModuloData - Dados para criação
 * • EditarModuloData - Dados para edição completa
 * • AtualizarModuloData - Dados para atualização parcial
 * 
 * 🔄 FLUXO TÍPICO:
 * 1. getModulosByCursoId() - Carrega módulos do curso
 * 2. criarModulo() - Adiciona novo módulo
 * 3. reordenarModulos() - Organiza ordem
 * 4. editarModulo() / atualizarModulo() - Modifica existente
 * 5. deletarModulo() - Remove se necessário
 * ===============================================================================
 */

import { toast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";

export interface Modulo {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Interface para criação de módulo
export interface CriarModuloData {
  course_id: string;
  title: string;
  description?: string;
  order_index?: number;
}

// Buscar módulos por curso
export async function getModulosByCursoId(cursoId: string): Promise<Modulo[]> {
  try {
    const { data, error } = await supabase
      .from("modulos")
      .select("*")
      .eq("course_id", cursoId)
      .order("order_index", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar módulos:", error);
    toast({
      title: "Erro ao carregar módulos",
      description: "Não foi possível carregar os módulos deste curso.",
      variant: "destructive",
    });
    return [];
  }
}

// Buscar módulo por ID
export async function getModuloById(id: string): Promise<Modulo | null> {
  try {
    const { data, error } = await supabase
      .from("modulos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao buscar módulo:", error);
    toast({
      title: "Erro ao carregar módulo",
      description: "Não foi possível carregar os detalhes do módulo.",
      variant: "destructive",
    });
    return null;
  }
}

// Criar novo módulo
export async function criarModulo(dados: CriarModuloData): Promise<Modulo | null> {
  try {
    // Buscar a próxima ordem
    const { data: modulosExistentes } = await supabase
      .from("modulos")
      .select("order_index")
      .eq("course_id", dados.course_id)
      .order("order_index", { ascending: false })
      .limit(1);

    const proximaOrdem = modulosExistentes && modulosExistentes.length > 0 
      ? (modulosExistentes[0].order_index || 0) + 1 
      : 1;

    const { data, error } = await supabase
      .from("modulos")
      .insert({
        course_id: dados.course_id,
        title: dados.title,
        description: dados.description,
        order_index: dados.order_index ?? proximaOrdem,
      })
      .select()
      .single();

    if (error) throw error;
    
    toast({
      title: "Módulo criado com sucesso",
      description: "O módulo foi adicionado ao curso.",
    });
    
    return data;
  } catch (error) {
    console.error("Erro ao criar módulo:", error);
    toast({
      title: "Erro ao criar módulo",
      description: "Não foi possível criar o módulo. Tente novamente.",
      variant: "destructive",
    });
    return null;
  }
}

// Interface para edição de módulo
export interface EditarModuloData {
  id: string;
  course_id: string;
  title: string;
  description?: string;
}

// Editar módulo
export async function editarModulo(dados: EditarModuloData): Promise<Modulo | null> {
  try {
    const { data, error } = await supabase
      .from("modulos")
      .update({
        title: dados.title,
        description: dados.description,
      })
      .eq("id", dados.id)
      .select()
      .single();

    if (error) throw error;
    
    toast({
      title: "Módulo atualizado",
      description: "As alterações foram salvas com sucesso.",
    });
    
    return data;
  } catch (error) {
    console.error("Erro ao editar módulo:", error);
    toast({
      title: "Erro ao editar módulo",
      description: "Não foi possível salvar as alterações. Tente novamente.",
      variant: "destructive",
    });
    return null;
  }
}

// Interface para atualização de módulo
export interface AtualizarModuloData {
  title?: string;
  description?: string;
}

// Atualizar módulo
export async function atualizarModulo(id: string, dados: AtualizarModuloData): Promise<Modulo | null> {
  try {
    const { data, error } = await supabase
      .from("modulos")
      .update(dados)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    
    toast({
      title: "Módulo atualizado",
      description: "As alterações foram salvas com sucesso.",
    });
    
    return data;
  } catch (error) {
    console.error("Erro ao atualizar módulo:", error);
    toast({
      title: "Erro ao atualizar módulo",
      description: "Não foi possível salvar as alterações. Tente novamente.",
      variant: "destructive",
    });
    return null;
  }
}

// Deletar módulo
export async function deletarModulo(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("modulos")
      .delete()
      .eq("id", id);

    if (error) throw error;
    
    toast({
      title: "Módulo excluído",
      description: "O módulo foi removido com sucesso.",
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao excluir módulo:", error);
    toast({
      title: "Erro ao excluir módulo",
      description: "Não foi possível excluir o módulo. Tente novamente.",
      variant: "destructive",
    });
    return false;
  }
}

// Reordenar módulos
export async function reordenarModulos(
  cursoId: string,
  ordenacao: { id: string; order_index: number }[]
): Promise<boolean> {
  try {
    for (const item of ordenacao) {
      const { error } = await supabase
        .from("modulos")
        .update({ order_index: item.order_index })
        .eq("id", item.id);
      
      if (error) throw error;
    }
    
    toast({
      title: "Módulos reordenados",
      description: "A nova ordem dos módulos foi salva com sucesso.",
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao reordenar módulos:", error);
    toast({
      title: "Erro ao reordenar módulos",
      description: "Não foi possível salvar a nova ordem dos módulos.",
      variant: "destructive",
    });
    return false;
  }
}
