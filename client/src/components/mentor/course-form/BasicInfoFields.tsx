import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/hooks/useCategories";
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { CourseFormData } from "./FormSchema";

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
            <FormLabel className="text-sm font-medium text-gray-300">Nome do Curso*</FormLabel>
            <FormControl>
              <Input 
                placeholder="Digite o nome do curso" 
                {...field} 
                className="h-11 bg-slate-800/50 text-white placeholder:text-gray-400"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => {
          const currentLength = field.value?.length || 0;
          const minLength = 100;
          const isValid = currentLength >= minLength;
          
          return (
            <FormItem className="mb-4">
              <FormLabel className="text-sm font-medium text-gray-300">Descrição*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Forneça um resumo do seu curso, destacando o conteúdo e os principais benefícios para o aluno..." 
                  rows={8}
                  {...field} 
                  className="bg-slate-800/50 text-white placeholder:text-gray-400"
                />
              </FormControl>
              <div className="flex justify-between items-center mt-1">
                <FormMessage />
                <span className={`text-xs ${isValid ? 'text-green-400' : 'text-gray-400'}`}>
                  {currentLength}/{minLength} caracteres mínimos
                </span>
              </div>
            </FormItem>
          );
        }}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel className="text-sm font-medium text-gray-300">Categoria*</FormLabel>
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
                <SelectTrigger className="h-11 bg-slate-800/50 text-white">
                  <SelectValue placeholder={loading ? "Carregando categorias..." : "Selecione uma categoria"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-slate-800 border-slate-600">
                {loading ? (
                  <div className="flex items-center justify-center p-4">
                    <Spinner className="h-4 w-4" />
                  </div>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-white hover:bg-slate-700">
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
