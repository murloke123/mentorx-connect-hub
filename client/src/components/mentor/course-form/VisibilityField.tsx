
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Globe, Lock } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { CourseFormData } from "./FormSchema";

interface VisibilityFieldProps {
  form: UseFormReturn<CourseFormData>;
}

const VisibilityField = ({ form }: VisibilityFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="visibility"
      render={({ field }) => (
        <FormItem className="mb-4">
          <FormLabel>Visibilidade do Curso*</FormLabel>
          <div className="p-4 rounded-lg border border-gold/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold">Configuração de Visibilidade</span>
            </div>
            <FormControl>
              <RadioGroup 
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-row gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="font-medium flex items-center text-white">
                    <Globe className="mr-2 h-4 w-4" />
                    Público
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="font-medium flex items-center text-white">
                    <Lock className="mr-2 h-4 w-4" />
                    Privado
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <p className="text-sm text-gray-400 italic mt-3">
              Público: visível para todos os usuários. Privado: visível apenas para seus seguidores.
            </p>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VisibilityField;
