/**
 * Template de Mensagem para Mentor
 * Template HTML responsivo para e-mail de contato enviado para o mentor
 */

import { EmailTemplate } from '../../types/emailTypes';

export const emailSendToMentorTemplate: EmailTemplate = {
  subject: '📩 Nova mensagem de {{SENDER_NAME}} - Mentora AI',
  htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova Mensagem - Mentora AI</title>
    <!--[if mso]>
    <style type="text/css">
        table { border-collapse: collapse; }
        .outlook-gradient { background-color: #6366f1 !important; }
        .outlook-button { background-color: #6366f1 !important; }
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td class="outlook-gradient" style="background-color: #6366f1; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0;">
                                📩 Nova Mensagem
                            </h1>
                            <p style="color: #ffffff; font-size: 16px; margin: 10px 0 0 0; opacity: 0.9;">
                                Alguém entrou em contato com você
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 20px 0;">
                                Olá, {{MENTOR_NAME}}! 👋
                            </h2>
                            
                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Você recebeu uma nova mensagem através da sua página de perfil na <strong>Mentora AI</strong>.
                            </p>
                            
                            <!-- Message Details Box -->
                            <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin: 30px 0; border-left: 4px solid #6366f1;">
                                <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">
                                    📋 Detalhes da Mensagem:
                                </h3>
                                
                                <div style="margin-bottom: 15px;">
                                    <strong style="color: #1f2937; font-size: 15px;">👤 Nome:</strong>
                                    <span style="color: #374151; font-size: 15px; margin-left: 10px;">{{SENDER_NAME}}</span>
                                </div>
                                
                                <div style="margin-bottom: 15px;">
                                    <strong style="color: #1f2937; font-size: 15px;">📧 E-mail:</strong>
                                    <span style="color: #374151; font-size: 15px; margin-left: 10px;">{{SENDER_EMAIL}}</span>
                                </div>
                                
                                <div style="margin-bottom: 20px;">
                                    <strong style="color: #1f2937; font-size: 15px;">📅 Data:</strong>
                                    <span style="color: #374151; font-size: 15px; margin-left: 10px;">{{MESSAGE_DATE}}</span>
                                </div>
                                
                                <div>
                                    <strong style="color: #1f2937; font-size: 15px; display: block; margin-bottom: 10px;">💬 Mensagem:</strong>
                                    <div style="background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 6px; padding: 15px; color: #374151; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">{{MESSAGE_CONTENT}}</div>
                                </div>
                            </div>
                            
                            <!-- Response Instructions -->
                            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 25px; margin: 30px 0;">
                                <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                    💡 Como responder:
                                </h3>
                                <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">
                                    Para responder a esta mensagem, você pode:
                                </p>
                                <ul style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                                    <li style="margin-bottom: 8px;">📧 Responder diretamente para o e-mail: <strong>{{SENDER_EMAIL}}</strong></li>
                                    <li style="margin-bottom: 8px;">🔗 Acessar sua conta na Mentora AI para gerenciar contatos</li>
                                    <li style="margin-bottom: 8px;">📱 Entrar em contato através de outros canais se disponíveis</li>
                                </ul>
                            </div>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 35px 0;">
                                <!--[if mso]>
                                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://mentoraai.com.br" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="16%" stroke="f" fillcolor="#6366f1">
                                <w:anchorlock/>
                                <center style="color:#ffffff;font-family:Arial;font-size:16px;font-weight:bold;">🎯 Acessar Plataforma</center>
                                </v:roundrect>
                                <![endif]-->
                                <!--[if !mso]><!-->
                                <a href="https://mentoraai.com.br" class="outlook-button" style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 15px 30px; border-radius: 8px; font-family: Arial, sans-serif;">
                                    🎯 Acessar Plataforma
                                </a>
                                <!--<![endif]-->
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; font-size: 13px; margin: 0 0 10px 0;">
                                Este e-mail foi enviado para {{MENTOR_EMAIL}} através da Mentora AI
                            </p>
                            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
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
📩 Nova Mensagem - Mentora AI

Olá, {{MENTOR_NAME}}!

Você recebeu uma nova mensagem através da sua página de perfil na Mentora AI.

📋 Detalhes da Mensagem:
👤 Nome: {{SENDER_NAME}}
📧 E-mail: {{SENDER_EMAIL}}
📅 Data: {{MESSAGE_DATE}}

💬 Mensagem:
{{MESSAGE_CONTENT}}

💡 Como responder:
Para responder a esta mensagem, você pode:
• Responder diretamente para o e-mail: {{SENDER_EMAIL}}
• Acessar sua conta na Mentora AI para gerenciar contatos
• Entrar em contato através de outros canais se disponíveis

🎯 Acesse a plataforma: https://mentoraai.com.br

Este e-mail foi enviado para {{MENTOR_EMAIL}} através da Mentora AI
© {{CURRENT_YEAR}} Mentora AI. Todos os direitos reservados.
  `
};