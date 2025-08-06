import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const moduloSchema = z.object({
  title: z.string().min(3, { message: 'O nome do módulo deve ter pelo menos 3 caracteres' }),
  description: z.string().optional(),
});

type ModuloFormData = z.infer<typeof moduloSchema>;

interface ModuloFormProps {
  onSubmit: (data: ModuloFormData) => Promise<void>;
  initialData?: {
    title?: string;
    description?: string;
  };
  isLoading?: boolean;
  submitText?: string;
}

const ModuloForm = ({ onSubmit, initialData, isLoading = false, submitText = 'Salvar' }: ModuloFormProps) => {
  const form = useForm<ModuloFormData>({
    resolver: zodResolver(moduloSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
    },
  });

  const handleSubmit = async (data: ModuloFormData) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Módulo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Digite o nome do módulo..." 
                  {...field} 
                  disabled={isLoading}
                  className="bg-background"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva brevemente o conteúdo deste módulo..."
                  rows={3}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ModuloForm;
