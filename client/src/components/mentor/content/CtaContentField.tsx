import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ConteudoFormValues } from './types';

interface CtaContentFieldProps {
  form: UseFormReturn<ConteudoFormValues>;
  isSubmitting: boolean;
}

const CtaContentField = ({ form, isSubmitting }: CtaContentFieldProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="cta_button_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-medium">Nome do Botão</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: Acesse o Material Complementar" 
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
        name="cta_redirect_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-medium">URL de Redirecionamento</FormLabel>
            <FormControl>
              <Input 
                placeholder="https://exemplo.com/material" 
                {...field} 
                disabled={isSubmitting}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-gold/50 focus:ring-gold/20 transition-all duration-300"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default CtaContentField;