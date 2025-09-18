/**
 * Teste Real da API Brevo - Com Envio de Email
 * Testa o envio real de emails usando o serviço configurado
 */

import 'dotenv/config';
import * as brevo from '@getbrevo/brevo';

async function testeRealBrevo() {
  console.log('🧪 TESTE REAL - ENVIO DE EMAIL BREVO\n');

  // 1. Verificar configuração da API Key do arquivo .env
  const API_KEY = process.env.BREVO_API_KEY;
  const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'contato@mentorx.com.br';
  const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Mentora AI';

  console.log('📋 CONFIGURAÇÕES:');
  console.log('- BREVO_API_KEY:', API_KEY ? '✅ Configurada' : '❌ NÃO configurada');
  console.log('- BREVO_SENDER_EMAIL:', SENDER_EMAIL);
  console.log('- BREVO_SENDER_NAME:', SENDER_NAME);
  console.log('🔑 Chave:', API_KEY ? API_KEY.substring(0, 20) + '...' : 'Não encontrada');
  console.log('');

  if (!API_KEY || API_KEY === 'your-brevo-api-key-here') {
    console.log('❌ ERRO: API Key do Brevo não configurada corretamente');
    return;
  }

  try {
    // 2. Configurar cliente Brevo
    console.log('📦 CONFIGURANDO CLIENTE BREVO:');
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, API_KEY);
    console.log('✅ Cliente configurado');
    console.log('');

    // 3. Criar email de teste
    console.log('📧 PREPARANDO EMAIL DE TESTE:');
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: SENDER_NAME,
      email: SENDER_EMAIL
    };

    sendSmtpEmail.to = [
      {
        email: 'teste@mentorx.com.br', // Email de teste - substitua pelo seu
        name: 'Teste MentorX'
      }
    ];

    sendSmtpEmail.subject = 'Teste da API Brevo - MentorX Connect';

    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Teste API Brevo</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">🚀 Teste da API Brevo</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">MentorX Connect Hub</p>
        </div>

        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">✅ Teste Realizado com Sucesso!</h2>
          <p style="color: #666; line-height: 1.6;">
            Este email foi enviado automaticamente para testar a integração da API do Brevo com o sistema MentorX.
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="color: #28a745; margin-top: 0;">📊 Dados do Teste:</h3>
            <ul style="color: #666;">
              <li><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</li>
              <li><strong>Remetente:</strong> ${SENDER_EMAIL}</li>
              <li><strong>Status:</strong> Funcionando ✅</li>
              <li><strong>Sistema:</strong> Notificação de Agendamentos</li>
            </ul>
          </div>

          <p style="color: #666; line-height: 1.6;">
            <strong>Próximo passo:</strong> Implementar notificações automáticas quando um mentor receber um novo agendamento.
          </p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://mentorx.com.br" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Acessar MentorX
            </a>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} MentorX Connect Hub - Sistema de Mentoria com IA</p>
        </div>
      </body>
      </html>
    `;

    console.log('✅ Email preparado');
    console.log('📧 Para:', sendSmtpEmail.to[0].email);
    console.log('📧 Assunto:', sendSmtpEmail.subject);
    console.log('');

    // 4. ENVIAR EMAIL REAL
    console.log('🚀 ENVIANDO EMAIL...');
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log('✅ EMAIL ENVIADO COM SUCESSO!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📊 Response:', JSON.stringify(result, null, 2));
    console.log('');

    console.log('🎯 TESTE CONCLUÍDO - API Brevo funcionando perfeitamente!');
    console.log('💡 Próximo: Implementar endpoint de agendamento com envio automático');

  } catch (error) {
    console.error('❌ ERRO NO ENVIO:');
    console.error('Tipo:', error.constructor.name);
    console.error('Mensagem:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('Stack:', error.stack);
  }
}

// Executar teste
testeRealBrevo().catch(console.error);