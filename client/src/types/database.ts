export interface ContentData {
  html_content?: string;
  texto?: string;
  video_url?: string;
  provider?: 'youtube' | 'vimeo';
  pdf_url?: string;
  pdf_filename?: string;
  storage_path?: string;
}

export interface Conteudo {
  id: string;
  module_id: string;
  content_type: 'texto_rico' | 'video_externo' | 'pdf';
  order_index: number;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  content_data: ContentData | null;
}

export interface Profile {
    id: string; 
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    bio: string | null;
    role: string | null;
    updated_at: string | null;
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
    sm_tit1?: string | null;
    sm_desc1?: string | null;
    sm_tit2?: string | null;
    sm_desc2?: string | null;
    sm_tit3?: string | null;
    sm_desc3?: string | null;
    phone?: string | null;
    account_already_verified?: boolean | null;
    document_verification_status?: 'pending' | 'verified' | 'rejected' | null;
    social_media?: {
        instagram: string;
        facebook: string;
        youtube: string;
    } | null;
    cx_diferenciais?: {
        dif_title_1?: string;
        dif_description_1?: string;
        dif_title_2?: string;
        dif_description_2?: string;
        dif_title_3?: string;
        dif_description_3?: string;
    } | null;
    review_comments?: {
        photo_1?: string;
        name_1?: string;
        profession_1?: string;
        comment_1?: string;
        photo_2?: string;
        name_2?: string;
        profession_2?: string;
        comment_2?: string;
        photo_3?: string;
        name_3?: string;
        profession_3?: string;
        comment_3?: string;
    } | null;
    verified?: {
        cards_sucesso_verificado?: boolean;
        por_que_me_seguir_verificado?: boolean;
        meus_cursos_verificado?: boolean;
        elogios_verificado?: boolean;
        calendario_verificado?: boolean;
    } | null;
    is_public?: boolean | null;
}

export interface Course {
    id: string;
    title: string;
    description: string | null;
    mentor_id: string;
    category_id: string | null;
    is_public: boolean;
    is_paid: boolean;
    price: number | null;
    discount: number | null;
    discounted_price: number | null;
    image_url: string | null;
    is_published: boolean;
    stripe_product_id: string | null;
    stripe_price_id: string | null;
    created_at: string;
    updated_at: string;
    category: string | null;
    landing_page_id: string | null;
    category_info?: { id: string; name: string };
    enrollments_count?: number;
    mentor_info?: { full_name: string | null; avatar_url: string | null };
}

export interface Matricula {
  id: string;
  course_id: string;
  student_id: string;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
  progress_percentage: number | null;
  price: number | null;
  email_sent: boolean;
  email_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Mentor {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  highlight_message: string | null;
  phone?: string | null;
  sm_tit1?: string | null;
  sm_desc1?: string | null;
  sm_tit2?: string | null;
  sm_desc2?: string | null;
  sm_tit3?: string | null;
  sm_desc3?: string | null;
  category?: string | null;
  category_id?: string | null;
  courses_count?: number;
  followers_count?: number;
  is_public?: boolean | null;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  slug: string | null;
}

export interface Notification {
  id: string;
  receiver_id: string;        // Quem recebe a notificação
  receiver_name?: string;     // Nome de quem recebe
  receiver_role?: string;     // Role de quem recebe (mentor/mentorado)
  sender_id?: string | null;  // Quem envia a notificação (opcional)
  sender_name?: string | null; // Nome de quem envia (opcional)
  sender_role?: string | null; // Role de quem envia (mentor/mentorado)
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}
