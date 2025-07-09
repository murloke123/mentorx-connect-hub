/**
 * Template de Novo Agendamento
 * Template HTML responsivo para notificar mentor sobre novo agendamento
 */

import { EmailTemplate } from '../../types/emailTypes';

export const newScheduleTemplate: EmailTemplate = {
  subject: '📅 Novo Agendamento Criado - {{MENTEE_NAME}}',
  htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novo Agendamento</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                📅 Novo Agendamento!
                            </h1>
                            <p style="color: #c6f6d5; font-size: 16px; margin: 10px 0 0 0;">
                                Um mentorado agendou uma sessão com você
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #2d3748; font-size: 22px; font-weight: 600; margin: 0 0 20px 0;">
                                Olá, {{MENTOR_NAME}}! 👋
                            </h2>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Você tem um <strong>novo agendamento</strong> criado por <strong>{{MENTEE_NAME}}</strong>!
                            </p>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Por favor, revise os detalhes abaixo e confirme sua disponibilidade. Caso não possa atender neste horário, você pode cancelar o agendamento justificando o motivo.
                            </p>
                            
                            <!-- Appointment Details Box -->
                            <div style="background-color: #f0fff4; border-radius: 8px; padding: 25px; margin: 30px 0; border-left: 4px solid #48bb78;">
                                <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                    📋 Detalhes do Novo Agendamento:
                                </h3>
                                <div style="color: #4a5568; font-size: 15px; line-height: 1.8;">
                                    <p style="margin: 0 0 10px 0;"><strong>👨‍🎓 Mentorado:</strong> {{MENTEE_NAME}}</p>
                                    <p style="margin: 0 0 10px 0;"><strong>📅 Data:</strong> {{APPOINTMENT_DATE}}</p>
                                    <p style="margin: 0 0 10px 0;"><strong>🕒 Horário:</strong> {{APPOINTMENT_TIME}}</p>
                                    <p style="margin: 0 0 10px 0;"><strong>🌍 Fuso Horário:</strong> {{TIMEZONE}}</p>
                                    {{#if NOTES}}
                                    <p style="margin: 0; padding-top: 10px; border-top: 1px solid #c6f6d5;"><strong>📝 Observações:</strong> {{NOTES}}</p>
                                    {{/if}}
                                </div>
                            </div>
                            
                            <!-- Action Buttons -->
                            <div style="text-align: center; margin: 35px 0;">
                                <a href="{{AGENDAMENTOS_URL}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 15px 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3); transition: all 0.3s ease; margin: 0 10px;">
                                    ✅ Gerenciar Agendamentos
                                </a>
                            </div>
                            
                            <!-- Instructions Section -->
                            <div style="border-left: 4px solid #667eea; padding-left: 20px; margin: 30px 0;">
                                <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                    📝 O que fazer agora:
                                </h3>
                                <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                                    1. <strong>Revise o agendamento</strong> - Verifique se o horário está disponível para você
                                </p>
                                <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                                    2. <strong>Confirme ou cancele</strong> - Se não puder atender, cancele com uma justificativa
                                </p>
                                <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0;">
                                    3. <strong>Prepare-se para a sessão</strong> - Se confirmado, prepare o conteúdo para a mentoria
                                </p>
                            </div>
                            
                            <!-- Important Notice -->
                            <div style="background-color: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                <h4 style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">
                                    ⚠️ Importante:
                                </h4>
                                <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin: 0;">
                                    Se você não conseguir atender no horário agendado, por favor cancele o quanto antes para que o mentorado possa escolher outro horário. Isso ajuda a manter uma boa experiência para todos.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Support Section -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
                            <div style="text-align: center;">
                                <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                    💬 Precisa de ajuda?
                                </h3>
                                <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                                    Nossa equipe está sempre disponível para ajudá-lo com qualquer dúvida sobre os agendamentos.
                                </p>
                                <a href="{{SUPPORT_URL}}" style="color: #667eea; text-decoration: none; font-weight: 600; font-size: 15px;">
                                    📧 Entrar em contato com o suporte
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #a0aec0; font-size: 13px; margin: 0 0 10px 0;">
                                Este e-mail foi enviado para {{MENTOR_EMAIL}}
                            </p>
                            <p style="color: #a0aec0; font-size: 13px; margin: 0;">
                                © {{CURRENT_YEAR}} Mentora AI. Todos os direitos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `,
  textContent: `
📅 Novo Agendamento!

Olá, {{MENTOR_NAME}}!

Você tem um novo agendamento criado por {{MENTEE_NAME}}!

Por favor, revise os detalhes abaixo e confirme sua disponibilidade. Caso não possa atender neste horário, você pode cancelar o agendamento justificando o motivo.

📋 Detalhes do Novo Agendamento:
• Mentorado: {{MENTEE_NAME}}
• Data: {{APPOINTMENT_DATE}}
• Horário: {{APPOINTMENT_TIME}}
• Fuso Horário: {{TIMEZONE}}
{{#if NOTES}}
• Observações: {{NOTES}}
{{/if}}

✅ Gerenciar Agendamentos: {{AGENDAMENTOS_URL}}

📝 O que fazer agora:
1. Revise o agendamento - Verifique se o horário está disponível para você
2. Confirme ou cancele - Se não puder atender, cancele com uma justificativa
3. Prepare-se para a sessão - Se confirmado, prepare o conteúdo para a mentoria

⚠️ Importante:
Se você não conseguir atender no horário agendado, por favor cancele o quanto antes para que o mentorado possa escolher outro horário. Isso ajuda a manter uma boa experiência para todos.

💬 Precisa de ajuda?
Nossa equipe está sempre disponível para ajudá-lo com qualquer dúvida sobre os agendamentos.
Suporte: {{SUPPORT_URL}}

Este e-mail foi enviado para {{MENTOR_EMAIL}}
© {{CURRENT_YEAR}} Mentora AI. Todos os direitos reservados.
  `
}; 