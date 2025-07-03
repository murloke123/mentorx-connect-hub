/**
 * Template de Boas-Vindas para Mentores
 * Template HTML responsivo para e-mail de boas-vindas de mentores
 */

import { EmailTemplate } from '../../types/emailTypes';

export const boasVindasMentorTemplate: EmailTemplate = {
  subject: '🎉 Bem-vindo(a) à Mentora AI - Sua jornada como mentor começa agora!',
  htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo à Mentora AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                🎉 Bem-vindo à Mentora AI!
                            </h1>
                            <p style="color: #e2e8f0; font-size: 16px; margin: 10px 0 0 0;">
                                Sua jornada como mentor começa agora
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #2d3748; font-size: 22px; font-weight: 600; margin: 0 0 20px 0;">
                                Olá, {{NOME_USUARIO}}! 👋
                            </h2>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                É com grande alegria que damos as boas-vindas à <strong>Mentora AI</strong>, a plataforma que conecta conhecimento e transforma vidas através da mentoria.
                            </p>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Como <strong>mentor</strong>, você tem o poder de impactar positivamente a carreira e vida de outras pessoas. Sua experiência e conhecimento são valiosos e podem fazer toda a diferença na jornada de quem busca crescimento.
                            </p>
                            
                            <!-- Features Box -->
                            <div style="background-color: #f7fafc; border-radius: 8px; padding: 25px; margin: 30px 0;">
                                <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                    🚀 O que você pode fazer na plataforma:
                                </h3>
                                <ul style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                                    <li style="margin-bottom: 8px;">📚 Criar e vender cursos online</li>
                                    <li style="margin-bottom: 8px;">👥 Conectar-se com mentorados interessados</li>
                                    <li style="margin-bottom: 8px;">💰 Monetizar seu conhecimento</li>
                                    <li style="margin-bottom: 8px;">📊 Acompanhar seu progresso e receitas</li>
                                    <li style="margin-bottom: 8px;">🎯 Construir sua marca pessoal</li>
                                </ul>
                            </div>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 35px 0;">
                                <a href="{{URL_LOGIN}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 15px 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;">
                                    🎯 Acessar Minha Conta
                                </a>
                            </div>
                            
                            <!-- Tips Section -->
                            <div style="border-left: 4px solid #667eea; padding-left: 20px; margin: 30px 0;">
                                <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                    💡 Dicas para começar:
                                </h3>
                                <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                                    1. <strong>Complete seu perfil</strong> - Adicione foto, biografia e suas especialidades
                                </p>
                                <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                                    2. <strong>Crie seu primeiro curso</strong> - Compartilhe seu conhecimento de forma estruturada
                                </p>
                                <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0;">
                                    3. <strong>Defina seus preços</strong> - Valorize seu tempo e expertise adequadamente
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
                                    Nossa equipe está sempre pronta para ajudar você a ter sucesso na plataforma.
                                </p>
                                <a href="{{URL_SUPORTE}}" style="color: #667eea; text-decoration: none; font-weight: 600; font-size: 15px;">
                                    📧 Entrar em contato com o suporte
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #a0aec0; font-size: 13px; margin: 0 0 10px 0;">
                                Este e-mail foi enviado para {{EMAIL_USUARIO}}
                            </p>
                            <p style="color: #a0aec0; font-size: 13px; margin: 0;">
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