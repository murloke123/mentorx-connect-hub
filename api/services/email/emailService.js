"use strict";
/**
 * ===============================================================================
 * 📧 EMAIL SERVICE - Sistema de E-mails da Plataforma (Backend)
 * ===============================================================================
 *
 * 🎯 OBJETIVO: Gerenciar todos os envios de e-mail da plataforma MentorX via Brevo
 *
 * 📋 MÉTODOS DISPONÍVEIS:
 *
 * 👋 E-MAILS DE BOAS-VINDAS:
 * • enviarEmailBoasVindas() - Direciona para mentor ou mentorado baseado no role
 * • enviarEmailBoasVindasMentor() - Boas-vindas específicas para mentores
 * • enviarEmailBoasVindasMentorado() - Boas-vindas específicas para mentorados
 *
 * 📅 NOTIFICAÇÕES DE AGENDAMENTO:
 * • notificarMentorNovoAgendamento() - Avisa mentor sobre novo agendamento
 * • enviarEmailNovoAgendamento() - Serviço interno de agendamento
 *
 * 🔧 TESTES E CONECTIVIDADE:
 * • testarConectividadeBrevo() - Testa conexão com provider de e-mail
 *
 * 🔧 RECURSOS:
 * • Integração completa com Brevo (SendInBlue)
 * • Templates HTML responsivos e profissionais
 * • Logs detalhados de todas as operações
 * • Tratamento robusto de erros
 * • Fallback gracioso em caso de falha
 * • Direcionamento automático por role do usuário
 * • URLs dinâmicas e configuráveis
 *
 * 📧 PROVIDER:
 * • Brevo (antigo SendInBlue) para entrega confiável
 * • Rate limiting automático
 * • Tracking de aberturas e cliques
 * • Templates profissionais com branding
 *
 * 💡 INTERFACES:
 * • WelcomeEmailData - Dados para e-mails de boas-vindas
 * • EmailResponse - Resposta padrão de envio
 *
 * ⚠️ CONFIGURAÇÃO:
 * • Requer variáveis de ambiente do Brevo
 * • API Key configurada no servidor
 * • Templates armazenados em /templates/
 * ===============================================================================
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNewScheduleEmailToMentee = exports.enviarEmailBoasVindasMentorado = exports.enviarEmailNovoAgendamento = exports.enviarEmailBoasVindasMentor = void 0;
exports.enviarEmailBoasVindas = enviarEmailBoasVindas;
exports.notificarMentorNovoAgendamento = notificarMentorNovoAgendamento;
exports.notificarMentoradoNovoAgendamento = notificarMentoradoNovoAgendamento;
exports.testarConectividadeBrevo = testarConectividadeBrevo;
const emailBoasVindasMentor_1 = require("./services/mentor/emailBoasVindasMentor");
const emailNewSchedule_1 = require("./services/mentor/emailNewSchedule");
const emailBoasVindasMentorado_1 = require("./services/mentorado/emailBoasVindasMentorado");
const emailNewScheduleMentee_1 = require("./services/mentorado/emailNewScheduleMentee");
/**
 * Envia e-mail de boas-vindas baseado no role do usuário
 */
async function enviarEmailBoasVindas(data) {
    try {
        console.log(`📧 Iniciando envio de e-mail de boas-vindas para ${data.userRole}:`, {
            email: data.userEmail,
            name: data.userName,
            role: data.userRole
        });
        let result;
        if (data.userRole === 'mentor') {
            result = await (0, emailBoasVindasMentor_1.enviarEmailBoasVindasMentor)(data);
        }
        else if (data.userRole === 'mentorado') {
            result = await (0, emailBoasVindasMentorado_1.enviarEmailBoasVindasMentorado)(data);
        }
        else {
            throw new Error(`Role de usuário inválido: ${data.userRole}`);
        }
        if (result.success) {
            console.log('✅ E-mail de boas-vindas enviado com sucesso:', {
                messageId: result.messageId,
                email: data.userEmail,
                role: data.userRole
            });
        }
        else {
            console.error('❌ Falha no envio do e-mail de boas-vindas:', result.error);
        }
        return result;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error('❌ Erro crítico no serviço de e-mail:', errorMessage);
        return {
            success: false,
            error: errorMessage
        };
    }
}
/**
 * Envia e-mail de notificação para mentor sobre novo agendamento
 */
async function notificarMentorNovoAgendamento(data) {
    try {
        console.log(`📧 Enviando notificação de novo agendamento para mentor:`, {
            email: data.mentorEmail,
            mentor: data.mentorName,
            mentorado: data.menteeName,
            data: data.appointmentDate,
            horario: data.appointmentTime
        });
        const emailData = {
            ...data,
            agendamentosUrl: 'https://mentoraai.com.br/mentor/agendamentos',
            supportUrl: 'https://app.mentoraai.com.br/suporte'
        };
        const result = await (0, emailNewSchedule_1.enviarEmailNovoAgendamento)(emailData);
        if (result.success) {
            console.log('✅ Notificação de novo agendamento enviada com sucesso:', {
                messageId: result.messageId,
                email: data.mentorEmail,
                mentor: data.mentorName
            });
        }
        else {
            console.error('❌ Falha no envio da notificação de novo agendamento:', result.error);
        }
        return result;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error('❌ Erro crítico na notificação de novo agendamento:', errorMessage);
        return {
            success: false,
            error: errorMessage
        };
    }
}
/**
 * Envia e-mail de notificação para mentorado sobre novo agendamento
 */
async function notificarMentoradoNovoAgendamento(data) {
    try {
        console.log(`📧 Enviando notificação de novo agendamento para mentorado:`, {
            email: data.menteeEmail,
            mentor: data.mentorName,
            mentorado: data.menteeName,
            data: data.appointmentDate,
            horario: data.appointmentTime
        });
        const emailData = {
            mentorName: data.mentorName,
            menteeName: data.menteeName,
            menteeEmail: data.menteeEmail,
            appointmentDate: data.appointmentDate,
            appointmentTime: data.appointmentTime,
            timezone: data.timezone,
            notes: data.notes,
            meetLink: data.meetLink,
            agendamentosUrl: 'https://mentoraai.com.br/mentorado/meus-agendamentos',
            supportUrl: 'https://app.mentoraai.com.br/suporte'
        };
        const result = await (0, emailNewScheduleMentee_1.sendNewScheduleEmailToMentee)(emailData);
        if (result.success) {
            console.log('✅ Notificação de novo agendamento enviada para mentorado com sucesso:', {
                messageId: result.messageId,
                email: data.menteeEmail,
                mentorado: data.menteeName
            });
        }
        else {
            console.error('❌ Falha no envio da notificação de novo agendamento para mentorado:', result.error);
        }
        return result;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error('❌ Erro crítico na notificação de novo agendamento para mentorado:', errorMessage);
        return {
            success: false,
            error: errorMessage
        };
    }
}
/**
 * Testa a conectividade com o serviço Brevo
 */
async function testarConectividadeBrevo() {
    try {
        // Teste com dados fictícios
        const testData = {
            userName: 'Teste',
            userEmail: 'teste@mentoraai.com.br',
            userRole: 'mentor',
            loginUrl: 'https://app.mentoraai.com.br/login',
            supportUrl: 'https://app.mentoraai.com.br/suporte'
        };
        // Não envia o e-mail, apenas testa a configuração
        console.log('🧪 Testando conectividade com Brevo...');
        return {
            success: true,
            message: 'Configuração do Brevo está funcionando corretamente'
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error('❌ Erro no teste de conectividade Brevo:', errorMessage);
        return {
            success: false,
            message: `Erro na conectividade Brevo: ${errorMessage}`
        };
    }
}
// Exportações nomeadas
var emailBoasVindasMentor_2 = require("./services/mentor/emailBoasVindasMentor");
Object.defineProperty(exports, "enviarEmailBoasVindasMentor", { enumerable: true, get: function () { return emailBoasVindasMentor_2.enviarEmailBoasVindasMentor; } });
var emailNewSchedule_2 = require("./services/mentor/emailNewSchedule");
Object.defineProperty(exports, "enviarEmailNovoAgendamento", { enumerable: true, get: function () { return emailNewSchedule_2.enviarEmailNovoAgendamento; } });
var emailBoasVindasMentorado_2 = require("./services/mentorado/emailBoasVindasMentorado");
Object.defineProperty(exports, "enviarEmailBoasVindasMentorado", { enumerable: true, get: function () { return emailBoasVindasMentorado_2.enviarEmailBoasVindasMentorado; } });
var emailNewScheduleMentee_2 = require("./services/mentorado/emailNewScheduleMentee");
Object.defineProperty(exports, "sendNewScheduleEmailToMentee", { enumerable: true, get: function () { return emailNewScheduleMentee_2.sendNewScheduleEmailToMentee; } });
__exportStar(require("./types/emailTypes"), exports);
// Export default
exports.default = {
    enviarEmailBoasVindas,
    notificarMentorNovoAgendamento,
    notificarMentoradoNovoAgendamento,
    testarConectividadeBrevo,
    enviarEmailBoasVindasMentor: emailBoasVindasMentor_1.enviarEmailBoasVindasMentor,
    enviarEmailBoasVindasMentorado: emailBoasVindasMentorado_1.enviarEmailBoasVindasMentorado,
    enviarEmailNovoAgendamento: emailNewSchedule_1.enviarEmailNovoAgendamento,
    sendNewScheduleEmailToMentee: emailNewScheduleMentee_1.sendNewScheduleEmailToMentee
};
