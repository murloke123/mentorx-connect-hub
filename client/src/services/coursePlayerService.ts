import { supabase } from '../utils/supabase';

// Tipos para o player de curso - compatíveis com types.ts e schema
export type ConteudoItemLocal = {
  id: string;
  title: string; // nome_conteudo -> title
  content_type: 'video_externo' | 'texto_rico' | 'pdf'; // tipo_conteudo -> content_type
  content_data: { // dados_conteudo -> content_data
    url?: string;
    video_url?: string; // Campo usado no banco de dados
    html_content?: string;
    pdf_url?: string;
    pdf_filename?: string;
    provider?: 'youtube' | 'vimeo';
  };
  ordem: number; // order_index -> ordem (compatibilidade)
  module_id: string; // modulo_id -> module_id (CORRIGIDO)
  created_at: string;
  updated_at: string;
};

export type ModuloItemLocal = {
  id: string;
  title: string; // nome_modulo -> title
  description?: string; // descricao_modulo -> description
  order_index: number; // ordem -> order_index
  course_id: string; // curso_id -> course_id
  created_at: string;
  updated_at: string;
  conteudos: ConteudoItemLocal[];
};

export type CursoItemLocal = {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  mentor_id: string; // Adicionar campo faltante
  is_public?: boolean;
  is_paid?: boolean;
  price?: number;
  modulos: ModuloItemLocal[];
};

// Buscar curso completo com módulos e conteúdos
export async function getCursoCompleto(cursoId: string): Promise<CursoItemLocal | null> {
  try {
    // Buscar curso
    const { data: curso, error: cursoError } = await supabase
      .from('cursos')
      .select('id, title, description, image_url, mentor_id, is_public, is_paid, price')
      .eq('id', cursoId)
      .single();

    if (cursoError) throw cursoError;
    if (!curso) return null;

    // Buscar módulos do curso
    const { data: modulos, error: modulosError } = await supabase
      .from('modulos')
      .select('*')
      .eq("course_id", cursoId) // curso_id -> course_id
      .order('order_index', { ascending: true }); // ordem -> order_index

    if (modulosError) throw modulosError;

    // Buscar conteúdos para cada módulo
    const modulosComConteudos: ModuloItemLocal[] = [];
    
    for (const modulo of modulos || []) {
      const { data: conteudos, error: conteudosError } = await supabase
        .from('conteudos')
        .select('*')
        .eq('module_id', modulo.id) // CORRIGIDO: modulo_id -> module_id
        .order('order_index', { ascending: true }); // ordem -> order_index

      if (conteudosError) {
        console.error('Erro ao buscar conteúdos:', conteudosError);
        continue;
      }

      modulosComConteudos.push({
        id: modulo.id,
        title: modulo.title, // nome_modulo -> title
        description: modulo.description, // descricao_modulo -> description
        order_index: modulo.order_index, // ordem -> order_index
        course_id: modulo.course_id, // curso_id -> course_id
        created_at: modulo.created_at,
        updated_at: modulo.updated_at,
        conteudos: (conteudos || []).map(conteudo => ({
          id: conteudo.id,
          title: conteudo.title, // nome_conteudo -> title
          content_type: conteudo.content_type as 'texto_rico' | 'video_externo' | 'pdf', // tipo_conteudo -> content_type
          content_data: conteudo.content_data, // dados_conteudo -> content_data
          ordem: conteudo.order_index, // order_index -> ordem (compatibilidade)
          module_id: conteudo.module_id, // CORRIGIDO: modulo_id -> module_id
          created_at: conteudo.created_at,
          updated_at: conteudo.updated_at
        }))
      });
    }

    return {
      id: curso.id,
      title: curso.title,
      description: curso.description,
      image_url: curso.image_url,
      mentor_id: curso.mentor_id,
      is_public: curso.is_public,
      is_paid: curso.is_paid,
      price: curso.price,
      modulos: modulosComConteudos
    };

  } catch (error) {
    console.error('Erro ao buscar curso completo:', error);
    return null;
  }
}
