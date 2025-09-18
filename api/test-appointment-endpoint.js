/**
 * Teste do Endpoint de Agendamento
 * Testa a criação de agendamento com envio automático de emails
 */

import 'dotenv/config';

async function testarEndpointAgendamento() {
  console.log('🧪 TESTE DO ENDPOINT DE AGENDAMENTO\n');

  // URL do endpoint local - usar porta 3000 onde o Vite está rodando (proxy para API na 5000)
  const API_URL = 'http://localhost:3000/api/appointments';

  // Dados de teste do agendamento
  const agendamentoData = {
    mentorId: 'mentor-123',
    menteeId: 'mentee-456',
    mentorName: 'João Silva - Mentor',
    mentorEmail: 'joao.mentor@exemplo.com', // SUBSTITUA pelo seu email para receber o teste
    menteeName: 'Maria Santos - Mentorada',
    menteeEmail: 'maria.mentee@exemplo.com', // SUBSTITUA pelo seu email para receber o teste
    appointmentDate: '2025-01-25',
    appointmentTime: '15:30',
    timezone: 'America/Sao_Paulo',
    notes: 'Discussão sobre estratégia de negócios digitais e planejamento de carreira',
    meetLink: 'https://meet.mentorx.com.br/sala-teste-123'
  };

  console.log('📋 DADOS DO TESTE:');
  console.log('- Mentor:', `${agendamentoData.mentorName} (${agendamentoData.mentorEmail})`);
  console.log('- Mentee:', `${agendamentoData.menteeName} (${agendamentoData.menteeEmail})`);
  console.log('- Data/Hora:', `${agendamentoData.appointmentDate} às ${agendamentoData.appointmentTime}`);
  console.log('- Timezone:', agendamentoData.timezone);
  console.log('- Notas:', agendamentoData.notes);
  console.log('- Link da Reunião:', agendamentoData.meetLink);
  console.log('');

  try {
    console.log('🚀 ENVIANDO REQUISIÇÃO PARA O ENDPOINT...');
    console.log('URL:', API_URL);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(agendamentoData)
    });

    console.log('📡 Resposta HTTP:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const result = await response.json();

    console.log('');
    console.log('✅ RESPOSTA DA API:');
    console.log(JSON.stringify(result, null, 2));

    console.log('');
    console.log('📊 RESULTADO DO TESTE:');

    if (result.success) {
      console.log('✅ Agendamento: CRIADO COM SUCESSO');

      // Verificar notificações
      if (result.notifications) {
        console.log('📧 Email para Mentor:',
          result.notifications.mentor.success ? '✅ ENVIADO' : `❌ FALHOU: ${result.notifications.mentor.error}`);
        console.log('📧 Email para Mentee:',
          result.notifications.mentee.success ? '✅ ENVIADO' : `❌ FALHOU: ${result.notifications.mentee.error}`);

        // IDs das mensagens se disponíveis
        if (result.notifications.mentor.messageId) {
          console.log('📧 ID Mentor:', result.notifications.mentor.messageId);
        }
        if (result.notifications.mentee.messageId) {
          console.log('📧 ID Mentee:', result.notifications.mentee.messageId);
        }
      }
    } else {
      console.log('❌ Agendamento: FALHOU');
      console.log('Erro:', result.error);
    }

    console.log('');
    console.log('🎯 TESTE CONCLUÍDO!');

    if (result.success && result.notifications.mentor.success && result.notifications.mentee.success) {
      console.log('🎉 TUDO FUNCIONANDO PERFEITAMENTE!');
      console.log('✅ Endpoint de agendamento operacional');
      console.log('✅ Emails sendo enviados automaticamente');
      console.log('💡 Sistema pronto para uso em produção');
    } else {
      console.log('⚠️  Sistema funcional mas com algumas falhas nos emails');
    }

  } catch (error) {
    console.error('');
    console.error('❌ ERRO NO TESTE:');
    console.error('Tipo:', error.constructor.name);
    console.error('Mensagem:', error.message);
    console.error('');

    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
      console.error('💡 DICA: Certifique-se de que o servidor está rodando na porta 3000');
      console.error('Execute: npm run dev ou vercel dev');
    }
  }
}

// Executar teste
testarEndpointAgendamento().catch(console.error);