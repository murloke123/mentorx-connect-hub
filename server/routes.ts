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
  // ###################### ENDPOINTS STRIPE - AGENDAMENTOS ############################
  // ##########################################################################################

  // ENDPOINT: Criar produto Stripe para agendamento
  app.post('/api/stripe/appointments/products', async (req, res) => {
    try {
      const { accountId, ...productData } = req.body;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em /api/stripe/appointments/products');
      console.log('📦 ROUTES.TS: Account ID:', accountId);
      console.log('📦 ROUTES.TS: Dados do produto de agendamento:', JSON.stringify(productData, null, 2));
      
      // 🔍 VALIDAÇÃO: accountId é obrigatório
      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'accountId é obrigatório para criar produto de agendamento na conta conectada'
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
      console.error('❌ ROUTES.TS: Erro em /api/stripe/appointments/products:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        details: error instanceof Error ? error.stack : undefined
      });
    }
  });

  // ENDPOINT: Criar preço Stripe para agendamento
  app.post('/api/stripe/appointments/prices', async (req, res) => {
    try {
      const { accountId, ...priceData } = req.body;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em /api/stripe/appointments/prices');
      console.log('📦 ROUTES.TS: Account ID:', accountId);
      console.log('📦 ROUTES.TS: Dados do preço de agendamento:', JSON.stringify(priceData, null, 2));
      
      // 🔍 VALIDAÇÃO: accountId é obrigatório
      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'accountId é obrigatório para criar preço de agendamento na conta conectada'
        });
      }
      
      // Importar dinamicamente o serviço de preços
      const { createStripePrice } = await import('./services/stripeServerProductService');
      
      const result = await createStripePrice(accountId, priceData);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em /api/stripe/appointments/prices:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        details: error instanceof Error ? error.stack : undefined
      });
    }
  });

  // ENDPOINT: Criar checkout Stripe para agendamento
  app.post('/api/stripe/appointments/checkout', async (req, res) => {
    try {
      const { 
        priceId, 
        buyerId, 
        buyerEmail, 
        mentorId, 
        mentorStripeAccountId, 
        appointmentData, 
        stripeProductId, 
        successUrl, 
        cancelUrl 
      } = req.body;
      
      console.log('🚀 ROUTES.TS: Requisição recebida em /api/stripe/appointments/checkout');
      console.log('📦 ROUTES.TS: Checkout de agendamento:', {
        priceId,
        buyerId,
        mentorId,
        mentorStripeAccountId,
        price: appointmentData?.price
      });
      
      // 🔍 VALIDAÇÃO: campos obrigatórios
      if (!priceId || !buyerId || !mentorId || !mentorStripeAccountId) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: priceId, buyerId, mentorId, mentorStripeAccountId'
        });
      }
      
      // Importar dinamicamente o serviço de checkout
      const { createStripeCheckoutSession } = await import('./services/stripeServerCheckoutService');
      
      // Criar registro inicial da transação no banco
      const supabase = (await import('@supabase/supabase-js')).createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE!
      );

      const totalAmount = appointmentData?.price || 0;
      const platformFee = 0; // Sem taxa da plataforma
      const mentorAmount = totalAmount;

      const { data: transaction, error: transactionError } = await supabase
        .from('stripe_connect_transactions')
        .insert({
          appointment_id: null, // Será atualizado após criar o agendamento
          buyer_id: buyerId,
          mentor_id: mentorId,
          stripe_session_id: '', // Será atualizado após criar a sessão
          stripe_payment_intent_id: null,
          total_amount: totalAmount,
          platform_fee: platformFee,
          mentor_amount: mentorAmount,
          amount: totalAmount * 100, // amount em centavos
          currency: 'brl',
          status: 'pending',
          stripe_account_id: mentorStripeAccountId,
          application_fee_amount: 0, // Sem taxa da plataforma
          type: 'appointment', // Tipo agendamento
          metadata: {
            buyer_email: buyerEmail,
            appointment_data: appointmentData,
            stripe_product_id: stripeProductId
          }
        })
        .select()
        .single();

      if (transactionError || !transaction) {
        console.error('❌ ROUTES.TS: Erro ao criar registro de transação:', transactionError);
        return res.status(500).json({
          success: false,
          error: 'Erro ao criar registro de transação'
        });
      }

      // Criar sessão de checkout - usando courseId temporário para agendamentos
      const sessionResult = await createStripeCheckoutSession({
        accountId: mentorStripeAccountId,
        priceId,
        courseId: 'appointment-pending', // Agendamentos usam este valor especial
        buyerId,
        buyerEmail,
        mentorId,
        successUrl,
        cancelUrl
      });

      if (!sessionResult.success) {
        return res.status(400).json(sessionResult);
      }

      // Atualizar transação com session ID
      const { error: updateError } = await supabase
        .from('stripe_connect_transactions')
        .update({
          stripe_session_id: sessionResult.sessionId
        })
        .eq('id', transaction.id);

      if (updateError) {
        console.error('❌ ROUTES.TS: Erro ao atualizar transação com session ID:', updateError);
      }

      const result = {
        success: true,
        sessionId: sessionResult.sessionId,
        sessionUrl: sessionResult.sessionUrl,
        transactionId: transaction.id
      };
      
      res.json(result);
    } catch (error) {
      console.error('❌ ROUTES.TS: Erro em /api/stripe/appointments/checkout:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        details: error instanceof Error ? error.stack : undefined
      });
    }
  });

  // ENDPOINT: Verificar pagamento de agendamento (para página de sucesso)
  app.post('/api/stripe/appointments/verify-payment', async (req, res) => {
    try {
      const { sessionId, transactionId } = req.body;
      
      console.log('🔍 ROUTES.TS: Verificando pagamento de agendamento:', {
        sessionId,
        transactionId
      });
      
      // Validação: sessionId é obrigatório
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'sessionId é obrigatório'
        });
      }

      // Buscar transação no banco
      const supabase = (await import('@supabase/supabase-js')).createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: transaction, error: transactionError } = await supabase
        .from('stripe_connect_transactions')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .eq('type', 'appointment')
        .single();

      if (transactionError || !transaction) {
        console.error('❌ ROUTES.TS: Transação não encontrada:', transactionError);
        return res.status(404).json({
          success: false,
          error: 'Transação não encontrada'
        });
      }

      // Verificar status no Stripe
      const { verifyStripeCheckoutSession } = await import('./services/stripeServerCheckoutService');
      const stripeResult = await verifyStripeCheckoutSession(
        transaction.stripe_account_id,
        sessionId
      );

      if (!stripeResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Erro ao verificar pagamento no Stripe'
        });
      }

      // Retornar dados da transação e status do pagamento
      res.json({
        success: true,
        transaction,
        stripeSession: stripeResult.transaction,
        isPaid: stripeResult.transaction.payment_status === 'paid'
      });

    } catch (error) {
      console.error('❌ ROUTES.TS: Erro ao verificar pagamento de agendamento:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
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

  // 🔒 CACHE DE PROTEÇÃO CONTRA E-MAILS DE BOAS-VINDAS DUPLICADOS
  const processedWelcomeEmails = new Map<string, { timestamp: number; messageId?: string }>();
  
  // Limpar cache de boas-vindas a cada 2 horas para evitar acúmulo de memória
  setInterval(() => {
    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
    const keysToDelete: string[] = [];
    
    processedWelcomeEmails.forEach((value, key) => {
      if (value.timestamp < twoHoursAgo) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => processedWelcomeEmails.delete(key));
    console.log('🧹 [WELCOME-EMAIL-CACHE] Cache de e-mails de boas-vindas limpo, entradas restantes:', processedWelcomeEmails.size);
  }, 2 * 60 * 60 * 1000); // 2 horas

  // ENDPOINT 21: Enviar e-mail de boas-vindas
  app.post('/api/email/boas-vindas', async (req, res) => {
    const startTime = Date.now();
    
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

      // 🔒 PROTEÇÃO BACKEND: Verificar se e-mail de boas-vindas já foi processado para este usuário
      const cacheKey = `${userEmail}_${userRole}`;
      const existingProcess = processedWelcomeEmails.get(cacheKey);
      
      if (existingProcess) {
        const timeDiff = Date.now() - existingProcess.timestamp;
        console.log('🛑 [WELCOME-EMAIL] E-mail de boas-vindas já processado para este usuário:', {
          userEmail,
          userRole,
          processedAt: new Date(existingProcess.timestamp).toISOString(),
          timeDiffMs: timeDiff,
          messageId: existingProcess.messageId
        });
        
        return res.json({
          success: true,
          message: 'E-mail de boas-vindas já foi enviado para este usuário',
          messageId: existingProcess.messageId,
          cached: true,
          processedAt: new Date(existingProcess.timestamp).toISOString()
        });
      }

      // 🔒 MARCAR COMO PROCESSANDO IMEDIATAMENTE (evita race conditions)
      processedWelcomeEmails.set(cacheKey, { 
        timestamp: Date.now(),
        messageId: undefined 
      });
      
      console.log('🔒 [WELCOME-EMAIL] Usuário marcado como processando:', {
        cacheKey,
        timestamp: new Date().toISOString()
      });
      
      // Importar dinamicamente o serviço de e-mail
      const { enviarEmailBoasVindas } = await import('./services/email/emailService');
      
      const emailData = {
        userName,
        userEmail,
        userRole: userRole as 'mentor' | 'mentorado',
        loginUrl: loginUrl || 'https://app.mentoraai.com.br/login',
        supportUrl: supportUrl || 'https://app.mentoraai.com.br/suporte'
      };
      
      console.log('📤 [WELCOME-EMAIL] Enviando e-mail ÚNICO de boas-vindas para Brevo...');
      const result = await enviarEmailBoasVindas(emailData);
      
      if (result.success) {
        // 🔒 ATUALIZAR CACHE COM MESSAGE ID
        processedWelcomeEmails.set(cacheKey, { 
          timestamp: Date.now(),
          messageId: result.messageId 
        });
        
        console.log('✅ [WELCOME-EMAIL] E-mail de boas-vindas enviado com sucesso!', {
          messageId: result.messageId,
          duration: Date.now() - startTime,
          userEmail,
          userRole
        });
        
        res.json({
          success: true,
          message: 'E-mail de boas-vindas enviado com sucesso',
          messageId: result.messageId,
          duration: Date.now() - startTime
        });
      } else {
        // 🔒 REMOVER DO CACHE SE FALHOU (permitir retry)
        processedWelcomeEmails.delete(cacheKey);
        
        console.error('❌ [WELCOME-EMAIL] Falha no envio do e-mail de boas-vindas:', result.error);
        res.status(500).json({
          success: false,
          error: result.error || 'Erro ao enviar e-mail de boas-vindas'
        });
      }
      
    } catch (error) {
      // 🔒 REMOVER DO CACHE SE ERRO CRÍTICO (permitir retry)
      const { userEmail, userRole } = req.body;
      if (userEmail && userRole) {
        const cacheKey = `${userEmail}_${userRole}`;
        processedWelcomeEmails.delete(cacheKey);
      }
      
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
        mentorId: 'test-mentor-id',
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
        
        // Buscar mentor ID baseado no nome (fallback)
        console.log('🔍 [DEBUG FALLBACK] Buscando mentor por nome:', mentorName);
        const { data: mentorByName, error: mentorNameError } = await supabase
          .from('profiles')
          .select('id')
          .eq('full_name', mentorName)
          .limit(1);
        
        console.log('🔍 [DEBUG FALLBACK] Mentor encontrado:', mentorByName);
        const mentorId = mentorByName?.[0]?.id || 'mentor-id-nao-encontrado';
        console.log('🔍 [DEBUG FALLBACK] mentorId final:', mentorId);
        
        console.log('\n📧 Preparando envio de email...');
        const emailData = {
          mentorId,
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
        mentorId: appointment.mentor_id,
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
        mentorId: req.body.mentorId || 'test-mentor-id-debug',
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
      
      console.log('📋 ROUTES.TS: mentorId enviado para o email:', testEmailData.mentorId);
      
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

  // ENDPOINT 26: Enviar e-mail de novo agendamento para mentor
  app.post('/api/calendar/new-appointment-email', async (req, res) => {
    try {
      const { 
        mentorId,
        mentorName, 
        menteeName, 
        appointmentDate, 
        appointmentTime, 
        timezone,
        notes,
        meetLink 
      } = req.body;
      
      console.log('\n========== NOVO AGENDAMENTO - E-MAIL ==========');
      console.log('📥 Dados recebidos:', JSON.stringify({
        mentorId,
        mentorName,
        menteeName,
        appointmentDate,
        appointmentTime,
        timezone,
        notes,
        meetLink
      }, null, 2));
      
      // Validação dos campos obrigatórios
      if (!mentorId || !mentorName || !menteeName || !appointmentDate || !appointmentTime) {
        console.error('❌ Campos obrigatórios faltando');
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios faltando'
        });
      }
      
      // Buscar dados do mentor no banco
      const { createClient } = await import('@supabase/supabase-js');
      const { config } = await import('./environment');
      
      // Usar SERVICE_ROLE_KEY para bypass RLS
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_ANON_KEY;
      const supabase = createClient(config.SUPABASE_URL, supabaseServiceKey);
      
      console.log('\n🔍 Buscando e-mail do mentor ID:', mentorId);
      
      const { data: mentorProfile, error: mentorError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', mentorId)
        .single();
      
      if (mentorError || !mentorProfile?.email) {
        console.error('❌ E-mail do mentor não encontrado:', mentorError);
        return res.status(400).json({
          success: false,
          error: 'E-mail do mentor não encontrado'
        });
      }
      
      console.log('✅ Mentor encontrado:', {
        email: mentorProfile.email,
        name: mentorProfile.full_name || mentorName
      });
      
      // Preparar dados para o e-mail
      console.log('\n📧 Preparando envio de e-mail de novo agendamento...');
      const emailData = {
        mentorName: mentorProfile.full_name || mentorName,
        mentorEmail: mentorProfile.email,
        menteeName,
        appointmentDate,
        appointmentTime,
        timezone: timezone || 'America/Sao_Paulo (UTC-3)',
        notes: notes || undefined,
        meetLink: meetLink || undefined,
        agendamentosUrl: 'https://mentoraai.com.br/mentor/agendamentos',
        supportUrl: 'https://app.mentoraai.com.br/suporte'
      };
      
      console.log('📤 Dados para o e-mail:', JSON.stringify(emailData, null, 2));
      
      // Importar e chamar o serviço de e-mail
      const { enviarEmailNovoAgendamento } = await import('./services/email/services/mentor/emailNewSchedule');
      const result = await enviarEmailNovoAgendamento(emailData);
      
      console.log('\n📨 Resultado do envio de e-mail:', JSON.stringify(result, null, 2));
      console.log('==============================================\n');
      
      res.json({
        success: result.success,
        message: result.success ? 'E-mail de novo agendamento enviado com sucesso' : 'Erro ao enviar e-mail',
        messageId: result.messageId,
        details: result
      });
      
    } catch (error) {
      console.error('\n❌ ERRO CRÍTICO no envio de e-mail de novo agendamento:', error);
      console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
      console.log('==============================================\n');
      
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT 27: Teste de e-mail de novo agendamento (debug)
  app.post('/api/calendar/new-appointment-email/test', async (req, res) => {
    try {
      console.log('🧪 TESTE: Endpoint de teste de e-mail de novo agendamento');
      
      const { enviarEmailNovoAgendamento } = await import('./services/email/services/mentor/emailNewSchedule');
      
      const testEmailData = {
        mentorName: 'Mentor Teste',
        mentorEmail: req.body.email || 'mentor@teste.com',
        menteeName: 'Mentorado Teste',
        appointmentDate: 'quinta-feira, 02 de janeiro de 2025',
        appointmentTime: '14:00 - 15:00',
        timezone: 'America/Sao_Paulo (UTC-3)',
        notes: req.body.notes || 'Este é um teste de novo agendamento',
        meetLink: req.body.meetLink || 'https://meet.jit.si/mentoria-teste-12345',
        agendamentosUrl: 'https://mentoraai.com.br/mentor/agendamentos',
        supportUrl: 'https://app.mentoraai.com.br/suporte'
      };
      
      console.log('📤 Dados de teste:', testEmailData);
      
      const result = await enviarEmailNovoAgendamento(testEmailData);
      
      console.log('📥 Resultado do teste:', result);
      
      res.json({
        success: true,
        message: 'Teste de e-mail de novo agendamento executado',
        result
      });
    } catch (error) {
      console.error('❌ Erro no teste de e-mail:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT DEBUG: Verificar HTML final do email de novo agendamento
  app.post('/api/calendar/new-appointment-email/debug-html', async (req, res) => {
    try {
      console.log('🔍 DEBUG HTML: Testando geração do HTML de novo agendamento');
      
      const { newScheduleTemplate } = await import('./services/email/templates/mentor/newScheduleTemplate');
      
      // Preparar parâmetros do template
      const templateParams: Record<string, string> = {
        MENTOR_NAME: 'Dr. João Silva',
        MENTOR_EMAIL: 'mentor@teste.com',
        MENTEE_NAME: 'Maria Santos',
        APPOINTMENT_DATE: 'quinta-feira, 02 de janeiro de 2025',
        APPOINTMENT_TIME: '14:00 - 15:00',
        TIMEZONE: 'America/Sao_Paulo (UTC-3)',
        NOTES: req.body.notes || 'Este é um teste de novo agendamento',
        MEET_LINK: req.body.meetLink || 'https://meet.jit.si/mentoria-teste-12345',
        AGENDAMENTOS_URL: 'https://mentoraai.com.br/mentor/agendamentos',
        SUPPORT_URL: 'https://app.mentoraai.com.br/suporte',
        CURRENT_YEAR: new Date().getFullYear().toString()
      };

      // Substituir variáveis no template
      let htmlContent = newScheduleTemplate.htmlContent;
      let textContent = newScheduleTemplate.textContent || '';
      let subject = newScheduleTemplate.subject;

      // Substituir todas as variáveis
      Object.entries(templateParams).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
        textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
      });

      // Tratar condicionais do template
      const hasNotes = req.body.notes && req.body.notes.trim();
      const hasMeetLink = req.body.meetLink && req.body.meetLink.trim();
      
      if (hasNotes) {
        htmlContent = htmlContent.replace(/\{\{#if NOTES\}\}/g, '');
        htmlContent = htmlContent.replace(/\{\{\/if\}\}/g, '');
        textContent = textContent.replace(/\{\{#if NOTES\}\}/g, '');
        textContent = textContent.replace(/\{\{\/if\}\}/g, '');
      } else {
        htmlContent = htmlContent.replace(/\{\{#if NOTES\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        textContent = textContent.replace(/\{\{#if NOTES\}\}[\s\S]*?\{\{\/if\}\}/g, '');
      }

      if (hasMeetLink) {
        htmlContent = htmlContent.replace(/\{\{#if MEET_LINK\}\}/g, '');
        htmlContent = htmlContent.replace(/\{\{\/if\}\}/g, '');
        textContent = textContent.replace(/\{\{#if MEET_LINK\}\}/g, '');
        textContent = textContent.replace(/\{\{\/if\}\}/g, '');
      } else {
        htmlContent = htmlContent.replace(/\{\{#if MEET_LINK\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        textContent = textContent.replace(/\{\{#if MEET_LINK\}\}[\s\S]*?\{\{\/if\}\}/g, '');
      }
      
      console.log('📝 DEBUG HTML: HTML final gerado');
      
      res.json({
        success: true,
        debug: {
          templateParams,
          hasNotes,
          hasMeetLink,
          subject,
          htmlContent,
          textContent
        }
      });
    } catch (error) {
      console.error('❌ Erro no debug HTML:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT 28: Enviar e-mail de novo agendamento para mentorado
  app.post('/api/calendar/new-appointment-email/mentee', async (req, res) => {
    try {
      const { 
        menteeId,
        mentorName, 
        menteeName, 
        menteeEmail,
        appointmentDate, 
        appointmentTime, 
        timezone,
        notes,
        meetLink 
      } = req.body;
      
      console.log('\n========== NOVO AGENDAMENTO - E-MAIL MENTORADO ==========');
      console.log('📥 Dados recebidos:', JSON.stringify({
        menteeId,
        mentorName,
        menteeName,
        menteeEmail,
        appointmentDate,
        appointmentTime,
        timezone,
        notes,
        meetLink
      }, null, 2));
      
      // Validação dos campos obrigatórios
      if (!mentorName || !menteeName || !menteeEmail || !appointmentDate || !appointmentTime) {
        console.error('❌ Campos obrigatórios faltando');
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios faltando'
        });
      }
      
      // Preparar dados para o e-mail do mentorado
      console.log('\n📧 Preparando envio de e-mail de confirmação para mentorado...');
      const emailData = {
        mentorName,
        menteeName,
        menteeEmail,
        appointmentDate,
        appointmentTime,
        timezone: timezone || 'America/Sao_Paulo (UTC-3)',
        notes: notes || undefined,
        meetLink: meetLink || undefined,
        agendamentosUrl: 'https://mentoraai.com.br/mentorado/agendamentos',
        supportUrl: 'https://app.mentoraai.com.br/suporte'
      };
      
      console.log('📤 Dados para o e-mail do mentorado:', JSON.stringify(emailData, null, 2));
      
      // Importar e chamar o serviço de e-mail para mentorado
      const { sendNewScheduleEmailToMentee } = await import('./services/email/services/mentorado/emailNewScheduleMentee');
      const result = await sendNewScheduleEmailToMentee(emailData);
      
      console.log('\n📨 Resultado do envio de e-mail para mentorado:', JSON.stringify(result, null, 2));
      console.log('=========================================================\n');
      
      res.json({
        success: result.success,
        message: result.success ? 'E-mail de confirmação enviado para mentorado com sucesso' : 'Erro ao enviar e-mail',
        messageId: result.messageId,
        details: result
      });
      
    } catch (error) {
      console.error('\n❌ ERRO CRÍTICO no envio de e-mail para mentorado:', error);
      console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
      console.log('=========================================================\n');
      
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT 29: Teste de e-mail de confirmação para mentorado (debug)
  app.post('/api/calendar/new-appointment-email/mentee/test', async (req, res) => {
    try {
      console.log('🧪 TESTE: Endpoint de teste de e-mail de confirmação para mentorado');
      
      const { testNewScheduleEmailToMentee } = await import('./services/email/services/mentorado/emailNewScheduleMentee');
      
      const testEmail = req.body.email || 'teste.mentorado@exemplo.com';
      console.log('📧 Enviando teste para:', testEmail);
      
      const result = await testNewScheduleEmailToMentee(testEmail);
      
      console.log('📥 Resultado do teste:', result);
      
      res.json({
        success: true,
        message: 'Teste de email de confirmação para mentorado executado',
        result
      });
    } catch (error) {
      console.error('❌ Erro no teste de email para mentorado:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT DEBUG: Verificar HTML final do email de cancelamento
  app.post('/api/calendar/cancel-email/debug-html', async (req, res) => {
    try {
      console.log('🔍 DEBUG HTML: Testando geração do HTML com mentorId específico');
      
      const { calendarCancelTemplate } = await import('./services/email/templates/mentor/calendarCancelTemplate');
      
      const mentorId = req.body.mentorId || 'e5d9eab0-b1fc-4221-a2fd-4cb211c53dd1';
      
      console.log('📋 DEBUG HTML: mentorId usado:', mentorId);
      
      // Preparar parâmetros do template
      const templateParams: Record<string, string> = {
        MENTOR_ID: mentorId,
        MENTOR_NAME: 'Dr. João Silva',
        MENTEE_NAME: 'Maria Santos',
        MENTEE_EMAIL: 'debug@test.com',
        APPOINTMENT_DATE: 'Quinta-feira, 09 de janeiro de 2025',
        APPOINTMENT_TIME: '15:00 - 16:00',
        TIMEZONE: 'America/Sao_Paulo',
        CANCELLATION_REASON: 'Imprevisto do mentor',
        PLATFORM_URL: 'https://app.mentoraai.com.br',
        SUPPORT_URL: 'https://app.mentoraai.com.br/suporte',
        CURRENT_YEAR: new Date().getFullYear().toString()
      };
      
      // Aplicar substituições
      let htmlContent = calendarCancelTemplate.htmlContent;
      Object.entries(templateParams).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      });
      
      // Buscar links específicos
      const linkMatches = htmlContent.match(/https:\/\/mentoraai\.com\.br\/mentor\/publicschedule\/[^"\s]+/g);
      
      console.log('🔗 DEBUG HTML: Links encontrados:', linkMatches);
      console.log('🎯 DEBUG HTML: Link esperado:', `https://mentoraai.com.br/mentor/publicschedule/${mentorId}`);
      
      // Extrair snippet do HTML com o link
      const linkStartIndex = htmlContent.indexOf('href="https://mentoraai.com.br/mentor/publicschedule/');
      const linkSnippet = linkStartIndex !== -1 ? 
        htmlContent.substring(linkStartIndex, linkStartIndex + 120) : 'Link não encontrado';
      
      res.json({
        success: true,
        mentorIdUsado: mentorId,
        linksEncontrados: linkMatches || [],
        linkEsperado: `https://mentoraai.com.br/mentor/publicschedule/${mentorId}`,
        linksCorretos: linkMatches ? linkMatches.every(link => link.includes(mentorId)) : false,
        htmlSnippet: linkSnippet,
        totalLinksEncontrados: linkMatches ? linkMatches.length : 0
      });
      
    } catch (error) {
      console.error('❗ DEBUG HTML: Erro:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  });

  // ENDPOINT BÁSICO: E-mail simples para mentorado (sem condicionais)
  app.post('/api/calendar/new-appointment-email/mentee/basic', async (req, res) => {
    try {
      console.log('\n🧪 [BASIC-EMAIL] Teste de email BÁSICO para mentorado');
      console.log('📥 [BASIC-EMAIL] Dados recebidos:', JSON.stringify(req.body, null, 2));
      
      const emailData = {
        mentorName: req.body.mentorName || 'João Silva',
        menteeName: req.body.menteeName || 'Maria Santos',
        menteeEmail: req.body.menteeEmail || 'guilherme.galdino391@gmail.com',
        appointmentDate: req.body.appointmentDate || '10 de janeiro de 2025',
        appointmentTime: req.body.appointmentTime || '14:00 - 15:00',
        timezone: req.body.timezone || 'UTC-3',
        notes: req.body.notes || 'Nenhuma observação',
        meetLink: req.body.meetLink || 'https://meet.jit.si/teste-basico',
        agendamentosUrl: 'https://mentoraai.com.br/mentorado/agendamentos',
        supportUrl: 'https://app.mentoraai.com.br/suporte'
      };
      
      console.log('📤 [BASIC-EMAIL] Enviando email básico...');
      
      // Importar e usar o serviço básico
      const { sendNewScheduleEmailToMenteeBasic } = await import('./services/email/services/mentorado/emailNewScheduleMenteeBasic');
      const result = await sendNewScheduleEmailToMenteeBasic(emailData);
      
      console.log('✅ [BASIC-EMAIL] Resultado:', JSON.stringify(result, null, 2));
      
      res.json({
        success: result.success,
        message: result.success ? 'Email BÁSICO enviado com sucesso' : 'Erro no email básico',
        messageId: result.messageId,
        type: 'BASIC_EMAIL',
        details: result
      });
      
    } catch (error) {
      console.error('❌ [BASIC-EMAIL] Erro crítico:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        type: 'BASIC_EMAIL_ERROR'
      });
    }
  });

  // ==================== EMAIL CONTACT MENTOR ROUTE ====================

  // Rota para enviar email de contato para o mentor
  app.post('/api/email/contact-mentor', async (req, res) => {
    try {
      console.log('📧 [API] Enviando email de contato para mentor...');
      console.log('📝 [API] Dados recebidos:', JSON.stringify(req.body, null, 2));
      
      const { mentorName, mentorEmail, senderName, senderEmail, messageContent } = req.body;
      
      // Validar campos obrigatórios
      if (!mentorName || !mentorEmail || !senderName || !senderEmail || !messageContent) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: mentorName, mentorEmail, senderName, senderEmail, messageContent'
        });
      }
      
      // Importar o serviço de email
      const { enviarEmailParaMentor } = await import('./services/email/services/mentor/emailSendToMentor');
      
      const emailData = {
        mentorName,
        mentorEmail,
        senderName,
        senderEmail,
        messageContent
      };
      
      console.log('📤 [API] Enviando email...');
      const result = await enviarEmailParaMentor(emailData);
      
      if (result.success) {
        console.log('✅ [API] Email enviado com sucesso');
        res.json({
          success: true,
          message: 'Email enviado com sucesso para o mentor',
          messageId: result.messageId
        });
      } else {
        console.error('❌ [API] Falha no envio do email:', result.error);
        res.status(500).json({
          success: false,
          error: result.error || 'Erro ao enviar email'
        });
      }
      
    } catch (error: any) {
      console.error('❌ [API] Erro crítico no envio de email:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  });

  // ==================== EMAIL COURSE SALE NOTIFICATION ROUTE ====================

  // 🔒 CACHE DE PROTEÇÃO CONTRA EMAILS DUPLICADOS NO BACKEND
  const processedEmails = new Map<string, { timestamp: number; messageId?: string }>();
  
  // Limpar cache a cada 1 hora para evitar acúmulo de memória
  setInterval(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const keysToDelete: string[] = [];
    
    processedEmails.forEach((value, key) => {
      if (value.timestamp < oneHourAgo) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => processedEmails.delete(key));
    console.log('🧹 [EMAIL-CACHE] Cache de emails limpo, entradas restantes:', processedEmails.size);
  }, 60 * 60 * 1000); // 1 hora

  // Rota para enviar email de notificação de venda de curso para o mentor
  app.post('/api/email/course-buy', async (req, res) => {
    const startTime = Date.now();
    
    try {
      console.log('💰 [API-EMAIL] Iniciando processo de envio de email de venda...');
      console.log('📝 [API-EMAIL] Dados recebidos:', JSON.stringify(req.body, null, 2));
      
      const { mentorName, mentorEmail, buyerName, courseName, coursePrice, transactionId } = req.body;
      
      // Validar campos obrigatórios
      if (!mentorName || !mentorEmail || !buyerName || !courseName || coursePrice === undefined || !transactionId) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: mentorName, mentorEmail, buyerName, courseName, coursePrice, transactionId'
        });
      }

      // 🔒 PROTEÇÃO BACKEND: Verificar se email já foi processado para esta transação
      const cacheKey = `${transactionId}_${mentorEmail}`;
      const existingProcess = processedEmails.get(cacheKey);
      
      if (existingProcess) {
        const timeDiff = Date.now() - existingProcess.timestamp;
        console.log('🛑 [API-EMAIL] Email já processado para esta transação:', {
          transactionId,
          mentorEmail,
          processedAt: new Date(existingProcess.timestamp).toISOString(),
          timeDiffMs: timeDiff,
          messageId: existingProcess.messageId
        });
        
        return res.json({
          success: true,
          message: 'Email já foi enviado para esta transação',
          messageId: existingProcess.messageId,
          cached: true,
          processedAt: new Date(existingProcess.timestamp).toISOString()
        });
      }

      // 🔒 MARCAR COMO PROCESSANDO IMEDIATAMENTE (evita race conditions)
      processedEmails.set(cacheKey, { 
        timestamp: Date.now(),
        messageId: undefined 
      });
      
      console.log('🔒 [API-EMAIL] Transação marcada como processando:', {
        cacheKey,
        timestamp: new Date().toISOString()
      });
      
      // Importar o serviço de email de venda de curso
      const { enviarEmailVendaCurso } = await import('./services/email/services/mentor/emailSendCourseBuy');
      
      const emailData = {
        mentorName,
        mentorEmail,
        buyerName,
        courseName,
        coursePrice: Number(coursePrice),
        transactionId
      };
      
      console.log('📤 [API-EMAIL] Enviando email ÚNICO para Brevo...');
      const result = await enviarEmailVendaCurso(emailData);
      
      if (result.success) {
        // 🔒 ATUALIZAR CACHE COM MESSAGE ID
        processedEmails.set(cacheKey, { 
          timestamp: Date.now(),
          messageId: result.messageId 
        });
        
        console.log('✅ [API-EMAIL] Email enviado com sucesso!', {
          messageId: result.messageId,
          duration: Date.now() - startTime,
          transactionId,
          mentorEmail
        });
        
        res.json({
          success: true,
          message: 'Email de venda enviado com sucesso para o mentor',
          messageId: result.messageId,
          duration: Date.now() - startTime
        });
      } else {
        // 🔒 REMOVER DO CACHE SE FALHOU (permitir retry)
        processedEmails.delete(cacheKey);
        
        console.error('❌ [API-EMAIL] Falha no envio do email:', result.error);
        res.status(500).json({
          success: false,
          error: result.error || 'Erro ao enviar email de venda'
        });
      }
      
    } catch (error: any) {
      // 🔒 REMOVER DO CACHE SE ERRO CRÍTICO (permitir retry)
      const { transactionId, mentorEmail } = req.body;
      if (transactionId && mentorEmail) {
        const cacheKey = `${transactionId}_${mentorEmail}`;
        processedEmails.delete(cacheKey);
      }
      
      console.error('❌ [API-EMAIL] Erro crítico no envio de email:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  });

  // ==================== JITSI MEET ROUTES ====================

  // Importar Jitsi Meet Service
  const JitsiMeetService = (await import('./services/JitsiMeetService')).default;
  const meetService = new JitsiMeetService();

  // Rota para testar conexão com Jitsi Meet
  app.get('/api/jitsi-meet/test-connection', async (req, res) => {
    try {
      console.log('🧪 [API] Testando geração de link Jitsi...');
      const resultado = await meetService.testarConexao();
      
      res.json({
        success: true,
        message: 'Teste de conexão concluído',
        data: resultado
      });
      
    } catch (error: any) {
      console.error('❌ [API] Erro no teste de conexão:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Rota para criar agendamento com Jitsi Meet
  app.post('/api/jitsi-meet/create-appointment', async (req, res) => {
    try {
      console.log('📅 [API] Criando agendamento com Jitsi Meet...');
      console.log('📝 [API] Body recebido:', JSON.stringify(req.body, null, 2));
      
      const resultado = await meetService.criarAgendamentoComMeet(req.body);
      
      res.json({
        success: true,
        message: 'Agendamento criado com sucesso',
        data: resultado
      });
      
    } catch (error: any) {
      console.error('❌ [API] Erro ao criar agendamento:', error.message);
      res.status(500).json({
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Rota para gerar link rápido Jitsi
  app.post('/api/jitsi-meet/quick-link', async (req, res) => {
    try {
      console.log('⚡ [API] Gerando link rápido Jitsi...');
      const { nomeReuniao } = req.body;
      
      const link = meetService.criarLinkMeet(nomeReuniao);
      
      res.json({
        success: true,
        message: 'Link gerado com sucesso',
        data: {
          link: link,
          provider: 'Jitsi Meet',
          criadoEm: new Date().toISOString()
        }
      });
      
    } catch (error: any) {
      console.error('❌ [API] Erro ao gerar link:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Rota para gerar múltiplos links
  app.post('/api/jitsi-meet/multiple-links', async (req, res) => {
    try {
      console.log('🎯 [API] Gerando múltiplos links Jitsi...');
      const { quantidade = 3 } = req.body;
      
      const result = await meetService.criarMultiplosLinks(quantidade);
      
      res.json({
        success: true,
        message: `${quantidade} links gerados com sucesso`,
        data: {
          links: result.links,
          quantidade: result.quantidade,
          provider: 'Jitsi Meet',
          criadoEm: new Date().toISOString()
        }
      });
      
    } catch (error: any) {
      console.error('❌ [API] Erro ao gerar links:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ##########################################################################################
  // ###################### ENDPOINT DE TROCA DE SENHA ####################################
  // ##########################################################################################
  
  // ENDPOINT: Trocar senha do usuário
  app.post('/api/user/change-password', async (req, res) => {
    try {
      const { userId, newPassword } = req.body;
      
      console.log('🔐 [API] Requisição de troca de senha recebida para usuário:', userId);
      
      // Validação básica
      if (!userId || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'userId e newPassword são obrigatórios'
        });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'A senha deve ter pelo menos 6 caracteres'
        });
      }
      
      // Importar Supabase dinamicamente
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ [API] Variáveis de ambiente do Supabase não configuradas');
        console.error('❌ [API] VITE_SUPABASE_URL:', supabaseUrl ? 'OK' : 'MISSING');
        console.error('❌ [API] SUPABASE_SERVICE_ROLE:', supabaseServiceKey ? 'OK' : 'MISSING');
        return res.status(500).json({
          success: false,
          error: 'Configuração do servidor incompleta'
        });
      }
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Atualizar senha no Supabase Auth
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );
      
      if (authError) {
        console.error('❌ [API] Erro ao atualizar senha no Supabase Auth:', authError);
        return res.status(500).json({
          success: false,
          error: 'Erro ao atualizar senha'
        });
      }
      
      // Atualizar campo lead para false se for true
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('lead')
        .eq('id', userId)
        .single();
      
      if (!profileError && profile?.lead === true) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ lead: false })
          .eq('id', userId);
        
        if (updateError) {
          console.error('❌ [API] Erro ao atualizar campo lead:', updateError);
          // Não retornar erro aqui, pois a senha já foi alterada com sucesso
        } else {
          console.log('✅ [API] Campo lead atualizado para false');
        }
      }
      
      console.log('✅ [API] Senha alterada com sucesso para usuário:', userId);
      
      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
      
    } catch (error) {
      console.error('❌ [API] Erro crítico na troca de senha:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // ##########################################################################################
  // ###################### PROXY PARA N8N WEBHOOK (CORS) ####################################
  // ##########################################################################################
  
  // ENDPOINT PROXY: Contornar problema de CORS com webhook N8N
  app.post('/api/n8n-webhook-proxy', async (req, res) => {
    try {
      console.log('🚀 PROXY N8N: Requisição recebida');
      console.log('📦 PROXY N8N: Dados:', JSON.stringify(req.body, null, 2));
      
      // URL do webhook N8N
      const webhookUrl = 'https://remotely-welcome-stallion.ngrok-free.app/webhook/5120bb5f-b740-4681-983f-48a3693f89d9';
      
      console.log('🎯 PROXY N8N: URL do webhook sendo chamada:', webhookUrl);
      
      // Fazer requisição para o webhook N8N
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'MentorX-Connect-Hub-Proxy/1.0'
        },
        body: JSON.stringify(req.body)
      });
      
      console.log('📡 PROXY N8N: Status da resposta:', response.status);
      
      // Ler resposta do webhook
      const webhookResponse = await response.text();
      console.log('📥 PROXY N8N: Resposta do webhook:', webhookResponse);
      
      // Retornar resposta do webhook para o frontend
      res.status(response.status).json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: webhookResponse
      });
      
    } catch (error) {
      console.error('❌ PROXY N8N: Erro:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
