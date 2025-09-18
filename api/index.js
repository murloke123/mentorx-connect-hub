// Vercel Serverless Function - Main API Handler
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5000',
    'http://localhost:5173',
    'https://mentorx.com.br',
    'https://www.mentorx.com.br',
    /\.vercel\.app$/,
    /\.vercel\.dev$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// ENDPOINT DE LOG: Para aparecer no Network do Chrome
app.post('/api/stripe-network-logs', async (req, res) => {
  try {
    const { type, action, data, timestamp } = req.body;

    res.json({
      success: true,
      logged: true,
      message: `Log registrado: ${type} - ${action}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro no log' });
  }
});

// ENDPOINT: Criar agendamento e enviar emails
app.post('/api/appointments', async (req, res) => {
  console.log('📅 [AGENDAMENTO] Nova requisição de agendamento recebida');

  // LOG DETALHADO DOS DADOS RECEBIDOS
  console.log('🔍 [DEBUG] Dados completos recebidos:', JSON.stringify(req.body, null, 2));
  console.log('🔍 [DEBUG] Headers da requisição:', JSON.stringify(req.headers, null, 2));

  try {
    const {
      mentorId,
      menteeId,
      mentorName,
      mentorEmail,
      menteeName,
      menteeEmail,
      appointmentDate,
      appointmentTime,
      timezone,
      notes,
      meetLink
    } = req.body;

    // LOG INDIVIDUAL DE CADA CAMPO
    console.log('🔍 [DEBUG] Campos extraídos:', {
      mentorId: mentorId || 'UNDEFINED',
      menteeId: menteeId || 'UNDEFINED',
      mentorName: mentorName || 'UNDEFINED',
      mentorEmail: mentorEmail || 'UNDEFINED',
      menteeName: menteeName || 'UNDEFINED',
      menteeEmail: menteeEmail || 'UNDEFINED',
      appointmentDate: appointmentDate || 'UNDEFINED',
      appointmentTime: appointmentTime || 'UNDEFINED',
      timezone: timezone || 'UNDEFINED',
      notes: notes || 'UNDEFINED',
      meetLink: meetLink || 'UNDEFINED'
    });

    // Validações básicas
    if (!mentorEmail || !menteeEmail || !mentorName || !menteeName || !appointmentDate || !appointmentTime) {
      console.error('❌ [AGENDAMENTO] Dados obrigatórios ausentes');
      console.error('🔍 [DEBUG] Validação falhou para:', {
        mentorEmail: !!mentorEmail,
        menteeEmail: !!menteeEmail,
        mentorName: !!mentorName,
        menteeName: !!menteeName,
        appointmentDate: !!appointmentDate,
        appointmentTime: !!appointmentTime
      });
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios ausentes: mentor/mentee email, nomes, data e horário',
        debug: {
          received: req.body,
          validation: {
            mentorEmail: !!mentorEmail,
            menteeEmail: !!menteeEmail,
            mentorName: !!mentorName,
            menteeName: !!menteeName,
            appointmentDate: !!appointmentDate,
            appointmentTime: !!appointmentTime
          }
        }
      });
    }

    console.log('📋 [AGENDAMENTO] Dados do agendamento:', {
      mentor: `${mentorName} (${mentorEmail})`,
      mentee: `${menteeName} (${menteeEmail})`,
      data: appointmentDate,
      horario: appointmentTime,
      timezone: timezone || 'America/Sao_Paulo'
    });

    // Importar serviços de email limpos (ES Modules)
    const { notificarMentorNovoAgendamento, notificarMentoradoNovoAgendamento } = await import('./services/email/emailService-clean.js');

    // Dados para notificação do mentor
    const mentorNotificationData = {
      mentorName,
      mentorEmail,
      menteeName,
      appointmentDate,
      appointmentTime,
      timezone: timezone || 'America/Sao_Paulo',
      notes: notes || '',
      meetLink: meetLink || ''
    };

    // Dados para notificação do mentorado
    const menteeNotificationData = {
      mentorName,
      menteeName,
      menteeEmail,
      appointmentDate,
      appointmentTime,
      timezone: timezone || 'America/Sao_Paulo',
      notes: notes || '',
      meetLink: meetLink || ''
    };

    console.log('📧 [AGENDAMENTO] Enviando notificações por email...');

    // Enviar emails em paralelo
    const [mentorEmailResult, menteeEmailResult] = await Promise.allSettled([
      notificarMentorNovoAgendamento(mentorNotificationData),
      notificarMentoradoNovoAgendamento(menteeNotificationData)
    ]);

    // Processar resultados
    const results = {
      appointment: {
        success: true,
        data: {
          mentorName,
          menteeName,
          appointmentDate,
          appointmentTime,
          timezone: timezone || 'America/Sao_Paulo'
        }
      },
      notifications: {
        mentor: mentorEmailResult.status === 'fulfilled'
          ? mentorEmailResult.value
          : { success: false, error: mentorEmailResult.reason?.message || 'Erro desconhecido' },
        mentee: menteeEmailResult.status === 'fulfilled'
          ? menteeEmailResult.value
          : { success: false, error: menteeEmailResult.reason?.message || 'Erro desconhecido' }
      }
    };

    console.log('📧 [AGENDAMENTO] Resultado das notificações:', {
      mentorEmail: results.notifications.mentor.success ? '✅ Enviado' : '❌ Falhou',
      menteeEmail: results.notifications.mentee.success ? '✅ Enviado' : '❌ Falhou'
    });

    // Resposta de sucesso
    res.status(201).json({
      success: true,
      message: 'Agendamento criado e notificações enviadas',
      ...results
    });

    console.log('✅ [AGENDAMENTO] Processamento concluído com sucesso');

  } catch (error) {
    console.error('❌ [AGENDAMENTO] Erro no processamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// ENDPOINT: Verificar status da conta Stripe
app.get('/api/stripe/account/:accountId/status', async (req, res) => {
  try {
    const { accountId } = req.params;
    
    if (!accountId) {
      return res.status(400).json({
        success: false,
        error: 'AccountId é obrigatório'
      });
    }
    
    // Importar dinamicamente o serviço de cliente Stripe
    const { verifyStripeAccountStatus } = await import('./services/stripeServerClientService.js');
    
    const result = await verifyStripeAccountStatus(accountId);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : undefined
    });
  }
});

// ENDPOINT: Verificar saldo pendente da conta conectada
app.post('/api/stripe/verify-balance', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { stripeAccountId } = req.body;
    
    console.log('🚀 API: Requisição recebida em /api/stripe/verify-balance');
    console.log('📦 API: Stripe Account ID:', stripeAccountId);
    
    // Validações
    if (!stripeAccountId) {
      console.error('❌ API: stripeAccountId não fornecido');
      return res.status(400).json({
        success: false,
        error: 'stripeAccountId é obrigatório para verificar saldo'
      });
    }
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ API: STRIPE_SECRET_KEY não configurada');
      return res.status(500).json({
        success: false,
        error: 'Configuração do Stripe não encontrada'
      });
    }
    
    console.log('📡 API: Fazendo chamada para Stripe API (balance)...');
    
    // Importar Stripe dinamicamente
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Buscar saldo da conta conectada
    const balance = await stripe.balance.retrieve({
      stripeAccount: stripeAccountId
    });
    
    const apiCallDuration = Date.now() - startTime;
    console.log(`✅ API: Chamada Stripe concluída em ${apiCallDuration}ms`);
    console.log('📊 API: Saldo encontrado:', balance);
    
    // Calcular saldo pendente total
    let pendingAmount = 0;
    let currency = 'brl';
    
    if (balance.pending && balance.pending.length > 0) {
      balance.pending.forEach((pendingBalance) => {
        pendingAmount += pendingBalance.amount;
        currency = pendingBalance.currency;
      });
    }
    
    // Converter de centavos para valor real
    const pendingAmountInCurrency = pendingAmount / 100;
    
    console.log('💰 API: Estatísticas calculadas:', {
      pendingAmount: pendingAmountInCurrency,
      currency
    });
    
    const result = {
      success: true,
      pendingAmount: pendingAmountInCurrency,
      currency: currency,
      message: `Saldo pendente: ${pendingAmountInCurrency.toFixed(2)} ${currency.toUpperCase()}`,
      metadata: {
        stripe_account_id: stripeAccountId,
        api_call_duration_ms: apiCallDuration,
        total_duration_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    };
    
    const duration = Date.now() - startTime;
    console.log(`✅ API: Resposta enviada com sucesso em ${duration}ms`);
    
    return res.status(200).json(result);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ API: Erro após ${duration}ms:`, error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao verificar saldo',
      details: {
        error_type: error.constructor.name,
        stripe_account_id: req.body?.stripeAccountId,
        duration_ms: duration,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// ENDPOINT: Verificar payouts da conta conectada usando balance_transactions
app.post('/api/stripe/verify-payouts', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { stripeAccountId } = req.body;
    
    console.log('🚀 API: Requisição recebida em /api/stripe/verify-payouts');
    console.log('📦 API: Stripe Account ID:', stripeAccountId);
    
    // Validações
    if (!stripeAccountId) {
      console.error('❌ API: stripeAccountId não fornecido');
      return res.status(400).json({
        success: false,
        error: 'stripeAccountId é obrigatório para verificar payouts'
      });
    }
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ API: STRIPE_SECRET_KEY não configurada');
      return res.status(500).json({
        success: false,
        error: 'Configuração do Stripe não encontrada'
      });
    }
    
    console.log('📡 API: Fazendo chamada para Stripe API (balance_transactions)...');
    
    // Importar Stripe dinamicamente
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Buscar balance_transactions do tipo payout da conta conectada
    const balanceTransactions = await stripe.balanceTransactions.list(
      {
        type: 'payout',
        limit: 10 // Limitar a 10 transações mais recentes
      },
      {
        stripeAccount: stripeAccountId
      }
    );
    
    const apiCallDuration = Date.now() - startTime;
    console.log(`✅ API: Chamada Stripe concluída em ${apiCallDuration}ms`);
    console.log('📊 API: Balance transactions encontradas:', balanceTransactions.data.length);
    
    // Calcular estatísticas dos payouts
    let totalAmount = 0;
    let totalPayouts = 0;
    let pendingPayouts = 0;
    let completedPayouts = 0;
    let currency = 'brl';
    
    balanceTransactions.data.forEach((transaction) => {
      if (transaction.type === 'payout') {
        // Payouts são valores negativos, então usamos Math.abs()
        const payoutAmount = Math.abs(transaction.amount) / 100; // Converter de centavos para reais
        totalAmount += payoutAmount;
        totalPayouts++;
        currency = transaction.currency;
        
        if (transaction.status === 'available') {
          completedPayouts++;
        } else {
          pendingPayouts++;
        }
      }
    });
    
    console.log('💵 API: Estatísticas calculadas:', {
      totalTransactions: balanceTransactions.data.length,
      totalAmount,
      totalPayouts,
      completedPayouts,
      pendingPayouts,
      currency
    });
    
    // Retornar dados no formato com estatísticas
    const result = {
      success: true,
      payouts: balanceTransactions.data.map(transaction => ({
        id: transaction.source,
        amount: Math.abs(transaction.amount) / 100,
        currency: transaction.currency,
        status: transaction.status === 'available' ? 'paid' : 'pending',
        arrival_date: transaction.available_on,
        created: transaction.created,
        description: transaction.description,
        method: 'standard',
        type: 'bank_account'
      })),
      statistics: {
        total: totalPayouts,
        totalAmount: totalAmount,
        pending: pendingPayouts,
        completed: completedPayouts,
        currency: currency
      },
      message: `${totalPayouts} payouts encontrados`,
      metadata: {
        stripe_account_id: stripeAccountId,
        api_call_duration_ms: apiCallDuration,
        total_duration_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    };
    
    const duration = Date.now() - startTime;
    console.log(`✅ API: Resposta enviada com sucesso em ${duration}ms`);
    console.log('📊 API: Resultado:', {
      success: result.success,
      transactionsCount: balanceTransactions.data.length
    });
    
    return res.status(200).json(result);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ API: Erro após ${duration}ms:`, error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao verificar payouts',
      details: {
        error_type: error.constructor.name,
        stripe_account_id: req.body?.stripeAccountId,
        duration_ms: duration,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// ENDPOINT: Testar balance_transactions diretamente (para comparação com Postman)
app.get('/api/stripe/balance_transactions', async (req, res) => {
  try {
    const { stripeAccountId, type = 'payout' } = req.query;
    
    console.log('🚀 API: Requisição recebida em /api/stripe/balance_transactions');
    console.log('📦 API: Stripe Account ID:', stripeAccountId);
    console.log('📦 API: Type:', type);
    
    // Validação: stripeAccountId é obrigatório
    if (!stripeAccountId) {
      return res.status(400).json({
        success: false,
        error: 'stripeAccountId é obrigatório como query parameter'
      });
    }
    
    // Importar Stripe dinamicamente
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20'
    });
    
    // Buscar balance_transactions
    const balanceTransactions = await stripe.balanceTransactions.list({
      type: type,
      limit: 10
    }, {
      stripeAccount: stripeAccountId
    });
    
    console.log('✅ API: Balance transactions encontrados:', balanceTransactions.data.length);
    
    res.json(balanceTransactions);
  } catch (error) {
    console.error('❌ API: Erro em /api/stripe/balance_transactions:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      details: error instanceof Error ? error.stack : undefined
    });
  }
});

// ENDPOINT: Teste de e-mail de boas-vindas para mentor
app.post('/api/test-email/boas-vindas-mentor', async (req, res) => {
  console.log('🧪 [TESTE] Testando email boas-vindas mentor');

  try {
    const { enviarEmailBoasVindasMentor } = await import('./services/email/emailService-clean.js');

    const testData = {
      userName: req.body.userName || 'João Silva - Mentor de Teste',
      userEmail: req.body.userEmail || 'teste.mentor@exemplo.com',
      userRole: 'mentor',
      loginUrl: 'https://mentorx.com.br/mentor/dashboard'
    };

    const result = await enviarEmailBoasVindasMentor(testData);

    res.json({
      success: true,
      message: 'Teste de email boas-vindas mentor executado',
      emailResult: result,
      testData
    });

  } catch (error) {
    console.error('❌ Erro no teste email boas-vindas mentor:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ENDPOINT: Teste de e-mail de boas-vindas para mentorado
app.post('/api/test-email/boas-vindas-mentorado', async (req, res) => {
  console.log('🧪 [TESTE] Testando email boas-vindas mentorado');

  try {
    const { enviarEmailBoasVindasMentorado } = await import('./services/email/emailService-clean.js');

    const testData = {
      userName: req.body.userName || 'Maria Santos - Mentorada de Teste',
      userEmail: req.body.userEmail || 'teste.mentorada@exemplo.com',
      userRole: 'mentorado',
      loginUrl: 'https://mentorx.com.br/mentorado/dashboard'
    };

    const result = await enviarEmailBoasVindasMentorado(testData);

    res.json({
      success: true,
      message: 'Teste de email boas-vindas mentorado executado',
      emailResult: result,
      testData
    });

  } catch (error) {
    console.error('❌ Erro no teste email boas-vindas mentorado:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ENDPOINT: Teste de e-mail de compra de curso
app.post('/api/test-email/compra-curso', async (req, res) => {
  console.log('🧪 [TESTE] Testando email compra curso');

  try {
    const { enviarEmailCompraCurso } = await import('./services/email/emailService-clean.js');

    const testData = {
      menteeName: req.body.menteeName || 'Maria Santos',
      menteeEmail: req.body.menteeEmail || 'teste.mentorada@exemplo.com',
      mentorName: req.body.mentorName || 'João Silva',
      courseName: req.body.courseName || 'Curso de React Avançado',
      coursePrice: req.body.coursePrice || '299,00',
      courseUrl: 'https://mentorx.com.br/mentorado/cursos'
    };

    const result = await enviarEmailCompraCurso(testData);

    res.json({
      success: true,
      message: 'Teste de email compra curso executado',
      emailResult: result,
      testData
    });

  } catch (error) {
    console.error('❌ Erro no teste email compra curso:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ENDPOINT: E-mail de boas-vindas (genérico que direciona baseado no role)
app.post('/api/email/boas-vindas', async (req, res) => {
  console.log('📧 [BOAS-VINDAS] Nova requisição de e-mail de boas-vindas');

  try {
    const { userName, userEmail, userRole, loginUrl, supportUrl } = req.body;

    // Validações básicas
    if (!userName || !userEmail || !userRole) {
      console.error('❌ [BOAS-VINDAS] Dados obrigatórios ausentes');
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios ausentes: userName, userEmail, userRole'
      });
    }

    // Verificar se o role é válido
    if (userRole !== 'mentor' && userRole !== 'mentorado') {
      console.error('❌ [BOAS-VINDAS] Role inválido:', userRole);
      return res.status(400).json({
        success: false,
        error: 'userRole deve ser "mentor" ou "mentorado"'
      });
    }

    console.log('📋 [BOAS-VINDAS] Dados recebidos:', {
      userName,
      userEmail,
      userRole,
      loginUrl: loginUrl || 'default',
      supportUrl: supportUrl || 'default'
    });

    // Importar as funções de email
    const { enviarEmailBoasVindasMentor, enviarEmailBoasVindasMentorado } = await import('./services/email/emailService-clean.js');

    // Preparar dados para o email
    const emailData = {
      userName,
      userEmail,
      loginUrl: loginUrl || 'https://mentorx.com.br/login',
      supportUrl: supportUrl || 'https://mentorx.com.br/suporte'
    };

    let result;

    // Direcionar para a função correta baseada no role
    if (userRole === 'mentor') {
      console.log('📧 [BOAS-VINDAS] Enviando email de boas-vindas para mentor');
      result = await enviarEmailBoasVindasMentor(emailData);
    } else {
      console.log('📧 [BOAS-VINDAS] Enviando email de boas-vindas para mentorado');
      result = await enviarEmailBoasVindasMentorado(emailData);
    }

    if (result.success) {
      console.log('✅ [BOAS-VINDAS] Email enviado com sucesso!', result.messageId);
      res.json({
        success: true,
        messageId: result.messageId,
        message: `E-mail de boas-vindas ${userRole} enviado com sucesso`
      });
    } else {
      console.error('❌ [BOAS-VINDAS] Falha no envio:', result.error);
      res.status(500).json({
        success: false,
        error: result.error || 'Erro no envio do email'
      });
    }

  } catch (error) {
    console.error('❌ [BOAS-VINDAS] Erro crítico:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// ENDPOINT: Teste de e-mail de cancelamento
app.post('/api/test-email/cancelamento', async (req, res) => {
  console.log('🧪 [TESTE] Testando email cancelamento');

  try {
    const { enviarEmailCancelamentoAgendamento } = await import('./services/email/emailService-clean.js');

    const testData = {
      recipientName: req.body.recipientName || 'João Silva',
      recipientEmail: req.body.recipientEmail || 'teste.mentor@exemplo.com',
      recipientRole: req.body.recipientRole || 'mentor',
      appointmentDate: req.body.appointmentDate || '25 de janeiro de 2025',
      appointmentTime: req.body.appointmentTime || '15:30 - 16:30',
      otherPartyName: req.body.otherPartyName || 'Maria Santos',
      cancellationReason: req.body.cancellationReason || 'Conflito de agenda'
    };

    const result = await enviarEmailCancelamentoAgendamento(testData);

    res.json({
      success: true,
      message: 'Teste de email cancelamento executado',
      emailResult: result,
      testData
    });

  } catch (error) {
    console.error('❌ Erro no teste email cancelamento:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Export for Vercel
// Para desenvolvimento local, iniciar servidor
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 API Server rodando na porta ${PORT}`);
    console.log(`📧 Endpoints disponíveis:`);
    console.log(`   POST /api/appointments - Criar agendamento com emails`);
  });
}

export default app;