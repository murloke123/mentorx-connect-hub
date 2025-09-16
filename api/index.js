// Vercel Serverless Function - Main API Handler
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000', 
    'http://localhost:5173',
    'https://mentoraai.com.br',
    'https://www.mentoraai.com.br',
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

// ENDPOINT: Verificar payouts da conta conectada usando balance_transactions
app.post('/api/stripe/verify-payouts', async (req, res) => {
  try {
    const { stripeAccountId } = req.body;
    
    console.log('🚀 API: Requisição recebida em /api/stripe/verify-payouts');
    console.log('📦 API: Stripe Account ID:', stripeAccountId);
    
    // Validação: stripeAccountId é obrigatório
    if (!stripeAccountId) {
      return res.status(400).json({
        success: false,
        error: 'stripeAccountId é obrigatório para verificar payouts'
      });
    }
    
    // Importar dinamicamente o serviço de payouts
    const { verifyConnectedAccountPayouts } = await import('./services/stripeServerVerifyPayoutsService.js');
    
    const result = await verifyConnectedAccountPayouts(stripeAccountId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('❌ API: Erro em /api/stripe/verify-payouts:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      details: error instanceof Error ? error.stack : undefined
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
export default app;