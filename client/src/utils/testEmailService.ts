/**
 * 🧪 TESTE DO SERVIÇO DE E-MAIL DE NOVO AGENDAMENTO
 * 
 * Este arquivo contém funções para testar o envio de e-mails
 * quando um novo agendamento é criado.
 * 
 * Para usar este teste:
 * 1. Importe esta função em qualquer componente
 * 2. Chame testEmailNovoAgendamento() no console ou num botão
 * 3. Verifique os logs no console e se o e-mail chegou
 */

interface TestEmailData {
  email: string;
  notes?: string;
}

/**
 * Testa o envio de e-mail para novo agendamento
 */
export async function testEmailNovoAgendamento(data: TestEmailData = { email: 'teste@exemplo.com' }) {
  console.log('\n🧪 ========== TESTE DE E-MAIL - NOVO AGENDAMENTO ==========');
  console.log('📧 Testando envio para:', data.email);
  
  try {
    const response = await fetch('/api/calendar/new-appointment-email/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        notes: data.notes || 'Este é um teste do sistema de e-mail'
      }),
    });

    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    
    console.log('📊 Resultado completo:', JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('✅ TESTE PASSOU! E-mail enviado com sucesso');
      console.log('✉️ Detalhes:', result.result);
      
      if (result.result?.messageId) {
        console.log('📮 Message ID:', result.result.messageId);
      }
      
      return {
        success: true,
        message: 'Teste realizado com sucesso',
        details: result
      };
    } else {
      console.error('❌ TESTE FALHOU! Erro no envio');
      console.error('💥 Erro:', result.error || 'Erro desconhecido');
      
      return {
        success: false,
        message: 'Teste falhou',
        error: result.error,
        details: result
      };
    }

  } catch (error) {
    console.error('💥 ERRO CRÍTICO no teste:', error);
    console.error('📍 Stack:', error instanceof Error ? error.stack : 'N/A');
    
    return {
      success: false,
      message: 'Erro crítico no teste',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  } finally {
    console.log('🧪 ======================================================\n');
  }
}

/**
 * Testa o envio com dados específicos de agendamento
 */
export async function testEmailComDadosCompletos() {
  console.log('\n🎯 ========== TESTE COMPLETO COM DADOS REAIS ==========');
  
  try {
    const emailData = {
      mentorId: 'test-mentor-id',
      mentorName: 'Ramalho Silva',
      menteeName: 'Guilherme Teste',
      appointmentDate: 'quinta-feira, 02 de janeiro de 2025',
      appointmentTime: '14:00 - 15:00',
      timezone: 'America/Sao_Paulo (UTC-3)',
      notes: 'Este é um teste do sistema completo de e-mail'
    };

    console.log('📤 Dados do teste:', JSON.stringify(emailData, null, 2));

    const response = await fetch('/api/calendar/new-appointment-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    console.log('📡 Status da resposta:', response.status);
    const result = await response.json();
    console.log('📊 Resultado:', JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('✅ TESTE COMPLETO PASSOU!');
      return { success: true, details: result };
    } else {
      console.error('❌ TESTE COMPLETO FALHOU!');
      return { success: false, error: result.error, details: result };
    }

  } catch (error) {
    console.error('💥 ERRO no teste completo:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  } finally {
    console.log('🎯 ======================================================\n');
  }
}

/**
 * Função helper para ser executada diretamente no console do navegador
 */
export function quickTest(email: string = 'teste@exemplo.com') {
  console.log('🚀 Executando teste rápido...');
  return testEmailNovoAgendamento({ email });
}

// Expor funções globalmente para acesso fácil no console
if (typeof window !== 'undefined') {
  (window as any).testEmailNovoAgendamento = testEmailNovoAgendamento;
  (window as any).testEmailCompleto = testEmailComDadosCompletos;
  (window as any).quickTest = quickTest;
  
  console.log(`
  🧪 FUNÇÕES DE TESTE DISPONÍVEIS NO CONSOLE:
  
  • testEmailNovoAgendamento({ email: 'seu@email.com' })
  • testEmailCompleto()
  • quickTest('seu@email.com')
  
  Exemplo:
  > quickTest('guilherme.ramalho@outlook.com')
  `);
} 