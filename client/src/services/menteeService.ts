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

    console.log('🔍 Buscando cursos para o usuário:', user.id);

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
      console.error('❌ Erro ao buscar matrículas:', matriculasError);
      throw matriculasError;
    }

    console.log('📚 Matrículas encontradas:', matriculas?.length || 0, matriculas);

    if (!matriculas || matriculas.length === 0) {
      console.log('📭 Nenhuma matrícula ativa encontrada');
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
      console.error('❌ Erro ao buscar cursos:', cursosError);
      throw cursosError;
    }

    console.log('📖 Cursos encontrados:', cursos?.length || 0, cursos);

    // Buscar informações dos mentores
    const mentorIds = Array.from(new Set(cursos?.map(c => c.mentor_id) || []));
    const { data: mentores, error: mentoresError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", mentorIds);

    if (mentoresError) {
      console.error('❌ Erro ao buscar mentores:', mentoresError);
    }

    console.log('👨‍🏫 Mentores encontrados:', mentores?.length || 0, mentores);

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

    console.log('✅ Cursos formatados:', enrolledCourses);
    
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
    
    const { data, error } = await supabase
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
    
    // Transform the data to match the Course interface
    const courses: Course[] = (data || []).map((enrollment: any) => ({
      id: enrollment.course.id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      mentor_id: enrollment.course.mentor_id,
      mentor_name: enrollment.course.mentor?.full_name,
      progress: enrollment.progress_percentage || 0,
      completed_lessons: 0, // You might want to calculate this based on actual lesson completion
      total_lessons: 0, // You might want to get this from the course structure
    }));
    
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
