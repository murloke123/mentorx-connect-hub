
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
          <FormControl>
            <RadioGroup 
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-start space-x-2">
                <div className="flex items-center h-6">
                  <RadioGroupItem value="public" id="public" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <Label htmlFor="public" className="font-medium flex items-center">
                      <Globe className="mr-2 h-4 w-4" />
                      Público
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">O curso aparecerá para todos os mentorados da plataforma.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <div className="flex items-center h-6">
                  <RadioGroupItem value="private" id="private" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <Label htmlFor="private" className="font-medium flex items-center">
                      <Lock className="mr-2 h-4 w-4" />
                      Privado
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">O curso aparecerá apenas para os mentorados que seguem você.</p>
                </div>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VisibilityField;
