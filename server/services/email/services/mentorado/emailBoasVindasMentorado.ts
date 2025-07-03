/**
 * Serviço de E-mail de Boas-Vindas para Mentorados
 * Envia e-mail de boas-vindas personalizado para novos mentorados
 */

import * as brevo from '@getbrevo/brevo';
import brevoClient, { emailConfig } from '../../config/brevoClient';
import { boasVindasMentoradoTemplate } from '../../templates/mentorado/boasVindasMentoradoTemplate';
import { BrevoEmailParams, EmailResponse, WelcomeEmailData } from '../../types/emailTypes';

export async function enviarEmailBoasVindasMentorado(data: WelcomeEmailData): Promise<EmailResponse> {
  try {
    console.log('🌟 [BREVO-MENTORADO] Iniciando envio de e-mail para mentorado');
    console.log('🌟 [BREVO-MENTORADO] Dados recebidos:', JSON.stringify(data, null, 2));

    // Preparar parâmetros do template
    const templateParams: BrevoEmailParams = {
      NOME_USUARIO: data.userName,
      EMAIL_USUARIO: data.userEmail,
      URL_LOGIN: data.loginUrl,
      URL_SUPORTE: data.supportUrl,
      ANO_ATUAL: new Date().getFullYear().toString(),
      ROLE_USUARIO: data.userRole
    };

    console.log('🔧 [BREVO-MENTORADO] Parâmetros do template:', JSON.stringify(templateParams, null, 2));

    // Substituir variáveis no template
    let htmlContent = boasVindasMentoradoTemplate.htmlContent;
    let textContent = boasVindasMentoradoTemplate.textContent || '';
    let subject = boasVindasMentoradoTemplate.subject;

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
    sendSmtpEmail.tags = ['boas-vindas', 'mentorado', 'onboarding'];

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

    console.log('📤 [BREVO-MENTORADO] Payload enviado para API Brevo:', JSON.stringify(brevoPayload, null, 2));
    console.log('📤 [BREVO-MENTORADO] Chamando brevoClient.sendTransacEmail()...');

    // Enviar e-mail
    const response = await brevoClient.sendTransacEmail(sendSmtpEmail);
    
    console.log('📥 [BREVO-MENTORADO] Resposta da API Brevo:');
    console.log('📥 [BREVO-MENTORADO] Status:', response.response?.statusCode);
    console.log('📥 [BREVO-MENTORADO] Headers:', JSON.stringify(response.response?.headers, null, 2));
    console.log('📥 [BREVO-MENTORADO] Body:', JSON.stringify(response.body, null, 2));
    
    console.log('✅ [BREVO-MENTORADO] E-mail de boas-vindas para mentorado enviado com sucesso!');
    console.log('✅ [BREVO-MENTORADO] Detalhes:', {
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
    console.error('❌ [BREVO-MENTORADO] ERRO CRÍTICO no envio de e-mail:');
    console.error('❌ [BREVO-MENTORADO] Tipo do erro:', error?.constructor?.name);
    console.error('❌ [BREVO-MENTORADO] Mensagem:', error instanceof Error ? error.message : error);
    console.error('❌ [BREVO-MENTORADO] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    
    // Log adicional para erros da API Brevo
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as any;
      console.error('❌ [BREVO-MENTORADO] Resposta de erro da API Brevo:');
      console.error('❌ [BREVO-MENTORADO] Status:', apiError.response?.status);
      console.error('❌ [BREVO-MENTORADO] Data:', JSON.stringify(apiError.response?.data, null, 2));
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar e-mail'
    };
  }
}

export default enviarEmailBoasVindasMentorado; 