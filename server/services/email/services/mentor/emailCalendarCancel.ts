/**
 * Serviço de E-mail de Cancelamento de Agendamento
 * Envia e-mail de cancelamento personalizado para mentorados
 */

import brevo from '@getbrevo/brevo';
import brevoClient, { emailConfig } from '../../config/brevoClient';
import { calendarCancelTemplate } from '../../templates/mentor/calendarCancelTemplate';

export interface CalendarCancelEmailData {
  mentorName: string;
  menteeName: string;
  menteeEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  timezone: string;
  cancellationReason?: string;
  platformUrl: string;
  supportUrl: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function enviarEmailCancelamentoAgendamento(data: CalendarCancelEmailData): Promise<EmailResponse> {
  try {
    console.log('\n🚀 [EMAIL-SERVICE] Iniciando envio de email de cancelamento');
    
    // Preparar parâmetros do template
    const templateParams: Record<string, string> = {
      MENTOR_NAME: data.mentorName,
      MENTEE_NAME: data.menteeName,
      MENTEE_EMAIL: data.menteeEmail,
      APPOINTMENT_DATE: data.appointmentDate,
      APPOINTMENT_TIME: data.appointmentTime,
      TIMEZONE: data.timezone,
      CANCELLATION_REASON: data.cancellationReason || '',
      PLATFORM_URL: data.platformUrl,
      SUPPORT_URL: data.supportUrl,
      CURRENT_YEAR: new Date().getFullYear().toString()
    };

    // Substituir variáveis no template
    let htmlContent = calendarCancelTemplate.htmlContent;
    let textContent = calendarCancelTemplate.textContent || '';
    let subject = calendarCancelTemplate.subject;

    // Substituir todas as variáveis
    Object.entries(templateParams).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
    });

    // Tratar condicionais do template
    if (data.cancellationReason) {
      // Manter seção do motivo
      htmlContent = htmlContent.replace(/\{\{#if CANCELLATION_REASON\}\}/g, '');
      htmlContent = htmlContent.replace(/\{\{\/if\}\}/g, '');
      textContent = textContent.replace(/\{\{#if CANCELLATION_REASON\}\}/g, '');
      textContent = textContent.replace(/\{\{\/if\}\}/g, '');
    } else {
      // Remover seção do motivo
      htmlContent = htmlContent.replace(/\{\{#if CANCELLATION_REASON\}\}[\s\S]*?\{\{\/if\}\}/g, '');
      textContent = textContent.replace(/\{\{#if CANCELLATION_REASON\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }

    // Configurar e-mail
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = emailConfig.sender;
    sendSmtpEmail.to = [{ email: data.menteeEmail, name: data.menteeName }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.textContent = textContent;
    sendSmtpEmail.headers = emailConfig.headers;
    sendSmtpEmail.tags = ['cancelamento', 'agendamento', 'mentor'];

    // Log do payload que será enviado para o Brevo
    const brevoPayload = {
      sender: sendSmtpEmail.sender,
      to: sendSmtpEmail.to,
      subject: sendSmtpEmail.subject,
      headers: sendSmtpEmail.headers,
      tags: sendSmtpEmail.tags,
      htmlContent: '[HTML CONTENT]',
      textContent: '[TEXT CONTENT]'
    };

    console.log('\n📤 [BREVO-API] Payload enviado:', JSON.stringify(brevoPayload, null, 2));

    // Enviar e-mail
    const response = await brevoClient.sendTransacEmail(sendSmtpEmail);
    
    // Log da resposta do Brevo
    const brevoResponse = {
      statusCode: response.response?.statusCode,
      statusMessage: response.response?.statusMessage,
      messageId: response.body?.messageId,
      timestamp: new Date().toISOString()
    };
    
    console.log('\n📥 [BREVO-API] Resposta recebida:', JSON.stringify(brevoResponse, null, 2));
    
    return {
      success: true,
      messageId: response.body?.messageId || 'sem-id'
    };

  } catch (error) {
    console.error('\n❌ [EMAIL-SERVICE] Erro no envio:', error);
    
    // Log de erro detalhado se for erro da API Brevo
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as any;
      const errorDetails = {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
      console.error('\n❌ [BREVO-API] Erro detalhado:', JSON.stringify(errorDetails, null, 2));
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar e-mail'
    };
  }
} 