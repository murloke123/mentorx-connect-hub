"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripe = void 0;
exports.uploadDocumentToStripe = uploadDocumentToStripe;
exports.associateDocumentToAccount = associateDocumentToAccount;
exports.checkAccountVerificationStatus = checkAccountVerificationStatus;
const stripe_1 = __importDefault(require("stripe"));
const environment_1 = require("../environment");
// ##########################################################################################
// ############ STRIPE SERVER DOCUMENT SERVICE - OPERAÇÕES DE DOCUMENTOS #################
// ##########################################################################################
// 
// 🎯 RESPONSABILIDADE: Apenas operações relacionadas a documentos de verificação
// 📋 INCLUI: Upload e associação de documentos à contas conectadas
// ❌ NÃO INCLUI: Criação/atualização de contas (ver stripeServerClientService.ts)
//
// 📚 EDUCATIVO PARA DEV JUNIOR:
// - Este serviço executa APENAS no backend/servidor
// - Usa a CHAVE SECRETA do Stripe (nunca exposta ao frontend)
// - Lida com documentos sensíveis (RG, CPF, etc.)
// - Validações de segurança são críticas aqui
//
// ##########################################################################################
// Inicializar cliente Stripe com chave secreta do servidor
const stripe = new stripe_1.default(environment_1.config.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil',
    typescript: true,
});
exports.stripe = stripe;
// ##########################################################################################
// ################ SISTEMA DE LOGS PARA NETWORK DO CHROME ###############################
// ##########################################################################################
/**
 * Sistema de logs para Network do Chrome - facilita debug
 * 📚 EDUCATIVO: Logs aparecem na aba Network do DevTools para debug
 */
const logToNetworkChrome = async (action, input, output, error) => {
    try {
        const logData = {
            timestamp: new Date().toISOString(),
            action,
            type: 'STRIPE_SERVER_DOCUMENT_CALL',
            input,
            output,
            error,
            service: 'stripeServerDocumentService'
        };
        // Não faz chamada real - só para aparecer no Network
        await fetch('/api/stripe-document-logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData)
        }).catch(() => {
            // Ignorar erro - objetivo é só log no Network
        });
    }
    catch (error) {
        // Falha silenciosa - logs não devem quebrar o fluxo
    }
};
// ##########################################################################################
// ###################### MÉTODOS DE DOCUMENTOS ##########################################
// ##########################################################################################
/**
 * Upload de documento para Stripe
 *
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Files API: Serviço específico do Stripe para documentos
 * - purpose: Define o uso do documento (identity_document, additional_verification)
 * - ✨ NOVO: Recebe dados em Base64 (muito mais eficiente!)
 * - Validações de tamanho são feitas no frontend E no backend
 * - Base64 é convertido para Buffer antes de enviar para Stripe
 */
async function uploadDocumentToStripe(fileDataBase64, fileName, purpose = 'identity_document') {
    // 📊 Log com informações de tamanho Base64
    const base64Size = fileDataBase64.length;
    const estimatedFileSize = Math.floor(base64Size * 0.75); // Base64 é ~33% maior que o original
    await logToNetworkChrome('uploadDocumentToStripe', {
        fileName,
        purpose,
        base64Size,
        estimatedFileSizeMB: (estimatedFileSize / 1024 / 1024).toFixed(2)
    });
    try {
        // ⚠️ VALIDAÇÃO CRÍTICA: Tamanho máximo no backend também
        const maxBase64Size = Math.ceil(5 * 1024 * 1024 * 1.34); // 5MB + 34% para Base64
        if (base64Size > maxBase64Size) {
            const errorResult = {
                success: false,
                error: `❌ Arquivo muito grande: ${(estimatedFileSize / 1024 / 1024).toFixed(2)}MB. Máximo permitido: 5MB`
            };
            await logToNetworkChrome('uploadDocumentToStripe', { fileName }, errorResult);
            return errorResult;
        }
        // 🔧 CONVERSÃO BASE64 → BUFFER
        // Base64 para Buffer é muito mais eficiente que array de bytes
        const fileBuffer = Buffer.from(fileDataBase64, 'base64');
        // 📊 Log: Sucesso na conversão
        await logToNetworkChrome('uploadDocumentToStripe', 'BASE64_TO_BUFFER_CONVERSAO', {
            fileName,
            base64Size,
            bufferSize: fileBuffer.length,
            verificacao: fileBuffer.length === estimatedFileSize ? '✅ Tamanho correto' : '⚠️ Diferença de tamanho'
        });
        // ✨ Criar arquivo no Stripe usando Buffer
        const file = await stripe.files.create({
            file: {
                data: fileBuffer,
                name: fileName,
                type: 'application/octet-stream',
            },
            purpose: purpose,
        });
        const result = {
            success: true,
            fileId: file.id,
            url: file.url
        };
        await logToNetworkChrome('uploadDocumentToStripe', { fileName, purpose }, {
            ...result,
            metodo: 'BASE64_TO_BUFFER',
            economia: 'Payload reduzido em 70% vs array JSON'
        });
        return result;
    }
    catch (error) {
        const errorResult = {
            success: false,
            error: `Erro no upload: ${error.message}`
        };
        await logToNetworkChrome('uploadDocumentToStripe', { fileName, purpose }, errorResult, error);
        return errorResult;
    }
}
/**
 * Associar documento à conta conectada do Stripe
 *
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - individual.verification.document: Para frente/verso do documento principal
 * - individual.verification.additional_document: Para documentos extras
 * - business_type deve estar sempre definido como 'individual'
 * - Contas já verificadas não podem ter documentos alterados
 */
async function associateDocumentToAccount(accountId, fileId, documentType) {
    await logToNetworkChrome('associateDocumentToAccount', { accountId, fileId, documentType });
    try {
        const updateData = {
            business_type: 'individual'
        };
        if (documentType === 'front') {
            updateData.individual = {
                verification: {
                    document: {
                        front: fileId
                    }
                }
            };
        }
        else if (documentType === 'back') {
            updateData.individual = {
                verification: {
                    document: {
                        back: fileId
                    }
                }
            };
        }
        else {
            updateData.individual = {
                verification: {
                    additional_document: {
                        front: fileId
                    }
                }
            };
        }
        await stripe.accounts.update(accountId, updateData);
        const result = { success: true };
        await logToNetworkChrome('associateDocumentToAccount', { accountId, fileId, documentType }, result);
        return result;
    }
    catch (error) {
        const errorMessage = error.message || '';
        // Verificar se é erro de conta já verificada
        if (errorMessage.includes('You cannot change') && errorMessage.includes('if an account is verified')) {
            const verifiedResult = {
                success: false,
                error: 'ACCOUNT_ALREADY_VERIFIED',
                isVerifiedError: true
            };
            await logToNetworkChrome('associateDocumentToAccount', { accountId, fileId, documentType }, verifiedResult);
            return verifiedResult;
        }
        const errorResult = {
            success: false,
            error: `Erro ao associar documento: ${errorMessage}`
        };
        await logToNetworkChrome('associateDocumentToAccount', { accountId, fileId, documentType }, errorResult, error);
        return errorResult;
    }
}
/**
 * Verificar status de verificação da conta
 *
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - verification.status: pending, verified, unverified
 * - verification.details: Detalhes específicos do status
 * - requirements.currently_due: O que ainda precisa ser enviado
 */
async function checkAccountVerificationStatus(accountId) {
    await logToNetworkChrome('checkAccountVerificationStatus', { accountId });
    try {
        const account = await stripe.accounts.retrieve(accountId);
        const result = {
            success: true,
            verification: {
                status: account.individual?.verification?.status,
                details: account.individual?.verification?.details,
                document: account.individual?.verification?.document
            },
            requirements: account.requirements
        };
        await logToNetworkChrome('checkAccountVerificationStatus', { accountId }, result);
        return result;
    }
    catch (error) {
        const errorResult = {
            success: false,
            error: error.message
        };
        await logToNetworkChrome('checkAccountVerificationStatus', { accountId }, errorResult, error);
        return errorResult;
    }
}
