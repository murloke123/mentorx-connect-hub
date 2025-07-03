/**
 * Template de Boas-Vindas para Mentorados
 * Template HTML responsivo para e-mail de boas-vindas de mentorados
 */

import { EmailTemplate } from '../../types/emailTypes';

export const boasVindasMentoradoTemplate: EmailTemplate = {
  subject: '🌟 Bem-vindo(a) à Mentora AI - Sua jornada de aprendizado começa aqui!',
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
                        <td style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                🌟 Bem-vindo à Mentora AI!
                            </h1>
                            <p style="color: #e6fffa; font-size: 16px; margin: 10px 0 0 0;">
                                Sua jornada de aprendizado começa aqui
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
                                É com grande alegria que damos as boas-vindas à <strong>Mentora AI</strong>, a plataforma que conecta você aos melhores mentores e conhecimentos para acelerar seu crescimento pessoal e profissional.
                            </p>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Como <strong>mentorado</strong>, você tem acesso a uma comunidade incrível de especialistas prontos para compartilhar suas experiências e ajudar você a alcançar seus objetivos.
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
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 35px 0;">
                                <a href="{{URL_LOGIN}}" style="display: inline-block; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 15px 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(72, 187, 120, 0.3); transition: all 0.3s ease;">
                                    🎯 Explorar a Plataforma
                                </a>
                            </div>
                            
                            <!-- Tips Section -->
                            <div style="border-left: 4px solid #48bb78; padding-left: 20px; margin: 30px 0;">
                                <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                    💡 Primeiros passos:
                                </h3>
                                <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                                    1. <strong>Complete seu perfil</strong> - Conte sobre seus objetivos e interesses
                                </p>
                                <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
                                    2. <strong>Explore os cursos</strong> - Descubra conteúdos alinhados com seus objetivos
                                </p>
                                <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0;">
                                    3. <strong>Conecte-se com mentores</strong> - Encontre quem pode acelerar sua jornada
                                </p>
                            </div>
                            
                            <!-- Motivational Quote -->
                            <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center; border: 1px solid #e2e8f0;">
                                <p style="color: #2d3748; font-size: 18px; font-style: italic; margin: 0 0 10px 0; font-weight: 500;">
                                    "O investimento em conhecimento paga os melhores juros."
                                </p>
                                <p style="color: #718096; font-size: 14px; margin: 0;">
                                    - Benjamin Franklin
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
                                    Nossa equipe está aqui para garantir que você tenha a melhor experiência de aprendizado possível.
                                </p>
                                <a href="{{URL_SUPORTE}}" style="color: #48bb78; text-decoration: none; font-weight: 600; font-size: 15px;">
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
🌟 Bem-vindo à Mentora AI!

Olá, {{NOME_USUARIO}}!

É com grande alegria que damos as boas-vindas à Mentora AI, a plataforma que conecta você aos melhores mentores e conhecimentos para acelerar seu crescimento pessoal e profissional.

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
© {{ANO_ATUAL}} Mentora AI. Todos os direitos reservados.
  `
}; 