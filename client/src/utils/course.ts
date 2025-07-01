import * as z from "zod";

export const formSchema = z.object({
  name: z.string().min(5, "O título deve conter pelo menos 5 caracteres"),
  description: z.string().min(20, "A descrição deve conter pelo menos 20 caracteres"),
  category: z.string().min(1, "Selecione uma categoria"),
  image: z.string().min(1, "Selecione uma imagem para o curso"),
  type: z.enum(["free", "paid"]),
  price: z.number().min(0),
  currency: z.string(),
  discount: z.number().min(0).max(100),
  visibility: z.enum(["public", "private"]),
  isPublished: z.boolean().default(false),
});

export type CourseFormData = z.infer<typeof formSchema>;

// Re-export Course type from database types
export type { Course } from '../types/database';
