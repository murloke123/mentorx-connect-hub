/**
 * Serviço de E-mail de Boas-Vindas para Mentores
 * Envia e-mail de boas-vindas personalizado para novos mentores
 */

import * as brevo from '@getbrevo/brevo';
import brevoClient, { emailConfig } from '../../config/brevoClient';
import { boasVindasMentorTemplate } from '../../templates/mentor/boasVindasMentorTemplate';
import { BrevoEmailParams, EmailResponse, WelcomeEmailData } from '../../types/emailTypes';

export async function enviarEmailBoasVindasMentor(data: WelcomeEmailData): Promise<EmailResponse> {
  try {
    console.log('🎯 [BREVO-MENTOR] Iniciando envio de e-mail para mentor');
    console.log('🎯 [BREVO-MENTOR] Dados recebidos:', JSON.stringify(data, null, 2));

    // Preparar parâmetros do template
    const templateParams: BrevoEmailParams = {
      NOME_USUARIO: data.userName,
      EMAIL_USUARIO: data.userEmail,
      URL_LOGIN: data.loginUrl,
      URL_SUPORTE: data.supportUrl,
      ANO_ATUAL: new Date().getFullYear().toString(),
      ROLE_USUARIO: data.userRole
    };

    console.log('🔧 [BREVO-MENTOR] Parâmetros do template:', JSON.stringify(templateParams, null, 2));

    // Substituir variáveis no template
    let htmlContent = boasVindasMentorTemplate.htmlContent;
    let textContent = boasVindasMentorTemplate.textContent || '';
    let subject = boasVindasMentorTemplate.subject;

    // Substituir todas as variáveis
    Object.entries(templateParams).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
    });

    // Configurar e-mail
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = emailConfig.sender;
    sendSmtpEmail.to = [{ email: data.userEmail, name: data.userName }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.textContent = textContent;
    sendSmtpEmail.headers = emailConfig.headers;
    sendSmtpEmail.tags = ['boas-vindas', 'mentor', 'onboarding'];

    // Log do payload que será enviado para o Brevo
    const brevoPayload = {
      sender: sendSmtpEmail.sender,
      to: sendSmtpEmail.to,
      subject: sendSmtpEmail.subject,
      htmlContent: htmlContent.substring(0, 200) + '... (truncado para log)',
      textContent: textContent.substring(0, 200) + '... (truncado para log)',
      headers: sendSmtpEmail.headers,
      tags: sendSmtpEmail.tags
    };

    console.log('📤 [BREVO-MENTOR] Payload enviado para API Brevo:', JSON.stringify(brevoPayload, null, 2));
    console.log('📤 [BREVO-MENTOR] Chamando brevoClient.sendTransacEmail()...');

    // Enviar e-mail
    const response = await brevoClient.sendTransacEmail(sendSmtpEmail);
    
    console.log('📥 [BREVO-MENTOR] Resposta da API Brevo:');
    console.log('📥 [BREVO-MENTOR] Status:', response.response?.statusCode);
    console.log('📥 [BREVO-MENTOR] Headers:', JSON.stringify(response.response?.headers, null, 2));
    console.log('📥 [BREVO-MENTOR] Body:', JSON.stringify(response.body, null, 2));
    
    console.log('✅ [BREVO-MENTOR] E-mail de boas-vindas para mentor enviado com sucesso!');
    console.log('✅ [BREVO-MENTOR] Detalhes:', {
      messageId: response.body.messageId,
      email: data.userEmail,
      name: data.userName,
      subject: subject,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      messageId: response.body.messageId
    };

  } catch (error) {
    console.error('❌ [BREVO-MENTOR] ERRO CRÍTICO no envio de e-mail:');
    console.error('❌ [BREVO-MENTOR] Tipo do erro:', error?.constructor?.name);
    console.error('❌ [BREVO-MENTOR] Mensagem:', error instanceof Error ? error.message : error);
    console.error('❌ [BREVO-MENTOR] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    
    // Log adicional para erros da API Brevo
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as any;
      console.error('❌ [BREVO-MENTOR] Resposta de erro da API Brevo:');
      console.error('❌ [BREVO-MENTOR] Status:', apiError.response?.status);
      console.error('❌ [BREVO-MENTOR] Data:', JSON.stringify(apiError.response?.data, null, 2));
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar e-mail'
    };
  }
}

export default enviarEmailBoasVindasMentor; 