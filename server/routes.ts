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
  // ###################### ENDPOINT STRIPE - WEBHOOK ####################################
  // ##########################################################################################

  // ENDPOINT WEBHOOK: Processar eventos do Stripe
  app.post('/api/stripe/webhook', async (req, res) => {
    try {
      const signature = req.get('stripe-signature');
      
      console.log('🚀 ROUTES.TS: Webhook recebido do Stripe');
      console.log('📦 ROUTES.TS: Signature presente:', !!signature);
      
      if (!signature) {
        return res.status(400).json({
          success: false,
          error: 'Stripe signature header ausente'
        });
      }
      
      // Importar dinamicamente o serviço de webhook
      const { handleStripeWebhook } = await import('./services/stripeServerWebhookService');
      
      const result = await handleStripeWebhook(req.body, signature);
      
      console.log('✅ ROUTES.TS: Webhook processado com sucesso');
      res.json(result);
      
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro no webhook:', error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
