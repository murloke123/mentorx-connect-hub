import { z } from 'zod';

export const conteudoSchema = z.object({
  title: z.string().min(3, { message: 'O nome do conteúdo deve ter pelo menos 3 caracteres' }),
  description: z.string().optional(),
  content_type: z.enum(['texto_rico', 'video_externo', 'pdf']),
  html_content: z.string().optional(),
  video_url: z.string().optional(),
});

export type ConteudoFormValues = z.infer<typeof conteudoSchema> & {
  provider?: 'youtube' | 'vimeo';
  pdf_file?: File | null;
  pdf_url?: string;
  pdf_filename?: string;
  storage_path?: string;
};

export interface ConteudoFormProps {
  onSubmit: (values: ConteudoFormValues) => Promise<void>;
  initialData?: Partial<ConteudoFormValues>;
  isSubmitting: boolean;
  onCancel: () => void;
}
