"use strict";
/**
 * Serviço de E-mail de Novo Agendamento
 * Envia e-mail de notificação para mentores quando um novo agendamento é criado
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
exports.enviarEmailNovoAgendamento = enviarEmailNovoAgendamento;
const brevo = __importStar(require("@getbrevo/brevo"));
const brevoClient_1 = __importStar(require("../../config/brevoClient"));
const newScheduleTemplate_1 = require("../../templates/mentor/newScheduleTemplate");
async function enviarEmailNovoAgendamento(data) {
    try {
        console.log('\n🚀 [EMAIL-SERVICE] Iniciando envio de email de novo agendamento');
        // Preparar parâmetros do template
        const templateParams = {
            MENTOR_NAME: data.mentorName,
            MENTOR_EMAIL: data.mentorEmail,
            MENTEE_NAME: data.menteeName,
            APPOINTMENT_DATE: data.appointmentDate,
            APPOINTMENT_TIME: data.appointmentTime,
            TIMEZONE: data.timezone,
            NOTES: data.notes || '',
            MEET_LINK: data.meetLink || '',
            AGENDAMENTOS_URL: data.agendamentosUrl,
            SUPPORT_URL: data.supportUrl,
            CURRENT_YEAR: new Date().getFullYear().toString()
        };
        // Substituir variáveis no template
        let htmlContent = newScheduleTemplate_1.newScheduleTemplate.htmlContent;
        let textContent = newScheduleTemplate_1.newScheduleTemplate.textContent || '';
        let subject = newScheduleTemplate_1.newScheduleTemplate.subject;
        // Substituir todas as variáveis
        Object.entries(templateParams).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
            textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
            subject = subject.replace(new RegExp(placeholder, 'g'), value);
        });
        // Tratar condicionais do template
        if (data.notes && data.notes.trim()) {
            // Manter seção das observações
            htmlContent = htmlContent.replace(/\{\{#if NOTES\}\}/g, '');
            htmlContent = htmlContent.replace(/\{\{\/if\}\}/g, '');
            textContent = textContent.replace(/\{\{#if NOTES\}\}/g, '');
            textContent = textContent.replace(/\{\{\/if\}\}/g, '');
        }
        else {
            // Remover seção das observações
            htmlContent = htmlContent.replace(/\{\{#if NOTES\}\}[\s\S]*?\{\{\/if\}\}/g, '');
            textContent = textContent.replace(/\{\{#if NOTES\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }
        // Tratar condicional do Meet Link
        if (data.meetLink && data.meetLink.trim()) {
            // Manter seção do Meet Link
            htmlContent = htmlContent.replace(/\{\{#if MEET_LINK\}\}/g, '');
            htmlContent = htmlContent.replace(/\{\{\/if\}\}/g, '');
            textContent = textContent.replace(/\{\{#if MEET_LINK\}\}/g, '');
            textContent = textContent.replace(/\{\{\/if\}\}/g, '');
        }
        else {
            // Remover seção do Meet Link
            htmlContent = htmlContent.replace(/\{\{#if MEET_LINK\}\}[\s\S]*?\{\{\/if\}\}/g, '');
            textContent = textContent.replace(/\{\{#if MEET_LINK\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }
        // Configurar e-mail
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.sender = brevoClient_1.emailConfig.sender;
        sendSmtpEmail.to = [{ email: data.mentorEmail, name: data.mentorName }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = htmlContent;
        sendSmtpEmail.textContent = textContent;
        sendSmtpEmail.headers = brevoClient_1.emailConfig.headers;
        sendSmtpEmail.tags = ['novo-agendamento', 'mentor', 'notificacao'];
        // Log do payload que será enviado para o Brevo
        const brevoPayload = {
            sender: sendSmtpEmail.sender,
            to: sendSmtpEmail.to,
            subject: sendSmtpEmail.subject,
            headers: sendSmtpEmail.headers,
            tags: sendSmtpEmail.tags,
            htmlContent: '[HTML CONTENT]',
            textContent: '[TEXT CONTENT]'
        };
        console.log('\n📤 [BREVO-API] Payload enviado:', JSON.stringify(brevoPayload, null, 2));
        // Enviar e-mail
        const response = await brevoClient_1.default.sendTransacEmail(sendSmtpEmail);
        // Log da resposta do Brevo
        const brevoResponse = {
            statusCode: response.response?.statusCode,
            statusMessage: response.response?.statusMessage,
            messageId: response.body?.messageId,
            timestamp: new Date().toISOString()
        };
        console.log('\n📥 [BREVO-API] Resposta recebida:', JSON.stringify(brevoResponse, null, 2));
        return {
            success: true,
            messageId: response.body?.messageId || 'sem-id'
        };
    }
    catch (error) {
        console.error('\n❌ [EMAIL-SERVICE] Erro no envio:', error);
        // Log de erro detalhado se for erro da API Brevo
        if (error && typeof error === 'object' && 'response' in error) {
            const apiError = error;
            const errorDetails = {
                status: apiError.response?.status,
                statusText: apiError.response?.statusText,
                data: apiError.response?.data,
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            };
            console.error('\n❌ [BREVO-API] Erro detalhado:', JSON.stringify(errorDetails, null, 2));
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar e-mail'
        };
    }
}
