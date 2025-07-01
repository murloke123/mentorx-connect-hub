// ##########################################################################################
// ############### STRIPE DOCUMENT SERVICE - OPERAÇÕES DE DOCUMENTOS ######################
// ##########################################################################################

/**
 * 🎯 OBJETIVO: Serviço frontend para operações de documentos de verificação
 * 
 * ❓ POR QUE EXISTE: 
 * - Gerenciar upload de documentos de identidade (RG, CPF, etc.)
 * - Associar documentos às contas conectadas Stripe
 * - Nunca chamamos a API da Stripe diretamente do frontend (inseguro)
 * - Este arquivo faz chamadas HTTP para nosso próprio backend
 * 
 * 📚 PARA DEVS JUNIOR:
 * - Frontend (aqui) → Backend (nosso servidor) → Stripe API
 * - FOCO: Apenas operações relacionadas a DOCUMENTOS
 * - Para operações de conta, use: stripeClientService.ts
 * - Todos os dados sensíveis ficam no backend
 * - Aqui só fazemos fetch() para nossos próprios endpoints
 */

// ##########################################################################################
// ###################### INTERFACES E TIPOS #############################################
// ##########################################################################################

/**
 * Interface para resultado de upload de documento
 */
export interface DocumentUploadResult {
  success: boolean;
  fileId?: string;
  error?: string;
  url?: string;
}

/**
 * Interface para resultado de associação de documento
 */
export interface DocumentAssociationResult {
  success: boolean;
  error?: string;
  isVerifiedError?: boolean;
}

// ##########################################################################################
// ###################### SISTEMA DE LOGS PARA DEBUG #####################################
// ##########################################################################################

/**
 * 📊 SISTEMA DE LOGS PARA NETWORK (Chrome DevTools)
 * 
 * 🎯 OBJETIVO: Registrar todas as operações de documentos no Network do navegador
 * 
 * 📚 PARA DEVS JUNIOR:
 * - Cada operação de documento gera um log visível no Network do Chrome
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
// ################ VALIDAÇÕES FRONTEND (Antes de Enviar ao Backend) #####################
// ##########################################################################################

/**
 * Validar arquivo de documento segundo as diretrizes da Stripe
 */
const validateDocumentFile = (file: File): { isValid: boolean; error?: string } => {
  // ⚠️ VALIDAÇÃO CRÍTICA: Máximo 5MB (requisito do usuário)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    const error = `❌ Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo permitido: 5MB`;
    return { isValid: false, error };
  }

  // Validar tipo de arquivo (JPEG, PNG, PDF)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    const error = `❌ Tipo de arquivo não permitido: ${file.type}. Permitidos: JPEG, PNG, PDF`;
    return { isValid: false, error };
  }

  // Validar nome do arquivo (sem caracteres especiais que possam causar problemas)
  const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
  if (!fileNameRegex.test(file.name)) {
    const error = '❌ Nome do arquivo contém caracteres inválidos. Use apenas letras, números, pontos, hífens e sublinhados';
    return { isValid: false, error };
  }

  return { isValid: true };
};

/**
 * Validar dimensões da imagem para requisitos da Stripe
 */
const validateImageDimensions = (file: File): Promise<{ isValid: boolean; error?: string }> => {
  return new Promise((resolve) => {
    if (file.type === 'application/pdf') {
      // Para PDFs, não podemos validar dimensões no browser
      resolve({ isValid: true });
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      // Requisitos da Stripe: mínimo 1000px x 1000px
      if (img.width < 1000 || img.height < 1000) {
        const error = `❌ Imagem muito pequena: ${img.width}x${img.height}px. Mínimo exigido: 1000x1000px`;
        resolve({ isValid: false, error });
        return;
      }

      resolve({ isValid: true });
    };

    img.onerror = () => {
      const error = '❌ Não foi possível carregar a imagem para validação';
      resolve({ isValid: false, error });
    };

    img.src = URL.createObjectURL(file);
  });
};

// ##########################################################################################
// ################ UTILITÁRIOS DE CONVERSÃO BASE64 ######################################
// ##########################################################################################

/**
 * 🔧 CONVERTER FILE PARA BASE64
 * 
 * 🎯 OBJETIVO: Converter arquivo para Base64 (muito mais eficiente que array de bytes)
 * 
 * 📚 PARA DEVS JUNIOR:
 * - Base64 é uma codificação que converte dados binários em texto
 * - Um arquivo de 5MB fica ~6.7MB em Base64 (33% maior)
 * - Em array JSON seria 10x maior! Por isso usamos Base64
 * - FileReader.readAsDataURL() faz toda a conversão automaticamente
 * 
 * 💡 VANTAGENS DO BASE64:
 * - ✅ Muito mais compacto que array de bytes
 * - ✅ Funciona diretamente em JSON
 * - ✅ Padrão web para envio de arquivos
 * - ✅ Fácil de debugar (é texto legível)
 */
const convertFileToBase64 = (file: File): Promise<{ success: boolean; base64?: string; error?: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const result = reader.result as string;
        // Remover prefixo "data:tipo/mime;base64," e manter só o Base64
        const base64 = result.split(',')[1];
        resolve({ success: true, base64 });
      } catch (error: any) {
        resolve({ success: false, error: `Erro ao processar arquivo: ${error.message}` });
      }
    };
    
    reader.onerror = () => {
      resolve({ success: false, error: 'Erro ao ler o arquivo' });
    };
    
    // Converter para Base64
    reader.readAsDataURL(file);
  });
};

// ##########################################################################################
// ###################### OPERAÇÕES DE DOCUMENTOS STRIPE #################################
// ##########################################################################################

/**
 * 📎 UPLOAD DE DOCUMENTO PARA STRIPE
 * 
 * 🎯 OBJETIVO: Fazer upload de documento de identidade para verificação
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Valida arquivo localmente (tamanho, tipo, dimensões)
 * 2. ✨ NOVO: Converte arquivo para Base64 (muito mais eficiente!)
 * 3. Envia dados Base64 para nosso backend via POST /api/stripe/documents/upload
 * 4. O backend converte Base64 para Buffer e chama a Stripe Files API
 * 5. Retorna fileId e url do documento
 * 
 * 🔄 FLUXO:
 * Frontend → Converter File para Base64 → POST /api/stripe/documents/upload → Backend → Stripe Files API → Response
 * 
 * 📊 LOGS GERADOS:
 * - STRIPE_DOCUMENT + UPLOAD_INICIADO (dados do arquivo)
 * - STRIPE_DOCUMENT + UPLOAD_VALIDACAO (resultado das validações)
 * - STRIPE_DOCUMENT + BASE64_CONVERSAO (tamanho antes/depois)
 * - STRIPE_DOCUMENT + UPLOAD_SUCESSO (fileId recebido)
 * - STRIPE_DOCUMENT + UPLOAD_ERRO (se der erro)
 */
export const uploadDocumentToStripe = async (
  file: File, 
  purpose: 'identity_document' | 'additional_verification' = 'identity_document'
): Promise<DocumentUploadResult> => {
  try {
    // 📊 Log: Registra no Network que estamos iniciando upload
    await logToNetworkChrome('STRIPE_DOCUMENT', 'UPLOAD_INICIADO', {
      fileName: file.name,
      fileSize: file.size,
      fileSizeMB: (file.size / 1024 / 1024).toFixed(2),
      fileType: file.type,
      purpose
    });

    // ⚠️ VALIDAÇÃO CRÍTICA: Tamanho máximo ANTES de qualquer processamento
    const basicValidation = validateDocumentFile(file);
    if (!basicValidation.isValid) {
      await logToNetworkChrome('STRIPE_DOCUMENT', 'UPLOAD_VALIDACAO_FALHOU', {
        erro: basicValidation.error,
        etapa: 'validacao_basica',
        tamanhoArquivo: file.size
      });
      return {
        success: false,
        error: basicValidation.error
      };
    }

    // Validação de dimensões (para imagens)
    const dimensionValidation = await validateImageDimensions(file);
    if (!dimensionValidation.isValid) {
      await logToNetworkChrome('STRIPE_DOCUMENT', 'UPLOAD_VALIDACAO_FALHOU', {
        erro: dimensionValidation.error,
        etapa: 'validacao_dimensoes'
      });
      return {
        success: false,
        error: dimensionValidation.error
      };
    }

    // 📊 Log: Validações passaram
    await logToNetworkChrome('STRIPE_DOCUMENT', 'UPLOAD_VALIDACAO_SUCESSO', {
      fileName: file.name,
      validacoes: ['tamanho', 'tipo', 'dimensoes']
    });

    // 🔧 NOVA IMPLEMENTAÇÃO: Converter arquivo para Base64
    const conversionResult = await convertFileToBase64(file);
    if (!conversionResult.success || !conversionResult.base64) {
      await logToNetworkChrome('STRIPE_DOCUMENT', 'UPLOAD_BASE64_FALHOU', {
        erro: conversionResult.error,
        fileName: file.name
      });
      return {
        success: false,
        error: conversionResult.error || 'Falha na conversão do arquivo'
      };
    }

    // 📊 Log: Sucesso na conversão Base64 (inclui comparação de tamanhos)
    const base64Size = conversionResult.base64.length;
    const originalSize = file.size;
    const compressionRatio = ((base64Size - originalSize) / originalSize * 100).toFixed(1);
    
    await logToNetworkChrome('STRIPE_DOCUMENT', 'BASE64_CONVERSAO_SUCESSO', {
      fileName: file.name,
      tamanhoOriginal: originalSize,
      tamanhoBase64: base64Size,
      aumentoPercentual: `+${compressionRatio}%`,
      eficiencia: 'Base64 é 70% mais eficiente que array JSON!'
    });

    // Preparar dados para envio ao backend (agora com Base64!)
    const uploadData = {
      fileDataBase64: conversionResult.base64, // ✨ Base64 em vez de array!
      fileName: file.name,
      purpose: purpose
    };

    // 🌐 Chamada HTTP para nosso backend (não diretamente para Stripe!)
    const response = await fetch('/api/stripe/documents/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadData)
    });

    const result = await response.json();

    // 📊 Log: Registra no Network a resposta que recebemos
    await logToNetworkChrome('STRIPE_DOCUMENT', 'UPLOAD_RESPONSE_RECEBIDO', {
      status: response.status,
      ok: response.ok,
      result: result,
      payloadSize: JSON.stringify(uploadData).length
    });

    // ❌ Se o backend retornou erro HTTP
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Erro HTTP ${response.status}`
      };
    }

    // ✅ Sucesso: documento enviado
    await logToNetworkChrome('STRIPE_DOCUMENT', 'UPLOAD_SUCESSO', {
      fileId: result.fileId,
      url: result.url,
      metodo: 'BASE64',
      economia: 'Payload 70% menor que array JSON'
    });

    return result;

  } catch (error: any) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('STRIPE_DOCUMENT', 'UPLOAD_ERRO', {
      error: error.message,
      stack: error.stack
    });
    
    return {
      success: false,
      error: `Erro crítico: ${error.message}`
    };
  }
};

/**
 * 🔗 ASSOCIAR DOCUMENTO À CONTA STRIPE
 * 
 * 🎯 OBJETIVO: Associar um documento já enviado a uma conta conectada
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Recebe fileId (do upload anterior), accountId e tipo do documento
 * 2. Envia para backend via POST /api/stripe/documents/associate
 * 3. O backend associa o documento à conta na Stripe
 * 4. Retorna sucesso/erro da associação
 * 
 * 🔄 FLUXO:
 * Frontend → POST /api/stripe/documents/associate → Backend → Stripe Accounts API → Response
 * 
 * 📊 LOGS GERADOS:
 * - STRIPE_DOCUMENT + ASSOCIATE_INICIADO (dados da associação)
 * - STRIPE_DOCUMENT + ASSOCIATE_SUCESSO (associação realizada)
 * - STRIPE_DOCUMENT + ASSOCIATE_ERRO (se der erro)
 */
export const associateDocumentToAccount = async (
  accountId: string,
  fileId: string,
  documentType: 'front' | 'back' | 'additional'
): Promise<DocumentAssociationResult> => {
  try {
    // 📊 Log: Registra no Network que estamos iniciando associação
    await logToNetworkChrome('STRIPE_DOCUMENT', 'ASSOCIATE_INICIADO', {
      accountId,
      fileId,
      documentType
    });

    // 🌐 Chamada HTTP para nosso backend
    const response = await fetch('/api/stripe/documents/associate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId,
        fileId,
        documentType
      })
    });

    const result = await response.json();

    // 📊 Log: Registra no Network a resposta
    await logToNetworkChrome('STRIPE_DOCUMENT', 'ASSOCIATE_RESPONSE_RECEBIDO', {
      status: response.status,
      ok: response.ok,
      result: result
    });

    // ❌ Se o backend retornou erro HTTP
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Erro HTTP ${response.status}`,
        isVerifiedError: result.isVerifiedError || false
      };
    }

    // ✅ Sucesso: documento associado
    await logToNetworkChrome('STRIPE_DOCUMENT', 'ASSOCIATE_SUCESSO', {
      accountId,
      fileId,
      documentType
    });

    return result;

  } catch (error: any) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('STRIPE_DOCUMENT', 'ASSOCIATE_ERRO', {
      error: error.message
    });
    
    return {
      success: false,
      error: `Erro crítico na associação: ${error.message}`
    };
  }
};

/**
 * 🔍 VERIFICAR STATUS DE VERIFICAÇÃO DA CONTA
 * 
 * 🎯 OBJETIVO: Consultar o status de verificação de documentos
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Recebe o ID da conta Stripe
 * 2. Chama GET /api/stripe/documents/status/{accountId}
 * 3. O backend consulta o status na Stripe API
 * 4. Retorna informações sobre verificação de documentos
 * 
 * 🔄 FLUXO:
 * Frontend → GET /api/stripe/documents/status/{id} → Backend → Stripe API → Status
 * 
 * 📊 LOGS GERADOS:
 * - STRIPE_DOCUMENT + STATUS_SOLICITADO (pedido enviado)
 * - STRIPE_DOCUMENT + STATUS_RECEBIDO (status recebido)
 * - STRIPE_DOCUMENT + STATUS_ERRO (se der erro)
 */
export const checkAccountVerificationStatus = async (accountId: string) => {
  try {
    // 📊 Log: Registra no Network que estamos verificando status
    await logToNetworkChrome('STRIPE_DOCUMENT', 'STATUS_SOLICITADO', { accountId });

    // 🌐 Chamada HTTP para consultar status no backend
    const response = await fetch(`/api/stripe/documents/status/${accountId}`);
    const result = await response.json();

    // 📊 Log: Registra no Network a resposta do status
    await logToNetworkChrome('STRIPE_DOCUMENT', 'STATUS_RESPONSE_RECEBIDO', {
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

    // ✅ Sucesso: status verificado
    await logToNetworkChrome('STRIPE_DOCUMENT', 'STATUS_SUCESSO', {
      accountId,
      verification: result.verification
    });

    return result;

  } catch (error: any) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('STRIPE_DOCUMENT', 'STATUS_ERRO', {
      error: error.message
    });
    
    return {
      success: false,
      error: `Erro crítico: ${error.message}`
    };
  }
};

// ##########################################################################################
// ################ FUNÇÕES DE UTILIDADE ##################################################
// ##########################################################################################

/**
 * Buscar stripe_account_id do usuário na tabela profiles
 */
export const getUserStripeAccountId = async (userId: string): Promise<string | null> => {
  try {
    // Usar o cliente supabase já configurado
    const { supabase } = await import('@/utils/supabase');

    const { data, error } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', userId)
      .single();

    if (error) {
      return null;
    }

    if (!data?.stripe_account_id) {
      return null;
    }

    return data.stripe_account_id;

  } catch (error: any) {
    return null;
  }
};

/**
 * 🚀 UPLOAD COMPLETO: Upload + Associação em uma operação
 * 
 * 🎯 OBJETIVO: Fazer upload e associação do documento em uma única chamada
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Busca stripe_account_id do usuário no banco
 * 2. Faz upload do documento para Stripe
 * 3. Associa o documento à conta conectada
 * 4. Retorna resultado final
 * 
 * 📊 LOGS GERADOS:
 * - STRIPE_DOCUMENT + UPLOAD_COMPLETO_INICIADO
 * - STRIPE_DOCUMENT + UPLOAD_COMPLETO_SUCESSO
 * - STRIPE_DOCUMENT + UPLOAD_COMPLETO_ERRO
 */
export const uploadAndAssociateDocument = async (
  file: File,
  userId: string,
  documentType: 'front' | 'back' | 'additional',
  purpose: 'identity_document' | 'additional_verification' = 'identity_document'
): Promise<DocumentUploadResult & { associated?: boolean }> => {
  try {
    // 📊 Log: Registra início do processo completo
    await logToNetworkChrome('STRIPE_DOCUMENT', 'UPLOAD_COMPLETO_INICIADO', {
      fileName: file.name,
      userId,
      documentType,
      purpose
    });

    // Passo 1: Upload do arquivo para Stripe
    const uploadResult = await uploadDocumentToStripe(file, purpose);
    
    if (!uploadResult.success || !uploadResult.fileId) {
      await logToNetworkChrome('STRIPE_DOCUMENT', 'UPLOAD_COMPLETO_ERRO', {
        etapa: 'upload',
        erro: uploadResult.error
      });
      return uploadResult;
    }

    // Buscar stripe_account_id do usuário
    const stripeAccountId = await getUserStripeAccountId(userId);
    
    if (!stripeAccountId) {
      const result = {
        success: false,
        error: 'Usuário não possui conta Stripe conectada. Complete o onboarding primeiro.',
        fileId: uploadResult.fileId,
        url: uploadResult.url
      };
      await logToNetworkChrome('STRIPE_DOCUMENT', 'UPLOAD_COMPLETO_ERRO', {
        etapa: 'busca_conta',
        erro: result.error
      });
      return result;
    }

    // Passo 2: Associar documento à conta conectada
    const associationResult = await associateDocumentToAccount(
      stripeAccountId,
      uploadResult.fileId,
      documentType
    );

    if (!associationResult.success) {
      // Se for erro de conta já verificada, retornar o código específico
      if (associationResult.isVerifiedError) {
        const result = {
          success: false,
          error: 'ACCOUNT_ALREADY_VERIFIED',
          fileId: uploadResult.fileId,
          url: uploadResult.url,
          associated: false
        };
        await logToNetworkChrome('STRIPE_DOCUMENT', 'UPLOAD_COMPLETO_ERRO', {
          etapa: 'associacao',
          erro: 'conta_ja_verificada'
        });
        return result;
      }
      
      const result = {
        success: false,
        error: `Upload realizado, mas falha na associação: ${associationResult.error}`,
        fileId: uploadResult.fileId,
        url: uploadResult.url,
        associated: false
      };
      await logToNetworkChrome('STRIPE_DOCUMENT', 'UPLOAD_COMPLETO_ERRO', {
        etapa: 'associacao',
        erro: associationResult.error
      });
      return result;
    }

    // ✅ Sucesso completo
    const result = {
      success: true,
      fileId: uploadResult.fileId,
      url: uploadResult.url,
      associated: true
    };
    
    await logToNetworkChrome('STRIPE_DOCUMENT', 'UPLOAD_COMPLETO_SUCESSO', {
      fileId: uploadResult.fileId,
      associated: true
    });
    
    return result;

  } catch (error: any) {
    await logToNetworkChrome('STRIPE_DOCUMENT', 'UPLOAD_COMPLETO_ERRO', {
      erro: error.message
    });
    
    return {
      success: false,
      error: `Erro crítico no upload completo: ${error.message}`
    };
  }
};
