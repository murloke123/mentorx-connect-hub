// Utilitários compartilhados para funções serverless do Stripe
import Stripe from 'stripe';

/**
 * Inicializar cliente Stripe com configurações otimizadas para serverless
 * @returns {Stripe} Instância do Stripe configurada
 */
function initializeStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY não configurada');
  }
  
  // Inicializar sem versão específica da API para máxima compatibilidade
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    timeout: 15000, // 15 segundos timeout para serverless
    maxNetworkRetries: 2 // Retry automático em caso de falha de rede
  });
}

/**
 * Configurar headers CORS padrão para todas as funções
 * @param {Object} res - Response object
 */
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
}

/**
 * Handler para requisições OPTIONS (preflight)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {boolean} True se foi uma requisição OPTIONS
 */
function handleOptionsRequest(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Validar método HTTP permitido
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string|string[]} allowedMethods - Métodos permitidos
 * @returns {boolean} True se método é válido
 */
function validateHttpMethod(req, res, allowedMethods) {
  const methods = Array.isArray(allowedMethods) ? allowedMethods : [allowedMethods];
  
  if (!methods.includes(req.method)) {
    res.status(405).json({
      success: false,
      error: `Method not allowed. Use ${methods.join(' or ')}.`
    });
    return false;
  }
  return true;
}

/**
 * Logger padronizado para funções serverless
 * @param {string} functionName - Nome da função
 * @param {string} level - Nível do log (info, error, warn)
 * @param {string} message - Mensagem
 * @param {Object} data - Dados adicionais
 */
function logServerless(functionName, level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: '🚀',
    error: '❌',
    warn: '⚠️',
    success: '✅'
  }[level] || '📝';
  
  const logData = {
    timestamp,
    function: functionName,
    level,
    message,
    ...data
  };
  
  console.log(`${emoji} SERVERLESS ${functionName}: ${message}`, 
    Object.keys(data).length > 0 ? logData : '');
}

/**
 * Criar resposta de erro padronizada
 * @param {Error} error - Erro capturado
 * @param {string} functionName - Nome da função
 * @param {number} startTime - Timestamp de início
 * @returns {Object} Objeto de resposta de erro
 */
function createErrorResponse(error, functionName, startTime) {
  const duration = Date.now() - startTime;
  
  logServerless(functionName, 'error', `Erro após ${duration}ms`, {
    errorName: error.name,
    errorMessage: error.message,
    errorStack: error.stack
  });
  
  // Log adicional para erros específicos do Stripe
  if (error.type) {
    logServerless(functionName, 'error', 'Stripe Error Details', {
      type: error.type,
      decline_code: error.decline_code,
      charge: error.charge,
      payment_intent: error.payment_intent,
      setup_intent: error.setup_intent,
      source: error.source
    });
  }
  
  // Verificar se é um erro de timeout ou rede
  const isNetworkError = error instanceof Error && (
    error.message.includes('timeout') ||
    error.message.includes('ECONNRESET') ||
    error.message.includes('ENOTFOUND') ||
    error.message.includes('fetch')
  );
  
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Erro interno do servidor',
    errorType: error instanceof Error ? error.name : 'UnknownError',
    isNetworkError,
    timestamp: new Date().toISOString(),
    duration: `${duration}ms`,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV
    }
  };
}

/**
 * Wrapper para funções serverless com tratamento de erro padrão
 * @param {string} functionName - Nome da função
 * @param {Function} handler - Função handler
 * @returns {Function} Handler com tratamento de erro
 */
function withErrorHandling(functionName, handler) {
  return async (req, res) => {
    const startTime = Date.now();
    
    try {
      setCorsHeaders(res);
      
      // Handle preflight OPTIONS request
      if (handleOptionsRequest(req, res)) {
        return;
      }
      
      logServerless(functionName, 'info', 'Requisição recebida', {
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent']
      });
      
      await handler(req, res, startTime);
      
    } catch (error) {
      const errorResponse = createErrorResponse(error, functionName, startTime);
      return res.status(500).json(errorResponse);
    }
  };
}

export {
  initializeStripe,
  setCorsHeaders,
  handleOptionsRequest,
  validateHttpMethod,
  logServerless,
  createErrorResponse,
  withErrorHandling
};