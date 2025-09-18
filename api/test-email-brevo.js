/**
 * Teste da API de E-mail Brevo
 * Script para testar a conectividade e funcionamento do serviço de e-mail
 */

import { config } from './environment.js';
// Importar diretamente dos arquivos compilados
const { testarConectividadeBrevo, notificarMentorNovoAgendamento, notificarMentoradoNovoAgendamento } = await import('./services/email/emailService.js');

async function testarAPIBrevo() {
  console.log('🧪 INICIANDO TESTE DA API BREVO\n');

  // 1. Verificar configurações
  console.log('📋 CONFIGURAÇÕES:');
  console.log('- BREVO_API_KEY:', config.BREVO_API_KEY ? '✅ Configurada' : '❌ NÃO configurada');
  console.log('- BREVO_SENDER_EMAIL:', config.BREVO_SENDER_EMAIL);
  console.log('- BREVO_SENDER_NAME:', config.BREVO_SENDER_NAME);
  console.log('');

  // 2. Testar conectividade
  console.log('🔗 TESTANDO CONECTIVIDADE:');
  try {
    const connectivityTest = await testarConectividadeBrevo();
    console.log(connectivityTest.success ? '✅' : '❌', connectivityTest.message);
  } catch (error) {
    console.log('❌ Erro na conectividade:', error.message);
  }
  console.log('');

  // 3. Testar notificação de agendamento para mentor
  console.log('📧 TESTANDO NOTIFICAÇÃO PARA MENTOR:');
  try {
    const mentorNotificationData = {
      mentorName: 'João Silva',
      mentorEmail: 'joao@exemplo.com',
      menteeName: 'Maria Santos',
      appointmentDate: '2025-01-20',
      appointmentTime: '14:00',
      timezone: 'America/Sao_Paulo',
      notes: 'Discussão sobre estratégia de negócios',
      meetLink: 'https://meet.mentorx.com.br/sala-123'
    };

    const mentorResult = await notificarMentorNovoAgendamento(mentorNotificationData);
    console.log(mentorResult.success ? '✅' : '❌',
      mentorResult.success ? 'Mentor notificado com sucesso' : `Erro: ${mentorResult.error}`);

    if (mentorResult.messageId) {
      console.log('📧 ID da mensagem:', mentorResult.messageId);
    }
  } catch (error) {
    console.log('❌ Erro ao notificar mentor:', error.message);
  }
  console.log('');

  // 4. Testar notificação de agendamento para mentorado
  console.log('📧 TESTANDO NOTIFICAÇÃO PARA MENTORADO:');
  try {
    const mentoradoNotificationData = {
      mentorName: 'João Silva',
      menteeName: 'Maria Santos',
      menteeEmail: 'maria@exemplo.com',
      appointmentDate: '2025-01-20',
      appointmentTime: '14:00',
      timezone: 'America/Sao_Paulo',
      notes: 'Discussão sobre estratégia de negócios',
      meetLink: 'https://meet.mentorx.com.br/sala-123'
    };

    const mentoradoResult = await notificarMentoradoNovoAgendamento(mentoradoNotificationData);
    console.log(mentoradoResult.success ? '✅' : '❌',
      mentoradoResult.success ? 'Mentorado notificado com sucesso' : `Erro: ${mentoradoResult.error}`);

    if (mentoradoResult.messageId) {
      console.log('📧 ID da mensagem:', mentoradoResult.messageId);
    }
  } catch (error) {
    console.log('❌ Erro ao notificar mentorado:', error.message);
  }
  console.log('');

  console.log('🎯 TESTE CONCLUÍDO\n');
}

// Executar teste se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testarAPIBrevo().catch(console.error);
}

export default testarAPIBrevo;