/**
 * Serviço de E-mail para Notificação de Venda de Curso
 * Envia e-mail para o mentor quando um mentorado compra seu curso
 */

import * as brevo from '@getbrevo/brevo';
import brevoClient, { emailConfig } from '../../config/brevoClient';
import { emailSendCourseBuyTemplate } from '../../templates/mentor/emailSendCourseBuyTemplate';
import { BrevoEmailParams, EmailResponse } from '../../types/emailTypes';

export interface CourseBuyEmailData {
  mentorName: string;
  mentorEmail: string;
  buyerName: string;
  courseName: string;
  coursePrice: number;
  transactionId?: string;
}

export async function enviarEmailVendaCurso(data: CourseBuyEmailData): Promise<EmailResponse> {
  try {
    console.log('🎯 [BREVO-COURSE-BUY] Iniciando envio de e-mail de venda de curso');
    console.log('🎯 [BREVO-COURSE-BUY] Dados recebidos:', JSON.stringify(data, null, 2));

    // Formatar preço em reais
    const formattedPrice = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(data.coursePrice);

    // Preparar parâmetros do template
    const templateParams: BrevoEmailParams = {
      MENTOR_NAME: data.mentorName,
      BUYER_NAME: data.buyerName,
      COURSE_NAME: data.courseName,
      COURSE_PRICE: formattedPrice,
      TRANSACTION_ID: data.transactionId || 'N/A',
      SALE_DATE: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      CURRENT_YEAR: new Date().getFullYear().toString()
    };

    console.log('🔧 [BREVO-COURSE-BUY] Parâmetros do template:', JSON.stringify(templateParams, null, 2));

    // Substituir variáveis no template
    let htmlContent = emailSendCourseBuyTemplate.htmlContent;
    let textContent = emailSendCourseBuyTemplate.textContent || '';
    let subject = emailSendCourseBuyTemplate.subject;

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
    sendSmtpEmail.tags = ['venda', 'curso', 'mentor', 'parabens'];

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

    console.log('📤 [BREVO-COURSE-BUY] Payload enviado para API Brevo:', JSON.stringify(brevoPayload, null, 2));
    console.log('📤 [BREVO-COURSE-BUY] Chamando brevoClient.sendTransacEmail()...');

    // Enviar e-mail
    const response = await brevoClient.sendTransacEmail(sendSmtpEmail);
    
    console.log('📥 [BREVO-COURSE-BUY] Resposta da API Brevo:');
    console.log('📥 [BREVO-COURSE-BUY] Status:', response.response?.statusCode);
    console.log('📥 [BREVO-COURSE-BUY] Headers:', JSON.stringify(response.response?.headers, null, 2));
    console.log('📥 [BREVO-COURSE-BUY] Body:', JSON.stringify(response.body, null, 2));
    
    console.log('✅ [BREVO-COURSE-BUY] E-mail de venda de curso enviado com sucesso!');
    console.log('✅ [BREVO-COURSE-BUY] Detalhes:', {
      messageId: response.body.messageId,
      mentorEmail: data.mentorEmail,
      mentorName: data.mentorName,
      buyerName: data.buyerName,
      courseName: data.courseName,
      coursePrice: formattedPrice,
      subject: subject,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      messageId: response.body.messageId
    };

  } catch (error) {
    console.error('❌ [BREVO-COURSE-BUY] ERRO CRÍTICO no envio de e-mail:');
    console.error('❌ [BREVO-COURSE-BUY] Tipo do erro:', error?.constructor?.name);
    console.error('❌ [BREVO-COURSE-BUY] Mensagem:', error instanceof Error ? error.message : error);
    console.error('❌ [BREVO-COURSE-BUY] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    
    // Log adicional para erros da API Brevo
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as any;
      console.error('❌ [BREVO-COURSE-BUY] Resposta de erro da API Brevo:');
      console.error('❌ [BREVO-COURSE-BUY] Status:', apiError.response?.status);
      console.error('❌ [BREVO-COURSE-BUY] Data:', JSON.stringify(apiError.response?.data, null, 2));
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar e-mail'
    };
  }
}

export default enviarEmailVendaCurso;