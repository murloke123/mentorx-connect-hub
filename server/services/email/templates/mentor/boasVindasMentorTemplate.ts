/**
 * Template de Boas-Vindas para Mentores
 * Template HTML responsivo para e-mail de boas-vindas de mentores
 */

import { EmailTemplate } from '../../types/emailTypes';

export const boasVindasMentorTemplate: EmailTemplate = {
  subject: '🎉 Bem-vindo(a) à Mentora AI - Sua jornada como mentor começa agora!',
  htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Bem-vindo à Mentora AI</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <!--[if gte mso 9]>
    <style>
        table {border-collapse: collapse;}
        .outlook-fallback {mso-hide: all;}
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #667eea; padding: 40px 30px; text-align: center;">
                            <!--[if gte mso 9]>
                            <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:540px;height:120px;">
                                <v:fill type="gradient" color="#667eea" color2="#764ba2" angle="135" />
                                <v:textbox inset="0,0,0,0">
                            <![endif]-->
                            <div style="color: #ffffff;">
                                <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 32px;">
                                    🎉 Bem-vindo à Mentora AI!
                                </h1>
                                <p style="color: #ffffff; font-size: 16px; margin: 10px 0 0 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 20px;">
                                    Sua jornada como mentor começa agora
                                </p>
                            </div>
                            <!--[if gte mso 9]>
                                </v:textbox>
                            </v:rect>
                            <![endif]-->
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #2d3748; font-size: 22px; font-weight: 600; margin: 0 0 20px 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 26px;">
                                Olá, {{NOME_USUARIO}}! 👋
                            </h2>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 20px 0; padding: 0; font-family: Arial, Helvetica, sans-serif;">
                                É com grande alegria que damos as boas-vindas à <strong>Mentora AI</strong>, a plataforma que conecta conhecimento e transforma vidas através da mentoria.
                            </p>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; padding: 0; font-family: Arial, Helvetica, sans-serif;">
                                Como <strong>mentor</strong>, você tem o poder de impactar positivamente a carreira e vida de outras pessoas. Sua experiência e conhecimento são valiosos e podem fazer toda a diferença na jornada de quem busca crescimento.
                            </p>
                            
                            <!-- Features Box -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f7fafc; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 22px;">
                                            🚀 O que você pode fazer na plataforma:
                                        </h3>
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                            <tr><td style="color: #4a5568; font-size: 15px; line-height: 24px; padding: 4px 0; font-family: Arial, Helvetica, sans-serif;">📚 Criar e vender cursos online</td></tr>
                                            <tr><td style="color: #4a5568; font-size: 15px; line-height: 24px; padding: 4px 0; font-family: Arial, Helvetica, sans-serif;">👥 Conectar-se com mentorados interessados</td></tr>
                                            <tr><td style="color: #4a5568; font-size: 15px; line-height: 24px; padding: 4px 0; font-family: Arial, Helvetica, sans-serif;">💰 Monetizar seu conhecimento</td></tr>
                                            <tr><td style="color: #4a5568; font-size: 15px; line-height: 24px; padding: 4px 0; font-family: Arial, Helvetica, sans-serif;">📊 Acompanhar seu progresso e receitas</td></tr>
                                            <tr><td style="color: #4a5568; font-size: 15px; line-height: 24px; padding: 4px 0; font-family: Arial, Helvetica, sans-serif;">🎯 Construir sua marca pessoal</td></tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; margin: 35px 0;">
                                <tr>
                                    <td align="center" style="padding: 0;">
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{URL_LOGIN}}" style="height:50px;v-text-anchor:middle;width:250px;" arcsize="16%" stroke="f" fillcolor="#667eea">
                                            <w:anchorlock/>
                                            <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">🎯 Acessar Minha Conta</center>
                                        </v:roundrect>
                                        <![endif]-->
                                        <!--[if !mso]><!-->
                                        <a href="{{URL_LOGIN}}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 15px 30px; font-family: Arial, Helvetica, sans-serif; border: 2px solid #667eea; mso-hide: all;">
                                            🎯 Acessar Minha Conta
                                        </a>
                                        <!--<![endif]-->
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Tips Section -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; margin: 30px 0;">
                                <tr>
                                    <td style="border-left: 4px solid #667eea; padding-left: 20px;">
                                        <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 22px;">
                                            💡 Dicas para começar:
                                        </h3>
                                        <p style="color: #4a5568; font-size: 15px; line-height: 22px; margin: 0 0 10px 0; padding: 0; font-family: Arial, Helvetica, sans-serif;">
                                            1. <strong>Complete seu perfil</strong> - Adicione foto, biografia e suas especialidades
                                        </p>
                                        <p style="color: #4a5568; font-size: 15px; line-height: 22px; margin: 0 0 10px 0; padding: 0; font-family: Arial, Helvetica, sans-serif;">
                                            2. <strong>Crie seu primeiro curso</strong> - Compartilhe seu conhecimento de forma estruturada
                                        </p>
                                        <p style="color: #4a5568; font-size: 15px; line-height: 22px; margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif;">
                                            3. <strong>Defina seus preços</strong> - Valorize seu tempo e expertise adequadamente
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Support Section -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px; text-align: center;">
                            <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 22px;">
                                💬 Precisa de ajuda?
                            </h3>
                            <p style="color: #4a5568; font-size: 15px; line-height: 22px; margin: 0 0 20px 0; padding: 0; font-family: Arial, Helvetica, sans-serif;">
                                Nossa equipe está sempre pronta para ajudar você a ter sucesso na plataforma.
                            </p>
                            <a href="{{URL_SUPORTE}}" style="color: #667eea; text-decoration: none; font-weight: 600; font-size: 15px; font-family: Arial, Helvetica, sans-serif;">
                                📧 Entrar em contato com o suporte
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #a0aec0; font-size: 13px; margin: 0 0 10px 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 16px;">
                                Este e-mail foi enviado para {{EMAIL_USUARIO}}
                            </p>
                            <p style="color: #a0aec0; font-size: 13px; margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 16px;">
                                © {{ANO_ATUAL}} Mentora AI. Todos os direitos reservados.
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
🎉 Bem-vindo à Mentora AI!

Olá, {{NOME_USUARIO}}!

É com grande alegria que damos as boas-vindas à Mentora AI, a plataforma que conecta conhecimento e transforma vidas através da mentoria.

Como mentor, você tem o poder de impactar positivamente a carreira e vida de outras pessoas. Sua experiência e conhecimento são valiosos e podem fazer toda a diferença na jornada de quem busca crescimento.

🚀 O que você pode fazer na plataforma:
• Criar e vender cursos online
• Conectar-se com mentorados interessados  
• Monetizar seu conhecimento
• Acompanhar seu progresso e receitas
• Construir sua marca pessoal

🎯 Acesse sua conta: {{URL_LOGIN}}

💡 Dicas para começar:
1. Complete seu perfil - Adicione foto, biografia e suas especialidades
2. Crie seu primeiro curso - Compartilhe seu conhecimento de forma estruturada
3. Defina seus preços - Valorize seu tempo e expertise adequadamente

💬 Precisa de ajuda?
Nossa equipe está sempre pronta para ajudar você a ter sucesso na plataforma.
Suporte: {{URL_SUPORTE}}

Este e-mail foi enviado para {{EMAIL_USUARIO}}
© {{ANO_ATUAL}} Mentora AI. Todos os direitos reservados.
  `
};