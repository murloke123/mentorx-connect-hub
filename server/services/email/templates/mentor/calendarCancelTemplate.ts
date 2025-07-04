/**
 * Template de Cancelamento de Agendamento
 * Template HTML responsivo para e-mail de cancelamento de agendamento
 */

import { EmailTemplate } from '../../types/emailTypes';

export const calendarCancelTemplate: EmailTemplate = {
  subject: '📅 Agendamento Cancelado - {{MENTOR_NAME}}',
  htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agendamento Cancelado</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                📅 Agendamento Cancelado
                            </h1>
                            <p style="color: #fed7d7; font-size: 16px; margin: 10px 0 0 0;">
                                Informações sobre o cancelamento
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #2d3748; font-size: 22px; font-weight: 600; margin: 0 0 20px 0;">
                                Olá, {{MENTEE_NAME}}! 👋
                            </h2>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Lamentamos informar que seu agendamento com <strong>{{MENTOR_NAME}}</strong> foi cancelado.
                            </p>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Pedimos sinceras desculpas pelo inconveniente e esperamos que você possa reagendar em breve.
                            </p>
                            
                            <!-- Appointment Details Box -->
                            <div style="background-color: #f7fafc; border-radius: 8px; padding: 25px; margin: 30px 0; border-left: 4px solid #e53e3e;">
                                <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                    📋 Detalhes do Agendamento Cancelado:
                                </h3>
                                <div style="color: #4a5568; font-size: 15px; line-height: 1.8;">
                                    <p style="margin: 0 0 10px 0;"><strong>👨‍🏫 Mentor:</strong> {{MENTOR_NAME}}</p>
                                    <p style="margin: 0 0 10px 0;"><strong>📅 Data:</strong> {{APPOINTMENT_DATE}}</p>
                                    <p style="margin: 0 0 10px 0;"><strong>🕒 Horário:</strong> {{APPOINTMENT_TIME}}</p>
                                    <p style="margin: 0 0 10px 0;"><strong>🌍 Fuso Horário:</strong> {{TIMEZONE}}</p>
                                    {{#if CANCELLATION_REASON}}
                                    <p style="margin: 0; padding-top: 10px; border-top: 1px solid #e2e8f0;"><strong>📝 Motivo:</strong> {{CANCELLATION_REASON}}</p>
                                    {{/if}}
                                </div>
                            </div>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 35px 0;">
                                <a href="{{PLATFORM_URL}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 15px 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;">
                                    🔄 Reagendar na Mentora AI
                                </a>
                            </div>
                            
                            <!-- Support Section -->
                            <div style="border-left: 4px solid #667eea; padding-left: 20px; margin: 30px 0;">
                                <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                    💡 Próximos passos:
                                </h3>
                                <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                                    1. <strong>Reagende quando quiser</strong> - Acesse a plataforma e escolha um novo horário
                                </p>
                                <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                                    2. <strong>Explore outros mentores</strong> - Encontre outros profissionais na sua área
                                </p>
                                <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0;">
                                    3. <strong>Entre em contato</strong> - Nossa equipe está aqui para ajudar
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
                                    Nossa equipe está sempre pronta para ajudar você a encontrar o mentor ideal.
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
                                Este e-mail foi enviado para {{MENTEE_EMAIL}}
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
📅 Agendamento Cancelado

Olá, {{MENTEE_NAME}}!

Lamentamos informar que seu agendamento com {{MENTOR_NAME}} foi cancelado.

Pedimos sinceras desculpas pelo inconveniente e esperamos que você possa reagendar em breve.

📋 Detalhes do Agendamento Cancelado:
• Mentor: {{MENTOR_NAME}}
• Data: {{APPOINTMENT_DATE}}
• Horário: {{APPOINTMENT_TIME}}
• Fuso Horário: {{TIMEZONE}}
{{#if CANCELLATION_REASON}}
• Motivo: {{CANCELLATION_REASON}}
{{/if}}

🔄 Reagendar na Mentora AI: {{PLATFORM_URL}}

💡 Próximos passos:
1. Reagende quando quiser - Acesse a plataforma e escolha um novo horário
2. Explore outros mentores - Encontre outros profissionais na sua área
3. Entre em contato - Nossa equipe está aqui para ajudar

💬 Precisa de ajuda?
Nossa equipe está sempre pronta para ajudar você a encontrar o mentor ideal.
Suporte: {{SUPPORT_URL}}

Este e-mail foi enviado para {{MENTEE_EMAIL}}
© {{CURRENT_YEAR}} Mentora AI. Todos os direitos reservados.
  `
}; 