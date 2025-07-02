import CourseForm from "@/components/mentor/course-form";
import MentorSidebar from "@/components/mentor/MentorSidebar";
import { useToast } from "@/hooks/use-toast";
import { createCourseWithStripe } from "@/services/courseService";
import { CourseFormData } from "@/utils/course";
import { supabase } from "@/utils/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: CourseFormData = {
    name: "",
    description: "",
    image: "",
    category: "",
    type: "free",
    price: 0,
    currency: "BRL",
    discount: 0,
    visibility: "public",
    isPublished: false,
  };

  const handleSubmit = async (formData: CourseFormData) => {
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Buscar o nome da categoria baseado no ID selecionado
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("name")
        .eq("id", formData.category)
        .single();

      if (categoryError) {
        throw new Error("Erro ao buscar dados da categoria");
      }

      // Converter CourseFormData para o formato esperado pelo banco
      const courseData = {
        title: formData.name,
        description: formData.description,
        image_url: formData.image,
        category: categoryData.name, // Nome da categoria
        category_id: formData.category, // UUID da categoria
        is_public: formData.visibility === "public",
        is_paid: formData.type === "paid",
        price: formData.type === "paid" ? formData.price : null,
        discount: formData.discount > 0 ? formData.discount : null,
        is_published: formData.isPublished,
      };

      console.log('🔄 Criando curso com dados:', courseData);

      // Usar a nova função que integra com Stripe
      const result = await createCourseWithStripe(courseData, user.id);
      
      console.log('✅ Resultado da criação:', result);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['publicCourses'] });
      queryClient.invalidateQueries({ queryKey: ['mentorCourses'] });
      
      let successMessage = "Seu curso foi criado com sucesso!";
      
      // Se foi criado produto no Stripe, mencionar isso
      if (result.stripeData && formData.type === "paid") {
        successMessage += " O produto foi automaticamente configurado no Stripe para pagamentos.";
      } else if (formData.type === "paid") {
        successMessage += " Nota: Configure sua conta Stripe para aceitar pagamentos.";
      }
      
      toast({
        title: "Curso criado com sucesso!",
        description: successMessage,
      });
      
      // Redirect to course edit page or courses list with tab parameter
      navigate("/mentor/cursos");
    } catch (error) {
      console.error("❌ Erro ao criar curso:", error);
      toast({
        title: "Erro ao criar curso",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao tentar criar o curso. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/mentor/cursos");
  };

  return (
    <div className="flex">
      <MentorSidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Criar Novo Curso</h1>
        <CourseForm 
          mode="create"
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default CreateCoursePage;
