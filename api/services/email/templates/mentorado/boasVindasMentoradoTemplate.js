"use strict";
/**
 * Template de Boas-Vindas para Mentorados
 * Template HTML responsivo para e-mail de boas-vindas de mentorados
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.boasVindasMentoradoTemplate = void 0;
exports.boasVindasMentoradoTemplate = {
    subject: 'Bem-vindo à Mentor X! 🎉',
    htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Bem-vindo à Mentor X</title>
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
                        <td style="background-color: #48bb78; padding: 40px 30px; text-align: center;">
                            <!--[if gte mso 9]>
                            <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:540px;height:120px;">
                                <v:fill type="gradient" color="#48bb78" color2="#38a169" angle="135" />
                                <v:textbox inset="0,0,0,0">
                            <![endif]-->
                            <div style="color: #ffffff;">
                                <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 32px;">
                                    🎉 Bem-vindo à Mentor X!
                                </h1>
                                <p style="color: #ffffff; font-size: 16px; margin: 10px 0 0 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 20px;">
                                    Sua jornada de aprendizado começa aqui
                                </p>
                            </div>
                            <!--[if gte mso 9]>
                                </v:textbox>
                            </v:rect>
                            <![endif]-->
                        </td>
                    </tr>
                    
                    <!-- Conteúdo Principal -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #2d3748; font-size: 22px; font-weight: 600; margin: 0 0 20px 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 26px;">
                                Olá, {{userName}}! 👋
                            </h2>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 20px 0; padding: 0; font-family: Arial, Helvetica, sans-serif;">
                                É com grande alegria que damos as boas-vindas à <strong>Mentor X</strong>, a plataforma que conecta conhecimento e transforma vidas através da mentoria.
                            </p>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; padding: 0; font-family: Arial, Helvetica, sans-serif;">
                                Como <strong>mentorado(a)</strong>, você terá acesso a mentores experientes que irão guiá-lo em sua jornada de aprendizado e desenvolvimento.
                            </p>
                            
                            <!-- Features Box -->
                            <div style="background-color: #f0fff4; border-radius: 8px; padding: 25px; margin: 30px 0; border: 1px solid #c6f6d5;">
                                <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                    🚀 O que você pode fazer na plataforma:
                                </h3>
                                <ul style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                                    <li style="margin-bottom: 8px;">📚 Acessar cursos de mentores experientes</li>
                                    <li style="margin-bottom: 8px;">🎯 Encontrar mentores na sua área de interesse</li>
                                    <li style="margin-bottom: 8px;">📈 Acompanhar seu progresso de aprendizado</li>
                                    <li style="margin-bottom: 8px;">💬 Interagir com uma comunidade de aprendizes</li>
                                    <li style="margin-bottom: 8px;">🏆 Conquistar certificados e conquistas</li>
                                </ul>
                            </div>
                            
                            <!-- Botão CTA -->
                            <div style="text-align: center; margin: 30px 0;">
                                <!--[if mso]>
                                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{loginUrl}}" style="height:52px;v-text-anchor:middle;width:200px;" arcsize="15%" stroke="f" fillcolor="#48bb78">
                                    <w:anchorlock/>
                                    <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">🚀 Acessar Plataforma</center>
                                </v:roundrect>
                                <![endif]-->
                                <!--[if !mso]><!-->
                                <a href="{{loginUrl}}" style="display: inline-block; background-color: #48bb78; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; font-family: Arial, Helvetica, sans-serif; line-height: 20px; mso-hide: all;">
                                    🚀 Acessar Plataforma
                                </a>
                                <!--<![endif]-->
                            </div>
                            
                            <!-- Tips Section -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; margin: 30px 0;">
                                <tr>
                                    <td style="border-left: 4px solid #48bb78; padding-left: 20px;">
                                        <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 22px;">
                                            💡 Primeiros passos:
                                        </h3>
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 20px; padding: 5px 0; font-family: Arial, Helvetica, sans-serif;">
                                                    1. <strong>Complete seu perfil</strong> - Conte sobre seus objetivos e interesses
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 20px; padding: 5px 0; font-family: Arial, Helvetica, sans-serif;">
                                                    2. <strong>Explore os cursos</strong> - Descubra conteúdos alinhados com seus objetivos
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 20px; padding: 5px 0; font-family: Arial, Helvetica, sans-serif;">
                                                    3. <strong>Conecte-se com mentores</strong> - Encontre quem pode acelerar sua jornada
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Motivational Quote -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f7fafc; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; margin: 30px 0; border: 1px solid #e2e8f0;">
                                <tr>
                                    <td style="padding: 25px; text-align: center;">
                                        <p style="color: #2d3748; font-size: 18px; font-style: italic; margin: 0 0 10px 0; font-weight: 500; font-family: Arial, Helvetica, sans-serif; line-height: 22px;">
                                            "O investimento em conhecimento paga os melhores juros."
                                        </p>
                                        <p style="color: #718096; font-size: 14px; margin: 0; font-family: Arial, Helvetica, sans-serif; line-height: 18px;">
                                            - Benjamin Franklin
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Support Section -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr>
                                    <td style="text-align: center;">
                                        <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 22px;">
                                            💬 Precisa de ajuda?
                                        </h3>
                                        <p style="color: #4a5568; font-size: 15px; line-height: 20px; margin: 0 0 20px 0; padding: 0; font-family: Arial, Helvetica, sans-serif;">
                                            Nossa equipe está aqui para garantir que você tenha a melhor experiência de aprendizado possível.
                                        </p>
                                        <a href="{{URL_SUPORTE}}" style="color: #48bb78; text-decoration: none; font-weight: 600; font-size: 15px; font-family: Arial, Helvetica, sans-serif; line-height: 20px;">
                                            📧 Entrar em contato com o suporte
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr>
                                    <td style="text-align: center;">
                                        <p style="color: #a0aec0; font-size: 13px; margin: 0 0 10px 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 16px;">
                                            Este e-mail foi enviado para {{EMAIL_USUARIO}}
                                        </p>
                                        <p style="color: #a0aec0; font-size: 13px; margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 16px;">
                                            © {{ANO_ATUAL}} Mentor X. Todos os direitos reservados.
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
</body>
</html>
  `,
    textContent: `
🌟 Bem-vindo à Mentor X!

Olá, {{NOME_USUARIO}}!

É com grande alegria que damos as boas-vindas à <strong>Mentor X</strong>, a plataforma que conecta você aos melhores mentores e conhecimentos para acelerar seu crescimento pessoal e profissional.

Como mentorado, você tem acesso a uma comunidade incrível de especialistas prontos para compartilhar suas experiências e ajudar você a alcançar seus objetivos.

🚀 O que você pode fazer na plataforma:
• Acessar cursos de mentores experientes
• Encontrar mentores na sua área de interesse
• Acompanhar seu progresso de aprendizado
• Interagir com uma comunidade de aprendizes
• Conquistar certificados e conquistas

🎯 Explore a plataforma: {{URL_LOGIN}}

💡 Primeiros passos:
1. Complete seu perfil - Conte sobre seus objetivos e interesses
2. Explore os cursos - Descubra conteúdos alinhados com seus objetivos
3. Conecte-se com mentores - Encontre quem pode acelerar sua jornada

"O investimento em conhecimento paga os melhores juros." - Benjamin Franklin

💬 Precisa de ajuda?
Nossa equipe está aqui para garantir que você tenha a melhor experiência de aprendizado possível.
Suporte: {{URL_SUPORTE}}

Este e-mail foi enviado para {{EMAIL_USUARIO}}
© {{ANO_ATUAL}} Mentor X. Todos os direitos reservados.
  `
};
