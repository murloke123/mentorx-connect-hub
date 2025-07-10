/**
 * Email Service para Confirmação de Agendamento - Mentorado
 * Serviço responsável por enviar emails de confirmação para mentorados
 */

import * as brevo from '@getbrevo/brevo';
import brevoClient, { emailConfig } from '../../config/brevoClient';
import { emailNewScheduleMenteeTemplate } from '../../templates/mentorado/emailNewScheduleMentee';
import { NewScheduleEmailDataMentee, EmailResponse } from '../../types/emailTypes';

/**
 * Envia email de confirmação de agendamento para o mentorado
 */
export async function sendNewScheduleEmailToMentee(data: NewScheduleEmailDataMentee): Promise<EmailResponse> {
  try {
    console.log('\n🚀 [EMAIL-SERVICE] Iniciando envio de email de confirmação para mentorado');
    console.log('🔍 [DEBUG] Dados recebidos RAW:', JSON.stringify(data, null, 2));

    // Verificar se algum parâmetro contém caracteres problemáticos
    console.log('🔍 [DEBUG] Verificando parâmetros individuais:');
    console.log('  - mentorName:', JSON.stringify(data.mentorName));
    console.log('  - menteeName:', JSON.stringify(data.menteeName));
    console.log('  - menteeEmail:', JSON.stringify(data.menteeEmail));
    console.log('  - appointmentDate:', JSON.stringify(data.appointmentDate));
    console.log('  - appointmentTime:', JSON.stringify(data.appointmentTime));
    console.log('  - timezone:', JSON.stringify(data.timezone));
    console.log('  - notes:', JSON.stringify(data.notes));
    console.log('  - meetLink:', JSON.stringify(data.meetLink));
    console.log('  - agendamentosUrl:', JSON.stringify(data.agendamentosUrl));
    console.log('  - supportUrl:', JSON.stringify(data.supportUrl));

    // Preparar parâmetros do template
    const templateParams: Record<string, string> = {
      MENTOR_NAME: data.mentorName,
      MENTEE_NAME: data.menteeName,
      MENTEE_EMAIL: data.menteeEmail,
      APPOINTMENT_DATE: data.appointmentDate,
      APPOINTMENT_TIME: data.appointmentTime,
      TIMEZONE: data.timezone,
      NOTES: data.notes || '',
      MEET_LINK: data.meetLink || '',
      AGENDAMENTOS_URL: data.agendamentosUrl,
      SUPPORT_URL: data.supportUrl,
      CURRENT_YEAR: new Date().getFullYear().toString()
    };

    console.log('📤 [EMAIL-SERVICE] Parâmetros do template processados:', JSON.stringify(templateParams, null, 2));

    // Processar conteúdo HTML e texto
    console.log('🔍 [DEBUG] Carregando template...');
    let htmlContent = emailNewScheduleMenteeTemplate.htmlContent;
    let textContent = emailNewScheduleMenteeTemplate.textContent || '';
    let subject = emailNewScheduleMenteeTemplate.subject;
    
    console.log('🔍 [DEBUG] Template carregado - Lengths:', {
      htmlLength: htmlContent.length,
      textLength: textContent.length,
      subjectLength: subject.length
    });
    
    console.log('🔍 [DEBUG] Verificando template por problemas...');
    
    // Verificar se há problemas no template original
    const templateIssues = {
      htmlHasHandlebars: htmlContent.includes('{{'),
      htmlHasConditionals: htmlContent.includes('{{#if'),
      textHasHandlebars: textContent.includes('{{'),
      textHasConditionals: textContent.includes('{{#if'),
      subjectHasHandlebars: subject.includes('{{')
    };
    
    console.log('🔍 [DEBUG] Template issues check:', templateIssues);

    // Substituir variáveis no template
    Object.entries(templateParams).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, value);
      textContent = textContent.replace(regex, value);
      subject = subject.replace(regex, value);
    });

    console.log('🔍 [DEBUG] Iniciando processamento de condicionais...');
    console.log('🔍 [DEBUG] NOTES value:', JSON.stringify(templateParams.NOTES));
    console.log('🔍 [DEBUG] MEET_LINK value:', JSON.stringify(templateParams.MEET_LINK));
    
    try {
      // Processar condicionais NOTES
      if (templateParams.NOTES) {
        console.log('📝 [EMAIL-SERVICE] Processando condicional NOTES...');
        console.log('🔍 [DEBUG] HTML antes NOTES:', htmlContent.substring(0, 200) + '...');
        
        // Incluir seção de observações
        const htmlBefore = htmlContent;
        htmlContent = htmlContent.replace(/{{#if NOTES}}([\s\S]*?){{\/if}}/g, '$1');
        console.log('🔍 [DEBUG] HTML NOTES replace OK:', htmlBefore !== htmlContent);
        
        const textBefore = textContent;
        textContent = textContent.replace(/{{#if NOTES}}([\s\S]*?){{\/if}}/g, '$1');
        console.log('🔍 [DEBUG] TEXT NOTES replace OK:', textBefore !== textContent);
      } else {
        console.log('🚫 [EMAIL-SERVICE] Removendo seção NOTES (vazia)...');
        // Remover seção de observações
        htmlContent = htmlContent.replace(/{{#if NOTES}}[\s\S]*?{{\/if}}/g, '');
        textContent = textContent.replace(/{{#if NOTES}}[\s\S]*?{{\/if}}/g, '');
      }
      
      console.log('🔍 [DEBUG] NOTES processamento concluído');
      
      // Processar condicionais MEET_LINK
      if (templateParams.MEET_LINK) {
        console.log('🔗 [EMAIL-SERVICE] Processando condicional MEET_LINK...');
        console.log('🔍 [DEBUG] HTML antes MEET_LINK:', htmlContent.substring(0, 200) + '...');
        
        // Incluir seção do link da reunião
        const htmlBefore = htmlContent;
        htmlContent = htmlContent.replace(/{{#if MEET_LINK}}([\s\S]*?){{\/if}}/g, '$1');
        console.log('🔍 [DEBUG] HTML MEET_LINK replace OK:', htmlBefore !== htmlContent);
        
        const textBefore = textContent;
        textContent = textContent.replace(/{{#if MEET_LINK}}([\s\S]*?){{\/if}}/g, '$1');
        console.log('🔍 [DEBUG] TEXT MEET_LINK replace OK:', textBefore !== textContent);
      } else {
        console.log('🚫 [EMAIL-SERVICE] Removendo seção MEET_LINK (vazia)...');
        // Remover seção do link da reunião
        htmlContent = htmlContent.replace(/{{#if MEET_LINK}}[\s\S]*?{{\/if}}/g, '');
        textContent = textContent.replace(/{{#if MEET_LINK}}[\s\S]*?{{\/if}}/g, '');
      }
      
      console.log('🔍 [DEBUG] MEET_LINK processamento concluído');
      
    } catch (conditionalError) {
      console.error('❌ [DEBUG] ERRO no processamento de condicionais:', conditionalError);
      throw new Error(`Template Conditional Error: ${conditionalError}`);
    }

    console.log('📧 [EMAIL-SERVICE] Template processado com sucesso');
    console.log('🔍 [DEBUG] Subject final:', JSON.stringify(subject));
    console.log('🔍 [DEBUG] HTML Content length:', htmlContent.length);
    console.log('🔍 [DEBUG] Text Content length:', textContent.length);
    console.log('🔍 [DEBUG] Primeiros 500 chars do HTML:', htmlContent.substring(0, 500));

    // Configurar destinatário e remetente
    console.log('🔍 [DEBUG] Configurando SendSmtpEmail...');
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: data.menteeEmail, name: data.menteeName }];
    sendSmtpEmail.sender = emailConfig.sender;
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.textContent = textContent;
    sendSmtpEmail.tags = ['agendamento', 'confirmacao', 'mentorado'];
    
    console.log('🔍 [DEBUG] SendSmtpEmail configurado:', {
      to: sendSmtpEmail.to,
      sender: sendSmtpEmail.sender,
      subject: sendSmtpEmail.subject,
      tags: sendSmtpEmail.tags
    });

    console.log('📤 [EMAIL-SERVICE] Configuração do email:', {
      to: sendSmtpEmail.to,
      subject: sendSmtpEmail.subject,
      tags: sendSmtpEmail.tags
    });

    // Enviar email via Brevo
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
    console.error('❌ [EMAIL-SERVICE] Erro ao enviar email de confirmação para mentorado:', error);
    
    // Tratamento específico para erros da API Brevo
    if (error instanceof Error && 'response' in error) {
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

/**
 * Testa o envio de email para mentorado com dados simulados
 */
export async function testNewScheduleEmailToMentee(testEmail: string) {
  const testData: NewScheduleEmailDataMentee = {
    mentorName: 'Dr. Carlos Silva',
    menteeName: 'Ana Maria Santos',
    menteeEmail: testEmail,
    appointmentDate: 'sexta-feira, 12 de julho de 2025',
    appointmentTime: '14:00 - 15:00',
    timezone: 'America/Sao_Paulo (UTC-3)',
    notes: 'Primeira mentoria sobre desenvolvimento Full Stack. Trazer portfolio e lista de dúvidas específicas sobre React e Node.js.',
    meetLink: 'https://meet.jit.si/mentoria-carlos-ana-20250712-1400',
    agendamentosUrl: 'https://mentora.ai/agendamentos',
    supportUrl: 'https://mentora.ai/suporte'
  };

  console.log('🧪 [EmailService] Testando envio de email para mentorado...');
  
  return await sendNewScheduleEmailToMentee(testData);
}
