
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
          <FormControl>
            <RadioGroup 
              onValueChange={(value) => {
                field.onChange(value);
                onTypeChange(value as "free" | "paid");
              }}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="free" id="free" />
                <Label htmlFor="free">Gratuito</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="paid" />
                <Label htmlFor="paid">Pago</Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CourseTypeField;
