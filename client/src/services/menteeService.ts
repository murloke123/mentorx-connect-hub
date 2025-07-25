/**
 * ===============================================================================
 * 🎓 MENTEE SERVICE - Gerenciamento de Mentorados e suas Atividades
 * ===============================================================================
 * 
 * 🎯 OBJETIVO: Gerenciar matrículas, progresso e perfis dos mentorados
 * 
 * 📋 MÉTODOS DISPONÍVEIS:
 * 
 * 🎓 GESTÃO DE MATRÍCULAS:
 * • getEnrolledCourses() - Lista cursos em que o mentorado está matriculado
 * • enrollInCourse() - Matricula o mentorado em um curso gratuito
 * • updateProgress() - Atualiza progresso do mentorado em uma aula
 * 
 * 👤 PERFIL DO MENTORADO:
 * • getMenteeProfile() - Busca perfil do mentorado logado
 * • getMenteeCourses() - Lista cursos do mentorado (alternativa)
 * • getMenteeFollowingCount() - Contagem de mentores seguidos
 * 
 * 🔧 RECURSOS:
 * • Validação automática de autenticação
 * • Prevenção de matrículas duplicadas
 * • Cálculo automático de progresso
 * • Relacionamento automático com mentor/proprietário do curso
 * • Logs detalhados para debug
 * • Tratamento robusto de erros
 * 
 * 📊 PROGRESSO E ESTATÍSTICAS:
 * • Tracking de aulas completadas
 * • Percentual de progresso por curso
 * • Histórico de acesso e atividade
 * 
 * 💡 INTERFACES:
 * • EnrolledCourseData - Dados de curso matriculado
 * • Progress - Informações de progresso
 * • Course - Estrutura completa de curso com progresso
 * ===============================================================================
 */

import { supabase } from '../utils/supabase';

interface EnrolledCourseData {
  id: string;
  title: string;
  description: string;
  mentor_id: string;
  profiles: {
    full_name: string;
  } | null;
}

type Progress = {
  percent: number;
  completed_lessons: number;
  total_lessons: number;
  completed_lessons_ids?: string[];
  last_accessed?: string;
};

interface Course {
  id: string;
  title: string;
  description?: string;
  mentor_id: string;
  mentor_name?: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
}

export async function getEnrolledCourses() {
  try {
    // Obter o ID do usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    // Primeiro buscar as matrículas
    const { data: matriculas, error: matriculasError } = await supabase
      .from("matriculas")
      .select(`
        id,
        course_id,
        progress_percentage,
        status,
        enrolled_at
      `)
      .eq("student_id", user.id)
      .eq("status", "active"); // Apenas matrículas ativas

    if (matriculasError) {
      throw matriculasError;
    }

    if (!matriculas || matriculas.length === 0) {
      return [];
    }

    // Buscar os cursos das matrículas
    const courseIds = matriculas.map(m => m.course_id);
    const { data: cursos, error: cursosError } = await supabase
      .from("cursos")
      .select(`
        id,
        title,
        description,
        mentor_id,
        image_url
      `)
      .in("id", courseIds);

    if (cursosError) {
      throw cursosError;
    }

    // Buscar informações dos mentores
    const mentorIds = Array.from(new Set(cursos?.map(c => c.mentor_id) || []));
    const { data: mentores, error: mentoresError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", mentorIds);

    if (mentoresError) {
      // Continuar mesmo com erro nos mentores
    }

    // Combinar os dados
    const enrolledCourses = matriculas.map(matricula => {
      const curso = cursos?.find(c => c.id === matricula.course_id);
      const mentor = mentores?.find(m => m.id === curso?.mentor_id);
      
      return {
        id: curso?.id || matricula.course_id,
        title: curso?.title || 'Curso não encontrado',
        description: curso?.description || '',
        mentor_id: curso?.mentor_id || '',
        mentor_name: mentor?.full_name || 'Mentor não encontrado',
        progress: matricula.progress_percentage || 0,
        completed_lessons: 0, // Campo não existe em matriculas
        total_lessons: 0, // Campo não existe em matriculas
        image_url: curso?.image_url
      };
    });
    
    return enrolledCourses;
  } catch (error) {
    console.error("❌ Erro ao buscar cursos do mentorado:", error);
    return [];
  }
}

export async function enrollInCourse(courseId: string) {
  try {
    // Obter o ID do usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    
    // Verificar se o usuário já está inscrito neste curso
    const { data: existingEnrollment, error: checkError } = await supabase
      .from("matriculas")
      .select("id")
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    // Se já estiver inscrito, não fazer nada
    if (existingEnrollment) {
      return { already_enrolled: true };
    }
    
    // Buscar nome do usuário para popular o campo studant_name
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const userName = userProfile?.full_name || 'Nome não informado';

    // Buscar dados do proprietário do curso e preço
    const { data: course } = await supabase
      .from('cursos')
      .select('mentor_id, price, is_paid')
      .eq('id', courseId)
      .single();

    const { data: courseOwner } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', course?.mentor_id)
      .single();

    const ownerName = courseOwner?.full_name || 'Mentor não informado';
    const coursePrice = course?.is_paid ? (course?.price || 0) : 0;

    // Criar nova matrícula
    const { data, error } = await supabase
      .from("matriculas")
      .insert({
        student_id: user.id,
        course_id: courseId,
        status: 'active',
        enrolled_at: new Date().toISOString(),
        progress_percentage: 0,
        studant_name: userName, // Adicionar nome do estudante
        course_owner_id: course?.mentor_id, // ID do proprietário do curso
        course_owner_name: ownerName, // Nome do proprietário do curso
        price: coursePrice // Preço do curso no momento da matrícula
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Erro ao se inscrever no curso:", error);
    throw error;
  }
}

export async function updateProgress(courseId: string, lessonId: string, completed: boolean) {
  try {
    // Obter o ID do usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    
    // Obter a matrícula atual e o progresso
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("matriculas")
      .select("progress_percentage")
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .single();
      
    if (enrollmentError) throw enrollmentError;
    
    if (!enrollment) {
      throw new Error("Inscrição não encontrada");
    }
    
    // Obter total de conteúdos do curso
    const { count: totalConteudos, error: countError } = await supabase
      .from("conteudos")
      .select("*", { count: 'exact', head: true })
      .eq("modulo_id", "modulos.id")
      .eq("modulos.course_id", courseId);
      
    if (countError) throw countError;
    
    // Usar progress_percentage da tabela matriculas
    const currentProgress = enrollment.progress_percentage || 0;
    
    // Calcular novo progresso baseado no número de conteúdos
    const percentComplete = totalConteudos ? Math.min(currentProgress + (completed ? 10 : -10), 100) : 0;
    
    // Atualizar o progresso na matrícula
    const { data, error } = await supabase
      .from("matriculas")
      .update({ 
        progress_percentage: Math.max(percentComplete, 0),
        updated_at: new Date().toISOString()
      })
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Erro ao atualizar progresso:", error);
    throw error;
  }
}

// Adicionando funções necessárias para o MentoradoDashboardPage
export async function getMenteeProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error fetching mentee profile:", error);
    throw error;
  }
}

export async function getMenteeCourses(): Promise<Course[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    
    // Buscar matrículas com dados do curso e mentor
    const { data: enrollments, error } = await supabase
      .from("matriculas")
      .select(`
        *,
        course:cursos (
          id,
          title,
          description,
          mentor_id,
          mentor:mentor_id (
            full_name
          )
        )
      `)
      .eq("student_id", user.id)
      .eq("status", "active");
      
    if (error) throw error;
    
    if (!enrollments || enrollments.length === 0) {
      return [];
    }

    // Extrair IDs dos cursos
    const courseIds = enrollments.map((enrollment: any) => enrollment.course.id);
    
    // Buscar todos os módulos dos cursos de uma vez
    const { data: modules, error: modulesError } = await supabase
      .from("modulos")
      .select("id, course_id")
      .in("course_id", courseIds);
      
    if (modulesError) {
      console.error("Error fetching modules:", modulesError);
    }
    
    // Extrair IDs dos módulos
    const moduleIds = modules?.map(m => m.id) || [];
    
    // Buscar todos os conteúdos dos módulos de uma vez
    const { data: contents, error: contentsError } = await supabase
      .from("conteudos")
      .select("id, module_id")
      .in("module_id", moduleIds);
      
    if (contentsError) {
      console.error("Error fetching contents:", contentsError);
    }
    
    // Buscar todos os conteúdos concluídos pelo usuário de uma vez
    const { data: completedContents, error: completedError } = await supabase
      .from("conteudo_concluido")
      .select("id, course_id, content_id")
      .eq("user_id", user.id)
      .in("course_id", courseIds);
      
    if (completedError) {
      console.error("Error fetching completed contents:", completedError);
    }
    
    // Criar mapas para facilitar o cálculo
    const modulesByCourse = modules?.reduce((acc: any, module: any) => {
      if (!acc[module.course_id]) acc[module.course_id] = [];
      acc[module.course_id].push(module.id);
      return acc;
    }, {}) || {};
    
    const contentsByModule = contents?.reduce((acc: any, content: any) => {
      if (!acc[content.module_id]) acc[content.module_id] = [];
      acc[content.module_id].push(content.id);
      return acc;
    }, {}) || {};
    
    const completedByCourse = completedContents?.reduce((acc: any, completed: any) => {
      if (!acc[completed.course_id]) acc[completed.course_id] = 0;
      acc[completed.course_id]++;
      return acc;
    }, {}) || {};
    
    // Transform the data to match the Course interface
    const courses: Course[] = enrollments.map((enrollment: any) => {
      const courseId = enrollment.course.id;
      
      // Calcular total de conteúdos do curso
      const courseModules = modulesByCourse[courseId] || [];
      const totalLessons = courseModules.reduce((total: number, moduleId: string) => {
        return total + (contentsByModule[moduleId]?.length || 0);
      }, 0);
      
      // Conteúdos concluídos
      const completedLessons = completedByCourse[courseId] || 0;
      
      // Calcular progresso baseado nas aulas concluídas
      const calculatedProgress = totalLessons > 0 ? (completedLessons / totalLessons) : 0;

      return {
        id: courseId,
        title: enrollment.course.title,
        description: enrollment.course.description,
        mentor_id: enrollment.course.mentor_id,
        mentor_name: enrollment.course.mentor?.full_name,
        progress: calculatedProgress, // Valor entre 0 e 1
        completed_lessons: completedLessons,
        total_lessons: totalLessons,
      };
    });
    
    return courses;
  } catch (error) {
    console.error("Error fetching mentee courses:", error);
    throw error;
  }
}

export async function getMenteeFollowingCount(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    
    const { count, error } = await supabase
      .from("mentor_followers")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", user.id);
      
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error("Error fetching mentee following count:", error);
    return 0;
  }
}
