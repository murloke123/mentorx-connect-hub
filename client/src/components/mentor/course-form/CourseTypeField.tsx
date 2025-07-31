
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DollarSign } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { CourseFormData } from "./FormSchema";

interface CourseTypeFieldProps {
  form: UseFormReturn<CourseFormData>;
  onTypeChange: (value: "free" | "paid") => void;
}

const CourseTypeField = ({ form, onTypeChange }: CourseTypeFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem className="mb-4">
          <FormLabel>Tipo de Curso*</FormLabel>
          <div className="p-4 rounded-lg border border-gold/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold">Modelo de Monetização</span>
            </div>
            <FormControl>
              <RadioGroup 
                onValueChange={(value) => {
                  field.onChange(value);
                  onTypeChange(value as "free" | "paid");
                }}
                defaultValue={field.value}
                className="flex flex-row gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free" className="font-medium text-white">Gratuito</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paid" id="paid" />
                  <Label htmlFor="paid" className="font-medium text-white">Pago</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <p className="text-sm text-gray-400 italic mt-3">
              Defina se o curso será gratuito ou terá cobrança para acesso.
            </p>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CourseTypeField;
