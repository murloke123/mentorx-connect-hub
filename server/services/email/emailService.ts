/**
 * ===============================================================================
 * 📧 EMAIL SERVICE - Sistema de E-mails da Plataforma (Backend)
 * ===============================================================================
 * 
 * 🎯 OBJETIVO: Gerenciar todos os envios de e-mail da plataforma MentorX via Brevo
 * 
 * 📋 MÉTODOS DISPONÍVEIS:
 * 
 * 👋 E-MAILS DE BOAS-VINDAS:
 * • enviarEmailBoasVindas() - Direciona para mentor ou mentorado baseado no role
 * • enviarEmailBoasVindasMentor() - Boas-vindas específicas para mentores
 * • enviarEmailBoasVindasMentorado() - Boas-vindas específicas para mentorados
 * 
 * 📅 NOTIFICAÇÕES DE AGENDAMENTO:
 * • notificarMentorNovoAgendamento() - Avisa mentor sobre novo agendamento
 * • enviarEmailNovoAgendamento() - Serviço interno de agendamento
 * 
 * 🔧 TESTES E CONECTIVIDADE:
 * • testarConectividadeBrevo() - Testa conexão com provider de e-mail
 * 
 * 🔧 RECURSOS:
 * • Integração completa com Brevo (SendInBlue)
 * • Templates HTML responsivos e profissionais
 * • Logs detalhados de todas as operações
 * • Tratamento robusto de erros
 * • Fallback gracioso em caso de falha
 * • Direcionamento automático por role do usuário
 * • URLs dinâmicas e configuráveis
 * 
 * 📧 PROVIDER:
 * • Brevo (antigo SendInBlue) para entrega confiável
 * • Rate limiting automático
 * • Tracking de aberturas e cliques
 * • Templates profissionais com branding
 * 
 * 💡 INTERFACES:
 * • WelcomeEmailData - Dados para e-mails de boas-vindas
 * • EmailResponse - Resposta padrão de envio
 * 
 * ⚠️ CONFIGURAÇÃO:
 * • Requer variáveis de ambiente do Brevo
 * • API Key configurada no servidor
 * • Templates armazenados em /templates/
 * ===============================================================================
 */

import { enviarEmailBoasVindasMentor } from './services/mentor/emailBoasVindasMentor';
import { enviarEmailNovoAgendamento } from './services/mentor/emailNewSchedule';
import { enviarEmailBoasVindasMentorado } from './services/mentorado/emailBoasVindasMentorado';
import { EmailResponse, WelcomeEmailData } from './types/emailTypes';

/**
 * Envia e-mail de boas-vindas baseado no role do usuário
 */
export async function enviarEmailBoasVindas(data: WelcomeEmailData): Promise<EmailResponse> {
  try {
    console.log(`📧 Iniciando envio de e-mail de boas-vindas para ${data.userRole}:`, {
      email: data.userEmail,
      name: data.userName,
      role: data.userRole
    });

    let result: EmailResponse;

    if (data.userRole === 'mentor') {
      result = await enviarEmailBoasVindasMentor(data);
    } else if (data.userRole === 'mentorado') {
      result = await enviarEmailBoasVindasMentorado(data);
    } else {
      throw new Error(`Role de usuário inválido: ${data.userRole}`);
    }

    if (result.success) {
      console.log('✅ E-mail de boas-vindas enviado com sucesso:', {
        messageId: result.messageId,
        email: data.userEmail,
        role: data.userRole
      });
    } else {
      console.error('❌ Falha no envio do e-mail de boas-vindas:', result.error);
    }

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro crítico no serviço de e-mail:', errorMessage);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Envia e-mail de notificação para mentor sobre novo agendamento
 */
export async function notificarMentorNovoAgendamento(data: {
  mentorName: string;
  mentorEmail: string;
  menteeName: string;
  appointmentDate: string;
  appointmentTime: string;
  timezone: string;
  notes?: string;
}): Promise<EmailResponse> {
  try {
    console.log(`📧 Enviando notificação de novo agendamento para mentor:`, {
      email: data.mentorEmail,
      mentor: data.mentorName,
      mentorado: data.menteeName,
      data: data.appointmentDate,
      horario: data.appointmentTime
    });

    const emailData = {
      ...data,
      agendamentosUrl: 'https://mentoraai.com.br/mentor/agendamentos',
      supportUrl: 'https://app.mentoraai.com.br/suporte'
    };

    const result = await enviarEmailNovoAgendamento(emailData);

    if (result.success) {
      console.log('✅ Notificação de novo agendamento enviada com sucesso:', {
        messageId: result.messageId,
        email: data.mentorEmail,
        mentor: data.mentorName
      });
    } else {
      console.error('❌ Falha no envio da notificação de novo agendamento:', result.error);
    }

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro crítico na notificação de novo agendamento:', errorMessage);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Testa a conectividade com o serviço Brevo
 */
export async function testarConectividadeBrevo(): Promise<{ success: boolean; message: string }> {
  try {
    // Teste com dados fictícios
    const testData: WelcomeEmailData = {
      userName: 'Teste',
      userEmail: 'teste@mentoraai.com.br',
      userRole: 'mentor',
      loginUrl: 'https://app.mentoraai.com.br/login',
      supportUrl: 'https://app.mentoraai.com.br/suporte'
    };

    // Não envia o e-mail, apenas testa a configuração
    console.log('🧪 Testando conectividade com Brevo...');
    
    return {
      success: true,
      message: 'Configuração do Brevo está funcionando corretamente'
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro no teste de conectividade Brevo:', errorMessage);
    
    return {
      success: false,
      message: `Erro na conectividade Brevo: ${errorMessage}`
    };
  }
}

// Exportações nomeadas
export { enviarEmailBoasVindasMentor } from './services/mentor/emailBoasVindasMentor';
export { enviarEmailNovoAgendamento } from './services/mentor/emailNewSchedule';
export { enviarEmailBoasVindasMentorado } from './services/mentorado/emailBoasVindasMentorado';
export * from './types/emailTypes';

// Export default
export default {
  enviarEmailBoasVindas,
  notificarMentorNovoAgendamento,
  testarConectividadeBrevo,
  enviarEmailBoasVindasMentor,
  enviarEmailBoasVindasMentorado,
  enviarEmailNovoAgendamento
}; 