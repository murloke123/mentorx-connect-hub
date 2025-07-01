import React, { useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { CourseFormData } from "./FormSchema";
import { useCategories } from "@/hooks/useCategories";
import { Spinner } from "@/components/ui/spinner";

interface BasicInfoFieldsProps {
  form: UseFormReturn<CourseFormData>;
}

const BasicInfoFields = ({ form }: BasicInfoFieldsProps) => {
  const { categories, loading } = useCategories();
  const categoryValue = form.watch("category");
  
  useEffect(() => {
    console.log("Categoria atual:", categoryValue);
  }, [categoryValue]);

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>Nome do Curso*</FormLabel>
            <FormControl>
              <Input placeholder="Digite o nome do curso" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>Descrição*</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Forneça um resumo do seu curso, destacando o conteúdo e os principais benefícios para o aluno..." 
                rows={5}
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>Categoria*</FormLabel>
            <Select 
              onValueChange={(value) => {
                console.log("Categoria selecionada:", value);
                field.onChange(value);
              }}
              defaultValue={field.value}
              value={field.value}
              disabled={loading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Carregando categorias..." : "Selecione uma categoria"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {loading ? (
                  <div className="flex items-center justify-center p-4">
                    <Spinner className="h-4 w-4" />
                  </div>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                  </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicInfoFields;
