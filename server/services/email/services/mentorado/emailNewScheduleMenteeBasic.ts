/**
 * Email Service BÁSICO para Confirmação de Agendamento - Mentorado
 * Versão simplificada SEM condicionais para testar Template Render Error
 */

import * as brevo from '@getbrevo/brevo';
import brevoClient, { emailConfig } from '../../config/brevoClient';
import { emailNewScheduleMenteeBasicTemplate } from '../../templates/mentorado/emailNewScheduleMenteeBasic';
import { NewScheduleEmailDataMentee, EmailResponse } from '../../types/emailTypes';

/**
 * Envia email BÁSICO de confirmação de agendamento para o mentorado
 */
export async function sendNewScheduleEmailToMenteeBasic(data: NewScheduleEmailDataMentee): Promise<EmailResponse> {
  try {
    console.log('\n🚀 [EMAIL-SERVICE-BASIC] Iniciando envio de email BÁSICO para mentorado');
    console.log('🔍 [DEBUG-BASIC] Dados recebidos:', JSON.stringify(data, null, 2));

    // Preparar parâmetros do template (SEM condicionais)
    const templateParams: Record<string, string> = {
      MENTOR_NAME: data.mentorName || 'Mentor',
      MENTEE_NAME: data.menteeName || 'Mentorado',
      MENTEE_EMAIL: data.menteeEmail || 'email',
      APPOINTMENT_DATE: data.appointmentDate || 'Data',
      APPOINTMENT_TIME: data.appointmentTime || 'Horário',
      TIMEZONE: data.timezone || 'UTC',
      NOTES: data.notes || 'Nenhuma observação',
      MEET_LINK: data.meetLink || 'https://meet.jit.si/test',
      AGENDAMENTOS_URL: data.agendamentosUrl || 'https://app.mentoraai.com.br',
      SUPPORT_URL: data.supportUrl || 'https://app.mentoraai.com.br/suporte',
      CURRENT_YEAR: new Date().getFullYear().toString()
    };

    console.log('📤 [EMAIL-SERVICE-BASIC] Parâmetros do template:', JSON.stringify(templateParams, null, 2));

    // Processar conteúdo HTML e texto (SEM condicionais complexos)
    let htmlContent = emailNewScheduleMenteeBasicTemplate.htmlContent;
    let textContent = emailNewScheduleMenteeBasicTemplate.textContent || '';
    let subject = emailNewScheduleMenteeBasicTemplate.subject;

    // Substituir variáveis no template (apenas substituição simples)
    Object.entries(templateParams).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, value);
      textContent = textContent.replace(regex, value);
      subject = subject.replace(regex, value);
    });

    console.log('📧 [EMAIL-SERVICE-BASIC] Template processado - Subject:', subject);
    console.log('🔍 [DEBUG-BASIC] HTML Content length:', htmlContent.length);

    // Configurar destinatário e remetente
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: data.menteeEmail, name: data.menteeName }];
    sendSmtpEmail.sender = emailConfig.sender;
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.textContent = textContent;
    sendSmtpEmail.tags = ['agendamento', 'confirmacao', 'mentorado', 'basic'];

    console.log('📤 [EMAIL-SERVICE-BASIC] Enviando email via Brevo API...');

    // Enviar email via Brevo
    const response = await brevoClient.sendTransacEmail(sendSmtpEmail);

    // Log da resposta do Brevo
    const brevoResponse = {
      statusCode: response.response?.statusCode,
      statusMessage: response.response?.statusMessage,
      messageId: response.body?.messageId
    };
    
    console.log('✅ [EMAIL-SERVICE-BASIC] Resposta do Brevo:', brevoResponse);
    console.log('✅ [EMAIL-SERVICE-BASIC] Email enviado com sucesso!');

    return {
      success: true,
      messageId: response.body?.messageId
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ [EMAIL-SERVICE-BASIC] Erro ao enviar email:', errorMessage);
    console.error('❌ [EMAIL-SERVICE-BASIC] Stack trace:', error);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}
