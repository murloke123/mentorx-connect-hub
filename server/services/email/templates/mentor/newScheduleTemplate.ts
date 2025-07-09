/**
 * Template de Novo Agendamento
 * Template HTML responsivo para notificar mentor sobre novo agendamento
 */

import { EmailTemplate } from '../../types/emailTypes';

export const newScheduleTemplate: EmailTemplate = {
  subject: 'Novo Agendamento Criado - {{MENTEE_NAME}}',
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
    <title>Novo Agendamento</title>
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
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #48bb78; padding: 40px 30px; text-align: center;">
                            <!--[if mso]>
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td align="center">
                            <![endif]-->
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; line-height: 32px;">
                                🎉 Novo Agendamento!
                            </h1>
                            <p style="color: #e6fffa; font-size: 16px; margin: 10px 0 0 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; line-height: 20px;">
                                Um mentorado agendou uma sessão com você
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
                                Olá, {{MENTOR_NAME}}!
                            </h2>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly;">
                                Você tem um <strong>novo agendamento</strong> criado por <strong>{{MENTEE_NAME}}</strong>!
                            </p>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly;">
                                Por favor, revise os detalhes abaixo e confirme sua disponibilidade. Caso não possa atender neste horário, você pode cancelar o agendamento justificando o motivo.
                            </p>
                            <!--[if mso]>
                                    </td>
                                </tr>
                            </table>
                            <![endif]-->
                            
                            <!-- Appointment Details Box -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0fff4; border-left: 4px solid #48bb78; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; line-height: 22px;">
                                            📅 Detalhes do Novo Agendamento:
                                        </h3>
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; padding: 5px 0;">
                                                    <strong>Mentorado:</strong> {{MENTEE_NAME}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; padding: 5px 0;">
                                                    <strong>Data:</strong> {{APPOINTMENT_DATE}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; padding: 5px 0;">
                                                    <strong>Horário:</strong> {{APPOINTMENT_TIME}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; padding: 5px 0;">
                                                    <strong>Fuso Horário:</strong> {{TIMEZONE}}
                                                </td>
                                            </tr>
                                            {{#if NOTES}}
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; padding: 15px 0 5px 0; border-top: 1px solid #c6f6d5;">
                                                    <strong>Observações:</strong> {{NOTES}}
                                                </td>
                                            </tr>
                                            {{/if}}
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Action Button -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 35px 0;">
                                <tr>
                                    <td align="center">
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{AGENDAMENTOS_URL}}" style="height:50px;v-text-anchor:middle;width:280px;" arcsize="0%" strokecolor="#5a67d8" fillcolor="#5a67d8">
                                            <w:anchorlock/>
                                            <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;">📅 Gerenciar Agendamentos</center>
                                        </v:roundrect>
                                        <![endif]-->
                                        <!--[if !mso]><!-->
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="background-color: #5a67d8; padding: 15px 35px; text-align: center; border: 2px solid #5a67d8;">
                                                    <a href="{{AGENDAMENTOS_URL}}" style="color: #ffffff; text-decoration: none; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; display: block;">
                                                        📅 Gerenciar Agendamentos
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <!--<![endif]-->
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Instructions Section -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-left: 4px solid #667eea; margin: 30px 0;">
                                <tr>
                                    <td style="padding-left: 20px;">
                                        <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; line-height: 22px;">
                                            O que fazer agora:
                                        </h3>
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; padding: 5px 0;">
                                                    1. <strong>Revise o agendamento</strong> - Verifique se o horário está disponível para você
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; padding: 5px 0;">
                                                    2. <strong>Confirme ou cancele</strong> - Se não puder atender, cancele com uma justificativa
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; padding: 5px 0;">
                                                    3. <strong>Prepare-se para a sessão</strong> - Se confirmado, prepare o conteúdo para a mentoria
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Important Notice -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fffbeb; border: 1px solid #fbbf24; margin: 25px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h4 style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0 0 10px 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; line-height: 20px;">
                                            ⚠️ Importante:
                                        </h4>
                                        <p style="color: #92400e; font-size: 14px; line-height: 20px; margin: 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly;">
                                            Se você não conseguir atender no horário agendado, por favor cancele o quanto antes para que o mentorado possa escolher outro horário. Isso ajuda a manter uma boa experiência para todos.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Support Section -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px;">
                            <!--[if mso]>
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td align="center">
                            <![endif]-->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly; line-height: 22px;">
                                            Precisa de ajuda?
                                        </h3>
                                        <p style="color: #4a5568; font-size: 15px; line-height: 22px; margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; mso-line-height-rule: exactly;">
                                            Nossa equipe está sempre disponível para ajudá-lo com qualquer dúvida sobre os agendamentos.
                                        </p>
                                        <a href="{{SUPPORT_URL}}" style="color: #667eea; text-decoration: underline; font-weight: 600; font-size: 15px; font-family: Arial, Helvetica, sans-serif;">
                                            Entrar em contato com o suporte
                                        </a>
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
                                            Este e-mail foi enviado para {{MENTOR_EMAIL}}
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
NOVO AGENDAMENTO

Olá, {{MENTOR_NAME}}!

Você tem um novo agendamento criado por {{MENTEE_NAME}}!

Por favor, revise os detalhes abaixo e confirme sua disponibilidade. Caso não possa atender neste horário, você pode cancelar o agendamento justificando o motivo.

DETALHES DO NOVO AGENDAMENTO:
• Mentorado: {{MENTEE_NAME}}
• Data: {{APPOINTMENT_DATE}}
• Horário: {{APPOINTMENT_TIME}}
• Fuso Horário: {{TIMEZONE}}
{{#if NOTES}}
• Observações: {{NOTES}}
{{/if}}

GERENCIAR AGENDAMENTOS: {{AGENDAMENTOS_URL}}

O QUE FAZER AGORA:
1. Revise o agendamento - Verifique se o horário está disponível para você
2. Confirme ou cancele - Se não puder atender, cancele com uma justificativa
3. Prepare-se para a sessão - Se confirmado, prepare o conteúdo para a mentoria

IMPORTANTE:
Se você não conseguir atender no horário agendado, por favor cancele o quanto antes para que o mentorado possa escolher outro horário. Isso ajuda a manter uma boa experiência para todos.

PRECISA DE AJUDA?
Nossa equipe está sempre disponível para ajudá-lo com qualquer dúvida sobre os agendamentos.
Suporte: {{SUPPORT_URL}}

Este e-mail foi enviado para {{MENTOR_EMAIL}}
© {{CURRENT_YEAR}} Mentora AI. Todos os direitos reservados.
  `
}; 