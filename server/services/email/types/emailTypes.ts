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
  NOME_USUARIO: string;
  EMAIL_USUARIO: string;
  URL_LOGIN: string;
  URL_SUPORTE: string;
  ANO_ATUAL: string;
  ROLE_USUARIO: string;
} 