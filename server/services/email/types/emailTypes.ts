/**
 * Email Types
 * Define os tipos TypeScript para o sistema de e-mails
 */

export interface EmailRecipient {
  email: string;
  name: string;
}

export interface EmailSender {
  email: string;
  name: string;
}

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export interface EmailData {
  to: EmailRecipient[];
  sender: EmailSender;
  subject: string;
  htmlContent: string;
  textContent?: string;
  tags?: string[];
  templateId?: number;
  params?: Record<string, any>;
}

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  userRole: 'mentor' | 'mentorado';
  loginUrl: string;
  supportUrl: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface BrevoEmailParams {
  NOME_USUARIO?: string;
  EMAIL_USUARIO?: string;
  URL_LOGIN?: string;
  URL_SUPORTE?: string;
  ANO_ATUAL?: string;
  ROLE_USUARIO?: string;
  // Calendar cancel params
  MENTOR_NAME?: string;
  MENTEE_NAME?: string;
  MENTEE_EMAIL?: string;
  APPOINTMENT_DATE?: string;
  APPOINTMENT_TIME?: string;
  TIMEZONE?: string;
  CANCELLATION_REASON?: string;
  PLATFORM_URL?: string;
  SUPPORT_URL?: string;
  CURRENT_YEAR?: string;
  // New schedule params
  MENTOR_EMAIL?: string;
  AGENDAMENTOS_URL?: string;
  // Contact mentor params
  SENDER_NAME?: string;
  SENDER_EMAIL?: string;
  MESSAGE_CONTENT?: string;
  MESSAGE_DATE?: string;
  [key: string]: string | undefined;
}

export interface NewScheduleEmailData {
  mentorName: string;
  mentorEmail: string;
  menteeName: string;
  appointmentDate: string;
  appointmentTime: string;
  timezone: string;
  notes?: string;
  meetLink?: string;
  agendamentosUrl: string;
  supportUrl: string;
}

export interface NewScheduleEmailDataMentee {
  mentorName: string;
  menteeName: string;
  menteeEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  timezone: string;
  notes?: string;
  meetLink?: string;
  agendamentosUrl: string;
  supportUrl: string;
}

export interface SendToMentorEmailData {
  mentorName: string;
  mentorEmail: string;
  senderName: string;
  senderEmail: string;
  messageContent: string;
}