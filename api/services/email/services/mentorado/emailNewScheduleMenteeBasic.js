"use strict";
/**
 * Email Service BÁSICO para Confirmação de Agendamento - Mentorado
 * Versão simplificada SEM condicionais para testar Template Render Error
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
exports.sendNewScheduleEmailToMenteeBasic = sendNewScheduleEmailToMenteeBasic;
const brevo = __importStar(require("@getbrevo/brevo"));
const brevoClient_1 = __importStar(require("../../config/brevoClient"));
const emailNewScheduleMenteeBasic_1 = require("../../templates/mentorado/emailNewScheduleMenteeBasic");
/**
 * Envia email BÁSICO de confirmação de agendamento para o mentorado
 */
async function sendNewScheduleEmailToMenteeBasic(data) {
    try {
        console.log('\n🚀 [EMAIL-SERVICE-BASIC] Iniciando envio de email BÁSICO para mentorado');
        console.log('🔍 [DEBUG-BASIC] Dados recebidos:', JSON.stringify(data, null, 2));
        // Preparar parâmetros do template (SEM condicionais)
        const templateParams = {
            MENTOR_NAME: data.mentorName || 'Mentor',
            MENTEE_NAME: data.menteeName || 'Mentorado',
            MENTEE_EMAIL: data.menteeEmail || 'email',
            APPOINTMENT_DATE: data.appointmentDate || 'Data',
            APPOINTMENT_TIME: data.appointmentTime || 'Horário',
            TIMEZONE: data.timezone || 'UTC',
            NOTES: data.notes || 'Nenhuma observação',
            MEET_LINK: data.meetLink || 'https://meet.jit.si/test',
            AGENDAMENTOS_URL: data.agendamentosUrl || 'https://app.mentoraai.com.br',
            SUPPORT_URL: data.supportUrl || 'https://app.mentoraai.com.br/suporte',
            CURRENT_YEAR: new Date().getFullYear().toString()
        };
        console.log('📤 [EMAIL-SERVICE-BASIC] Parâmetros do template:', JSON.stringify(templateParams, null, 2));
        // Processar conteúdo HTML e texto (SEM condicionais complexos)
        let htmlContent = emailNewScheduleMenteeBasic_1.emailNewScheduleMenteeBasicTemplate.htmlContent;
        let textContent = emailNewScheduleMenteeBasic_1.emailNewScheduleMenteeBasicTemplate.textContent || '';
        let subject = emailNewScheduleMenteeBasic_1.emailNewScheduleMenteeBasicTemplate.subject;
        // Substituir variáveis no template (apenas substituição simples)
        Object.entries(templateParams).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            htmlContent = htmlContent.replace(regex, value);
            textContent = textContent.replace(regex, value);
            subject = subject.replace(regex, value);
        });
        console.log('📧 [EMAIL-SERVICE-BASIC] Template processado - Subject:', subject);
        console.log('🔍 [DEBUG-BASIC] HTML Content length:', htmlContent.length);
        // Configurar destinatário e remetente
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.to = [{ email: data.menteeEmail, name: data.menteeName }];
        sendSmtpEmail.sender = brevoClient_1.emailConfig.sender;
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = htmlContent;
        sendSmtpEmail.textContent = textContent;
        sendSmtpEmail.tags = ['agendamento', 'confirmacao', 'mentorado', 'basic'];
        console.log('📤 [EMAIL-SERVICE-BASIC] Enviando email via Brevo API...');
        // Enviar email via Brevo
        const response = await brevoClient_1.default.sendTransacEmail(sendSmtpEmail);
        // Log da resposta do Brevo
        const brevoResponse = {
            statusCode: response.response?.statusCode,
            statusMessage: response.response?.statusMessage,
            messageId: response.body?.messageId
        };
        console.log('✅ [EMAIL-SERVICE-BASIC] Resposta do Brevo:', brevoResponse);
        console.log('✅ [EMAIL-SERVICE-BASIC] Email enviado com sucesso!');
        return {
            success: true,
            messageId: response.body?.messageId
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error('❌ [EMAIL-SERVICE-BASIC] Erro ao enviar email:', errorMessage);
        console.error('❌ [EMAIL-SERVICE-BASIC] Stack trace:', error);
        return {
            success: false,
            error: errorMessage
        };
    }
}
