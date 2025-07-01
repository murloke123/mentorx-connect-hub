import { supabase } from '../utils/supabase';
import { QueryKey } from "@tanstack/react-query";
import { Course, Profile } from '@/types/database';

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
};

export async function getAllMentors({ signal }: { queryKey: QueryKey, signal?: AbortSignal }): Promise<MentorWithStats[]> {
  try {
    // Fixed SQL query to avoid parsing errors
    const { data, error } = await supabase
      .from("profiles")
      .select('*, courses:cursos(count), followers:followers(count)')
      .eq("role", "mentor")
      .order("full_name", { ascending: true });

    if (error) throw error;
    
    return data.map(mentor => ({
      ...mentor,
      courses_count: Array.isArray(mentor.courses) ? mentor.courses[0]?.count || 0 : 0,
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
