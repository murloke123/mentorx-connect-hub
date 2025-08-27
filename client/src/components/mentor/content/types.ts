import { z } from 'zod';

export const conteudoSchema = z.object({
  title: z.string().min(3, { message: 'O nome do conteúdo deve ter pelo menos 3 caracteres' }),
  description: z.string().optional(),
  content_type: z.enum(['texto_rico', 'video_externo', 'pdf', 'cta_button']),
  html_content: z.string().optional(),
  video_url: z.string().optional(),
  cta_button_name: z.string().optional(),
  cta_redirect_url: z.string().optional(),
}).refine((data) => {
  if (data.content_type === 'cta_button') {
    return data.cta_button_name && data.cta_button_name.trim().length > 0 &&
           data.cta_redirect_url && data.cta_redirect_url.trim().length > 0;
  }
  return true;
}, {
  message: 'Nome do botão e URL de redirecionamento são obrigatórios para chamadas para ação',
  path: ['cta_button_name']
});

export type ConteudoFormValues = z.infer<typeof conteudoSchema> & {
  provider?: 'youtube' | 'vimeo';
  pdf_file?: File | null;
  pdf_url?: string;
  pdf_filename?: string;
  storage_path?: string;
  cta_button_name?: string;
  cta_redirect_url?: string;
};

export interface ConteudoFormProps {
  onSubmit: (values: ConteudoFormValues) => Promise<void>;
  initialData?: Partial<ConteudoFormValues>;
  isSubmitting: boolean;
  onCancel: () => void;
}
