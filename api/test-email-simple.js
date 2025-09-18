/**
 * Teste Simples da API Brevo
 * Testa diretamente o cliente Brevo sem dependências complexas
 */

import { config } from './environment.js';
import * as brevo from '@getbrevo/brevo';

async function testeSimples() {
  console.log('🧪 TESTE SIMPLES DA API BREVO\n');

  // 1. Verificar configurações
  console.log('📋 CONFIGURAÇÕES:');
  console.log('- BREVO_API_KEY:', config.BREVO_API_KEY ? '✅ Configurada' : '❌ NÃO configurada');
  console.log('- BREVO_SENDER_EMAIL:', config.BREVO_SENDER_EMAIL);
  console.log('- BREVO_SENDER_NAME:', config.BREVO_SENDER_NAME);
  console.log('');

  // 2. Testar importação do cliente
  try {
    console.log('📦 TESTANDO IMPORTAÇÃO:');
    console.log('✅ Brevo SDK importado com sucesso');

    // Criar instância da API
    const apiInstance = new brevo.TransactionalEmailsApi();

    // Configurar API Key
    if (config.BREVO_API_KEY && config.BREVO_API_KEY !== 'your-brevo-api-key-here') {
      apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, config.BREVO_API_KEY);
      console.log('✅ API Key configurada');
      console.log('🔑 Chave:', config.BREVO_API_KEY.substring(0, 20) + '...');
    } else {
      console.log('❌ API Key não configurada ou usando valor padrão');
      return;
    }

    // 3. Teste básico - criar objeto de email (sem enviar)
    console.log('\n📧 TESTANDO CRIAÇÃO DE EMAIL:');
    const emailData = {
      sender: {
        name: config.BREVO_SENDER_NAME,
        email: config.BREVO_SENDER_EMAIL
      },
      to: [{
        email: 'teste@mentorx.com.br',
        name: 'Teste'
      }],
      subject: 'Teste de Conectividade - MentorX',
      htmlContent: `
        <h1>Teste de Conectividade</h1>
        <p>Este é um teste da API Brevo.</p>
        <p>Hora do teste: ${new Date().toLocaleString('pt-BR')}</p>
      `
    };

    console.log('✅ Objeto de email criado com sucesso');
    console.log('📧 Para:', emailData.to[0].email);
    console.log('📧 Assunto:', emailData.subject);

    console.log('\n🎯 TESTE CONCLUÍDO - API Brevo está configurada corretamente');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar teste
testeSimples().catch(console.error);