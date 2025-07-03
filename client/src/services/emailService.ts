/**
 * Serviço de E-mails - Frontend
 * Integração com a API de e-mails do Brevo
 */

interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  userRole: 'mentor' | 'mentorado';
  loginUrl?: string;
  supportUrl?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envia e-mail de boas-vindas para novo usuário
 */
export async function enviarEmailBoasVindas(data: WelcomeEmailData): Promise<EmailResponse> {
  try {
    console.log('📧 [EMAIL-SERVICE] Iniciando envio de e-mail de boas-vindas');
    console.log('📧 [EMAIL-SERVICE] Dados:', {
      userName: data.userName,
      userEmail: data.userEmail,
      userRole: data.userRole,
      loginUrl: data.loginUrl || 'default',
      supportUrl: data.supportUrl || 'default'
    });

    const payload = {
      userName: data.userName,
      userEmail: data.userEmail,
      userRole: data.userRole,
      loginUrl: data.loginUrl || 'https://app.mentoraai.com.br/login',
      supportUrl: data.supportUrl || 'https://app.mentoraai.com.br/suporte'
    };

    console.log('📤 [EMAIL-SERVICE] Payload enviado para API:', JSON.stringify(payload, null, 2));

    const response = await fetch('/api/email/boas-vindas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📥 [EMAIL-SERVICE] Status da resposta:', response.status);
    console.log('📥 [EMAIL-SERVICE] Headers da resposta:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    
    console.log('📥 [EMAIL-SERVICE] Resposta completa da API:', JSON.stringify(result, null, 2));

    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}`);
    }

    if (result.success) {
      console.log('✅ [EMAIL-SERVICE] E-mail enviado com sucesso!');
      console.log('✅ [EMAIL-SERVICE] Message ID:', result.messageId);
    } else {
      console.error('❌ [EMAIL-SERVICE] Falha no envio:', result.error);
    }

    return result;

  } catch (error) {
    console.error('❌ [EMAIL-SERVICE] Erro crítico:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Testa a conectividade com o sistema de e-mails
 */
export async function testarConectividadeEmail(): Promise<EmailResponse> {
  try {
    console.log('🧪 [EMAIL-SERVICE] Testando conectividade...');

    const response = await fetch('/api/email/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    console.log('🧪 [EMAIL-SERVICE] Resultado do teste:', result);

    return {
      success: result.success,
      error: result.success ? undefined : 'Falha no teste de conectividade'
    };

  } catch (error) {
    console.error('❌ [EMAIL-SERVICE] Erro no teste:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
} 