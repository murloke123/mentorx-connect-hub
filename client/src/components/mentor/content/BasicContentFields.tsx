import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { ConteudoFormValues } from './types';

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
            <FormLabel className="text-white font-medium">Nome do Conteúdo</FormLabel>
            <FormControl>
              <Input 
                placeholder="Digite o nome do conteúdo..." 
                {...field} 
                disabled={isSubmitting}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-gold/50 focus:ring-gold/20 transition-all duration-300"
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
            <FormLabel className="text-white font-medium">Descrição (Opcional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descreva brevemente este conteúdo..."
                rows={3}
                {...field}
                disabled={isSubmitting}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-gold/50 focus:ring-gold/20 transition-all duration-300 resize-none"
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
            <FormLabel className="text-white font-medium">Tipo de Conteúdo</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-gold/50 focus:ring-gold/20 transition-all duration-300">
                  <SelectValue placeholder="Selecione o tipo..." className="text-gray-400" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="texto_rico" className="text-white hover:bg-slate-700 focus:bg-slate-700">Texto Rico</SelectItem>
                  <SelectItem value="video_externo" className="text-white hover:bg-slate-700 focus:bg-slate-700">Vídeo Externo</SelectItem>
                  <SelectItem value="pdf" className="text-white hover:bg-slate-700 focus:bg-slate-700">PDF</SelectItem>
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
