/**
 * ===============================================================================
 * 👨‍🏫 MENTOR SERVICE - Gerenciamento de Mentores e suas Atividades
 * ===============================================================================
 * 
 * 🎯 OBJETIVO: Gerenciar perfis, cursos, estatísticas e dados dos mentores
 * 
 * 📋 MÉTODOS DISPONÍVEIS:
 * 
 * 🔍 PERFIS DE MENTORES:
 * • getMentorProfile() - Busca perfil do mentor logado
 * • getMentorProfileById() - Busca perfil específico por ID
 * • getFeaturedMentors() - Lista mentores em destaque
 * • getAllPublicMentors() - Lista todos os mentores públicos
 * 
 * 📚 GESTÃO DE CURSOS:
 * • getMentorCourses() - Lista cursos do mentor logado
 * • getMentorCoursesById() - Lista cursos de mentor específico
 * • getMentorModules() - Lista módulos recentes do mentor
 * • getModulosByCurso() - Busca módulos de um curso específico
 * 
 * 📊 ESTATÍSTICAS E ANALYTICS:
 * • getMentorEnrollmentStats() - Estatísticas de matrículas do mentor logado
 * • getMentorEnrollmentStatsById() - Estatísticas de mentor específico
 * • getEnrollmentStats() - Dados históricos de matrículas (gráficos)
 * • getEnrollmentStatsById() - Dados históricos por mentor específico
 * • getMentorFollowersCount() - Contagem de seguidores do mentor logado
 * • getMentorFollowersCountById() - Contagem de seguidores por ID
 * 
 * 🔧 RECURSOS:
 * • Funções otimizadas que recebem userId como parâmetro
 * • Eliminação de chamadas desnecessárias ao getUser()
 * • Cálculo automático de receita e estatísticas
 * • Contagem de alunos únicos por mentor
 * • Logs detalhados para debug
 * • Tratamento robusto de erros com toast notifications
 * 
 * 💡 INTERFACES:
 * • MentorEnrollmentStats - Estatísticas completas de matrículas
 * • EnrollmentDataPoint - Pontos de dados para gráficos
 * • Module - Estrutura de módulos de curso
 * ===============================================================================
 */

import { Course, Mentor, Profile } from '@/types/database';
import { toast } from '../hooks/use-toast';
import { supabase } from '../utils/supabase';

// ==================================================================================
// ✅ INTERFACES
// ==================================================================================

export interface MentorEnrollmentStats {
  activeEnrollments: number;
  totalStudents: number;
  totalRevenue: number;
  stripePendingAmount: number;
  stripePaidAmount: number;
}

export interface EnrollmentDataPoint {
  date: string;
  count: number;
}

// ==================================================================================
// ✅ FUNÇÕES OTIMIZADAS - Recebem userId como parâmetro (eliminam chamadas getUser)
// ==================================================================================

export async function getMentorProfileById(userId: string): Promise<Profile | null> {
  try {
    if (!userId) throw new Error("User ID is required");
    
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return profile;
  } catch (error) {
    console.error("Error fetching mentor profile:", error);
    toast({
      title: "Error fetching profile",
      description: "Your profile information could not be loaded.",
      variant: "destructive",
    });
    return null;
  }
}

export async function getMentorCoursesById(userId: string): Promise<Course[]> {
  try {
    if (!userId) throw new Error("User ID is required");
    
    console.log('📚 Buscando cursos do mentor:', userId);
    
    // Buscar cursos do mentor
    const { data: courses, error: coursesError } = await supabase
      .from("cursos")
      .select('*')
      .eq("mentor_id", userId)
      .order("created_at", { ascending: false });

    if (coursesError) {
      console.error("Query error:", coursesError);
      throw coursesError;
    }

    if (!courses || courses.length === 0) {
      console.log('📝 Nenhum curso encontrado para o mentor');
      return [];
    }

    console.log(`📋 ${courses.length} cursos encontrados, buscando contagem de matrículas...`);

    // Para cada curso, buscar a contagem de matrículas ativas
    const coursesWithEnrollments = await Promise.all(
      courses.map(async (course) => {
        // Buscar contagem de matrículas ativas para este curso usando course_owner_id
        const { count: enrollmentsCount, error: countError } = await supabase
          .from("matriculas")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)
          .eq("course_owner_id", userId)
          .eq("status", "active");

        if (countError) {
          console.error(`❌ Erro ao contar matrículas do curso ${course.id}:`, countError);
          return { ...course, enrollments_count: 0 };
        }

        const finalCount = enrollmentsCount || 0;
        console.log(`📊 Curso "${course.title}" (${course.id}): ${finalCount} matrículas ativas`);

        return { ...course, enrollments_count: finalCount };
      })
    );

    console.log('✅ Busca de cursos com contagem de matrículas concluída');
    return coursesWithEnrollments as Course[];
  } catch (error) {
    console.error("Error fetching mentor courses:", error);
    toast({
      title: "Error fetching courses",
      description: "Your courses could not be loaded.",
      variant: "destructive",
    });
    return [];
  }
}

export async function getMentorFollowersCountById(userId: string): Promise<number> {
  try {
    if (!userId) throw new Error("User ID is required");
    
    const { count, error } = await supabase
      .from("mentor_followers")
      .select("*", { count: "exact", head: true })
      .eq("mentor_id", userId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Error fetching follower count:", error);
    toast({
      title: "Error fetching followers",
      description: "Your follower count could not be loaded.",
      variant: "destructive",
    });
    return 0;
  }
}

export async function getMentorEnrollmentStatsById(userId: string): Promise<MentorEnrollmentStats> {
  try {
    if (!userId) throw new Error("User ID is required");

    console.log('🔍 Buscando estatísticas de matrículas para mentor (course_owner_id):', userId);

    // Buscar apenas contagem de matrículas ativas - sem join desnecessário
    const { count: activeCount, error: activeError } = await supabase
      .from("matriculas")
      .select("*", { count: "exact", head: true })
      .eq("course_owner_id", userId)
      .eq("status", "active");

    if (activeError) throw activeError;

    // Buscar alunos únicos (student_id) que tem matrículas com este mentor
    const { data: uniqueStudents, error: studentsError } = await supabase
      .from("matriculas")
      .select("student_id")
      .eq("course_owner_id", userId);

    if (studentsError) throw studentsError;

    // Contar alunos únicos
    const uniqueStudentIds = Array.from(new Set(uniqueStudents?.map(enrollment => enrollment.student_id) || []));
    const totalStudents = uniqueStudentIds.length;

    console.log('👥 Cursos adquiridos (matrículas ativas):', activeCount || 0);
    console.log('👨‍🎓 Total de alunos únicos:', totalStudents);

    // Para receita, buscar apenas cursos com preço - query separada e otimizada
    const { data: paidEnrollments, error: revenueError } = await supabase
      .from("matriculas")
      .select("cursos:course_id(price)")
      .eq("course_owner_id", userId)
      .eq("status", "active");

    if (revenueError) {
      console.warn('⚠️ Erro ao calcular receita, continuando sem receita:', revenueError);
    }

    // Calcular receita estimada apenas de matrículas ativas
    const totalRevenue = paidEnrollments?.reduce((sum, enrollment) => {
      const course = Array.isArray(enrollment.cursos) ? enrollment.cursos[0] : enrollment.cursos;
      const price = course?.price || 0;
      return sum + Number(price);
    }, 0) || 0;

    const stats = {
      activeEnrollments: activeCount || 0,
      totalStudents: totalStudents,
      totalRevenue: totalRevenue,
      stripePendingAmount: 0, // Será atualizado no dashboard
      stripePaidAmount: 0 // Será atualizado no dashboard
    };

    console.log('📊 Estatísticas finais calculadas:', stats);
    return stats;
  } catch (error) {
    console.error("❌ Erro ao buscar estatísticas de matrículas:", error);
    toast({
      title: "Erro ao carregar estatísticas",
      description: "As estatísticas de matrículas não puderam ser carregadas.",
      variant: "destructive",
    });
    return {
      activeEnrollments: 0,
      totalStudents: 0,
      totalRevenue: 0,
      stripePendingAmount: 0,
      stripePaidAmount: 0
    };
  }
}

// ==================================================================================
// ⚠️  FUNÇÕES ORIGINAIS MANTIDAS PARA COMPATIBILIDADE (fazem getUser)
// ==================================================================================

export async function getMentorProfile(): Promise<Profile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    return getMentorProfileById(user.id);
  } catch (error) {
    console.error("Error fetching mentor profile:", error);
    return null;
  }
}

export async function getMentorCourses(): Promise<Course[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    return getMentorCoursesById(user.id);
  } catch (error) {
    console.error("Error fetching mentor courses:", error);
    return [];
  }
}

export async function getMentorFollowersCount(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    return getMentorFollowersCountById(user.id);
  } catch (error) {
    console.error("Error fetching follower count:", error);
    return 0;
  }
}

export async function getMentorEnrollmentStats(): Promise<MentorEnrollmentStats> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    return getMentorEnrollmentStatsById(user.id);
  } catch (error) {
    console.error("Error fetching enrollment stats:", error);
    return {
      activeEnrollments: 0,
      totalStudents: 0,
      totalRevenue: 0,
      stripePendingAmount: 0,
      stripePaidAmount: 0
    };
  }
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  course_id: string;
  created_at: string;
  updated_at: string;
  order_index: number;
  cursos?: {
    id: string;
    title: string;
  };
}

export async function getMentorModules(limit = 5): Promise<Module[]> {
  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Not authenticated");
    
    const { data: modules, error } = await supabase
      .from("modulos")
      .select(`
        id, 
        title, 
        description, 
        course_id, 
        created_at, 
        updated_at, 
        order_index,
        cursos!inner(id, title, mentor_id)
      `)
      .eq("cursos.mentor_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    // Transform the data to match the Module interface
    const transformedModules: Module[] = modules ? modules.map(mod => ({
      id: mod.id,
      name: mod.title,
      description: mod.description,
      course_id: mod.course_id,
      created_at: mod.created_at,
      updated_at: mod.updated_at,
      order_index: mod.order_index,
      cursos: Array.isArray(mod.cursos) && mod.cursos.length > 0 ? {
        id: mod.cursos[0].id,
        title: mod.cursos[0].title
      } : undefined
    })) : [];
    
    return transformedModules;
  } catch (error) {
    console.error("Error fetching mentor modules:", error);
    toast({
      title: "Error fetching modules",
      description: "Your recent modules could not be loaded.",
      variant: "destructive",
    });
    return [];
  }
}

export async function getFeaturedMentors(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select('*')
      .eq("role", "mentor")
      .order("updated_at", { ascending: false })
      .limit(3);

    if (error) throw error;

    return (data as Profile[]) || [];
  } catch (error) {
    console.error("Error fetching featured mentors:", error);
    return [];
  }
}

export async function getAllPublicMentors(): Promise<Mentor[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select('*')
      .eq("role", "mentor")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    // Mapear Profile para Mentor garantindo todos os campos
    const mentors: Mentor[] = (data || []).map(profile => ({
      id: profile.id,
      full_name: profile.full_name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      highlight_message: profile.highlight_message,
      phone: profile.phone,
      sm_tit1: profile.sm_tit1,
      sm_desc1: profile.sm_desc1,
      sm_tit2: profile.sm_tit2,
      sm_desc2: profile.sm_desc2,
      sm_tit3: profile.sm_tit3,
      sm_desc3: profile.sm_desc3,
      category: profile.category,
      category_id: profile.category_id,
      courses_count: 0,
      followers_count: 0
    }));

    return mentors;
  } catch (error) {
    console.error("Error fetching public mentors:", error);
    throw error;
  }
}

// Buscar módulos por curso
export async function getModulosByCurso(cursoId: string) {
  const { data, error } = await supabase
    .from('modulos')
    .select(`
      id,
      title,
      description,
      course_id,
      order_index,
      created_at,
      updated_at
    `)
    .eq('course_id', cursoId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Erro ao buscar módulos:', error);
    return [];
  }

  return (data || []).map(mod => ({
    id: mod.id,
    name: mod.title,
    description: mod.description,
    course_id: mod.course_id,
    order_index: mod.order_index,
    created_at: mod.created_at,
    updated_at: mod.updated_at
  }));
}

// ==================================================================================
// ✅ FUNÇÕES PARA GRÁFICOS E ANALYTICS
// ==================================================================================

export async function getEnrollmentStatsById(userId: string, periodDays = 30): Promise<EnrollmentDataPoint[]> {
  try {
    if (!userId) throw new Error("User ID is required");

    console.log('📈 Buscando estatísticas de inscrição para mentor:', userId);
    
    // Calculate the date X days ago
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    
    // Format date for Supabase query
    const startDateStr = startDate.toISOString();
    
    // Buscar matrículas dos cursos que este mentor criou
    const { data: enrollments, error } = await supabase
      .from("matriculas")
      .select("enrolled_at, studant_name, course_owner_name")
      .eq("course_owner_id", userId)
      .gte("enrolled_at", startDateStr)
      .order("enrolled_at", { ascending: true });

    if (error) throw error;

    console.log('📊 Inscrições encontradas:', enrollments?.length || 0, enrollments);
    
    // Process data for chart display - Group by date and count
    const enrollmentByDate = enrollments?.reduce((acc, enrollment) => {
      // Ensure enrollment.enrolled_at is not null or undefined before creating Date object
      if (enrollment.enrolled_at) {
        const date = new Date(enrollment.enrolled_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};
    
    // Convert to array format for charts
    const chartData = Object.entries(enrollmentByDate).map(([date, count]) => ({
      date,
      count,
    }));

    console.log('📈 Dados do gráfico:', chartData);
    
    return chartData;
  } catch (error) {
    console.error("❌ Erro ao buscar estatísticas de inscrição:", error);
    toast({
      title: "Erro ao carregar dados de inscrição",
      description: "As estatísticas de inscrição não puderam ser carregadas.",
      variant: "destructive",
    });
    return [];
  }
}

export async function getEnrollmentStats(periodDays = 30): Promise<EnrollmentDataPoint[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    return getEnrollmentStatsById(user.id, periodDays);
  } catch (error) {
    console.error("Error fetching enrollment stats:", error);
    return [];
  }
}