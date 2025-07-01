export interface ContentData {
  html_content?: string;
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
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_user_id?: string | null;
  related_user_name?: string | null;
  created_at: string;
  updated_at: string;
}
