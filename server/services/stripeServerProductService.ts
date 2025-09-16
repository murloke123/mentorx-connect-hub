import Stripe from 'stripe';
import { config } from '../environment';

// ##########################################################################################
// ############ STRIPE SERVER PRODUCT SERVICE - OPERAÇÕES DE PRODUTOS ####################
// ##########################################################################################
// 
// 🎯 RESPONSABILIDADE: Apenas operações relacionadas a produtos e preços Stripe
// 📋 INCLUI: Criação, listagem, atualização e exclusão de produtos e preços
// ❌ NÃO INCLUI: Operações de conta (ver stripeServerClientService.ts) ou documentos
//
// 📚 EDUCATIVO PARA DEV JUNIOR:
// - Este serviço executa APENAS no backend/servidor
// - Usa a CHAVE SECRETA do Stripe (nunca exposta ao frontend)
// - Lida com produtos/preços que serão usados em checkouts
// - Produtos são obrigatórios para pagamentos na Stripe
//
// ##########################################################################################

// Inicializar cliente Stripe com chave secreta do servidor
const stripe = new Stripe(config.STRIPE_SECRET_KEY!, {
  typescript: true,
});

// ##########################################################################################
// ###################### INTERFACES E TIPOS #############################################
// ##########################################################################################

export interface ProductCreateData {
  name: string;
  description?: string;
  images?: string[];
  metadata?: Record<string, string>;
}

export interface ProductUpdateData {
  name?: string;
  description?: string | null;
  images?: string[];
  metadata?: Record<string, string>;
  active?: boolean;
}

export interface PriceCreateData {
  product_id: string;
  unit_amount: number; // em centavos
  currency?: string;
  recurring?: {
    interval: 'month' | 'year' | 'week' | 'day';
    interval_count?: number;
  };
  metadata?: Record<string, string>;
}

export interface ProductResult {
  success: boolean;
  product?: Stripe.Product;
  error?: string;
}

export interface ProductListResult {
  success: boolean;
  products?: Stripe.Product[];
  error?: string;
}

export interface PriceResult {
  success: boolean;
  price?: Stripe.Price;
  error?: string;
}

export interface PriceListResult {
  success: boolean;
  prices?: Stripe.Price[];
  error?: string;
}

// ##########################################################################################
// ################ SISTEMA DE LOGS PARA NETWORK DO CHROME ###############################
// ##########################################################################################

/**
 * 📊 SISTEMA DE LOGS PARA NETWORK (Chrome DevTools)
 * 
 * 🎯 OBJETIVO: Registrar todas as operações de produtos no Network do navegador
 * 
 * 📚 EDUCATIVO: Logs aparecem na aba Network do DevTools para debug
 * 
 * 🔍 COMO VER OS LOGS:
 * 1. Abra Chrome DevTools (F12)
 * 2. Vá na aba "Network" 
 * 3. Procure por requisições "/api/stripe-network-logs"
 * 4. Clique para ver os dados enviados
 */
async function logToNetworkChrome(type: string, action: string, data: any): Promise<void> {
  try {
    await fetch('/api/stripe-network-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        action,
        data,
        timestamp: new Date().toISOString(),
        service: 'stripeServerProductService',
        location: 'backend'
      })
    });
  } catch (error) {
    // Falha silenciosa - logs não devem quebrar o fluxo
  }
}

// ##########################################################################################
// ###################### MÉTODOS DE PRODUTOS ###########################################
// ##########################################################################################

/**
 * Criar produto no Stripe
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Produtos são necessários antes de criar preços
 * - accountId: ID da conta conectada onde criar o produto (obrigatório)
 * - name: Nome do produto (obrigatório)
 * - description: Descrição detalhada (opcional)
 * - images: Array de URLs de imagens (opcional)
 * - metadata: Dados customizados (ex: course_id, mentor_id)
 */
export async function createStripeProduct(accountId: string, productData: ProductCreateData): Promise<ProductResult> {
  try {
    console.log('🆕 [SERVER-STRIPE] Criando produto na conta conectada:', accountId);
    console.log('📦 [SERVER-STRIPE] Nome do produto:', productData.name);
    console.log('📦 [SERVER-STRIPE] Dados completos:', JSON.stringify(productData, null, 2));
    
    // 🎯 CORREÇÃO CRÍTICA: Criar produto na conta conectada específica
    const product = await stripe.products.create({
      name: productData.name,
      description: productData.description,
      images: productData.images,
      metadata: productData.metadata
    }, {
      stripeAccount: accountId  // 🔥 ESSENCIAL: Especificar conta conectada
    });
    
    console.log('✅ [SERVER-STRIPE] Produto criado na conta conectada:', product.id);
    console.log('✅ [SERVER-STRIPE] Detalhes do produto:', {
      id: product.id,
      name: product.name,
      active: product.active,
      metadata: product.metadata
    });
    
    return { success: true, product };
    
  } catch (error) {
    console.error('❌ [SERVER-STRIPE] Erro ao criar produto:', error);
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao criar produto'
    };
    return errorResult;
  }
}

/**
 * Listar produtos do Stripe
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Lista todos os produtos da conta conectada específica
 * - accountId: ID da conta conectada (obrigatório)
 * - active: true/false para filtrar produtos ativos
 * - limit: Limitar quantidade de resultados
 */
export async function listStripeProducts(accountId: string, options: { active?: boolean; limit?: number } = {}): Promise<ProductListResult> {
  await logToNetworkChrome('STRIPE_PRODUCT', 'LIST_INICIADO', { accountId, options });
  
  try {
    console.log('📋 [SERVER-STRIPE] Listando produtos da conta conectada:', accountId);
    
    const products = await stripe.products.list({
      active: options.active,
      limit: options.limit || 100
    }, {
      stripeAccount: accountId  // 🔥 ESSENCIAL: Especificar conta conectada
    });
    
    console.log(`✅ [SERVER-STRIPE] ${products.data.length} produtos encontrados na conta conectada`);
    
    const result = { success: true, products: products.data };
    await logToNetworkChrome('STRIPE_PRODUCT', 'LIST_SUCESSO', {
      account_id: accountId,
      count: products.data.length,
      products: products.data.map(p => ({ id: p.id, name: p.name, active: p.active }))
    });
    
    return result;
    
  } catch (error) {
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao listar produtos'
    };
    await logToNetworkChrome('STRIPE_PRODUCT', 'LIST_ERRO', { 
      accountId, 
      error: errorResult.error 
    });
    return errorResult;
  }
}

/**
 * Obter produto específico do Stripe
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Busca produto por ID na conta conectada específica
 * - accountId: ID da conta conectada (obrigatório)
 * - Retorna todos os detalhes do produto
 */
export async function getStripeProduct(accountId: string, productId: string): Promise<ProductResult> {
  await logToNetworkChrome('STRIPE_PRODUCT', 'GET_INICIADO', { accountId, productId });
  
  try {
    console.log('🔍 [SERVER-STRIPE] Buscando produto na conta conectada:', accountId);
    console.log('📦 [SERVER-STRIPE] Product ID:', productId);
    
    const product = await stripe.products.retrieve(productId, {
      stripeAccount: accountId  // 🔥 ESSENCIAL: Especificar conta conectada
    });
    
    console.log('✅ [SERVER-STRIPE] Produto encontrado:', product.name);
    
    const result = { success: true, product };
    await logToNetworkChrome('STRIPE_PRODUCT', 'GET_SUCESSO', {
      account_id: accountId,
      product_id: product.id,
      name: product.name,
      active: product.active
    });
    
    return result;
    
  } catch (error) {
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar produto'
    };
    await logToNetworkChrome('STRIPE_PRODUCT', 'GET_ERRO', { 
      accountId,
      productId, 
      error: errorResult.error 
    });
    return errorResult;
  }
}

/**
 * Atualizar produto no Stripe
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Atualiza apenas os campos enviados na conta conectada específica
 * - accountId: ID da conta conectada (obrigatório)
 * - active: false para "deletar" produto (soft delete)
 * - Produtos com preços ativos não podem ser deletados
 */
export async function updateStripeProduct(accountId: string, productId: string, productData: ProductUpdateData): Promise<ProductResult> {
  await logToNetworkChrome('STRIPE_PRODUCT', 'UPDATE_INICIADO', { accountId, productId, productData });
  
  try {
    console.log('🔄 [SERVER-STRIPE] Atualizando produto na conta conectada:', accountId);
    console.log('📦 [SERVER-STRIPE] Product ID:', productId);
    
    const product = await stripe.products.update(productId, productData, {
      stripeAccount: accountId  // 🔥 ESSENCIAL: Especificar conta conectada
    });
    
    console.log('✅ [SERVER-STRIPE] Produto atualizado:', product.name);
    
    const result = { success: true, product };
    await logToNetworkChrome('STRIPE_PRODUCT', 'UPDATE_SUCESSO', {
      account_id: accountId,
      product_id: product.id,
      name: product.name,
      active: product.active,
      updated_fields: Object.keys(productData)
    });
    
    return result;
    
  } catch (error) {
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao atualizar produto'
    };
    await logToNetworkChrome('STRIPE_PRODUCT', 'UPDATE_ERRO', { 
      accountId,
      productId, 
      error: errorResult.error 
    });
    return errorResult;
  }
}

/**
 * Deletar produto no Stripe (soft delete)
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Stripe não permite deletar produtos permanentemente
 * - Define active: false (soft delete) na conta conectada específica
 * - accountId: ID da conta conectada (obrigatório)
 * - Produto fica oculto mas preserva histórico
 */
export async function deleteStripeProduct(accountId: string, productId: string): Promise<ProductResult> {
  await logToNetworkChrome('STRIPE_PRODUCT', 'DELETE_INICIADO', { accountId, productId });
  
  try {
    console.log('🗑️ [SERVER-STRIPE] Deletando produto (soft delete) na conta conectada:', accountId);
    console.log('📦 [SERVER-STRIPE] Product ID:', productId);
    
    const product = await stripe.products.update(productId, { active: false }, {
      stripeAccount: accountId  // 🔥 ESSENCIAL: Especificar conta conectada
    });
    
    console.log('✅ [SERVER-STRIPE] Produto desativado:', product.name);
    
    const result = { success: true, product };
    await logToNetworkChrome('STRIPE_PRODUCT', 'DELETE_SUCESSO', {
      account_id: accountId,
      product_id: product.id,
      name: product.name,
      active: product.active
    });
    
    return result;
    
  } catch (error) {
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao deletar produto'
    };
    await logToNetworkChrome('STRIPE_PRODUCT', 'DELETE_ERRO', { 
      accountId,
      productId, 
      error: errorResult.error 
    });
    return errorResult;
  }
}

// ##########################################################################################
// ###################### MÉTODOS DE PREÇOS #############################################
// ##########################################################################################

/**
 * Criar preço para produto no Stripe
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Preços são vinculados a produtos na conta conectada específica
 * - accountId: ID da conta conectada (obrigatório)
 * - unit_amount: Valor em centavos (R$ 100,00 = 10000)
 * - currency: Moeda (padrão: 'brl')
 * - recurring: Para assinaturas (opcional)
 */
export async function createStripePrice(accountId: string, priceData: PriceCreateData): Promise<PriceResult> {
  await logToNetworkChrome('STRIPE_PRICE', 'CREATE_INICIADO', { accountId, priceData });
  
  try {
    console.log('💰 [SERVER-STRIPE] Criando preço na conta conectada:', accountId);
    console.log(`📦 [SERVER-STRIPE] Produto: ${priceData.product_id}, Valor: R$ ${(priceData.unit_amount / 100).toFixed(2)}`);
    
    const price = await stripe.prices.create({
      product: priceData.product_id,
      unit_amount: priceData.unit_amount,
      currency: priceData.currency || 'brl',
      recurring: priceData.recurring,
      metadata: priceData.metadata
    }, {
      stripeAccount: accountId  // 🔥 ESSENCIAL: Especificar conta conectada
    });
    
    console.log('✅ [SERVER-STRIPE] Preço criado:', price.id);
    
    const result = { success: true, price };
    await logToNetworkChrome('STRIPE_PRICE', 'CREATE_SUCESSO', {
      account_id: accountId,
      price_id: price.id,
      product_id: price.product,
      unit_amount: price.unit_amount,
      currency: price.currency,
      is_recurring: !!price.recurring
    });
    
    return result;
    
  } catch (error) {
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao criar preço'
    };
    await logToNetworkChrome('STRIPE_PRICE', 'CREATE_ERRO', { 
      accountId,
      product_id: priceData.product_id,
      error: errorResult.error 
    });
    return errorResult;
  }
}

/**
 * Listar preços de um produto no Stripe
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Lista todos os preços de um produto específico na conta conectada
 * - accountId: ID da conta conectada (obrigatório)
 * - active: true/false para filtrar preços ativos
 * - Produtos podem ter múltiplos preços (ex: mensal/anual)
 */
export async function listStripePrices(accountId: string, productId: string, options: { active?: boolean } = {}): Promise<PriceListResult> {
  await logToNetworkChrome('STRIPE_PRICE', 'LIST_INICIADO', { accountId, productId, options });
  
  try {
    console.log('💰 [SERVER-STRIPE] Listando preços na conta conectada:', accountId);
    console.log('📦 [SERVER-STRIPE] Product ID:', productId);
    
    const prices = await stripe.prices.list({
      product: productId,
      active: options.active
    }, {
      stripeAccount: accountId  // 🔥 ESSENCIAL: Especificar conta conectada
    });
    
    console.log(`✅ [SERVER-STRIPE] ${prices.data.length} preços encontrados`);
    
    const result = { success: true, prices: prices.data };
    await logToNetworkChrome('STRIPE_PRICE', 'LIST_SUCESSO', {
      account_id: accountId,
      product_id: productId,
      count: prices.data.length,
      prices: prices.data.map(p => ({
        id: p.id,
        unit_amount: p.unit_amount,
        currency: p.currency,
        active: p.active
      }))
    });
    
    return result;
    
  } catch (error) {
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao listar preços'
    };
    await logToNetworkChrome('STRIPE_PRICE', 'LIST_ERRO', { 
      accountId,
      productId, 
      error: errorResult.error 
    });
    return errorResult;
  }
}

/**
 * Obter preço específico do Stripe
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Busca preço por ID na conta conectada específica
 * - accountId: ID da conta conectada (obrigatório)
 * - Retorna todos os detalhes do preço
 */
export async function getStripePrice(accountId: string, priceId: string): Promise<PriceResult> {
  await logToNetworkChrome('STRIPE_PRICE', 'GET_INICIADO', { accountId, priceId });
  
  try {
    console.log('🔍 [SERVER-STRIPE] Buscando preço na conta conectada:', accountId);
    console.log('📦 [SERVER-STRIPE] Price ID:', priceId);
    
    const price = await stripe.prices.retrieve(priceId, {
      stripeAccount: accountId  // 🔥 ESSENCIAL: Especificar conta conectada
    });
    
    console.log(`✅ [SERVER-STRIPE] Preço encontrado: R$ ${price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'N/A'}`);
    
    const result = { success: true, price };
    await logToNetworkChrome('STRIPE_PRICE', 'GET_SUCESSO', {
      account_id: accountId,
      price_id: price.id,
      product_id: price.product,
      unit_amount: price.unit_amount,
      currency: price.currency,
      active: price.active
    });
    
    return result;
    
  } catch (error) {
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar preço'
    };
    await logToNetworkChrome('STRIPE_PRICE', 'GET_ERRO', { 
      accountId,
      priceId, 
      error: errorResult.error 
    });
    return errorResult;
  }
}

/**
 * Desativar preço no Stripe
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Stripe não permite deletar preços permanentemente
 * - Define active: false (soft delete) na conta conectada específica
 * - accountId: ID da conta conectada (obrigatório)
 * - Preço fica oculto mas preserva histórico de vendas
 */
export async function deactivateStripePrice(accountId: string, priceId: string): Promise<PriceResult> {
  await logToNetworkChrome('STRIPE_PRICE', 'DEACTIVATE_INICIADO', { accountId, priceId });
  
  try {
    console.log('🔒 [SERVER-STRIPE] Desativando preço na conta conectada:', accountId);
    console.log('📦 [SERVER-STRIPE] Price ID:', priceId);
    
    const price = await stripe.prices.update(priceId, { active: false }, {
      stripeAccount: accountId  // 🔥 ESSENCIAL: Especificar conta conectada
    });
    
    console.log('✅ [SERVER-STRIPE] Preço desativado');
    
    const result = { success: true, price };
    await logToNetworkChrome('STRIPE_PRICE', 'DEACTIVATE_SUCESSO', {
      account_id: accountId,
      price_id: price.id,
      product_id: price.product,
      active: price.active
    });
    
    return result;
    
  } catch (error) {
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao desativar preço'
    };
    await logToNetworkChrome('STRIPE_PRICE', 'DEACTIVATE_ERRO', { 
      accountId,
      priceId, 
      error: errorResult.error 
    });
    return errorResult;
  }
}

export { stripe };
