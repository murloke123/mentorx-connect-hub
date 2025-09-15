"use strict";
/**
 * Serviço de E-mail de Cancelamento de Agendamento
 * Envia e-mail de cancelamento personalizado para mentorados
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enviarEmailCancelamentoAgendamento = enviarEmailCancelamentoAgendamento;
const brevo_1 = __importDefault(require("@getbrevo/brevo"));
const brevoClient_1 = __importStar(require("../../config/brevoClient"));
const calendarCancelTemplate_1 = require("../../templates/mentor/calendarCancelTemplate");
async function enviarEmailCancelamentoAgendamento(data) {
    try {
        console.log('\n🚀 [EMAIL-SERVICE] Iniciando envio de email de cancelamento');
        console.log('🔍 [DEBUG] mentorId recebido:', data.mentorId);
        console.log('🔍 [DEBUG] tipo do mentorId:', typeof data.mentorId);
        // Validar e corrigir mentorId se for undefined/null/vazio
        let validMentorId = data.mentorId;
        if (!validMentorId || validMentorId === 'undefined' || validMentorId === 'null') {
            console.log('⚠️ [WARNING] mentorId inválido, usando fallback');
            validMentorId = 'mentor-generico'; // Fallback para mentor genérico
        }
        // Preparar parâmetros do template
        const templateParams = {
            MENTOR_ID: validMentorId,
            MENTOR_NAME: data.mentorName,
            MENTEE_NAME: data.menteeName,
            MENTEE_EMAIL: data.menteeEmail,
            APPOINTMENT_DATE: data.appointmentDate,
            APPOINTMENT_TIME: data.appointmentTime,
            TIMEZONE: data.timezone,
            CANCELLATION_REASON: data.cancellationReason || '',
            PLATFORM_URL: data.platformUrl,
            SUPPORT_URL: data.supportUrl,
            CURRENT_YEAR: new Date().getFullYear().toString()
        };
        console.log('🔍 [DEBUG] templateParams MENTOR_ID:', templateParams.MENTOR_ID);
        // Substituir variáveis no template
        let htmlContent = calendarCancelTemplate_1.calendarCancelTemplate.htmlContent;
        let textContent = calendarCancelTemplate_1.calendarCancelTemplate.textContent || '';
        let subject = calendarCancelTemplate_1.calendarCancelTemplate.subject;
        // Substituir todas as variáveis
        Object.entries(templateParams).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            console.log(`🔄 [DEBUG] Substituindo ${placeholder} por: ${value}`);
            htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
            textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
            subject = subject.replace(new RegExp(placeholder, 'g'), value);
        });
        // Verificar se o link foi substituído corretamente
        const linkMatch = htmlContent.match(/https:\/\/mentoraai\.com\.br\/mentor\/publicschedule\/([^"\s]+)/);
        console.log('🔗 [DEBUG] Link encontrado no HTML:', linkMatch ? linkMatch[0] : 'Link não encontrado');
        // SEGUNDA CAMADA DE PROTEÇÃO: Forçar substituição de qualquer {{MENTOR_ID}} restante
        htmlContent = htmlContent.replace(/\{\{MENTOR_ID\}\}/g, validMentorId);
        textContent = textContent.replace(/\{\{MENTOR_ID\}\}/g, validMentorId);
        // Verificar se ainda há links com 'undefined'
        if (htmlContent.includes('/undefined') || htmlContent.includes('{{MENTOR_ID}}')) {
            console.log('⚠️ [EMERGENCY FIX] Corrigindo links com undefined/placeholder');
            htmlContent = htmlContent.replace(/\/undefined/g, `/${validMentorId}`);
            htmlContent = htmlContent.replace(/\{\{MENTOR_ID\}\}/g, validMentorId);
        }
        // Tratar condicionais do template
        if (data.cancellationReason) {
            // Manter seção do motivo
            htmlContent = htmlContent.replace(/\{\{#if CANCELLATION_REASON\}\}/g, '');
            htmlContent = htmlContent.replace(/\{\{\/if\}\}/g, '');
            textContent = textContent.replace(/\{\{#if CANCELLATION_REASON\}\}/g, '');
            textContent = textContent.replace(/\{\{\/if\}\}/g, '');
        }
        else {
            // Remover seção do motivo
            htmlContent = htmlContent.replace(/\{\{#if CANCELLATION_REASON\}\}[\s\S]*?\{\{\/if\}\}/g, '');
            textContent = textContent.replace(/\{\{#if CANCELLATION_REASON\}\}[\s\S]*?\{\{\/if\}\}/g, '');
        }
        // Configurar e-mail
        const sendSmtpEmail = new brevo_1.default.SendSmtpEmail();
        sendSmtpEmail.sender = brevoClient_1.emailConfig.sender;
        sendSmtpEmail.to = [{ email: data.menteeEmail, name: data.menteeName }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = htmlContent;
        sendSmtpEmail.textContent = textContent;
        sendSmtpEmail.headers = brevoClient_1.emailConfig.headers;
        sendSmtpEmail.tags = ['cancelamento', 'agendamento', 'mentor'];
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
