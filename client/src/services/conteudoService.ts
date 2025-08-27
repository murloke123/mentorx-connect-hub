/**
 * ===============================================================================
 * 📝 CONTEÚDO SERVICE - Gerenciamento de Conteúdos de Módulos
 * ===============================================================================
 * 
 * 🎯 OBJETIVO: Gerenciar conteúdos dentro dos módulos dos cursos (texto, vídeo, PDF)
 * 
 * 📋 MÉTODOS DISPONÍVEIS:
 * 
 * 🔍 CONSULTA DE CONTEÚDOS:
 * • getConteudosByModuloId() - Lista todos os conteúdos de um módulo
 * • getConteudoById() - Busca conteúdo específico por ID
 * 
 * ✏️ CRIAÇÃO DE CONTEÚDOS:
 * • criarConteudoTexto() - Cria conteúdo de texto rico/HTML
 * • criarConteudoVideo() - Cria conteúdo de vídeo externo (YouTube, Vimeo)
 * • criarConteudoPDF() - Cria conteúdo PDF com upload automático
 * 
 * 🔧 EDIÇÃO E GESTÃO:
 * • atualizarConteudo() - Atualiza dados de um conteúdo existente
 * • excluirConteudo() - Remove conteúdo do módulo
 * • reordenarConteudos() - Reordena lista de conteúdos por drag&drop
 * 
 * 🔧 RECURSOS:
 * • Sistema automático de ordenação (order_index)
 * • Upload automático de PDFs para Supabase Storage
 * • Validação de tipos de conteúdo
 * • Toast notifications para feedback
 * • Tratamento robusto de erros
 * • TypeScript completo com interfaces
 * 
 * 📚 TIPOS DE CONTEÚDO SUPORTADOS:
 * • texto_rico - Editor rich text (HTML)
 * • video_externo - URLs de vídeo (YouTube, Vimeo, etc.)
 * • pdf - Arquivos PDF com upload
 * 
 * 💡 INTERFACE:
 * • Conteudo - Estrutura completa de conteúdo
 * • content_data - Dados específicos por tipo de conteúdo
 * 
 * 🔄 FLUXO TÍPICO:
 * 1. getConteudosByModuloId() - Carrega lista
 * 2. criarConteudo*() - Adiciona novo conteúdo
 * 3. reordenarConteudos() - Organiza ordem
 * 4. atualizarConteudo() - Edita existente
 * ===============================================================================
 */

import { toast } from '../hooks/use-toast';
import { supabase } from '../utils/supabase';

export interface Conteudo {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  content_type: 'texto_rico' | 'video_externo' | 'pdf' | 'cta_button';
  content_data?: {
    texto?: string;
    video_url?: string;
    pdf_url?: string;
    button_name?: string;
    redirect_url?: string;
    [key: string]: unknown;
  };
  cta_button_name?: string;
  cta_redirect_url?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Obter todos os conteúdos de um módulo
export async function getConteudosByModuloId(moduloId: string): Promise<Conteudo[]> {
  try {
    const { data, error } = await supabase
      .from("conteudos")
      .select("*")
      .eq("module_id", moduloId)
      .order("order_index", { ascending: true });

    if (error) throw error;
    
    // Garantir que os dados retornados sejam do tipo Conteudo[]
    return (data || []).map(item => ({
      ...item,
      content_type: item.content_type as 'texto_rico' | 'video_externo' | 'pdf' | 'cta_button',
      content_data: item.content_data as Conteudo['content_data']
    }));
  } catch (error) {
    console.error("Erro ao buscar conteúdos:", error);
    toast({
      title: "Erro ao carregar conteúdos",
      description: "Não foi possível carregar os conteúdos deste módulo.",
      variant: "destructive",
    });
    return [];
  }
}

// Obter um conteúdo específico por ID
export async function getConteudoById(conteudoId: string): Promise<Conteudo | null> {
  try {
    const { data, error } = await supabase
      .from("conteudos")
      .select("*")
      .eq("id", conteudoId)
      .single();

    if (error) throw error;
    
    if (!data) return null;
    
    return {
      ...data,
      content_type: data.content_type as 'texto_rico' | 'video_externo' | 'pdf' | 'cta_button',
      content_data: data.content_data as Conteudo['content_data']
    };
  } catch (error) {
    console.error("Erro ao buscar conteúdo:", error);
    toast({
      title: "Erro ao carregar conteúdo",
      description: "Não foi possível carregar os detalhes do conteúdo.",
      variant: "destructive",
    });
    return null;
  }
}

// Criar um novo conteúdo de texto rico
export async function criarConteudoTexto(dados: {
  module_id: string;
  title: string;
  description?: string;
  texto: string;
}): Promise<Conteudo | null> {
  try {
    // Verificar a ordem máxima atual para o módulo
    const { data: conteudosExistentes } = await supabase
      .from("conteudos")
      .select("order_index")
      .eq("module_id", dados.module_id)
      .order("order_index", { ascending: false })
      .limit(1);

    const novaOrdem = conteudosExistentes && conteudosExistentes.length > 0 
      ? conteudosExistentes[0].order_index + 1 
      : 0;

    const { data, error } = await supabase
      .from("conteudos")
      .insert({
        module_id: dados.module_id,
        title: dados.title,
        description: dados.description,
        content_type: 'texto_rico' as const,
        content_data: {
          texto: dados.texto
        },
        order_index: novaOrdem,
      })
      .select()
      .single();

    if (error) throw error;
    
    toast({
      title: "Conteúdo criado com sucesso",
      description: "O conteúdo de texto foi adicionado ao módulo.",
    });
    
    return {
      ...data,
      content_type: data.content_type as 'texto_rico' | 'video_externo' | 'pdf' | 'cta_button',
      content_data: data.content_data as Conteudo['content_data']
    };
  } catch (error) {
    console.error("Erro ao criar conteúdo:", error);
    toast({
      title: "Erro ao criar conteúdo",
      description: "Não foi possível criar o conteúdo. Tente novamente.",
      variant: "destructive",
    });
    return null;
  }
}

// Criar um novo conteúdo de vídeo
export async function criarConteudoVideo(dados: {
  module_id: string;
  title: string;
  description?: string;
  video_url: string;
}): Promise<Conteudo | null> {
  try {
    // Verificar a ordem máxima atual para o módulo
    const { data: conteudosExistentes } = await supabase
      .from("conteudos")
      .select("order_index")
      .eq("module_id", dados.module_id)
      .order("order_index", { ascending: false })
      .limit(1);

    const novaOrdem = conteudosExistentes && conteudosExistentes.length > 0 
      ? conteudosExistentes[0].order_index + 1 
      : 0;

    const { data, error } = await supabase
      .from("conteudos")
      .insert({
        module_id: dados.module_id,
        title: dados.title,
        description: dados.description,
        content_type: 'video_externo' as const,
        content_data: {
          video_url: dados.video_url
        },
        order_index: novaOrdem,
      })
      .select()
      .single();

    if (error) throw error;
    
    toast({
      title: "Conteúdo criado com sucesso",
      description: "O conteúdo de vídeo foi adicionado ao módulo.",
    });
    
    return {
      ...data,
      content_type: data.content_type as 'texto_rico' | 'video_externo' | 'pdf' | 'cta_button',
      content_data: data.content_data as Conteudo['content_data']
    };
  } catch (error) {
    console.error("Erro ao criar conteúdo:", error);
    toast({
      title: "Erro ao criar conteúdo",
      description: "Não foi possível criar o conteúdo. Tente novamente.",
      variant: "destructive",
    });
    return null;
  }
}

// Criar um novo conteúdo de PDF
export async function criarConteudoPDF(dados: {
  module_id: string;
  title: string;
  description?: string;
  pdf_file: File;
}): Promise<Conteudo | null> {
  try {
    // 1. Fazer upload do PDF para o Supabase Storage
    const fileExt = dados.pdf_file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `pdfs/${dados.module_id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('mentorxbucket')
      .upload(filePath, dados.pdf_file);

    if (uploadError) {
      throw uploadError;
    }

    // 2. Obter a URL pública do arquivo
    const { data: publicUrlData } = supabase.storage
      .from('mentorxbucket')
      .getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('Não foi possível obter a URL pública do PDF.');
    }

    // 3. Salvar informações na tabela conteudos
    const { data: conteudosExistentes } = await supabase
      .from("conteudos")
      .select("order_index")
      .eq("module_id", dados.module_id)
      .order("order_index", { ascending: false })
      .limit(1);

    const novaOrdem = conteudosExistentes && conteudosExistentes.length > 0 
      ? conteudosExistentes[0].order_index + 1 
      : 0;

    const { data, error: insertError } = await supabase
      .from("conteudos")
      .insert({
        module_id: dados.module_id,
        title: dados.title,
        description: dados.description,
        content_type: 'pdf' as const,
        content_data: {
          pdf_url: publicUrlData.publicUrl,
          file_name: dados.pdf_file.name,
          file_size: dados.pdf_file.size,
          storage_path: filePath, // Armazenar o caminho do arquivo para facilitar a exclusão
        },
        order_index: novaOrdem,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    
    toast({
      title: "Conteúdo PDF criado com sucesso",
      description: "O arquivo PDF foi adicionado ao módulo.",
    });
    
    return {
      ...data,
      content_type: data.content_type as 'pdf', // Garantir o tipo correto
      content_data: data.content_data as Conteudo['content_data']
    };
  } catch (error: unknown) {
    console.error("Erro ao criar conteúdo PDF:", error);
    toast({
      title: "Erro ao criar conteúdo PDF",
      description: error instanceof Error ? error.message : "Não foi possível criar o conteúdo PDF. Verifique o console para mais detalhes.",
      variant: "destructive",
    });
    return null;
  }
}

// Atualizar um conteúdo existente de texto rico
export async function atualizarConteudo(
  conteudoId: string,
  dados: {
    title?: string;
    description?: string;
    content_data?: Conteudo['content_data'];
    cta_button_name?: string;
    cta_redirect_url?: string;
  }
): Promise<Conteudo | null> {
  try {
    // Primeiro, obtemos o conteúdo atual para preservar os dados que não serão alterados
    const { data: conteudoAtual } = await supabase
      .from("conteudos")
      .select("content_data")
      .eq("id", conteudoId)
      .single();
    
    // Criar um objeto para armazenar os dados do conteúdo atualizados
    const dadosConteudoAtuais = conteudoAtual?.content_data as Conteudo['content_data'] || {};
    
    const dadosConteudoAtualizados = {
      ...dadosConteudoAtuais,
      ...dados.content_data
    };
    
    const atualizacoes: Partial<Conteudo> = {};
    if (dados.title !== undefined) atualizacoes.title = dados.title;
    if (dados.description !== undefined) atualizacoes.description = dados.description;
    if (dados.cta_button_name !== undefined) atualizacoes.cta_button_name = dados.cta_button_name;
    if (dados.cta_redirect_url !== undefined) atualizacoes.cta_redirect_url = dados.cta_redirect_url;
    atualizacoes.content_data = dadosConteudoAtualizados;

    const { data, error } = await supabase
      .from("conteudos")
      .update(atualizacoes)
      .eq("id", conteudoId)
      .select()
      .single();

    if (error) throw error;
    
    toast({
      title: "Conteúdo atualizado",
      description: "As alterações foram salvas com sucesso.",
    });
    
    return {
      ...data,
      content_type: data.content_type as 'texto_rico' | 'video_externo' | 'pdf' | 'cta_button',
      content_data: data.content_data as Conteudo['content_data']
    };
  } catch (error) {
    console.error("Erro ao atualizar conteúdo:", error);
    toast({
      title: "Erro ao atualizar conteúdo",
      description: "Não foi possível salvar as alterações. Tente novamente.",
      variant: "destructive",
    });
    return null;
  }
}

// Excluir um conteúdo
export async function excluirConteudo(conteudoId: string): Promise<boolean> {
  try {
    // 1. Primeiro, obtemos os dados do conteúdo para verificar se é um PDF
    const { data: conteudo } = await supabase
      .from("conteudos")
      .select("*")
      .eq("id", conteudoId)
      .single();

    if (!conteudo) {
      throw new Error("Conteúdo não encontrado");
    }

    // 2. Se for um PDF, precisamos excluir o arquivo do storage
    if (conteudo.content_type === 'pdf' && conteudo.content_data) {
      const dados = conteudo.content_data as { storage_path?: string };
      
      // Verificar se temos o caminho do arquivo no storage
      if (dados.storage_path) {
        const { error: deleteFileError } = await supabase.storage
          .from('mentorxbucket')
          .remove([dados.storage_path]);
        
        if (deleteFileError) {
          console.error("Erro ao excluir arquivo do storage:", deleteFileError);
          // Não interrompemos o fluxo para permitir a exclusão do registro mesmo se o arquivo falhar
        }
      }
    }

    // 3. Excluir o registro do conteúdo
    const { error } = await supabase
      .from("conteudos")
      .delete()
      .eq("id", conteudoId);

    if (error) throw error;
    
    toast({
      title: "Conteúdo excluído",
      description: "O conteúdo foi removido com sucesso.",
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao excluir conteúdo:", error);
    toast({
      title: "Erro ao excluir conteúdo",
      description: "Não foi possível excluir o conteúdo. Tente novamente.",
      variant: "destructive",
    });
    return false;
  }
}

// Reordenar conteúdos
export async function reordenarConteudos(
  moduloId: string,
  ordenacao: { id: string; order_index: number }[]
): Promise<boolean> {
  try {
    // Usar uma transação para atualizar todos os conteúdos de uma vez
    for (const item of ordenacao) {
      const { error } = await supabase
        .from("conteudos")
        .update({ order_index: item.order_index })
        .eq("id", item.id)
        .eq("module_id", moduloId);
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao reordenar conteúdos:", error);
    toast({
      title: "Erro ao reordenar conteúdos",
      description: "Não foi possível salvar a nova ordem dos conteúdos.",
      variant: "destructive",
    });
    return false;
  }
}
