import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // ##########################################################################################
  // ###################### ENDPOINTS STRIPE - ETAPA 1 ####################################
  // ##########################################################################################

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

  // ENDPOINT 1: Criar ou atualizar conta conectada
  app.post('/api/stripe/account', async (req, res) => {
    try {
      const userData = req.body;
      
      // 🔍 DEBUG: Log que a requisição chegou ao servidor
      console.log('🚀 ROUTES.TS: Requisição recebida em /api/stripe/account');
      console.log('📦 ROUTES.TS: Dados recebidos:', JSON.stringify(userData, null, 2));
      
      // 🔍 DEBUG: Log antes da importação
      console.log('📋 ROUTES.TS: Importando stripeServerClientService...');
      
      // Importar dinamicamente o serviço
      const { createOrUpdateStripeConnectedAccount } = await import('./services/stripeServerClientService');
      
      // 🔍 DEBUG: Log após importação bem-sucedida
      console.log('✅ ROUTES.TS: stripeServerClientService importado com sucesso');
      console.log('🎯 ROUTES.TS: Chamando createOrUpdateStripeConnectedAccount...');
      
      const account = await createOrUpdateStripeConnectedAccount(userData);
      
      // 🔍 DEBUG: Log após execução bem-sucedida
      console.log('✅ ROUTES.TS: createOrUpdateStripeConnectedAccount executado com sucesso');
      console.log('📊 ROUTES.TS: Account retornado:', {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        requirements_currently_due: account.requirements?.currently_due?.length || 0
      });
      
      const response = {
        success: true,
        account: {
          id: account.id,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
          requirements: account.requirements
        }
      };
      
      res.json(response);
    } catch (error) {
      // 🔍 DEBUG: Log de erros
      console.error('❌ ROUTES.TS: Erro em /api/stripe/account:', error);
      console.error('❌ ROUTES.TS: Stack trace:', error instanceof Error ? error.stack : 'Sem stack');
      
      const errorResponse = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        details: error instanceof Error ? error.stack : undefined
      };
      
      res.status(500).json(errorResponse);
    }
  });

  // ENDPOINT 2: Verificar status da conta Stripe
  app.get('/api/stripe/account/:accountId/status', async (req, res) => {
    try {
      const { accountId } = req.params;
      
      // Importar dinamicamente o serviço
      const { verifyStripeAccountStatus } = await import('./services/stripeServerClientService');
      
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

  // ENDPOINT 3: Upload de documentos para verificação
  app.post('/api/stripe/documents/upload', async (req, res) => {
    try {
      // ✨ NOVO: Aceita dados em Base64 (muito mais eficiente!)
      const { fileDataBase64, fileName, purpose = 'identity_document' } = req.body;
      
      // Validar parâmetros obrigatórios
      if (!fileDataBase64) {
        return res.status(400).json({
          success: false,
          error: '❌ Dados do arquivo são obrigatórios (fileDataBase64)'
        });
      }

      if (!fileName) {
        return res.status(400).json({
          success: false,
          error: '❌ Nome do arquivo é obrigatório (fileName)'
        });
      }

      // Validar se é uma string Base64 válida
      if (typeof fileDataBase64 !== 'string') {
        return res.status(400).json({
          success: false,
          error: '❌ fileDataBase64 deve ser uma string Base64'
        });
      }

      // Validar formato Base64 básico
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(fileDataBase64)) {
        return res.status(400).json({
          success: false,
          error: '❌ fileDataBase64 não está em formato Base64 válido'
        });
      }

      // 📊 Log de informações de recebimento
      const base64Size = fileDataBase64.length;
      const estimatedFileSize = Math.floor(base64Size * 0.75);
      
      console.log(`📦 Recebido arquivo Base64: ${fileName}`);
      console.log(`📏 Tamanho Base64: ${(base64Size / 1024 / 1024).toFixed(2)}MB`);
      console.log(`📏 Tamanho estimado original: ${(estimatedFileSize / 1024 / 1024).toFixed(2)}MB`);

      // Importar dinamicamente o serviço de documentos
      const { uploadDocumentToStripe } = await import('./services/stripeServerDocumentService');
      
      // ✨ Chamar nova função que aceita Base64 diretamente
      const result = await uploadDocumentToStripe(fileDataBase64, fileName, purpose);
      
      res.json(result);
    } catch (error) {
      console.error('❌ Erro no upload de documento:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : undefined
      });
    }
  });

  // ENDPOINT 4: Associar documento à conta
  app.post('/api/stripe/documents/associate', async (req, res) => {
    try {
      const { accountId, fileId, documentType } = req.body;
      
      if (!accountId || !fileId || !documentType) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetros obrigatórios: accountId, fileId, documentType'
        });
      }
      
      // Importar dinamicamente o serviço de documentos
      const { associateDocumentToAccount } = await import('./services/stripeServerDocumentService');
      
      const result = await associateDocumentToAccount(accountId, fileId, documentType);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : undefined
      });
    }
  });

  // ENDPOINT 5: Verificar status de verificação da conta
  app.get('/api/stripe/documents/status/:accountId', async (req, res) => {
    try {
      const { accountId } = req.params;
      
      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'AccountId é obrigatório'
        });
      }
      
      // Importar dinamicamente o serviço de documentos
      const { checkAccountVerificationStatus } = await import('./services/stripeServerDocumentService');
      
      const result = await checkAccountVerificationStatus(accountId);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : undefined
      });
    }
  });

  // ##########################################################################################
  // ###################### ENDPOINTS STRIPE - PRODUTOS ####################################
  // ##########################################################################################

  // ENDPOINT 6: Criar produto Stripe
  app.post('/api/stripe/products', async (req, res) => {
    try {
      const { accountId, ...productData } = req.body;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em /api/stripe/products');
      console.log('📦 ROUTES.TS: Account ID:', accountId);
      console.log('📦 ROUTES.TS: Dados do produto recebidos:', JSON.stringify(productData, null, 2));
      
      // 🔍 VALIDAÇÃO: accountId é obrigatório
      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'accountId é obrigatório para criar produto na conta conectada'
        });
      }
      
      // Importar dinamicamente o serviço de produtos
      const { createStripeProduct } = await import('./services/stripeServerProductService');
      
      const result = await createStripeProduct(accountId, productData);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em /api/stripe/products:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        details: error instanceof Error ? error.stack : undefined
      });
    }
  });

  // ENDPOINT 7: Listar produtos Stripe
  app.get('/api/stripe/products/:accountId', async (req, res) => {
    try {
      const { accountId } = req.params;
      const { active, limit } = req.query;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em GET /api/stripe/products/:accountId');
      console.log('📦 ROUTES.TS: Account ID:', accountId);
      
      // 🔍 VALIDAÇÃO: accountId é obrigatório
      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'accountId é obrigatório para listar produtos da conta conectada'
        });
      }
      
      // Importar dinamicamente o serviço de produtos
      const { listStripeProducts } = await import('./services/stripeServerProductService');
      
      const options: any = {};
      if (active !== undefined) options.active = active === 'true';
      if (limit !== undefined) options.limit = parseInt(limit as string);
      
      const result = await listStripeProducts(accountId, options);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em GET /api/stripe/products/:accountId:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT 8: Obter produto específico
  app.get('/api/stripe/products/:accountId/:productId', async (req, res) => {
    try {
      const { accountId, productId } = req.params;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em GET /api/stripe/products/:accountId/:productId');
      console.log('📦 ROUTES.TS: Account ID:', accountId);
      console.log('📦 ROUTES.TS: Product ID:', productId);
      
      // 🔍 VALIDAÇÃO: accountId é obrigatório
      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'accountId é obrigatório para buscar produto da conta conectada'
        });
      }
      
      // Importar dinamicamente o serviço de produtos
      const { getStripeProduct } = await import('./services/stripeServerProductService');
      
      const result = await getStripeProduct(accountId, productId);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em GET /api/stripe/products/:accountId/:productId:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT 9: Atualizar produto Stripe
  app.put('/api/stripe/products/:accountId/:productId', async (req, res) => {
    try {
      const { accountId, productId } = req.params;
      const productData = req.body;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em PUT /api/stripe/products/:accountId/:productId');
      console.log('📦 ROUTES.TS: Account ID:', accountId);
      console.log('📦 ROUTES.TS: Product ID:', productId);
      console.log('📦 ROUTES.TS: Dados de atualização:', JSON.stringify(productData, null, 2));
      
      // 🔍 VALIDAÇÃO: accountId é obrigatório
      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'accountId é obrigatório para atualizar produto da conta conectada'
        });
      }
      
      // Importar dinamicamente o serviço de produtos
      const { updateStripeProduct } = await import('./services/stripeServerProductService');
      
      const result = await updateStripeProduct(accountId, productId, productData);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em PUT /api/stripe/products/:accountId/:productId:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT 10: Deletar produto Stripe (soft delete)
  app.delete('/api/stripe/products/:accountId/:productId', async (req, res) => {
    try {
      const { accountId, productId } = req.params;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em DELETE /api/stripe/products/:accountId/:productId');
      console.log('📦 ROUTES.TS: Account ID:', accountId);
      console.log('📦 ROUTES.TS: Product ID:', productId);
      
      // 🔍 VALIDAÇÃO: accountId é obrigatório
      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'accountId é obrigatório para deletar produto da conta conectada'
        });
      }
      
      // Importar dinamicamente o serviço de produtos
      const { deleteStripeProduct } = await import('./services/stripeServerProductService');
      
      const result = await deleteStripeProduct(accountId, productId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em DELETE /api/stripe/products/:accountId/:productId:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT 11: Criar preço para produto
  app.post('/api/stripe/prices', async (req, res) => {
    try {
      const { accountId, ...priceData } = req.body;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em /api/stripe/prices');
      console.log('📦 ROUTES.TS: Account ID:', accountId);
      console.log('📦 ROUTES.TS: Dados do preço recebidos:', JSON.stringify(priceData, null, 2));
      
      // 🔍 VALIDAÇÃO: accountId é obrigatório
      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'accountId é obrigatório para criar preço na conta conectada'
        });
      }
      
      // Importar dinamicamente o serviço de produtos
      const { createStripePrice } = await import('./services/stripeServerProductService');
      
      const result = await createStripePrice(accountId, priceData);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em /api/stripe/prices:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT 12: Listar preços de um produto
  app.get('/api/stripe/products/:accountId/:productId/prices', async (req, res) => {
    try {
      const { accountId, productId } = req.params;
      const { active } = req.query;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em GET /api/stripe/products/:accountId/:productId/prices');
      console.log('📦 ROUTES.TS: Account ID:', accountId);
      console.log('📦 ROUTES.TS: Product ID:', productId);
      
      // 🔍 VALIDAÇÃO: accountId é obrigatório
      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'accountId é obrigatório para listar preços da conta conectada'
        });
      }
      
      // Importar dinamicamente o serviço de produtos
      const { listStripePrices } = await import('./services/stripeServerProductService');
      
      const options: any = {};
      if (active !== undefined) options.active = active === 'true';
      
      const result = await listStripePrices(accountId, productId, options);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em GET /api/stripe/products/:accountId/:productId/prices:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT 13: Obter preço específico
  app.get('/api/stripe/prices/:accountId/:priceId', async (req, res) => {
    try {
      const { accountId, priceId } = req.params;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em GET /api/stripe/prices/:accountId/:priceId');
      console.log('📦 ROUTES.TS: Account ID:', accountId);
      console.log('📦 ROUTES.TS: Price ID:', priceId);
      
      // 🔍 VALIDAÇÃO: accountId é obrigatório
      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'accountId é obrigatório para buscar preço da conta conectada'
        });
      }
      
      // Importar dinamicamente o serviço de produtos
      const { getStripePrice } = await import('./services/stripeServerProductService');
      
      const result = await getStripePrice(accountId, priceId);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em GET /api/stripe/prices/:accountId/:priceId:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT 14: Desativar preço
  app.delete('/api/stripe/prices/:accountId/:priceId', async (req, res) => {
    try {
      const { accountId, priceId } = req.params;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em DELETE /api/stripe/prices/:accountId/:priceId');
      console.log('📦 ROUTES.TS: Account ID:', accountId);
      console.log('📦 ROUTES.TS: Price ID:', priceId);
      
      // 🔍 VALIDAÇÃO: accountId é obrigatório
      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'accountId é obrigatório para desativar preço da conta conectada'
        });
      }
      
      // Importar dinamicamente o serviço de produtos
      const { deactivateStripePrice } = await import('./services/stripeServerProductService');
      
      const result = await deactivateStripePrice(accountId, priceId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em DELETE /api/stripe/prices/:accountId/:priceId:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT DE TESTE: Verificar se o serviço Stripe está funcionando
  app.get('/api/stripe/test', async (req, res) => {
    try {
      // Verificar se as variáveis de ambiente estão configuradas
      const { config } = await import('./environment');
      
      const hasStripeKey = !!config.STRIPE_SECRET_KEY && config.STRIPE_SECRET_KEY !== '';
      const keyLength = config.STRIPE_SECRET_KEY?.length || 0;
      const isPlaceholder = config.STRIPE_SECRET_KEY?.includes('placeholder') || false;
      
      res.json({
        success: true,
        stripe: {
          hasKey: hasStripeKey,
          keyLength,
          isPlaceholder,
          keyPrefix: config.STRIPE_SECRET_KEY?.substring(0, 7) || 'N/A'
        },
        environment: config.NODE_ENV,
        message: hasStripeKey && !isPlaceholder ? 
          'Stripe configurado corretamente' : 
          'Stripe NÃO configurado - verifique STRIPE_SECRET_KEY'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  });

  // ##########################################################################################
  // ###################### ENDPOINTS STRIPE - CHECKOUT ####################################
  // ##########################################################################################

  // ENDPOINT 15: Criar sessão de checkout Stripe
  app.post('/api/stripe/checkout/session', async (req, res) => {
    try {
      const checkoutData = req.body;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em /api/stripe/checkout/session');
      console.log('📦 ROUTES.TS: Dados do checkout recebidos:', JSON.stringify(checkoutData, null, 2));
      
      // 🔍 VALIDAÇÃO: accountId é obrigatório
      if (!checkoutData.accountId) {
        return res.status(400).json({
          success: false,
          error: 'accountId é obrigatório para criar sessão de checkout na conta conectada'
        });
      }
      
      // Importar dinamicamente o serviço de checkout
      const { createStripeCheckoutSession } = await import('./services/stripeServerCheckoutService');
      
      const result = await createStripeCheckoutSession(checkoutData);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em /api/stripe/checkout/session:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        details: error instanceof Error ? error.stack : undefined
      });
    }
  });

  // ENDPOINT 16: Verificar sessão de checkout
  app.get('/api/stripe/checkout/session/:accountId/:sessionId', async (req, res) => {
    try {
      const { accountId, sessionId } = req.params;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em GET /api/stripe/checkout/session/:accountId/:sessionId');
      console.log('📦 ROUTES.TS: Account ID:', accountId);
      console.log('📦 ROUTES.TS: Session ID:', sessionId);
      
      // 🔍 VALIDAÇÃO: accountId é obrigatório
      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'accountId é obrigatório para verificar sessão de checkout'
        });
      }
      
      // Importar dinamicamente o serviço de checkout
      const { verifyStripeCheckoutSession } = await import('./services/stripeServerCheckoutService');
      
      const result = await verifyStripeCheckoutSession(accountId, sessionId);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em GET /api/stripe/checkout/session/:accountId/:sessionId:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT 17: Verificar status de pagamento
  app.get('/api/stripe/checkout/payment/:accountId/:paymentIntentId', async (req, res) => {
    try {
      const { accountId, paymentIntentId } = req.params;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em GET /api/stripe/checkout/payment/:accountId/:paymentIntentId');
      console.log('📦 ROUTES.TS: Account ID:', accountId);
      console.log('📦 ROUTES.TS: Payment Intent ID:', paymentIntentId);
      
      // 🔍 VALIDAÇÃO: accountId é obrigatório
      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'accountId é obrigatório para verificar status de pagamento'
        });
      }
      
      // Importar dinamicamente o serviço de checkout
      const { verifyStripePaymentStatus } = await import('./services/stripeServerCheckoutService');
      
      const result = await verifyStripePaymentStatus(accountId, paymentIntentId);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em GET /api/stripe/checkout/payment/:accountId/:paymentIntentId:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT 18: Listar sessões de checkout de uma conta
  app.get('/api/stripe/checkout/sessions/:accountId', async (req, res) => {
    try {
      const { accountId } = req.params;
      const { limit } = req.query;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em GET /api/stripe/checkout/sessions/:accountId');
      console.log('📦 ROUTES.TS: Account ID:', accountId);
      
      // 🔍 VALIDAÇÃO: accountId é obrigatório
      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'accountId é obrigatório para listar sessões de checkout'
        });
      }
      
      // Importar dinamicamente o serviço de checkout
      const { listStripeCheckoutSessions } = await import('./services/stripeServerCheckoutService');
      
      const options: any = {};
      if (limit !== undefined) options.limit = parseInt(limit as string);
      
      const result = await listStripeCheckoutSessions(accountId, options);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em GET /api/stripe/checkout/sessions/:accountId:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ##########################################################################################
  // ###################### ENDPOINTS STRIPE - BALANCE & PAYOUTS ########################
  // ##########################################################################################

  // ENDPOINT 19: Verificar saldo pendente da conta conectada
  app.post('/api/stripe/verify-balance', async (req, res) => {
    try {
      const { stripeAccountId } = req.body;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em /api/stripe/verify-balance');
      console.log('📦 ROUTES.TS: Stripe Account ID:', stripeAccountId);
      
      // 🔍 VALIDAÇÃO: stripeAccountId é obrigatório
      if (!stripeAccountId) {
        return res.status(400).json({
          success: false,
          error: 'stripeAccountId é obrigatório para verificar saldo'
        });
      }
      
      // Importar dinamicamente o serviço de balance
      const { verifyConnectedAccountBalance } = await import('./services/stripeServerVerifyBalanceService');
      
      const result = await verifyConnectedAccountBalance(stripeAccountId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em /api/stripe/verify-balance:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        details: error instanceof Error ? error.stack : undefined
      });
    }
  });

  // ENDPOINT 20: Verificar payouts da conta conectada
  app.post('/api/stripe/verify-payouts', async (req, res) => {
    try {
      const { stripeAccountId } = req.body;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em /api/stripe/verify-payouts');
      console.log('📦 ROUTES.TS: Stripe Account ID:', stripeAccountId);
      
      // 🔍 VALIDAÇÃO: stripeAccountId é obrigatório
      if (!stripeAccountId) {
        return res.status(400).json({
          success: false,
          error: 'stripeAccountId é obrigatório para verificar payouts'
        });
      }
      
      // Importar dinamicamente o serviço de payouts
      const { verifyConnectedAccountPayouts } = await import('./services/stripeServerVerifyPayoutsService');
      
      const result = await verifyConnectedAccountPayouts(stripeAccountId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em /api/stripe/verify-payouts:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        details: error instanceof Error ? error.stack : undefined
      });
    }
  });

  // ##########################################################################################
  // ###################### STRIPE WEBHOOK REMOVIDO ####################################
  // ##########################################################################################
  // 
  // ℹ️ WEBHOOK DO STRIPE FOI REMOVIDO - NÃO ESTAVA SENDO USADO
  // - Sistema de pagamentos funciona sem webhook
  // - Transações são processadas pelo frontend
  // - Matrículas são ativadas diretamente no checkout
  // 
  // ##########################################################################################

  // ##########################################################################################
  // ###################### ENDPOINTS E-MAIL - BREVO ####################################
  // ##########################################################################################

  // ENDPOINT 21: Enviar e-mail de boas-vindas
  app.post('/api/email/boas-vindas', async (req, res) => {
    try {
      const { userName, userEmail, userRole, loginUrl, supportUrl } = req.body;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em /api/email/boas-vindas');
      console.log('📦 ROUTES.TS: Dados do e-mail:', {
        userName,
        userEmail,
        userRole,
        loginUrl: loginUrl ? 'presente' : 'ausente',
        supportUrl: supportUrl ? 'presente' : 'ausente'
      });
      
      // 🔍 VALIDAÇÃO: Campos obrigatórios
      if (!userName || !userEmail || !userRole) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: userName, userEmail, userRole'
        });
      }

      // 🔍 VALIDAÇÃO: Role válido
      if (!['mentor', 'mentorado'].includes(userRole)) {
        return res.status(400).json({
          success: false,
          error: 'userRole deve ser "mentor" ou "mentorado"'
        });
      }
      
      // Importar dinamicamente o serviço de e-mail
      const { enviarEmailBoasVindas } = await import('./services/email/emailService');
      
      const emailData = {
        userName,
        userEmail,
        userRole: userRole as 'mentor' | 'mentorado',
        loginUrl: loginUrl || 'https://app.mentoraai.com.br/login',
        supportUrl: supportUrl || 'https://app.mentoraai.com.br/suporte'
      };
      
      const result = await enviarEmailBoasVindas(emailData);
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em /api/email/boas-vindas:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        details: error instanceof Error ? error.stack : undefined
      });
    }
  });

  // ENDPOINT 22: Testar conectividade Brevo
  app.get('/api/email/test', async (req, res) => {
    try {
      console.log('🚀 ROUTES.TS: Requisição recebida em /api/email/test');
      
      // Importar dinamicamente o serviço de e-mail
      const { testarConectividadeBrevo } = await import('./services/email/emailService');
      
      const result = await testarConectividadeBrevo();
      
      // Verificar configurações de ambiente
      const { config } = await import('./environment');
      
      const hasAPIKey = !!config.BREVO_API_KEY && config.BREVO_API_KEY !== '';
      const hasSenderEmail = !!config.BREVO_SENDER_EMAIL && config.BREVO_SENDER_EMAIL !== '';
      const hasSenderName = !!config.BREVO_SENDER_NAME && config.BREVO_SENDER_NAME !== '';
      
      res.json({
        success: result.success,
        message: result.message,
        config: {
          hasAPIKey,
          hasSenderEmail,
          hasSenderName,
          senderEmail: config.BREVO_SENDER_EMAIL,
          senderName: config.BREVO_SENDER_NAME,
          apiKeyPrefix: config.BREVO_API_KEY?.substring(0, 15) + '...' || 'N/A'
        },
        environment: config.NODE_ENV
      });
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em /api/email/test:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT 23: Enviar e-mail de teste
  app.post('/api/email/test-send', async (req, res) => {
    try {
      const { email, name, role } = req.body;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em /api/email/test-send');
      console.log('📦 ROUTES.TS: Dados do teste:', { email, name, role });
      
      // 🔍 VALIDAÇÃO: Campos obrigatórios
      if (!email || !name || !role) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: email, name, role'
        });
      }

      // 🔍 VALIDAÇÃO: Role válido
      if (!['mentor', 'mentorado'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'role deve ser "mentor" ou "mentorado"'
        });
      }
      
      // Importar dinamicamente o serviço de e-mail
      const { enviarEmailBoasVindas } = await import('./services/email/emailService');
      
      const emailData = {
        userName: name,
        userEmail: email,
        userRole: role as 'mentor' | 'mentorado',
        loginUrl: 'https://app.mentoraai.com.br/login',
        supportUrl: 'https://app.mentoraai.com.br/suporte'
      };
      
      const result = await enviarEmailBoasVindas(emailData);
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json({
        ...result,
        message: `E-mail de teste enviado com sucesso para ${email}`
      });
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em /api/email/test-send:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT DEBUG: Testar envio de email sem verificar banco
  app.post('/api/calendar/test-email', async (req, res) => {
    try {
      const { 
        mentorName, 
        menteeName, 
        menteeEmail, 
        appointmentDate, 
        appointmentTime, 
        cancellationReason 
      } = req.body;
      
      console.log('🧪 [TEST-EMAIL] Testando envio de email diretamente...');
      console.log('🧪 [TEST-EMAIL] Dados recebidos:', {
        mentorName, menteeName, menteeEmail, appointmentDate, appointmentTime, cancellationReason
      });
      
      // Importar dinamicamente o serviço de e-mail de cancelamento
      const { enviarEmailCancelamentoAgendamento } = await import('./services/email/services/mentor/emailCalendarCancel');
      
      const emailData = {
        mentorName,
        menteeName,
        menteeEmail,
        appointmentDate,
        appointmentTime,
        timezone: 'America/Sao_Paulo',
        cancellationReason,
        platformUrl: 'https://app.mentoraai.com.br',
        supportUrl: 'https://app.mentoraai.com.br/suporte'
      };
      
      console.log('📤 [TEST-EMAIL] Enviando email de teste...');
      const result = await enviarEmailCancelamentoAgendamento(emailData);
      
      console.log('📥 [TEST-EMAIL] Resultado:', result);
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Falha no envio do email de teste',
          details: result.error
        });
      }
      
      res.json({
        success: true,
        message: 'Email de teste enviado com sucesso!',
        messageId: result.messageId,
        testData: emailData
      });
    } catch (error) {
      console.error('❌ [TEST-EMAIL] Erro:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT DEBUG: Listar IDs de agendamentos disponíveis
  app.get('/api/calendar/list-ids', async (req, res) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const { config } = await import('./environment');
      const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
      
      // Buscar todos os IDs de agendamentos
      const { data: appointments, error } = await supabase
        .from('calendar')
        .select('id, status, mentor_name, mentee_name, scheduled_date, start_time, end_time, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      
      console.log('DEBUG: Lista de agendamentos:', { appointments, error });
      
      res.json({
        found: appointments ? appointments.length : 0,
        error: error?.message,
        appointments: appointments || []
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Erro' });
    }
  });

  // ENDPOINT DEBUG: Verificar agendamento
  app.get('/api/calendar/debug/:appointmentId', async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const { createClient } = await import('@supabase/supabase-js');
      const { config } = await import('./environment');
      const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
      
      // Buscar todos os agendamentos com esse ID
      const { data: allResults, error: allError } = await supabase
        .from('calendar')
        .select('*')
        .eq('id', appointmentId);
        
      // Buscar também todos os agendamentos para análise geral
      const { data: allAppointments, error: allAppError } = await supabase
        .from('calendar')
        .select('id, status, mentor_name, mentee_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      console.log('DEBUG: Resultado da busca SEM .single():', { allResults, allError });
      
      // Buscar com .single()
      const { data: singleResult, error: singleError } = await supabase
        .from('calendar')
        .select('*')
        .eq('id', appointmentId)
        .single();
        
      console.log('DEBUG: Resultado da busca COM .single():', { singleResult, singleError });
      
      res.json({
        appointmentId,
        withoutSingle: { data: allResults, error: allError?.message },
        withSingle: { data: singleResult, error: singleError?.message },
        recentAppointments: { data: allAppointments, error: allAppError?.message }
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Erro' });
    }
  });

  // ENDPOINT 24: Enviar e-mail de cancelamento de agendamento
  app.post('/api/calendar/cancel-email', async (req, res) => {
    try {
      const { 
        appointmentId, 
        mentorName, 
        menteeName, 
        appointmentDate, 
        appointmentTime, 
        cancellationReason 
      } = req.body;
      
      console.log('\n========== CANCELAMENTO DE AGENDAMENTO ==========');
      console.log('📥 Dados recebidos:', JSON.stringify({
        appointmentId,
        mentorName,
        menteeName,
        appointmentDate,
        appointmentTime,
        cancellationReason
      }, null, 2));
      
      // Validação dos campos obrigatórios
      if (!appointmentId || !mentorName || !menteeName || !appointmentDate || !appointmentTime) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios faltando'
        });
      }
      
      // Buscar dados do agendamento no banco
      const { createClient } = await import('@supabase/supabase-js');
      const { config } = await import('./environment');
      
      // Usar SERVICE_ROLE_KEY para bypass RLS
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_ANON_KEY;
      const supabase = createClient(config.SUPABASE_URL, supabaseServiceKey);
      
      console.log('\n🔍 Buscando agendamento ID:', appointmentId);
      
      // Buscar o agendamento independente do status
      const { data: appointments, error: searchError } = await supabase
        .from('calendar')
        .select('*')
        .eq('id', appointmentId);
      
      console.log('📊 Resultado da busca:', {
        encontrados: appointments?.length || 0,
        erro: searchError?.message || null
      });
      
      if (searchError) {
        console.error('❌ Erro na busca:', searchError);
        return res.status(500).json({
          success: false,
          error: 'Erro ao buscar agendamento'
        });
      }
      
      // Se não encontrou o agendamento
      if (!appointments || appointments.length === 0) {
        console.log('⚠️ Agendamento não encontrado no banco (possível RLS ativo)');
        console.log('✅ Usando dados fornecidos pelo frontend para envio do email');
        
        // Buscar email do mentorado baseado no nome (fallback)
        const { data: menteeByName, error: nameError } = await supabase
          .from('profiles')
          .select('email')
          .eq('full_name', menteeName)
          .limit(1);
        
        const menteeEmail = menteeByName?.[0]?.email || 'guilherme.ramalho@outlook.com';
        
        console.log('\n📧 Preparando envio de email...');
        const emailData = {
          mentorName,
          menteeName,
          menteeEmail,
          appointmentDate,
          appointmentTime,
          timezone: 'America/Sao_Paulo',
          cancellationReason,
          platformUrl: 'https://app.mentoraai.com.br',
          supportUrl: 'https://app.mentoraai.com.br/suporte'
        };
        
        console.log('📤 Dados para o email:', JSON.stringify(emailData, null, 2));
        
        // Importar e chamar o serviço de email
        const { enviarEmailCancelamentoAgendamento } = await import('./services/email/services/mentor/emailCalendarCancel');
        const result = await enviarEmailCancelamentoAgendamento(emailData);
        
        console.log('\n📨 Resultado do envio:', JSON.stringify(result, null, 2));
        
        return res.json({
          success: result.success,
          message: result.success ? 'Email enviado com sucesso' : 'Erro ao enviar email',
          details: result
        });
      }
      
      // Se encontrou o agendamento
      const appointment = appointments[0];
      console.log('✅ Agendamento encontrado:', {
        id: appointment.id,
        status: appointment.status,
        mentee_id: appointment.mentee_id
      });
      
      // Buscar email do mentorado
      console.log('\n🔍 Buscando email do mentorado ID:', appointment.mentee_id);
      
      const { data: menteeProfile, error: menteeError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', appointment.mentee_id)
        .single();
      
      if (menteeError || !menteeProfile?.email) {
        console.error('❌ Email do mentorado não encontrado');
        return res.status(400).json({
          success: false,
          error: 'Email do mentorado não encontrado'
        });
      }
      
      console.log('✅ Email encontrado:', menteeProfile.email);
      
      // Preparar e enviar email
      console.log('\n📧 Preparando envio de email...');
      const emailData = {
        mentorName,
        menteeName,
        menteeEmail: menteeProfile.email,
        appointmentDate,
        appointmentTime,
        timezone: 'America/Sao_Paulo',
        cancellationReason,
        platformUrl: 'https://app.mentoraai.com.br',
        supportUrl: 'https://app.mentoraai.com.br/suporte'
      };
      
      console.log('📤 Dados para o email:', JSON.stringify(emailData, null, 2));
      
      // Importar e chamar o serviço de email
      const { enviarEmailCancelamentoAgendamento } = await import('./services/email/services/mentor/emailCalendarCancel');
      const result = await enviarEmailCancelamentoAgendamento(emailData);
      
      console.log('\n📨 Resultado do envio:', JSON.stringify(result, null, 2));
      console.log('==================================================\n');
      
      res.json({
        success: result.success,
        message: result.success ? 'Email de cancelamento enviado com sucesso' : 'Erro ao enviar email',
        details: result
      });
      
    } catch (error) {
      console.error('\n❌ ERRO CRÍTICO:', error);
      console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
      console.log('==================================================\n');
      
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT 25: Testar e-mail de cancelamento (apenas para debug)
  app.post('/api/calendar/cancel-email/test', async (req, res) => {
    try {
      console.log('🧪 ROUTES.TS: Endpoint de teste de email de cancelamento');
      
      // Importar dinamicamente o serviço de e-mail de cancelamento
      const { enviarEmailCancelamentoAgendamento } = await import('./services/email/services/mentor/emailCalendarCancel');
      
      const testEmailData = {
        mentorName: 'Mentor Teste',
        menteeName: 'Mentorado Teste',
        menteeEmail: req.body.email || 'teste@exemplo.com',
        appointmentDate: 'quinta-feira, 02 de janeiro de 2025',
        appointmentTime: '14:00 - 15:00',
        timezone: 'America/Sao_Paulo',
        cancellationReason: req.body.reason || 'Teste de cancelamento via API',
        platformUrl: 'https://app.mentoraai.com.br',
        supportUrl: 'https://app.mentoraai.com.br/suporte'
      };
      
      console.log('📤 ROUTES.TS: Dados de teste:', testEmailData);
      
      const result = await enviarEmailCancelamentoAgendamento(testEmailData);
      
      console.log('📥 ROUTES.TS: Resultado do teste:', result);
      
      res.json({
        success: true,
        message: 'Teste de email de cancelamento executado',
        result
      });
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro no teste de email:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
