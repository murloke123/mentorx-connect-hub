import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Mail, Users, Calendar, Key, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  category: 'mentor' | 'mentorado' | 'geral';
  icon: JSX.Element;
  htmlContent: string;
  variables: string[];
}

const TemplatesEmail = () => {
  console.log('🔧 Componente TemplatesEmail iniciado');
  
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🚀 Componente TemplatesEmail montado, iniciando carregamento...');
    
    // Temporariamente usando templates mockados pois a API não existe ainda
    console.log('⚠️ Usando templates mockados - API não implementada');
    console.log('📋 Templates mockados disponíveis:', mockTemplates.length);
    
    // Simulando carregamento
    setTimeout(() => {
      setTemplates(mockTemplates);
      setLoading(false);
      console.log('✅ Templates mockados carregados com sucesso');
    }, 500);
    
    // Descomente a linha abaixo quando a API estiver implementada
    // fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      console.log('🔍 Iniciando busca de templates de email...');
      const response = await fetch('/api/email-templates');
      
      console.log('📡 Status da resposta:', response.status);
      console.log('📡 Headers da resposta:', response.headers);
      
      if (!response.ok) {
        console.error('❌ Resposta não OK:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Templates carregados com sucesso:', data);
      setTemplates(data);
    } catch (error) {
      console.error('❌ Erro detalhado ao carregar templates:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause
      });
      
      // Log adicional para erros de rede
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 Erro de rede detectado. Verificando conectividade...');
        console.log('🔗 URL tentativa:', '/api/email-templates');
        console.log('🏠 Base URL atual:', window.location.origin);
      }
      
      toast({
        variant: "destructive",
        title: "Erro ao carregar templates",
        description: `Não foi possível carregar os templates de email. Erro: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const getIconForTemplate = (type: string) => {
    switch (type) {
      case 'booking-confirmation':
      case 'booking-reminder':
      case 'booking-cancellation':
        return <Calendar className="h-5 w-5" />;
      case 'new-booking-notification':
        return <Mail className="h-5 w-5" />;
      case 'welcome-mentor':
      case 'welcome-mentee':
        return <UserPlus className="h-5 w-5" />;
      case 'password-reset':
        return <Key className="h-5 w-5" />;
      default:
        return <Mail className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mentor':
        return 'bg-blue-100 text-blue-800';
      case 'mentorado':
        return 'bg-green-100 text-green-800';
      case 'geral':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTemplateDescription = (type: string) => {
    const descriptions: { [key: string]: string } = {
      'booking-confirmation': 'Email de confirmação de agendamento enviado ao mentorado',
      'booking-reminder': 'Lembrete de agendamento enviado antes da sessão',
      'booking-cancellation': 'Notificação de cancelamento de agendamento',
      'new-booking-notification': 'Notificação de novo agendamento enviada ao mentor',
      'welcome-mentor': 'Email de boas-vindas para novos mentores',
      'welcome-mentee': 'Email de boas-vindas para novos mentorados',
      'password-reset': 'Email para redefinição de senha'
    };
    return descriptions[type] || 'Template de email personalizado';
  };

  const mockTemplates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Confirmação de Agendamento (Mentorado)',
      type: 'booking-confirmation',
      description: 'Email completo de confirmação de agendamento enviado ao mentorado com design responsivo',
      category: 'mentorado',
      icon: getIconForTemplate('booking-confirmation'),
      htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Agendamento Confirmado</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #667eea; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; font-family: Arial, Helvetica, sans-serif; line-height: 32px;">
                                ✅ Agendamento Confirmado!
                            </h1>
                            <p style="color: #e6f3ff; font-size: 16px; margin: 10px 0 0 0; font-family: Arial, Helvetica, sans-serif; line-height: 20px;">
                                Sua mentoria foi agendada com sucesso
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #2d3748; font-size: 22px; font-weight: 600; margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; line-height: 26px;">
                                Olá, {{MENTEE_NAME}}!
                            </h2>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif;">
                                Parabéns! Sua <strong>mentoria com {{MENTOR_NAME}}</strong> foi agendada com sucesso e está confirmada.
                            </p>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; font-family: Arial, Helvetica, sans-serif;">
                                Prepare-se para uma sessão incrível! Abaixo estão todos os detalhes do seu agendamento:
                            </p>
                            
                            <!-- Appointment Details Box -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0f4ff; border-left: 4px solid #667eea; margin: 30px 0; border-radius: 4px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; line-height: 22px;">
                                            📅 Detalhes da Sua Mentoria:
                                        </h3>
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 5px 0;">
                                                    <strong>👤 Mentor:</strong> {{MENTOR_NAME}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 5px 0;">
                                                    <strong>📅 Data:</strong> {{APPOINTMENT_DATE}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 5px 0;">
                                                    <strong>⏰ Horário:</strong> {{APPOINTMENT_TIME}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 5px 0;">
                                                    <strong>🌍 Fuso Horário:</strong> {{TIMEZONE}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 15px 0 5px 0;">
                                                    <strong>📝 Suas Observações:</strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 5px 0; background-color: #f7fafc; padding: 10px; border-radius: 4px;">
                                                    {{NOTES}}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Meeting Link Section -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0fff4; border-left: 4px solid #48bb78; margin: 30px 0; border-radius: 4px;">
                                <tr>
                                    <td style="padding: 25px; text-align: center;">
                                        <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; line-height: 22px;">
                                            🎥 Link da Reunião
                                        </h3>
                                        <p style="color: #4a5568; font-size: 15px; line-height: 22px; margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif;">
                                            Clique no botão abaixo para entrar na reunião no horário agendado:
                                        </p>
                                        <a href="{{MEET_LINK}}" style="display: inline-block; background-color: #48bb78; color: #ffffff; text-decoration: none; padding: 18px 36px; border-radius: 8px; font-weight: bold; font-size: 16px; font-family: Arial, Helvetica, sans-serif; text-align: center; line-height: 20px; min-width: 220px; border: 2px solid #48bb78;">
                                            🎥 Entrar na Reunião
                                        </a>
                                        <p style="color: #718096; font-size: 13px; line-height: 18px; margin: 15px 0 0 0; font-family: Arial, Helvetica, sans-serif;">
                                            Ou copie e cole este link no seu navegador:<br>
                                            <span style="word-break: break-all; color: #667eea;">{{MEET_LINK}}</span>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Tips Section -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fffaf0; border: 1px solid #fed7aa; margin: 30px 0; border-radius: 4px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <h3 style="color: #9c4221; font-size: 16px; font-weight: 600; margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; line-height: 20px;">
                                            💡 Dicas para uma mentoria produtiva:
                                        </h3>
                                        <ul style="color: #92400e; font-size: 14px; line-height: 20px; margin: 0; padding-left: 20px; font-family: Arial, Helvetica, sans-serif;">
                                            <li style="margin-bottom: 8px;">Prepare suas dúvidas e objetivos com antecedência</li>
                                            <li style="margin-bottom: 8px;">Teste sua conexão de internet e áudio antes da reunião</li>
                                            <li style="margin-bottom: 8px;">Tenha papel e caneta para anotações importantes</li>
                                            <li style="margin-bottom: 0;">Seja pontual - chegue alguns minutos antes do horário</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #a0aec0; font-size: 13px; margin: 0 0 10px 0; font-family: Arial, Helvetica, sans-serif; line-height: 16px;">
                                Este e-mail foi enviado para {{MENTEE_EMAIL}}
                            </p>
                            <p style="color: #a0aec0; font-size: 13px; margin: 0; font-family: Arial, Helvetica, sans-serif; line-height: 16px;">
                                © {{CURRENT_YEAR}} Mentora AI. Todos os direitos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
      variables: ['MENTEE_NAME', 'MENTOR_NAME', 'APPOINTMENT_DATE', 'APPOINTMENT_TIME', 'TIMEZONE', 'NOTES', 'MEET_LINK', 'AGENDAMENTOS_URL', 'SUPPORT_URL', 'MENTEE_EMAIL', 'CURRENT_YEAR']
    },
    {
      id: '2',
      name: 'Novo Agendamento (Mentor)',
      type: 'new-booking-notification',
      description: 'Notificação completa de novo agendamento enviada ao mentor com instruções e detalhes',
      category: 'mentor',
      icon: getIconForTemplate('new-booking-notification'),
      htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novo Agendamento</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #48bb78; padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; font-family: Arial, Helvetica, sans-serif; line-height: 32px;">
                                🎉 Novo Agendamento!
                            </h1>
                            <p style="color: #e6fffa; font-size: 16px; margin: 10px 0 0 0; font-family: Arial, Helvetica, sans-serif; line-height: 20px;">
                                Um mentorado agendou uma sessão com você
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #2d3748; font-size: 22px; font-weight: 600; margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; line-height: 26px;">
                                Olá, {{MENTOR_NAME}}!
                            </h2>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif;">
                                Você tem um <strong>novo agendamento</strong> criado por <strong>{{MENTEE_NAME}}</strong>!
                            </p>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; font-family: Arial, Helvetica, sans-serif;">
                                Por favor, revise os detalhes abaixo e confirme sua disponibilidade. Caso não possa atender neste horário, você pode cancelar o agendamento justificando o motivo.
                            </p>
                            
                            <!-- Appointment Details Box -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0fff4; border-left: 4px solid #48bb78; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; line-height: 22px;">
                                            Detalhes do Novo Agendamento:
                                        </h3>
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 5px 0;">
                                                    <strong>Mentorado:</strong> {{MENTEE_NAME}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 5px 0;">
                                                    <strong>Data:</strong> {{APPOINTMENT_DATE}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 5px 0;">
                                                    <strong>Horário:</strong> {{APPOINTMENT_TIME}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 5px 0;">
                                                    <strong>Fuso Horário:</strong> {{TIMEZONE}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 5px 0;">
                                                    <strong>Observações:</strong> {{NOTES}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 5px 0;">
                                                    <strong>Link da Reunião:</strong> <a href="{{MEET_LINK}}" style="color: #667eea; text-decoration: underline; font-weight: 600;">Entrar na reunião</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Instructions Section -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-left: 4px solid #667eea; margin: 30px 0;">
                                <tr>
                                    <td style="padding-left: 20px;">
                                        <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif; line-height: 22px;">
                                            O que fazer agora:
                                        </h3>
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 5px 0;">
                                                    1. <strong>Revise o agendamento</strong> - Verifique se o horário está disponível para você
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 5px 0;">
                                                    2. <strong>Confirme ou cancele</strong> - Se não puder atender, cancele com uma justificativa
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 5px 0;">
                                                    3. <strong>Prepare-se para a sessão</strong> - Se confirmado, prepare o conteúdo para a mentoria
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Action Button -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 35px 0;">
                                <tr>
                                    <td align="center">
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="background-color: #5a67d8; padding: 15px 35px; text-align: center; border: 2px solid #5a67d8;">
                                                    <a href="{{AGENDAMENTOS_URL}}" style="color: #ffffff; text-decoration: none; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; display: block;">
                                                        Gerenciar Agendamentos
                                                    </a>
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
                                        <h4 style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0 0 10px 0; font-family: Arial, Helvetica, sans-serif; line-height: 20px;">
                                            Importante:
                                        </h4>
                                        <p style="color: #92400e; font-size: 14px; line-height: 20px; margin: 0; font-family: Arial, Helvetica, sans-serif;">
                                            Se você não conseguir atender no horário agendado, por favor cancele o quanto antes para que o mentorado possa escolher outro horário. Isso ajuda a manter uma boa experiência para todos.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #a0aec0; font-size: 13px; margin: 0 0 10px 0; font-family: Arial, Helvetica, sans-serif; line-height: 16px;">
                                Este e-mail foi enviado para {{MENTOR_EMAIL}}
                            </p>
                            <p style="color: #a0aec0; font-size: 13px; margin: 0; font-family: Arial, Helvetica, sans-serif; line-height: 16px;">
                                © {{CURRENT_YEAR}} Mentora AI. Todos os direitos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
      variables: ['MENTOR_NAME', 'MENTEE_NAME', 'APPOINTMENT_DATE', 'APPOINTMENT_TIME', 'TIMEZONE', 'NOTES', 'MEET_LINK', 'AGENDAMENTOS_URL', 'SUPPORT_URL', 'MENTOR_EMAIL', 'CURRENT_YEAR']
    },
    {
      id: '3',
      name: 'Cancelamento de Agendamento',
      type: 'booking-cancellation',
      description: 'Email de cancelamento de agendamento com design responsivo e informações detalhadas',
      category: 'geral',
      icon: getIconForTemplate('booking-cancellation'),
      htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agendamento Cancelado</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #e53e3e; padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0;">
                                ⚠️ Agendamento Cancelado
                            </h1>
                            <p style="color: #fed7d7; font-size: 16px; margin: 10px 0 0 0;">
                                Informações sobre o cancelamento
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #2d3748; font-size: 22px; font-weight: 600; margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif;">
                                Olá, {{MENTEE_NAME}}!
                            </h2>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif;">
                                Infelizmente, seu agendamento com <strong>{{MENTOR_NAME}}</strong> foi cancelado.
                            </p>
                            
                            <!-- Cancellation Details -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fed7d7; border-left: 4px solid #e53e3e; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; font-family: Arial, Helvetica, sans-serif;">
                                            Detalhes do Cancelamento:
                                        </h3>
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 5px 0;">
                                                    <strong>Data:</strong> {{APPOINTMENT_DATE}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 5px 0;">
                                                    <strong>Horário:</strong> {{APPOINTMENT_TIME}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 5px 0;">
                                                    <strong>Fuso Horário:</strong> {{TIMEZONE}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 15px 0 5px 0;">
                                                    <strong>Motivo do Cancelamento:</strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; line-height: 22px; font-family: Arial, Helvetica, sans-serif; padding: 5px 0; background-color: #ffffff; padding: 10px; border-radius: 4px;">
                                                    {{CANCELLATION_REASON}}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 20px 0; font-family: Arial, Helvetica, sans-serif;">
                                Você pode reagendar uma nova sessão quando quiser através da plataforma.
                            </p>
                            
                            <!-- Action Button -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{{PLATFORM_URL}}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; font-family: Arial, Helvetica, sans-serif; text-align: center;">
                                            Reagendar Sessão
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #a0aec0; font-size: 13px; margin: 0; font-family: Arial, Helvetica, sans-serif;">
                                © {{CURRENT_YEAR}} Mentora AI. Todos os direitos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
      variables: ['MENTEE_NAME', 'MENTOR_NAME', 'APPOINTMENT_DATE', 'APPOINTMENT_TIME', 'TIMEZONE', 'CANCELLATION_REASON', 'PLATFORM_URL', 'CURRENT_YEAR']
    },
    {
      id: '4',
      name: 'Boas-vindas Mentor',
      type: 'welcome-mentor',
      description: 'Email de boas-vindas para novos mentores com design profissional e próximos passos',
      category: 'mentor',
      icon: getIconForTemplate('welcome-mentor'),
      htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo à Mentora AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0;">
                                🎉 Bem-vindo à Mentora AI!
                            </h1>
                            <p style="color: #e6f3ff; font-size: 16px; margin: 10px 0 0 0;">
                                Sua jornada como mentor começa agora
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #2d3748; font-size: 22px; font-weight: 600; margin: 0 0 20px 0;">
                                Olá, {{MENTOR_NAME}}!
                            </h2>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                                Parabéns! Você agora faz parte da comunidade <strong>Mentora AI</strong> como mentor.
                            </p>
                            
                            <!-- Next Steps -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0f4ff; border-left: 4px solid #667eea; margin: 30px 0; border-radius: 4px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                            Próximos Passos:
                                        </h3>
                                        <ul style="color: #4a5568; font-size: 15px; line-height: 24px; margin: 0; padding-left: 20px;">
                                            <li style="margin-bottom: 10px;">Complete seu perfil</li>
                                            <li style="margin-bottom: 10px;">Configure seus serviços</li>
                                            <li style="margin-bottom: 10px;">Defina sua disponibilidade</li>
                                            <li style="margin-bottom: 0;">Comece a receber agendamentos</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 20px 0;">
                                Estamos ansiosos para ver o impacto que você causará!
                            </p>
                            
                            <!-- Action Button -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{{PLATFORM_URL}}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; font-family: Arial, Helvetica, sans-serif; text-align: center;">
                                            Acessar Plataforma
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #a0aec0; font-size: 13px; margin: 0; font-family: Arial, Helvetica, sans-serif;">
                                © {{CURRENT_YEAR}} Mentora AI. Todos os direitos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
      variables: ['MENTOR_NAME', 'PLATFORM_URL', 'CURRENT_YEAR']
    },
    {
      id: '5',
      name: 'Boas-vindas Mentorado',
      type: 'welcome-mentee',
      description: 'Email de boas-vindas para novos mentorados com design atrativo e guia de primeiros passos',
      category: 'mentorado',
      icon: getIconForTemplate('welcome-mentee'),
      htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo à Mentora AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0;">
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
                                Olá, {{MENTEE_NAME}}!
                            </h2>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                                Seja bem-vindo à plataforma <strong>Mentora AI</strong>! Estamos felizes em tê-lo conosco.
                            </p>
                            
                            <!-- How to Start -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0fff4; border-left: 4px solid #48bb78; margin: 30px 0; border-radius: 4px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                                            Como Começar:
                                        </h3>
                                        <ul style="color: #4a5568; font-size: 15px; line-height: 24px; margin: 0; padding-left: 20px;">
                                            <li style="margin-bottom: 10px;">Explore nossos mentores</li>
                                            <li style="margin-bottom: 10px;">Encontre o mentor ideal para você</li>
                                            <li style="margin-bottom: 10px;">Agende sua primeira sessão</li>
                                            <li style="margin-bottom: 0;">Comece sua jornada de aprendizado</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 20px 0;">
                                Sua jornada de crescimento começa aqui!
                            </p>
                            
                            <!-- Action Button -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{{PLATFORM_URL}}" style="display: inline-block; background-color: #48bb78; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; font-family: Arial, Helvetica, sans-serif; text-align: center;">
                                            Explorar Mentores
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #a0aec0; font-size: 13px; margin: 0; font-family: Arial, Helvetica, sans-serif;">
                                © {{CURRENT_YEAR}} Mentora AI. Todos os direitos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
      variables: ['MENTEE_NAME', 'PLATFORM_URL', 'CURRENT_YEAR']
    }
  ];

  // Templates mockados definidos acima - removido useEffect duplicado

  if (loading) {
    console.log('⏳ Estado de loading ativo - mostrando spinner...');
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando templates...</p>
          <p className="text-sm text-gray-400 mt-2">Verificando logs no console...</p>
        </div>
      </div>
    );
  }

  console.log('🎯 Renderizando página com templates:', templates.length);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates de Email</h1>
          <p className="text-gray-600 mt-1">
            Visualize e gerencie todos os templates de email da plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {templates.filter(t => t.category === 'mentor').length} Mentor
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            {templates.filter(t => t.category === 'mentorado').length} Mentorado
          </Badge>
          <Badge variant="outline" className="bg-gray-50 text-gray-700">
            {templates.filter(t => t.category === 'geral').length} Geral
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          console.log('🎨 Renderizando template:', template.name);
          return (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {template.icon}
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge 
                      variant="secondary" 
                      className={`mt-1 ${getCategoryColor(template.category)}`}
                    >
                      {template.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {template.description}
              </CardDescription>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-gray-700">Variáveis:</p>
                <div className="flex flex-wrap gap-1">
                  {template.variables.map((variable, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {template.icon}
                      {template.name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-sm text-gray-700">Categoria:</p>
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-700">Tipo:</p>
                        <p className="text-sm">{template.type}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium text-sm text-gray-700 mb-2">Descrição:</p>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>

                    <div>
                      <p className="font-medium text-sm text-gray-700 mb-2">Variáveis Disponíveis:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-sm text-gray-700 mb-2">Preview do Email:</p>
                      <div 
                        className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: template.htmlContent }}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {templates.length === 0 && (() => {
        console.log('⚠️ Nenhum template encontrado para renderizar');
        return (
        <div className="text-center py-12">
          <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum template encontrado
          </h3>
          <p className="text-gray-600">
            Não há templates de email disponíveis no momento.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Verifique os logs do console para mais detalhes.
          </p>
        </div>
        );
      })()}
    </div>
  );
};

export default TemplatesEmail;