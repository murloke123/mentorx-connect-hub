"use strict";
/**
 * Brevo Client Configuration
 * Configura o cliente Brevo para envio de e-mails transacionais
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailConfig = exports.defaultSender = void 0;
const brevo = __importStar(require("@getbrevo/brevo"));
const environment_1 = require("../../../environment");
// Configurar o cliente da API Brevo
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, environment_1.config.BREVO_API_KEY);
exports.default = apiInstance;
// Configuração padrão do remetente
exports.defaultSender = {
    email: environment_1.config.BREVO_SENDER_EMAIL,
    name: environment_1.config.BREVO_SENDER_NAME
};
// Configurações de e-mail
exports.emailConfig = {
    sender: exports.defaultSender,
    replyTo: exports.defaultSender,
    headers: {
        'X-Mailer': 'Mentora AI Platform',
        'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
    }
};
