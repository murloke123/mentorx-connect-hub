/**
 * Teste Completo de Todas as APIs de Email
 * Testa todos os tipos de email disponíveis no sistema
 */

import 'dotenv/config';

async function testarTodasAPIsEmail() {
  console.log('🧪 ===== TESTE COMPLETO DE TODAS AS APIS DE EMAIL =====\n');

  const API_BASE = 'http://localhost:5000/api';

  // Configurar dados de teste - SUBSTITUA PELOS SEUS EMAILS
  const emailTeste = 'seu.email@exemplo.com'; // SUBSTITUA PELO SEU EMAIL PARA RECEBER OS TESTES

  const testes = [
    {
      nome: '1. Email de Agendamento (Mentor + Mentorado)',
      endpoint: '/appointments',
      dados: {
        mentorId: 'mentor-123',
        menteeId: 'mentee-456',
        mentorName: 'João Silva - Mentor',
        mentorEmail: emailTeste, // Você receberá como mentor
        menteeName: 'Maria Santos - Mentorada',
        menteeEmail: emailTeste, // Você receberá como mentorada
        appointmentDate: 'sexta-feira, 25 de janeiro de 2025',
        appointmentTime: '15:30 - 16:30',
        timezone: 'America/Sao_Paulo',
        notes: 'Discussão sobre estratégia de negócios digitais',
        meetLink: 'https://meet.mentorx.com.br/sala-teste-123'
      }
    },
    {
      nome: '2. Email de Boas-vindas - Mentor',
      endpoint: '/test-email/boas-vindas-mentor',
      dados: {
        userName: 'João Silva',
        userEmail: emailTeste
      }
    },
    {
      nome: '3. Email de Boas-vindas - Mentorado',
      endpoint: '/test-email/boas-vindas-mentorado',
      dados: {
        userName: 'Maria Santos',
        userEmail: emailTeste
      }
    },
    {
      nome: '4. Email de Compra de Curso',
      endpoint: '/test-email/compra-curso',
      dados: {
        menteeName: 'Maria Santos',
        menteeEmail: emailTeste,
        mentorName: 'João Silva',
        courseName: 'Curso Completo de React e Node.js',
        coursePrice: '299,00'
      }
    },
    {
      nome: '5. Email de Cancelamento de Agendamento',
      endpoint: '/test-email/cancelamento',
      dados: {
        recipientName: 'João Silva',
        recipientEmail: emailTeste,
        recipientRole: 'mentor',
        appointmentDate: '25 de janeiro de 2025',
        appointmentTime: '15:30 - 16:30',
        otherPartyName: 'Maria Santos',
        cancellationReason: 'Conflito de agenda imprevisto'
      }
    }
  ];

  const resultados = [];

  for (const teste of testes) {
    console.log(`\n🔄 Executando: ${teste.nome}`);
    console.log(`📡 Endpoint: ${API_BASE}${teste.endpoint}`);
    console.log(`📦 Dados:`, JSON.stringify(teste.dados, null, 2));

    try {
      const response = await fetch(`${API_BASE}${teste.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(teste.dados)
      });

      const resultado = await response.json();

      if (response.ok && resultado.success) {
        console.log(`✅ ${teste.nome}: SUCESSO`);

        if (resultado.emailResult) {
          console.log(`📧 Email Result:`, {
            success: resultado.emailResult.success,
            messageId: resultado.emailResult.messageId || 'N/A'
          });
        }

        if (resultado.notifications) {
          console.log(`📧 Notificações:`, {
            mentor: resultado.notifications.mentor?.success ? '✅' : '❌',
            mentee: resultado.notifications.mentee?.success ? '✅' : '❌'
          });
        }

        resultados.push({
          teste: teste.nome,
          status: 'SUCESSO',
          messageId: resultado.emailResult?.messageId || resultado.notifications?.mentor?.messageId
        });

      } else {
        console.log(`❌ ${teste.nome}: FALHOU`);
        console.log(`Erro:`, resultado.error || 'Erro desconhecido');

        resultados.push({
          teste: teste.nome,
          status: 'FALHOU',
          erro: resultado.error
        });
      }

    } catch (error) {
      console.log(`💥 ${teste.nome}: ERRO CRÍTICO`);
      console.log(`Erro:`, error.message);

      resultados.push({
        teste: teste.nome,
        status: 'ERRO CRÍTICO',
        erro: error.message
      });
    }

    // Aguardar 2 segundos entre testes para não sobrecarregar o Brevo
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Resumo final
  console.log('\n\n📊 ===== RESUMO DOS TESTES =====');

  let sucessos = 0;
  let falhas = 0;

  resultados.forEach((resultado, index) => {
    const status = resultado.status === 'SUCESSO' ? '✅' : '❌';
    console.log(`${status} ${resultado.teste}: ${resultado.status}`);

    if (resultado.messageId) {
      console.log(`   📧 Message ID: ${resultado.messageId}`);
    }

    if (resultado.erro) {
      console.log(`   🔍 Erro: ${resultado.erro}`);
    }

    if (resultado.status === 'SUCESSO') {
      sucessos++;
    } else {
      falhas++;
    }
  });

  console.log(`\n🏆 RESULTADO FINAL:`);
  console.log(`✅ Sucessos: ${sucessos}/${resultados.length}`);
  console.log(`❌ Falhas: ${falhas}/${resultados.length}`);

  if (sucessos === resultados.length) {
    console.log(`\n🎉 PARABÉNS! Todas as APIs de email estão funcionando perfeitamente!`);
    console.log(`📧 Verifique sua caixa de entrada (${emailTeste}) para ver os emails recebidos.`);
    console.log(`💡 Sistema de emails 100% operacional para produção!`);
  } else if (sucessos > 0) {
    console.log(`\n⚠️ Sistema parcialmente funcional. ${sucessos} APIs funcionando, ${falhas} com problemas.`);
  } else {
    console.log(`\n🚨 SISTEMA COM PROBLEMAS CRÍTICOS! Nenhuma API de email está funcionando.`);
  }

  console.log(`\n📝 Para configurar seus próprios emails de teste:`);
  console.log(`1. Edite a variável 'emailTeste' no arquivo teste-todos-emails.js`);
  console.log(`2. Execute: node api/teste-todos-emails.js`);
  console.log(`3. Verifique sua caixa de entrada\n`);
}

// Executar teste
testarTodasAPIsEmail().catch(error => {
  console.error('\n💥 ERRO FATAL NO TESTE:', error);
  process.exit(1);
});