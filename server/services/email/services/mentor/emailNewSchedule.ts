/**
 * Serviço de E-mail de Novo Agendamento
 * Envia e-mail de notificação para mentores quando um novo agendamento é criado
 */

import * as brevo from '@getbrevo/brevo';
import brevoClient, { emailConfig } from '../../config/brevoClient';
import { newScheduleTemplate } from '../../templates/mentor/newScheduleTemplate';
import { EmailResponse, NewScheduleEmailData } from '../../types/emailTypes';

export async function enviarEmailNovoAgendamento(data: NewScheduleEmailData): Promise<EmailResponse> {
  try {
    console.log('\n🚀 [EMAIL-SERVICE] Iniciando envio de email de novo agendamento');
    
    // Preparar parâmetros do template
    const templateParams: Record<string, string> = {
      MENTOR_NAME: data.mentorName,
      MENTOR_EMAIL: data.mentorEmail,
      MENTEE_NAME: data.menteeName,
      APPOINTMENT_DATE: data.appointmentDate,
      APPOINTMENT_TIME: data.appointmentTime,
      TIMEZONE: data.timezone,
      NOTES: data.notes || '',
      AGENDAMENTOS_URL: data.agendamentosUrl,
      SUPPORT_URL: data.supportUrl,
      CURRENT_YEAR: new Date().getFullYear().toString()
    };

    // Substituir variáveis no template
    let htmlContent = newScheduleTemplate.htmlContent;
    let textContent = newScheduleTemplate.textContent || '';
    let subject = newScheduleTemplate.subject;

    // Substituir todas as variáveis
    Object.entries(templateParams).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
    });

    // Tratar condicionais do template
    if (data.notes && data.notes.trim()) {
      // Manter seção das observações
      htmlContent = htmlContent.replace(/\{\{#if NOTES\}\}/g, '');
      htmlContent = htmlContent.replace(/\{\{\/if\}\}/g, '');
      textContent = textContent.replace(/\{\{#if NOTES\}\}/g, '');
      textContent = textContent.replace(/\{\{\/if\}\}/g, '');
    } else {
      // Remover seção das observações
      htmlContent = htmlContent.replace(/\{\{#if NOTES\}\}[\s\S]*?\{\{\/if\}\}/g, '');
      textContent = textContent.replace(/\{\{#if NOTES\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }

    // Configurar e-mail
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = emailConfig.sender;
    sendSmtpEmail.to = [{ email: data.mentorEmail, name: data.mentorName }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.textContent = textContent;
    sendSmtpEmail.headers = emailConfig.headers;
    sendSmtpEmail.tags = ['novo-agendamento', 'mentor', 'notificacao'];

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