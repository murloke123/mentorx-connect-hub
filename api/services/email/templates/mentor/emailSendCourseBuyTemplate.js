"use strict";
/**
 * Template de Notificação de Venda de Curso
 * Template HTML simples e compatível com Outlook para notificar mentor sobre venda
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailSendCourseBuyTemplate = void 0;
exports.emailSendCourseBuyTemplate = {
    subject: '🎉 Parabéns! Você vendeu um curso - {{COURSE_NAME}}',
    htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parabéns pela Venda!</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a202c; font-size: 28px; margin: 0; font-weight: bold;">🎉 Parabéns pela Venda!</h1>
            <p style="color: #4a5568; font-size: 16px; margin: 10px 0 0 0;">Você acabou de vender um curso na Mentora AI</p>
        </div>

        <!-- Greeting -->
        <div style="margin-bottom: 25px;">
            <p style="color: #2d3748; font-size: 16px; line-height: 24px; margin: 0;">
                Olá <strong>{{MENTOR_NAME}}</strong>,
            </p>
        </div>

        <!-- Main Message -->
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #48bb78; margin-bottom: 25px;">
            <p style="color: #2d3748; font-size: 16px; line-height: 24px; margin: 0 0 15px 0;">
                <strong>Excelente notícia!</strong> O mentorado <strong>{{BUYER_NAME}}</strong> acabou de adquirir seu curso:
            </p>
            <p style="color: #1a202c; font-size: 18px; font-weight: bold; margin: 0 0 15px 0;">
                📚 {{COURSE_NAME}}
            </p>
            <p style="color: #2d3748; font-size: 16px; line-height: 24px; margin: 0;">
                Valor da venda: <strong style="color: #48bb78; font-size: 18px;">{{COURSE_PRICE}}</strong>
            </p>
        </div>

        <!-- Sale Details -->
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #1a202c; font-size: 18px; margin: 0 0 15px 0; font-weight: bold;">📋 Detalhes da Venda</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="color: #4a5568; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                        <strong>Comprador:</strong>
                    </td>
                    <td style="color: #2d3748; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                        {{BUYER_NAME}}
                    </td>
                </tr>
                <tr>
                    <td style="color: #4a5568; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                        <strong>Curso:</strong>
                    </td>
                    <td style="color: #2d3748; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                        {{COURSE_NAME}}
                    </td>
                </tr>
                <tr>
                    <td style="color: #4a5568; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                        <strong>Valor:</strong>
                    </td>
                    <td style="color: #48bb78; font-size: 14px; font-weight: bold; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                        {{COURSE_PRICE}}
                    </td>
                </tr>
                <tr>
                    <td style="color: #4a5568; font-size: 14px; padding: 8px 0;">
                        <strong>Data da Venda:</strong>
                    </td>
                    <td style="color: #2d3748; font-size: 14px; padding: 8px 0;">
                        {{SALE_DATE}}
                    </td>
                </tr>
            </table>
        </div>

        <!-- Next Steps -->
        <div style="background-color: #edf2f7; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #1a202c; font-size: 18px; margin: 0 0 15px 0; font-weight: bold;">🚀 Próximos Passos</h3>
            <ul style="color: #4a5568; font-size: 14px; line-height: 22px; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">O mentorado já tem acesso ao seu curso</li>
                <li style="margin-bottom: 8px;">Você pode acompanhar o progresso dele na plataforma</li>
                <li style="margin-bottom: 8px;">Considere enviar uma mensagem de boas-vindas</li>
                <li style="margin-bottom: 8px;">Continue criando conteúdo de qualidade para mais vendas</li>
            </ul>
        </div>

        <!-- CTA Button - Simple for Outlook compatibility -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://mentoraai.com.br" style="display: inline-block; background-color: #4299e1; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                🎯 Acessar Plataforma
            </a>
        </div>

        <!-- Congratulations -->
        <div style="text-align: center; margin: 30px 0;">
            <p style="color: #2d3748; font-size: 16px; line-height: 24px; margin: 0;">
                <strong>Parabéns pelo seu sucesso!</strong><br>
                Continue compartilhando seu conhecimento e transformando vidas.
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                © {{CURRENT_YEAR}} Mentora AI. Todos os direitos reservados.
            </p>
            <p style="color: #a0aec0; font-size: 12px; margin: 5px 0 0 0;">
                Este e-mail foi enviado automaticamente. Não responda a este e-mail.
            </p>
        </div>
    </div>
</body>
</html>`,
    textContent: `
🎉 Parabéns pela Venda!

Olá {{MENTOR_NAME}},

Excelente notícia! O mentorado {{BUYER_NAME}} acabou de adquirir seu curso:

📚 {{COURSE_NAME}}
Valor da venda: {{COURSE_PRICE}}

Detalhes da Venda:
- Comprador: {{BUYER_NAME}}
- Curso: {{COURSE_NAME}}
- Valor: {{COURSE_PRICE}}
- Data da Venda: {{SALE_DATE}}

Próximos Passos:
- O mentorado já tem acesso ao seu curso
- Você pode acompanhar o progresso dele na plataforma
- Considere enviar uma mensagem de boas-vindas
- Continue criando conteúdo de qualidade para mais vendas

Acesse a plataforma: https://mentoraai.com.br

Parabéns pelo seu sucesso!
Continue compartilhando seu conhecimento e transformando vidas.

© {{CURRENT_YEAR}} Mentora AI. Todos os direitos reservados.
Este e-mail foi enviado automaticamente. Não responda a este e-mail.
`
};
