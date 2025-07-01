// ##########################################################################################
// ################## STRIPE PRODUCT SERVICE - OPERAÇÕES DE PRODUTOS ####################
// ##########################################################################################

/**
 * 🎯 OBJETIVO: Serviço frontend para operações de produtos e preços Stripe
 * 
 * ❓ POR QUE EXISTE: 
 * - Gerenciar criação e atualização de produtos para cursos
 * - Criar preços para produtos (one-time e recurring)
 * - Nunca chamamos a API da Stripe diretamente do frontend (inseguro)
 * - Este arquivo faz chamadas HTTP para nosso próprio backend
 * 
 * 📚 PARA DEVS JUNIOR:
 * - Frontend (aqui) → Backend (nosso servidor) → Stripe API
 * - FOCO: Apenas operações relacionadas a PRODUTOS E PREÇOS
 * - Para operações de conta, use: stripeClientService.ts
 * - Para documentos, use: stripeDocumentService.ts
 * - Todos os dados sensíveis ficam no backend
 * - Aqui só fazemos fetch() para nossos próprios endpoints
 */

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
  product?: {
    id: string;
    name: string;
    description?: string;
    images: string[];
    active: boolean;
    created: number;
    metadata: Record<string, string>;
  };
  error?: string;
}

export interface ProductListResult {
  success: boolean;
  products?: Array<{
    id: string;
    name: string;
    description?: string;
    images: string[];
    active: boolean;
    created: number;
    metadata: Record<string, string>;
  }>;
  error?: string;
}

export interface PriceResult {
  success: boolean;
  price?: {
    id: string;
    product: string;
    unit_amount: number | null;
    currency: string;
    active: boolean;
    created: number;
    recurring?: {
      interval: string;
      interval_count: number;
    } | null;
    metadata: Record<string, string>;
  };
  error?: string;
}

export interface PriceListResult {
  success: boolean;
  prices?: Array<{
    id: string;
    product: string;
    unit_amount: number | null;
    currency: string;
    active: boolean;
    created: number;
    recurring?: {
      interval: string;
      interval_count: number;
    } | null;
    metadata: Record<string, string>;
  }>;
  error?: string;
}

// ##########################################################################################
// ###################### TIPOS ESPECÍFICOS PARA CURSOS ##################################
// ##########################################################################################

export interface CourseStripeData {
  stripeProductId: string;
  stripePriceId: string;
}

export interface CourseInputData {
  courseId: string;
  mentorId: string;
  name: string;
  description?: string;
  images?: string[];
  category?: string;
  price: number; // em reais (será convertido para centavos)
}

export interface ProductWithPriceData {
  success: boolean;
  product?: {
    id: string;
    name: string;
    description?: string;
    images: string[];
    active: boolean;
    created: number;
    metadata: Record<string, string>;
  };
  price?: {
    id: string;
    product: string;
    unit_amount: number | null;
    currency: string;
    active: boolean;
    created: number;
    recurring?: {
      interval: string;
      interval_count: number;
    } | null;
    metadata: Record<string, string>;
  };
  error?: string;
}

export interface PriceForProductData {
  unitAmount: number; // em centavos
  currency?: string;
  recurring?: {
    interval: 'month' | 'year' | 'week' | 'day';
    interval_count?: number;
  };
  metadata?: Record<string, string>;
}

// ##########################################################################################
// ###################### SISTEMA DE LOGS PARA DEBUG #####################################
// ##########################################################################################

/**
 * 📊 SISTEMA DE LOGS PARA NETWORK (Chrome DevTools)
 * 
 * 🎯 OBJETIVO: Registrar todas as operações de produtos no Network do navegador
 * 
 * 📚 PARA DEVS JUNIOR:
 * - Cada operação de produto gera um log visível no Network do Chrome
 * - Facilita debug: você vê exatamente o que foi enviado/recebido
 * - Não polui o console, mas fica registrado no Network
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        action,
        data,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    // Silencioso: se o log falhar, não queremos quebrar a operação principal
  }
}

// ##########################################################################################
// ###################### OPERAÇÕES DE PRODUTOS STRIPE ####################################
// ##########################################################################################

/**
 * 🆕 CRIAR PRODUTO STRIPE
 * 
 * 🎯 OBJETIVO: Criar um novo produto no Stripe para um curso
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Recebe dados do produto (nome, descrição, imagens, metadata)
 * 2. Envia tudo para nosso backend via POST /api/stripe/products
 * 3. O backend valida e chama a Stripe API
 * 4. Retorna sucesso/erro para o frontend
 * 
 * 🔄 FLUXO:
 * Frontend → POST /api/stripe/products → Backend → Stripe API → Resposta
 * 
 * 📊 LOGS GERADOS:
 * - STRIPE_CREATE_PRODUCT + PAYLOAD_ENVIADO (dados enviados)
 * - STRIPE_CREATE_PRODUCT + RESPONSE_RECEBIDO (resposta recebida)
 * - STRIPE_CREATE_PRODUCT + ERRO_CLIENTE (se der erro)
 */
export async function createStripeProduct(accountId: string, productData: ProductCreateData): Promise<ProductResult> {
  try {
    // 📊 Log: Registra no Network quais dados estamos enviando
    await logToNetworkChrome('STRIPE_CREATE_PRODUCT', 'PAYLOAD_ENVIADO', { accountId, productData });

    // 🌐 Chamada HTTP para nosso backend (não diretamente para Stripe!)
    const response = await fetch('/api/stripe/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId, ...productData })
    });

    const result = await response.json();

    // 📊 Log: Registra no Network a resposta que recebemos
    await logToNetworkChrome('STRIPE_CREATE_PRODUCT', 'RESPONSE_RECEBIDO', {
      status: response.status,
      ok: response.ok,
      result: result
    });

    // ❌ Se o backend retornou erro HTTP
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Erro HTTP ${response.status}`
      };
    }

    // ✅ Sucesso: produto criado
    return result;

  } catch (error) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('STRIPE_CREATE_PRODUCT', 'ERRO_CLIENTE', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de conexão'
    };
  }
}

/**
 * 📋 LISTAR PRODUTOS STRIPE
 * 
 * 🎯 OBJETIVO: Consultar todos os produtos criados no Stripe
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Chama GET /api/stripe/products
 * 2. O backend consulta a Stripe API
 * 3. Retorna lista de produtos com detalhes
 * 
 * 🔄 FLUXO:
 * Frontend → GET /api/stripe/products → Backend → Stripe API → Lista
 * 
 * 📊 LOGS GERADOS:
 * - STRIPE_LIST_PRODUCTS + SOLICITACAO_ENVIADA (pedido enviado)
 * - STRIPE_LIST_PRODUCTS + RESPONSE_RECEBIDO (produtos recebidos)
 * - STRIPE_LIST_PRODUCTS + ERRO_CLIENTE (se der erro)
 */
export async function listStripeProducts(accountId: string, options: { active?: boolean; limit?: number } = {}): Promise<ProductListResult> {
  try {
    // 📊 Log: Registra no Network que estamos listando produtos
    await logToNetworkChrome('STRIPE_LIST_PRODUCTS', 'SOLICITACAO_ENVIADA', { accountId, options });

    // Construir query string para filtros
    const queryParams = new URLSearchParams();
    if (options.active !== undefined) queryParams.append('active', options.active.toString());
    if (options.limit !== undefined) queryParams.append('limit', options.limit.toString());

    // 🌐 Chamada HTTP para consultar produtos no backend
    const response = await fetch(`/api/stripe/products/${accountId}?${queryParams.toString()}`);
    const result = await response.json();

    // 📊 Log: Registra no Network a resposta dos produtos
    await logToNetworkChrome('STRIPE_LIST_PRODUCTS', 'RESPONSE_RECEBIDO', {
      status: response.status,
      count: result.products?.length || 0,
      result: result
    });

    // ❌ Se o backend retornou erro HTTP
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Erro HTTP ${response.status}`
      };
    }

    // ✅ Sucesso: produtos listados
    return result;

  } catch (error) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('STRIPE_LIST_PRODUCTS', 'ERRO_CLIENTE', {
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de conexão'
    };
  }
}

/**
 * 🔍 OBTER PRODUTO STRIPE
 * 
 * 🎯 OBJETIVO: Consultar detalhes de um produto específico
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Recebe o ID do produto
 * 2. Chama GET /api/stripe/products/{id}
 * 3. O backend consulta o produto na Stripe API
 * 4. Retorna informações detalhadas
 * 
 * 🔄 FLUXO:
 * Frontend → GET /api/stripe/products/{id} → Backend → Stripe API → Produto
 */
export async function getStripeProduct(accountId: string, productId: string): Promise<ProductResult> {
  try {
    // 📊 Log: Registra no Network que estamos buscando produto
    await logToNetworkChrome('STRIPE_GET_PRODUCT', 'SOLICITACAO_ENVIADA', { accountId, productId });

    // 🌐 Chamada HTTP para buscar produto no backend
    const response = await fetch(`/api/stripe/products/${accountId}/${productId}`);
    const result = await response.json();

    // 📊 Log: Registra no Network a resposta do produto
    await logToNetworkChrome('STRIPE_GET_PRODUCT', 'RESPONSE_RECEBIDO', {
      status: response.status,
      result: result
    });

    // ❌ Se o backend retornou erro HTTP
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Erro HTTP ${response.status}`
      };
    }

    // ✅ Sucesso: produto encontrado
    return result;

  } catch (error) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('STRIPE_GET_PRODUCT', 'ERRO_CLIENTE', {
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de conexão'
    };
  }
}

/**
 * 🔄 ATUALIZAR PRODUTO STRIPE
 * 
 * 🎯 OBJETIVO: Atualizar informações de um produto existente
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Recebe ID do produto e dados para atualizar
 * 2. Envia para backend via PUT /api/stripe/products/{id}
 * 3. O backend atualiza o produto na Stripe API
 * 4. Retorna produto atualizado
 */
export async function updateStripeProduct(accountId: string, productId: string, productData: ProductUpdateData): Promise<ProductResult> {
  try {
    // 📊 Log: Registra no Network quais dados estamos atualizando
    await logToNetworkChrome('STRIPE_UPDATE_PRODUCT', 'PAYLOAD_ENVIADO', { accountId, productId, productData });

    // 🌐 Chamada HTTP para atualizar produto no backend
    const response = await fetch(`/api/stripe/products/${accountId}/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData)
    });

    const result = await response.json();

    // 📊 Log: Registra no Network a resposta da atualização
    await logToNetworkChrome('STRIPE_UPDATE_PRODUCT', 'RESPONSE_RECEBIDO', {
      status: response.status,
      ok: response.ok,
      result: result
    });

    // ❌ Se o backend retornou erro HTTP
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Erro HTTP ${response.status}`
      };
    }

    // ✅ Sucesso: produto atualizado
    return result;

  } catch (error) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('STRIPE_UPDATE_PRODUCT', 'ERRO_CLIENTE', {
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de conexão'
    };
  }
}

/**
 * 🗑️ DELETAR PRODUTO STRIPE
 * 
 * 🎯 OBJETIVO: Desativar produto no Stripe (soft delete)
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Recebe ID do produto
 * 2. Chama DELETE /api/stripe/products/{id}
 * 3. O backend desativa o produto (active: false)
 * 4. Produto fica oculto mas preserva histórico
 */
export async function deleteStripeProduct(accountId: string, productId: string): Promise<ProductResult> {
  try {
    // 📊 Log: Registra no Network que estamos deletando produto
    await logToNetworkChrome('STRIPE_DELETE_PRODUCT', 'SOLICITACAO_ENVIADA', { accountId, productId });

    // 🌐 Chamada HTTP para deletar produto no backend
    const response = await fetch(`/api/stripe/products/${accountId}/${productId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    // 📊 Log: Registra no Network a resposta da deleção
    await logToNetworkChrome('STRIPE_DELETE_PRODUCT', 'RESPONSE_RECEBIDO', {
      status: response.status,
      ok: response.ok,
      result: result
    });

    // ❌ Se o backend retornou erro HTTP
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Erro HTTP ${response.status}`
      };
    }

    // ✅ Sucesso: produto deletado
    return result;

  } catch (error) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('STRIPE_DELETE_PRODUCT', 'ERRO_CLIENTE', {
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de conexão'
    };
  }
}

// ##########################################################################################
// ###################### OPERAÇÕES DE PREÇOS STRIPE ####################################
// ##########################################################################################

/**
 * 💰 CRIAR PREÇO STRIPE
 * 
 * 🎯 OBJETIVO: Criar um preço para um produto (one-time ou recurring)
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Recebe dados do preço (produto, valor, moeda, recorrência)
 * 2. Envia para backend via POST /api/stripe/prices
 * 3. O backend cria o preço na Stripe API
 * 4. Retorna preço criado para uso em checkouts
 */
export async function createStripePrice(accountId: string, priceData: PriceCreateData): Promise<PriceResult> {
  try {
    // 📊 Log: Registra no Network quais dados estamos enviando
    await logToNetworkChrome('STRIPE_CREATE_PRICE', 'PAYLOAD_ENVIADO', { accountId, priceData });

    // 🌐 Chamada HTTP para criar preço no backend
    const response = await fetch('/api/stripe/prices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId, ...priceData })
    });

    const result = await response.json();

    // 📊 Log: Registra no Network a resposta que recebemos
    await logToNetworkChrome('STRIPE_CREATE_PRICE', 'RESPONSE_RECEBIDO', {
      status: response.status,
      ok: response.ok,
      result: result
    });

    // ❌ Se o backend retornou erro HTTP
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Erro HTTP ${response.status}`
      };
    }

    // ✅ Sucesso: preço criado
    return result;

  } catch (error) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('STRIPE_CREATE_PRICE', 'ERRO_CLIENTE', {
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de conexão'
    };
  }
}

/**
 * 📋 LISTAR PREÇOS DE PRODUTO
 * 
 * 🎯 OBJETIVO: Consultar todos os preços de um produto específico
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Recebe ID do produto
 * 2. Chama GET /api/stripe/products/{id}/prices
 * 3. O backend lista preços na Stripe API
 * 4. Retorna lista de preços (mensal, anual, etc.)
 */
export async function listStripePrices(accountId: string, productId: string, options: { active?: boolean } = {}): Promise<PriceListResult> {
  try {
    // 📊 Log: Registra no Network que estamos listando preços
    await logToNetworkChrome('STRIPE_LIST_PRICES', 'SOLICITACAO_ENVIADA', { accountId, productId, options });

    // Construir query string para filtros
    const queryParams = new URLSearchParams();
    if (options.active !== undefined) queryParams.append('active', options.active.toString());

    // 🌐 Chamada HTTP para listar preços no backend
    const response = await fetch(`/api/stripe/products/${accountId}/${productId}/prices?${queryParams.toString()}`);
    const result = await response.json();

    // 📊 Log: Registra no Network a resposta dos preços
    await logToNetworkChrome('STRIPE_LIST_PRICES', 'RESPONSE_RECEBIDO', {
      status: response.status,
      count: result.prices?.length || 0,
      result: result
    });

    // ❌ Se o backend retornou erro HTTP
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Erro HTTP ${response.status}`
      };
    }

    // ✅ Sucesso: preços listados
    return result;

  } catch (error) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('STRIPE_LIST_PRICES', 'ERRO_CLIENTE', {
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de conexão'
    };
  }
}

/**
 * 🔍 OBTER PREÇO STRIPE
 * 
 * 🎯 OBJETIVO: Consultar detalhes de um preço específico
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Recebe ID do preço
 * 2. Chama GET /api/stripe/prices/{id}
 * 3. O backend busca preço na Stripe API
 * 4. Retorna informações detalhadas do preço
 */
export async function getStripePrice(accountId: string, priceId: string): Promise<PriceResult> {
  try {
    // 📊 Log: Registra no Network que estamos buscando preço
    await logToNetworkChrome('STRIPE_GET_PRICE', 'SOLICITACAO_ENVIADA', { accountId, priceId });

    // 🌐 Chamada HTTP para buscar preço no backend
    const response = await fetch(`/api/stripe/prices/${accountId}/${priceId}`);
    const result = await response.json();

    // 📊 Log: Registra no Network a resposta do preço
    await logToNetworkChrome('STRIPE_GET_PRICE', 'RESPONSE_RECEBIDO', {
      status: response.status,
      result: result
    });

    // ❌ Se o backend retornou erro HTTP
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Erro HTTP ${response.status}`
      };
    }

    // ✅ Sucesso: preço encontrado
    return result;

  } catch (error) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('STRIPE_GET_PRICE', 'ERRO_CLIENTE', {
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de conexão'
    };
  }
}

/**
 * 🔒 DESATIVAR PREÇO STRIPE
 * 
 * 🎯 OBJETIVO: Desativar preço no Stripe (soft delete)
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Recebe ID do preço
 * 2. Chama DELETE /api/stripe/prices/{id}
 * 3. O backend desativa o preço (active: false)
 * 4. Preço fica oculto mas preserva histórico de vendas
 */
export async function deactivateStripePrice(accountId: string, priceId: string): Promise<PriceResult> {
  try {
    // 📊 Log: Registra no Network que estamos desativando preço
    await logToNetworkChrome('STRIPE_DEACTIVATE_PRICE', 'SOLICITACAO_ENVIADA', { accountId, priceId });

    // 🌐 Chamada HTTP para desativar preço no backend
    const response = await fetch(`/api/stripe/prices/${accountId}/${priceId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    // 📊 Log: Registra no Network a resposta da desativação
    await logToNetworkChrome('STRIPE_DEACTIVATE_PRICE', 'RESPONSE_RECEBIDO', {
      status: response.status,
      ok: response.ok,
      result: result
    });

    // ❌ Se o backend retornou erro HTTP
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Erro HTTP ${response.status}`
      };
    }

    // ✅ Sucesso: preço desativado
    return result;

  } catch (error) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('STRIPE_DEACTIVATE_PRICE', 'ERRO_CLIENTE', {
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de conexão'
    };
  }
}

// ##########################################################################################
// ###################### OPERAÇÕES ESPECÍFICAS PARA CURSOS ##############################
// ##########################################################################################

/**
 * 🎯 CRIAR PRODUTO + PREÇO EM UMA OPERAÇÃO
 * 
 * 🔄 FLUXO OTIMIZADO:
 * 1. Cria produto no Stripe
 * 2. Cria preço vinculado ao produto
 * 3. Retorna ambos os IDs para salvar no banco
 */
export async function createStripeProductWithPrice(
  accountId: string,
  productData: ProductCreateData,
  priceData: PriceForProductData
): Promise<CourseStripeData> {
  try {
    // 📊 Log: Operação combinada iniciada
    await logToNetworkChrome('STRIPE_PRODUCT_WITH_PRICE', 'OPERACAO_INICIADA', { accountId, productData, priceData });

    // Passo 1: Criar produto
    const productResult = await createStripeProduct(accountId, {
      name: productData.name,
      description: productData.description,
      images: productData.images,
      metadata: productData.metadata
    });

    if (!productResult.success || !productResult.product) {
      throw new Error(`Erro ao criar produto: ${productResult.error}`);
    }

    // Passo 2: Criar preço para o produto
    const priceResult = await createStripePrice(accountId, {
      product_id: productResult.product.id,
      unit_amount: priceData.unitAmount,
      currency: priceData.currency || 'brl',
      recurring: priceData.recurring,
      metadata: priceData.metadata
    });

    if (!priceResult.success || !priceResult.price) {
      throw new Error(`Erro ao criar preço: ${priceResult.error}`);
    }

    const result = {
      stripeProductId: productResult.product.id,
      stripePriceId: priceResult.price.id
    };

    // 📊 Log: Operação combinada bem-sucedida
    await logToNetworkChrome('STRIPE_PRODUCT_WITH_PRICE', 'OPERACAO_SUCESSO', result);

    return result;

  } catch (error) {
    await logToNetworkChrome('STRIPE_PRODUCT_WITH_PRICE', 'OPERACAO_ERRO', {
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    throw error;
  }
}

/**
 * 💰 ATUALIZAR PREÇO DE PRODUTO
 * 
 * 🎯 CENÁRIO: Mentor alterou o preço do curso
 * 
 * 📚 STRIPE LOGIC: Não pode alterar preço existente, precisa criar novo
 * 
 * 🔄 FLUXO:
 * 1. Desativa preço antigo (se existir)
 * 2. Cria novo preço com valor atualizado
 * 3. Retorna ID do novo preço para salvar no banco
 */
export async function updateProductPrice(
  accountId: string,
  productId: string,
  oldPriceId: string | null,
  newUnitAmount: number
): Promise<string> {
  try {
    // Passo 1: Desativar preço antigo (se existe)
    if (oldPriceId) {
      await deactivateStripePrice(accountId, oldPriceId);
    }

    // Passo 2: Criar novo preço
    const priceResult = await createStripePrice(accountId, {
      product_id: productId,
      unit_amount: newUnitAmount,
      currency: 'brl'
    });

    if (!priceResult.success || !priceResult.price) {
      throw new Error(`Erro ao criar novo preço: ${priceResult.error}`);
    }

    return priceResult.price.id;

  } catch (error) {
    throw new Error(`Erro ao atualizar preço: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * 🔄 Sincronizar curso existente com Stripe
 * 
 * 📚 EDUCATIVO: Se o curso já existe mas não tem produto Stripe, esta função cria
 * 
 * 🎯 CENÁRIO: Curso criado antes da integração Stripe ser ativada
 */
export async function syncCourseWithStripe(accountId: string, courseData: CourseInputData): Promise<ProductWithPriceData> {
  try {
    // 🔍 Log: Registra no Network que estamos sincronizando curso
    await logToNetworkChrome('STRIPE_SYNC_COURSE', 'INICIADO', { accountId, courseData });

    // 🆕 Criar produto Stripe para curso existente
    const productResult = await createStripeProduct(accountId, {
      name: courseData.name,
      description: courseData.description,
      images: courseData.images,
      metadata: {
        course_id: courseData.courseId,
        mentor_id: courseData.mentorId,
        category: courseData.category || '',
        sync_date: new Date().toISOString()
      }
    });

    if (!productResult.success || !productResult.product) {
      throw new Error(`Erro ao criar produto: ${productResult.error}`);
    }

    // 💰 Criar preço para o produto
    const priceResult = await createStripePrice(accountId, {
      product_id: productResult.product.id,
      unit_amount: courseData.price * 100, // Converter para centavos
      currency: 'brl',
      metadata: {
        course_id: courseData.courseId,
        sync_date: new Date().toISOString()
      }
    });

    if (!priceResult.success || !priceResult.price) {
      throw new Error(`Erro ao criar preço: ${priceResult.error}`);
    }

    const result = {
      success: true,
      product: productResult.product,
      price: priceResult.price
    };

    // 📊 Log: Sucesso na sincronização
    await logToNetworkChrome('STRIPE_SYNC_COURSE', 'SUCESSO', {
      accountId,
      product_id: productResult.product.id,
      price_id: priceResult.price.id,
      course_id: courseData.courseId
    });

    return result;

  } catch (error) {
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido na sincronização'
    };
    
    await logToNetworkChrome('STRIPE_SYNC_COURSE', 'ERRO', {
      accountId,
      course_id: courseData.courseId,
      error: errorResult.error
    });
    
    return errorResult;
  }
} 