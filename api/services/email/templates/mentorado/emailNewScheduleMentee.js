"use strict";
/**
 * Template de Confirmação de Agendamento para Mentorado
 * Template HTML responsivo compatível com Outlook/Hotmail para notificar mentorado sobre confirmação de agendamento
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailNewScheduleMenteeTemplate = void 0;
exports.emailNewScheduleMenteeTemplate = {
    subject: 'Agendamento Confirmado - Sua mentoria com {{MENTOR_NAME}}',
    htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <title>Agendamento Confirmado</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <!--[if mso]>
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
            <td align="center">
    <![endif]-->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; -webkit-border-radius: 8px; -moz-border-radius: 8px;">
                    
                    <!-- Header -->
                    <tr>
                        <!--[if mso]>
                        <td bgcolor="#1a1a1a" style="padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                        <![endif]-->
                        <!--[if !mso]><!-->
                        <td style="background-color: #1a1a1a; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0; -webkit-border-radius: 8px 8px 0 0; -moz-border-radius: 8px 8px 0 0;">
                        <!--<![endif]-->
                            <!--[if mso]>
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td align="center">
                            <![endif]-->
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; line-height: 32px;">
                                ✅ Agendamento Confirmado!
                            </h1>
                            <p style="color: #e6f3ff; font-size: 16px; margin: 10px 0 0 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; line-height: 20px;">
                                Sua mentoria foi agendada com sucesso
                            </p>
                            <!--[if mso]>
                                    </td>
                                </tr>
                            </table>
                            <![endif]-->
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <!--[if mso]>
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td>
                            <![endif]-->
                            <h2 style="color: #2d3748; font-size: 22px; font-weight: 600; margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; line-height: 26px;">
                                Olá, {{MENTEE_NAME}}!
                            </h2>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly;">
                                Parabéns! Sua <strong>mentoria com {{MENTOR_NAME}}</strong> foi agendada com sucesso e está confirmada.
                            </p>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly;">
                                Prepare-se para uma sessão incrível! Abaixo estão todos os detalhes do seu agendamento:
                            </p>
                            <!--[if mso]>
                                    </td>
                                </tr>
                            </table>
                            <![endif]-->
                            
                            <!-- Appointment Details Box -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0f4ff; border-left: 4px solid #667eea; margin: 30px 0; border-radius: 4px; -webkit-border-radius: 4px; -moz-border-radius: 4px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; line-height: 22px;">
                                            📅 Detalhes da Sua Mentoria:
                                        </h3>
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; padding: 5px 0;">
                                                    <strong>👤 Mentor:</strong> {{MENTOR_NAME}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; padding: 5px 0;">
                                                    <strong>📅 Data:</strong> {{APPOINTMENT_DATE}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; padding: 5px 0;">
                                                    <strong>⏰ Horário:</strong> {{APPOINTMENT_TIME}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; padding: 5px 0;">
                                                    <strong>🌍 Fuso Horário:</strong> {{TIMEZONE}}
                                                </td>
                                            </tr>
                                            {{#if NOTES}}
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; padding: 15px 0 5px 0;">
                                                    <strong>📝 Suas Observações:</strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; padding: 5px 0; background-color: #f7fafc; padding: 10px; border-radius: 4px; -webkit-border-radius: 4px; -moz-border-radius: 4px;">
                                                    {{NOTES}}
                                                </td>
                                            </tr>
                                            {{/if}}
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            {{#if MEET_LINK}}
                            <!-- Meeting Link Section -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0fff4; border-left: 4px solid #48bb78; margin: 30px 0; border-radius: 4px; -webkit-border-radius: 4px; -moz-border-radius: 4px;">
                                <tr>
                                    <td style="padding: 25px; text-align: center;">
                                        <h3 style="color: #1a202c; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; line-height: 22px;">
                                            🚀 Link da Reunião
                                        </h3>
                                        <p style="color: #2d3748; font-size: 15px; line-height: 22px; margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly;">
                                            Clique no botão abaixo para entrar na reunião apenas quando estiver no dia e horário agendado:
                                        </p>
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{MEET_LINK}}" style="height:56px;v-text-anchor:middle;width:300px;" arcsize="15%" strokecolor="#1a1a1a" fillcolor="#1a1a1a">
                                            <w:anchorlock/>
                                            <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">▶️ Entrar na Reunião</center>
                                        </v:roundrect>
                                        <![endif]-->
                                        <!--[if !mso]><!-->
                                        <a href="{{MEET_LINK}}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; text-decoration: none; padding: 18px 36px; border-radius: 8px; -webkit-border-radius: 8px; -moz-border-radius: 8px; font-weight: 700; font-size: 16px; font-family: Arial, Helvetica, sans-serif; text-align: center; line-height: 20px; min-width: 220px; box-shadow: 0 4px 12px rgba(26,26,26,0.3); border: 2px solid #1a1a1a; -webkit-text-size-adjust: none; mso-hide: all;">
                                            ▶️ Entrar na Reunião
                                        </a>
                                        <!--<![endif]-->
                                        <p style="color: #718096; font-size: 13px; line-height: 18px; margin: 15px 0 0 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly;">
                                            Ou copie e cole este link no seu navegador:<br>
                                            <span style="word-break: break-all; color: #667eea;">{{MEET_LINK}}</span>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            {{/if}}
                            
                            <!--[if mso]>
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td>
                            <![endif]-->
                            
                            <!-- Tips Section -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fffaf0; border: 1px solid #fed7aa; margin: 30px 0; border-radius: 4px; -webkit-border-radius: 4px; -moz-border-radius: 4px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <h3 style="color: #9c4221; font-size: 16px; font-weight: 600; margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; line-height: 20px;">
                                            💡 Dicas para uma mentoria produtiva:
                                        </h3>
                                        <ul style="color: #92400e; font-size: 14px; line-height: 20px; margin: 0; padding-left: 20px; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly;">
                                            <li style="margin-bottom: 8px;">Prepare suas dúvidas e objetivos com antecedência</li>
                                            <li style="margin-bottom: 8px;">Teste sua conexão de internet e áudio antes da reunião</li>
                                            <li style="margin-bottom: 8px;">Tenha papel e caneta para anotações importantes</li>
                                            <li style="margin-bottom: 0;">Seja pontual - chegue alguns minutos antes do horário</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>
                            <!--[if mso]>
                                    </td>
                                </tr>
                            </table>
                            <![endif]-->
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <p style="color: #a0aec0; font-size: 13px; margin: 0 0 10px 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; line-height: 16px;">
                                            Este e-mail foi enviado para {{MENTEE_EMAIL}}
                                        </p>
                                        <p style="color: #a0aec0; font-size: 13px; margin: 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; line-height: 16px;">
                                            © {{CURRENT_YEAR}} Mentora AI. Todos os direitos reservados.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <!--[if mso]>
            </td>
        </tr>
    </table>
    <![endif]-->
</body>
</html>
  `,
    textContent: `
AGENDAMENTO CONFIRMADO

Olá, {{MENTEE_NAME}}!

Parabéns! Sua mentoria com {{MENTOR_NAME}} foi agendada com sucesso e está confirmada.

Prepare-se para uma sessão incrível! Abaixo estão todos os detalhes do seu agendamento:

DETALHES DA SUA MENTORIA:
• Mentor: {{MENTOR_NAME}}
• Data: {{APPOINTMENT_DATE}}
• Horário: {{APPOINTMENT_TIME}}
• Fuso Horário: {{TIMEZONE}}
{{#if NOTES}}
• Suas Observações: {{NOTES}}
{{/if}}
{{#if MEET_LINK}}
• Link da Reunião: {{MEET_LINK}}
{{/if}}

GERENCIAR MEUS AGENDAMENTOS: {{AGENDAMENTOS_URL}}

DICAS PARA UMA MENTORIA PRODUTIVA:
• Prepare suas dúvidas e objetivos com antecedência
• Teste sua conexão de internet e áudio antes da reunião
• Tenha papel e caneta para anotações importantes
• Seja pontual - chegue alguns minutos antes do horário

PRECISA DE AJUDA?
Se você tiver qualquer dúvida ou precisar alterar seu agendamento, nossa equipe está sempre pronta para ajudar.
Suporte: {{SUPPORT_URL}}

Este e-mail foi enviado para {{MENTEE_EMAIL}}
© {{CURRENT_YEAR}} Mentora AI. Todos os direitos reservados.
  `
};
