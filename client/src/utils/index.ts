export interface User {
  id: string;
  name: string;
  email: string;
  role: "mentor" | "mentee" | "admin";
  bio?: string;
  profileImage?: string;
  areas?: string[];
}

export interface Material {
  id: string;
  title: string;
  type: "video" | "pdf" | "text";
  url?: string;
  content?: string;
}

export interface ScheduleSlot {
  id: string;
  mentorId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  isBooked: boolean;
  sessionId?: string;
}

export interface Session {
  id: string;
  slotId: string;
  mentorId: string;
  menteeId: string;
  comment?: string;
  status: "pending" | "approved" | "rejected" | "completed";
}

// Re-export from modular files
export type { Course, CourseFormData } from './course';
export type { Mentor } from '../types/database';
