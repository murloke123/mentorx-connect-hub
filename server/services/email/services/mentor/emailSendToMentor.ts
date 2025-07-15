/**
 * Serviço de E-mail para Envio de Mensagens para Mentor
 * Envia e-mail para o mentor quando alguém envia uma mensagem através do formulário de contato
 */

import * as brevo from '@getbrevo/brevo';
import brevoClient, { emailConfig } from '../../config/brevoClient';
import { emailSendToMentorTemplate } from '../../templates/mentor/emailSendToMentorTemplate';
import { BrevoEmailParams, EmailResponse, SendToMentorEmailData } from '../../types/emailTypes';

export async function enviarEmailParaMentor(data: SendToMentorEmailData): Promise<EmailResponse> {
  try {
    console.log('🎯 [BREVO-CONTACT] Iniciando envio de e-mail para mentor');
    console.log('🎯 [BREVO-CONTACT] Dados recebidos:', JSON.stringify(data, null, 2));

    // Preparar parâmetros do template
    const templateParams: BrevoEmailParams = {
      MENTOR_NAME: data.mentorName,
      MENTOR_EMAIL: data.mentorEmail,
      SENDER_NAME: data.senderName,
      SENDER_EMAIL: data.senderEmail,
      MESSAGE_CONTENT: data.messageContent,
      MESSAGE_DATE: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      CURRENT_YEAR: new Date().getFullYear().toString()
    };

    console.log('🔧 [BREVO-CONTACT] Parâmetros do template:', JSON.stringify(templateParams, null, 2));

    // Substituir variáveis no template
    let htmlContent = emailSendToMentorTemplate.htmlContent;
    let textContent = emailSendToMentorTemplate.textContent || '';
    let subject = emailSendToMentorTemplate.subject;

    // Substituir todas as variáveis
    Object.entries(templateParams).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value || '');
      textContent = textContent.replace(new RegExp(placeholder, 'g'), value || '');
      subject = subject.replace(new RegExp(placeholder, 'g'), value || '');
    });

    // Configurar e-mail
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = emailConfig.sender;
    sendSmtpEmail.to = [{ email: data.mentorEmail, name: data.mentorName }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.textContent = textContent;
    sendSmtpEmail.headers = emailConfig.headers;
    sendSmtpEmail.tags = ['contato', 'mentor', 'mensagem'];
    
    // Configurar reply-to para o remetente da mensagem
    sendSmtpEmail.replyTo = { email: data.senderEmail, name: data.senderName };

    // Log do payload que será enviado para o Brevo
    const brevoPayload = {
      sender: sendSmtpEmail.sender,
      to: sendSmtpEmail.to,
      replyTo: sendSmtpEmail.replyTo,
      subject: sendSmtpEmail.subject,
      htmlContent: htmlContent.substring(0, 200) + '... (truncado para log)',
      textContent: textContent.substring(0, 200) + '... (truncado para log)',
      headers: sendSmtpEmail.headers,
      tags: sendSmtpEmail.tags
    };

    console.log('📤 [BREVO-CONTACT] Payload enviado para API Brevo:', JSON.stringify(brevoPayload, null, 2));
    console.log('📤 [BREVO-CONTACT] Chamando brevoClient.sendTransacEmail()...');

    // Enviar e-mail
    const response = await brevoClient.sendTransacEmail(sendSmtpEmail);
    
    console.log('📥 [BREVO-CONTACT] Resposta da API Brevo:');
    console.log('📥 [BREVO-CONTACT] Status:', response.response?.statusCode);
    console.log('📥 [BREVO-CONTACT] Headers:', JSON.stringify(response.response?.headers, null, 2));
    console.log('📥 [BREVO-CONTACT] Body:', JSON.stringify(response.body, null, 2));
    
    console.log('✅ [BREVO-CONTACT] E-mail de contato para mentor enviado com sucesso!');
    console.log('✅ [BREVO-CONTACT] Detalhes:', {
      messageId: response.body.messageId,
      mentorEmail: data.mentorEmail,
      mentorName: data.mentorName,
      senderEmail: data.senderEmail,
      senderName: data.senderName,
      subject: subject,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      messageId: response.body.messageId
    };

  } catch (error) {
    console.error('❌ [BREVO-CONTACT] ERRO CRÍTICO no envio de e-mail:');
    console.error('❌ [BREVO-CONTACT] Tipo do erro:', error?.constructor?.name);
    console.error('❌ [BREVO-CONTACT] Mensagem:', error instanceof Error ? error.message : error);
    console.error('❌ [BREVO-CONTACT] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    
    // Log adicional para erros da API Brevo
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as any;
      console.error('❌ [BREVO-CONTACT] Resposta de erro da API Brevo:');
      console.error('❌ [BREVO-CONTACT] Status:', apiError.response?.status);
      console.error('❌ [BREVO-CONTACT] Data:', JSON.stringify(apiError.response?.data, null, 2));
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar e-mail'
    };
  }
}

export default enviarEmailParaMentor;