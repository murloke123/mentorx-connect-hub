import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UseFormReturn } from 'react-hook-form';
import { ConteudoFormValues } from './types';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface BasicContentFieldsProps {
  form: UseFormReturn<ConteudoFormValues>;
  isSubmitting: boolean;
}

const BasicContentFields = ({ form, isSubmitting }: BasicContentFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Conteúdo</FormLabel>
            <FormControl>
              <Input placeholder="Digite o nome do conteúdo..." {...field} disabled={isSubmitting} />
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
                placeholder="Descreva brevemente este conteúdo..."
                rows={3}
                {...field}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="content_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Conteúdo</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="texto_rico">Texto Rico</SelectItem>
                  <SelectItem value="video_externo">Vídeo Externo</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicContentFields;
