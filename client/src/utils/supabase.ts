// ====================================================================
// SCHEMA PADRONIZADO DO SUPABASE - TODOS OS CAMPOS EM INGLÊS
// ====================================================================
// Este arquivo contém os tipos TypeScript para todas as tabelas do banco
// com campos padronizados em inglês
// ====================================================================

import { createClient } from '@supabase/supabase-js';

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          color: string | null;
          icon: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          color?: string | null;
          icon?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          color?: string | null;
          icon?: string | null;
        };
      };
      
      cursos: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          mentor_id: string;
          category_id: string | null;
          is_public: boolean | null;
          is_paid: boolean | null;
          price: number | null;
          discount: number | null;
          discounted_price: number | null;
          image_url: string | null;
          is_published: boolean | null;
          stripe_product_id: string | null;
          created_at: string | null;
          updated_at: string | null;
          category: string | null;
          landing_page_id: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          mentor_id: string;
          category_id?: string | null;
          is_public?: boolean | null;
          is_paid?: boolean | null;
          price?: number | null;
          discount?: number | null;
          discounted_price?: number | null;
          image_url?: string | null;
          is_published?: boolean | null;
          stripe_product_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          category?: string | null;
          landing_page_id?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          mentor_id?: string;
          category_id?: string | null;
          is_public?: boolean | null;
          is_paid?: boolean | null;
          price?: number | null;
          discount?: number | null;
          discounted_price?: number | null;
          image_url?: string | null;
          is_published?: boolean | null;
          stripe_product_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          category?: string | null;
          landing_page_id?: string | null;
        };
      };

      modulos: {
        Row: {
          id: string;
          course_id: string; // Após migração: curso_id -> course_id
          title: string; // Após migração: nome_modulo -> title
          description: string | null; // Após migração: descricao_modulo -> description
          order_index: number; // Após migração: ordem -> order_index
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          order_index?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string | null;
          order_index?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };

      conteudos: {
        Row: {
          id: string;
          module_id: string;
          title: string; // Após migração: nome_conteudo -> title
          description: string | null; // Após migração: descricao_conteudo -> description
          content_type: string; // Após migração: tipo_conteudo -> content_type
          content_data: Record<string, unknown> | null; // Após migração: dados_conteudo -> content_data
          order_index: number; // Após migração: ordem -> order_index
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          description?: string | null;
          content_type: string;
          content_data?: Record<string, unknown> | null;
          order_index?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          description?: string | null;
          content_type?: string;
          content_data?: Record<string, unknown> | null;
          order_index?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };

      matriculas: {
        Row: {
          id: string;
          course_id: string;
          student_id: string;
          status: string | null;
          enrolled_at: string | null;
          completed_at: string | null;
          progress_percentage: number | null;
          price: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          course_id: string;
          student_id: string;
          status?: string | null;
          enrolled_at?: string | null;
          completed_at?: string | null;
          progress_percentage?: number | null;
          price?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          course_id?: string;
          student_id?: string;
          status?: string | null;
          enrolled_at?: string | null;
          completed_at?: string | null;
          progress_percentage?: number | null;
          price?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };

      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: string;
          updated_at: string | null;
          created_at: string | null;
          category: string | null;
          category_id: string | null;
          highlight_message: string | null;
          stripe_account_id: string | null;
          stripe_onboarding_status: string | null;
          stripe_charges_enabled: boolean | null;
          stripe_payouts_enabled: boolean | null;
          stripe_onboarding_url: string | null;
          stripe_requirements: Record<string, unknown> | null;
          stripe_capabilities: Record<string, unknown> | null;
          account_already_verified: boolean | null;
          document_verification_status: 'pending' | 'verified' | 'rejected' | null;
          is_public: boolean | null;
          phone: string | null;
          sm_tit1: string | null;
          sm_desc1: string | null;
          sm_tit2: string | null;
          sm_desc2: string | null;
          sm_tit3: string | null;
          sm_desc3: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: string;
          updated_at?: string | null;
          category?: string | null;
          category_id?: string | null;
          highlight_message?: string | null;
          stripe_account_id?: string | null;
          stripe_onboarding_status?: string | null;
          stripe_charges_enabled?: boolean | null;
          stripe_payouts_enabled?: boolean | null;
          stripe_onboarding_url?: string | null;
          stripe_requirements?: Record<string, unknown> | null;
          stripe_capabilities?: Record<string, unknown> | null;
          account_already_verified?: boolean | null;
          document_verification_status?: 'pending' | 'verified' | 'rejected' | null;
          is_public?: boolean | null;
          phone?: string | null;
          sm_tit1?: string | null;
          sm_desc1?: string | null;
          sm_tit2?: string | null;
          sm_desc2?: string | null;
          sm_tit3?: string | null;
          sm_desc3?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: string;
          updated_at?: string | null;
          category?: string | null;
          category_id?: string | null;
          highlight_message?: string | null;
          stripe_account_id?: string | null;
          stripe_onboarding_status?: string | null;
          stripe_charges_enabled?: boolean | null;
          stripe_payouts_enabled?: boolean | null;
          stripe_onboarding_url?: string | null;
          stripe_requirements?: Record<string, unknown> | null;
          stripe_capabilities?: Record<string, unknown> | null;
          account_already_verified?: boolean | null;
          document_verification_status?: 'pending' | 'verified' | 'rejected' | null;
          is_public?: boolean | null;
          phone?: string | null;
          sm_tit1?: string | null;
          sm_desc1?: string | null;
          sm_tit2?: string | null;
          sm_desc2?: string | null;
          sm_tit3?: string | null;
          sm_desc3?: string | null;
        };
      };

      notificacoes: {
        Row: {
          id: string;
          mentor_id: string; // Após migração: mentor_id (já correto)
          mentee_id: string; // Após migração: mentorado_id -> mentee_id
          mentor_name: string; // Após migração: nome_mentor -> mentor_name
          mentee_name: string; // Após migração: nome_mentorado -> mentee_name
          action: string; // Após migração: acao -> action
          message: string; // Após migração: mensagem -> message
          is_read: boolean | null; // Após migração: mensagem_lida -> is_read
          created_at: string | null;
        };
        Insert: {
          id?: string;
          mentor_id: string;
          mentee_id: string;
          mentor_name: string;
          mentee_name: string;
          action: string;
          message: string;
          is_read?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          mentor_id?: string;
          mentee_id?: string;
          mentor_name?: string;
          mentee_name?: string;
          action?: string;
          message?: string;
          is_read?: boolean | null;
          created_at?: string | null;
        };
      };

      configuracoes_usuario: {
        Row: {
          id: string;
          user_id: string;
          username: string; // Após migração: nome_usuario -> username
          user_profile: string; // Após migração: perfil_usuario -> user_profile
          log_type: string; // Após migração: tipo_log -> log_type
          is_active: boolean | null; // Após migração: ativo -> is_active
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          user_profile: string;
          log_type: string;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          user_profile?: string;
          log_type?: string;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };

      mentor_followers: {
        Row: {
          mentor_id: string;
          follower_id: string;
          followed_at: string | null;
        };
        Insert: {
          mentor_id: string;
          follower_id: string;
          followed_at?: string | null;
        };
        Update: {
          mentor_id?: string;
          follower_id?: string;
          followed_at?: string | null;
        };
      };

      course_landing_pages: {
        Row: {
          id: string;
          course_id: string | null;
          layout_name: string | null;
          layout_body: Record<string, unknown> | null;
          layout_images: Record<string, unknown> | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          course_id?: string | null;
          layout_name?: string | null;
          layout_body?: Record<string, unknown> | null;
          layout_images?: Record<string, unknown> | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          course_id?: string | null;
          layout_name?: string | null;
          layout_body?: Record<string, unknown> | null;
          layout_images?: Record<string, unknown> | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };

      // Tabela opcional - pode ser removida conforme memória
      conteudo_concluido: {
        Row: {
          id: string;
          user_id: string;
          course_id: string; // Após migração: curso_id -> course_id
          module_id: string; // Após migração: modulo_id -> module_id
          content_id: string; // Após migração: conteudo_id -> content_id
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          module_id: string;
          content_id: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          module_id?: string;
          content_id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ====================================================================
// TIPOS AUXILIARES
// ====================================================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Tipos específicos para facilitar o uso
export type Curso = Tables<'cursos'>;
export type Modulo = Tables<'modulos'>;
export type Conteudo = Tables<'conteudos'>;
export type Profile = Tables<'profiles'>;
export type Category = Tables<'categories'>;
export type Matricula = Tables<'matriculas'>;
export type Notificacao = Tables<'notificacoes'>;
export type ConfiguracaoUsuario = Tables<'configuracoes_usuario'>;
export type MentorFollower = Tables<'mentor_followers'>;
export type CourseLandingPage = Tables<'course_landing_pages'>;
export type ConteudoConcluido = Tables<'conteudo_concluido'>;

// ====================================================================
// INSTÂNCIA DO SUPABASE
// ====================================================================

import { clientConfig } from '../config/environment';

const supabaseUrl = clientConfig.SUPABASE_URL;
const supabaseAnonKey = clientConfig.SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);