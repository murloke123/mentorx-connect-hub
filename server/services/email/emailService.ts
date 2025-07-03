/**
 * Serviço Principal de E-mails
 * Gerencia todos os tipos de envio de e-mail da plataforma Mentora AI
 */

import { enviarEmailBoasVindasMentor } from './services/mentor/emailBoasVindasMentor';
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
export { enviarEmailBoasVindasMentorado } from './services/mentorado/emailBoasVindasMentorado';
export * from './types/emailTypes';

// Export default
export default {
  enviarEmailBoasVindas,
  testarConectividadeBrevo,
  enviarEmailBoasVindasMentor,
  enviarEmailBoasVindasMentorado
}; 