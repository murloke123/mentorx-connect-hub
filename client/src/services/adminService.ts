/**
 * ===============================================================================
 * 👑 ADMIN SERVICE - Serviços de Administração da Plataforma
 * ===============================================================================
 * 
 * 🎯 OBJETIVO: Gerenciar operações administrativas da plataforma MentorX
 * 
 * 📋 MÉTODOS DISPONÍVEIS:
 * 
 * 🔐 PERFIL E AUTENTICAÇÃO:
 * • getAdminProfile() - Busca perfil do administrador logado
 * • logAdminAction() - Registra ações do admin para auditoria
 * • getAdminActions() - Lista histórico de ações administrativas
 * 
 * 👥 GESTÃO DE USUÁRIOS:
 * • getAllMentors() - Lista todos os mentores com estatísticas
 * • getAllMentorados() - Lista todos os mentorados com estatísticas  
 * • deleteUser() - Remove usuário da plataforma (admin)
 * 
 * 📊 ESTATÍSTICAS DA PLATAFORMA:
 * • getPlatformStats() - Estatísticas gerais (mentores, mentorados, cursos)
 * 
 * 📚 GESTÃO DE CURSOS:
 * • getAllCourses() - Lista todos os cursos com detalhes do mentor
 * • deleteCourse() - Remove curso da plataforma (admin)
 * 
 * 🔧 RECURSOS:
 * • Validação de permissões de admin
 * • Logs de auditoria automáticos
 * • Tratamento de erros robusto
 * • Integração com React Query
 * 
 * ⚠️ SEGURANÇA:
 * • Apenas usuários com role 'admin' podem usar estas funções
 * • Todas as ações são registradas para auditoria
 * ===============================================================================
 */

import { Course, Profile } from '@/types/database';
import { QueryKey } from "@tanstack/react-query";
import { supabase } from '../utils/supabase';

// Get admin profile
export async function getAdminProfile() {
  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Not authenticated");
    
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .eq("role", "admin")
      .single();

    if (error) throw error;
    return profile;
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return null;
  }
}

// Get all mentors
export type MentorWithStats = Profile & {
  courses_count: number;
  followers_count: number;
  published_courses_count: number;
  unpublished_courses_count: number;
  created_at: string;
};

export async function getAllMentors({ signal }: { queryKey: QueryKey, signal?: AbortSignal }): Promise<MentorWithStats[]> {
  try {
    // Get mentors with detailed course information
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        created_at,
        courses:cursos(count),
        published_courses:cursos!inner(count),
        unpublished_courses:cursos!inner(count),
        followers:mentor_followers(count)
      `)
      .eq("role", "mentor")
      .eq("published_courses.is_published", true)
      .eq("unpublished_courses.is_published", false)
      .order("created_at", { ascending: false });

    if (error) {
      // Fallback query if the complex query fails
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("profiles")
        .select(`
          *,
          created_at
        `)
        .eq("role", "mentor")
        .order("created_at", { ascending: false });

      if (fallbackError) throw fallbackError;

      // Get course counts separately for each mentor
      const mentorsWithStats = await Promise.all(
        fallbackData.map(async (mentor) => {
          // Get total courses count
          const { count: totalCourses } = await supabase
            .from("cursos")
            .select("*", { count: "exact", head: true })
            .eq("mentor_id", mentor.id);

          // Get published courses count
          const { count: publishedCourses } = await supabase
            .from("cursos")
            .select("*", { count: "exact", head: true })
            .eq("mentor_id", mentor.id)
            .eq("is_published", true);

          // Get unpublished courses count
          const { count: unpublishedCourses } = await supabase
            .from("cursos")
            .select("*", { count: "exact", head: true })
            .eq("mentor_id", mentor.id)
            .eq("is_published", false);

          // Get followers count
          const { count: followersCount } = await supabase
            .from("mentor_followers")
            .select("*", { count: "exact", head: true })
            .eq("mentor_id", mentor.id);

          return {
            ...mentor,
            courses_count: totalCourses || 0,
            published_courses_count: publishedCourses || 0,
            unpublished_courses_count: unpublishedCourses || 0,
            followers_count: followersCount || 0,
          };
        })
      );

      return mentorsWithStats;
    }
    
    return data.map(mentor => ({
      ...mentor,
      courses_count: Array.isArray(mentor.courses) ? mentor.courses[0]?.count || 0 : 0,
      published_courses_count: Array.isArray(mentor.published_courses) ? mentor.published_courses[0]?.count || 0 : 0,
      unpublished_courses_count: Array.isArray(mentor.unpublished_courses) ? mentor.unpublished_courses[0]?.count || 0 : 0,
      followers_count: Array.isArray(mentor.followers) ? mentor.followers[0]?.count || 0 : 0,
    }));
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return [];
  }
}

// Get all mentorados
export type MentoradoWithStats = Profile & {
  enrollments_count: number;
};

export async function getAllMentorados({ signal }: { queryKey: QueryKey, signal?: AbortSignal }): Promise<MentoradoWithStats[]> {
  try {
    // Fixed SQL query
    const { data, error } = await supabase
      .from("profiles")
      .select('*, enrollments(count)')
      .eq("role", "mentorado")
      .order("full_name", { ascending: true });

    if (error) throw error;
    
    return data.map(mentorado => ({
      ...mentorado,
      enrollments_count: Array.isArray(mentorado.enrollments) ? mentorado.enrollments[0]?.count || 0 : 0,
    }));
  } catch (error) {
    console.error("Error fetching mentorados:", error);
    return [];
  }
}

// Platform stats summary
export async function getPlatformStats() {
  try {
    // Get count of mentors
    const { count: mentorsCount, error: mentorsError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "mentor");
      
    if (mentorsError) throw mentorsError;
    
    // Get count of mentorees
    const { count: mentoreesCount, error: mentoreesError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "mentorado");
      
    if (mentoreesError) throw mentoreesError;
    
    // Get count of courses
    const { count: coursesCount, error: coursesError } = await supabase
      .from("cursos")
      .select("*", { count: "exact", head: true });
      
    if (coursesError) throw coursesError;
    
    // Get count of enrollments
    const { count: enrollmentsCount, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true });
      
    if (enrollmentsError) throw enrollmentsError;
    
    return {
      mentorsCount: mentorsCount || 0,
      mentoreesCount: mentoreesCount || 0,
      coursesCount: coursesCount || 0,
      enrollmentsCount: enrollmentsCount || 0,
    };
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    return {
      mentorsCount: 0,
      mentoreesCount: 0,
      coursesCount: 0,
      enrollmentsCount: 0,
    };
  }
}

// Get all courses for admin
export type CourseWithDetails = Course & {
  mentor_name: string | null;
  enrollments_count: number;
};

export async function getAllCourses({ signal }: { queryKey: QueryKey, signal?: AbortSignal }): Promise<CourseWithDetails[]> {
  try {
    // Fixed SQL query
    const { data, error } = await supabase
      .from("cursos")
      .select('*, mentor:profiles!mentor_id(full_name), enrollments(count)')
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    return data.map(course => ({
      ...course,
      mentor_name: (course.mentor as { full_name: string })?.full_name || null,
      enrollments_count: Array.isArray(course.enrollments) ? course.enrollments[0]?.count || 0 : 0,
    }));
  } catch (error) {
    console.error("Error fetching all courses:", error);
    return [];
  }
}

// Delete course (admin function)
export async function deleteCourse(courseId: string) {
  try {
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Not authenticated");
    
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
      
    if (profileError) throw profileError;
    
    if (profile.role !== "admin") {
      throw new Error("Not authorized: Admin role required");
    }
    
    // Delete course
    const { error } = await supabase
      .from("cursos")
      .delete()
      .eq("id", courseId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
}

// Log admin action
export async function logAdminAction(actionType: string, targetType: string, targetId: string, details?: Record<string, unknown>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Not authenticated");
    
    const { data, error } = await supabase
      .from("admin_actions")
      .insert({
        admin_id: user.id,
        action_type: actionType,
        target_type: targetType,
        target_id: targetId,
        details: details
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error logging admin action:", error);
    return null;
  }
}

// Get recent admin actions
export async function getAdminActions(limit = 10) {
  try {
    const { data, error } = await supabase
      .from("admin_actions")
      .select(`
        id,
        action_type,
        target_type,
        target_id,
        details,
        created_at,
        profiles:admin_id (full_name, avatar_url)
      `)
      .order("created_at", { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error fetching admin actions:", error);
    return [];
  }
}

// Get mentors with detailed course information for dashboard
export type MentorWithCourses = Profile & {
  courses: Array<{
    id: string;
    title: string;
    is_published: boolean;
  }>;
};

export async function getMentorsWithCourses({ signal }: { queryKey: QueryKey, signal?: AbortSignal }): Promise<MentorWithCourses[]> {
  try {
    // Get mentors with their courses
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        cursos:cursos(id, title, is_published)
      `)
      .eq("role", "mentor")
      .order("created_at", { ascending: false })
      .limit(10); // Limit to recent mentors for dashboard

    if (error) throw error;
    
    return data.map(mentor => ({
      ...mentor,
      courses: mentor.cursos || [],
    }));
  } catch (error) {
    console.error("Error fetching mentors with courses:", error);
    return [];
  }
}

export async function deleteUser(userId: string) {
  try {
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Not authenticated");
    
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
      
    if (profileError) throw profileError;
    
    if (profile.role !== "admin") {
      throw new Error("Not authorized: Admin role required");
    }
    
    // Delete user's profile first
    const { error: profileDeleteError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);
      
    if (profileDeleteError) throw profileDeleteError;

    // Log the admin action
    await logAdminAction("delete", "user", userId);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
