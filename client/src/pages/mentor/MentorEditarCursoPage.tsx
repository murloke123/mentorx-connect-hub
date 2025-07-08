import CourseForm from "@/components/mentor/course-form";
import MentorSidebar from "@/components/mentor/MentorSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getCourseById, updateCourseWithStripe } from "@/services/courseService";
import { Course } from "@/types/database";
import { CourseFormData } from "@/utils/course";
import { supabase } from "@/utils/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditCoursePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState<CourseFormData | null>(null);

  // Função para converter dados do banco para o formato do formulário
  const courseToFormData = (course: Course): CourseFormData => {
    return {
      name: course.title,
      description: course.description || "",
      image: course.image_url || "",
      category: course.category_id || "", // Usar category_id (UUID) para o formulário
      type: course.is_paid ? "paid" : "free",
      price: course.price || 0,
      currency: "BRL",
      discount: course.discount || 0,
      visibility: course.is_public ? "public" : "private",
      isPublished: course.is_published,
    };
  };

  // Função para converter dados do formulário para o formato do banco
  const formDataToCourse = (formData: CourseFormData): Partial<Course> => {
    return {
      title: formData.name,
      description: formData.description,
      image_url: formData.image,
      is_public: formData.visibility === "public",
      is_paid: formData.type === "paid",
      price: formData.type === "paid" ? formData.price : null,
      discount: formData.discount > 0 ? formData.discount : null,
      is_published: formData.isPublished,
    };
  };

  useEffect(() => {
    const loadCourse = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const course = await getCourseById(id);
        
        if (!course) {
          throw new Error("Curso não encontrado");
        }
        
        console.log("✅ Dados do curso carregados:", course);
        
        // Converter dados do banco para o formato do formulário
        const formData = courseToFormData(course);
        console.log("✅ Dados convertidos para formulário:", formData);
        
        setCourseData(formData);
      } catch (error) {
        console.error("❌ Erro ao carregar curso:", error);
        toast({
          title: "Erro ao carregar curso",
          description: "Não foi possível obter os dados do curso.",
          variant: "destructive",
        });
        navigate("/mentor/meus-cursos");
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [id, navigate, toast]);

  const handleSubmit = async (formData: CourseFormData) => {
    if (!id) return;
    
    setIsSubmitting(true);
    console.log("🔄 Enviando formulário para atualização:", formData);
    
    try {
      // Buscar o nome da categoria baseado no ID selecionado
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("name")
        .eq("id", formData.category)
        .single();

      if (categoryError) {
        throw new Error("Erro ao buscar dados da categoria");
      }

      // Converter dados do formulário para o formato do banco
      const courseUpdateData = formDataToCourse(formData);
      // Adicionar os campos de categoria corretos
      courseUpdateData.category = categoryData.name; // Nome da categoria
      courseUpdateData.category_id = formData.category; // UUID da categoria
      
      console.log("🔄 Dados convertidos para atualização:", courseUpdateData);
      
      // Usar a nova função que integra com Stripe
      const result = await updateCourseWithStripe(id, courseUpdateData);
      
      console.log("✅ Resultado da atualização:", result);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['publicCourses'] });
      queryClient.invalidateQueries({ queryKey: ['mentorCourses'] });
      queryClient.invalidateQueries({ queryKey: ['courseDetails', id] });
      
      let successMessage = "As alterações foram salvas com sucesso!";
      
      // Se foi sincronizado com Stripe, mencionar isso
      if (result.stripeData && formData.type === "paid") {
        successMessage += " O produto foi sincronizado com o Stripe.";
      } else if (formData.type === "paid") {
        successMessage += " Nota: Configure sua conta Stripe para aceitar pagamentos.";
      }
      
      toast({
        title: "Curso atualizado com sucesso!",
        description: successMessage,
      });
      
      navigate("/mentor/meus-cursos");
    } catch (error) {
      console.error("❌ Erro ao atualizar curso:", error);
      toast({
        title: "Erro ao atualizar curso",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao tentar salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/mentor/meus-cursos");
  };

  return (
    <div className="flex">
      <MentorSidebar />
      <div className="flex-1 transition-all duration-300  p-6">
        <h1 className="text-2xl font-bold mb-6">Editar Curso</h1>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-2/3" />
          </div>
        ) : courseData ? (
          <CourseForm 
            mode="edit"
            initialValues={courseData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className="text-center py-10">
            <p className="text-lg text-red-500">
              Curso não encontrado ou você não tem permissão para editá-lo.
            </p>
            <button 
              onClick={() => navigate("/mentor/meus-cursos")}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
            >
              Voltar para Meus Cursos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditCoursePage;
