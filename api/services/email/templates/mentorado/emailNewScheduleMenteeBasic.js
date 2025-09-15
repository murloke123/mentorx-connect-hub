"use strict";
/**
 * Template BÁSICO de Confirmação de Agendamento para Mentorado
 * Template HTML simples SEM condicionais para testar Template Render Error
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailNewScheduleMenteeBasicTemplate = void 0;
exports.emailNewScheduleMenteeBasicTemplate = {
    subject: 'Agendamento Confirmado - {{MENTOR_NAME}}',
    htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agendamento Confirmado</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px;">
        
        <h1 style="color: #667eea; text-align: center;">Agendamento Confirmado!</h1>
        
        <p>Olá, {{MENTEE_NAME}}!</p>
        
        <p>Sua mentoria com {{MENTOR_NAME}} foi agendada com sucesso.</p>
        
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Mentor:</strong> {{MENTOR_NAME}}</p>
            <p><strong>Data:</strong> {{APPOINTMENT_DATE}}</p>
            <p><strong>Horário:</strong> {{APPOINTMENT_TIME}}</p>
            <p><strong>Fuso Horário:</strong> {{TIMEZONE}}</p>
        </div>
        
        <p><strong>Link da Reunião:</strong></p>
        <p><a href="{{MEET_LINK}}" style="color: #667eea;">{{MEET_LINK}}</a></p>
        
        <p><strong>Observações:</strong> {{NOTES}}</p>
        
        <p style="text-align: center; margin-top: 30px;">
            <a href="{{AGENDAMENTOS_URL}}" style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Gerenciar Agendamentos
            </a>
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
        
        <p style="font-size: 12px; color: #718096; text-align: center;">
            Este e-mail foi enviado para {{MENTEE_EMAIL}}<br>
            © {{CURRENT_YEAR}} Mentora AI. Todos os direitos reservados.
        </p>
    </div>
</body>
</html>
  `,
    textContent: `
AGENDAMENTO CONFIRMADO

Olá, {{MENTEE_NAME}}!

Sua mentoria com {{MENTOR_NAME}} foi agendada com sucesso.

DETALHES:
• Mentor: {{MENTOR_NAME}}
• Data: {{APPOINTMENT_DATE}}
• Horário: {{APPOINTMENT_TIME}}
• Fuso Horário: {{TIMEZONE}}

Link da Reunião: {{MEET_LINK}}

Observações: {{NOTES}}

Gerenciar Agendamentos: {{AGENDAMENTOS_URL}}

Suporte: {{SUPPORT_URL}}

Este e-mail foi enviado para {{MENTEE_EMAIL}}
© {{CURRENT_YEAR}} Mentora AI. Todos os direitos reservados.
  `
};
