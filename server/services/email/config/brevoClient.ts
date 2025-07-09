/**
 * Brevo Client Configuration
 * Configura o cliente Brevo para envio de e-mails transacionais
 */

import * as brevo from '@getbrevo/brevo';
import { config } from '../../../environment';

// Configurar o cliente da API Brevo
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, config.BREVO_API_KEY);

export default apiInstance;

// Configuração padrão do remetente
export const defaultSender = {
  email: config.BREVO_SENDER_EMAIL,
  name: config.BREVO_SENDER_NAME
};

// Configurações de e-mail
export const emailConfig = {
  sender: defaultSender,
  replyTo: defaultSender,
  headers: {
    'X-Mailer': 'Mentora AI Platform',
    'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN',
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
  }
}; 