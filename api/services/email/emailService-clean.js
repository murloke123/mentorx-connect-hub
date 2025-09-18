/**
 * ===============================================================================
 * 📧 EMAIL SERVICE - Sistema de E-mails da Plataforma (ES Module Version)
 * ===============================================================================
 */

import 'dotenv/config';

// Teste básico de envio direto usando Brevo
async function notificarMentorNovoAgendamento(data) {
  console.log(`📧 Enviando notificação de novo agendamento para mentor:`, {
    email: data.mentorEmail,
    mentor: data.mentorName,
    mentorado: data.menteeName
  });

  try {
    const { default: brevo } = await import('@getbrevo/brevo');

    // Configurar API
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

    // Criar email
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || 'Mentora AI',
      email: process.env.BREVO_SENDER_EMAIL || 'contato@mentorx.com.br'
    };

    sendSmtpEmail.to = [{
      email: data.mentorEmail,
      name: data.mentorName
    }];

    sendSmtpEmail.subject = `🎯 Novo Agendamento - ${data.menteeName}`;

    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Novo Agendamento</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">

        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎯 Novo Agendamento!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">MentorX Connect Hub</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0; font-size: 24px;">Olá, ${data.mentorName}! 👋</h2>

          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Você tem um novo agendamento confirmado! Aqui estão os detalhes:
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="color: #28a745; margin-top: 0;">📅 Detalhes do Agendamento:</h3>
            <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
              <li><strong>👤 Mentorado:</strong> ${data.menteeName}</li>
              <li><strong>📅 Data:</strong> ${data.appointmentDate}</li>
              <li><strong>⏰ Horário:</strong> ${data.appointmentTime}</li>
              <li><strong>🌍 Timezone:</strong> ${data.timezone}</li>
              ${data.notes ? `<li><strong>📝 Observações:</strong> ${data.notes}</li>` : ''}
              ${data.meetLink ? `<li><strong>🔗 Link da Reunião:</strong> <a href="${data.meetLink}" style="color: #667eea;">${data.meetLink}</a></li>` : ''}
            </ul>
          </div>

          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">💡 Próximos Passos:</h4>
            <ul style="color: #555; line-height: 1.6;">
              <li>📱 Confirme sua presença</li>
              <li>📋 Prepare os materiais necessários</li>
              <li>🤝 Conecte-se com seu mentorado</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://mentorx.com.br/mentor/agendamentos" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Ver Meus Agendamentos
            </a>
          </div>

          <p style="color: #666; line-height: 1.6; font-size: 14px; margin-top: 30px;">
            Se precisar de ajuda, nossa equipe de suporte está sempre disponível.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} MentorX Connect Hub - Sistema de Mentoria com IA</p>
          <p>Este email foi enviado automaticamente pelo sistema.</p>
        </div>

      </body>
      </html>
    `;

    // Enviar email
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log('✅ Email enviado para mentor com sucesso!', result.body?.messageId);

    return {
      success: true,
      messageId: result.body?.messageId
    };

  } catch (error) {
    console.error('❌ Erro ao enviar email para mentor:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function notificarMentoradoNovoAgendamento(data) {
  console.log(`📧 Enviando notificação de novo agendamento para mentorado:`, {
    email: data.menteeEmail,
    mentorado: data.menteeName
  });

  try {
    const { default: brevo } = await import('@getbrevo/brevo');

    // Configurar API
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

    // Criar email
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || 'Mentora AI',
      email: process.env.BREVO_SENDER_EMAIL || 'contato@mentorx.com.br'
    };

    sendSmtpEmail.to = [{
      email: data.menteeEmail,
      name: data.menteeName
    }];

    sendSmtpEmail.subject = `✅ Agendamento Confirmado com ${data.mentorName}`;

    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Agendamento Confirmado</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">

        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">✅ Agendamento Confirmado!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">MentorX Connect Hub</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0; font-size: 24px;">Olá, ${data.menteeName}! 👋</h2>

          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Seu agendamento foi confirmado com sucesso! Estamos ansiosos para sua sessão de mentoria.
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="color: #28a745; margin-top: 0;">📅 Detalhes do seu Agendamento:</h3>
            <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
              <li><strong>🎯 Mentor:</strong> ${data.mentorName}</li>
              <li><strong>📅 Data:</strong> ${data.appointmentDate}</li>
              <li><strong>⏰ Horário:</strong> ${data.appointmentTime}</li>
              <li><strong>🌍 Timezone:</strong> ${data.timezone}</li>
              ${data.notes ? `<li><strong>📝 Observações:</strong> ${data.notes}</li>` : ''}
              ${data.meetLink ? `<li><strong>🔗 Link da Reunião:</strong> <a href="${data.meetLink}" style="color: #28a745;">${data.meetLink}</a></li>` : ''}
            </ul>
          </div>

          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0;">⏰ Lembrete Importante:</h4>
            <p style="color: #856404; margin: 0; line-height: 1.6;">
              Lembre-se de estar online 5 minutos antes do horário agendado. Prepare suas dúvidas e objetivos para aproveitar ao máximo sua sessão!
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://mentorx.com.br/mentorado/meus-agendamentos" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Ver Meus Agendamentos
            </a>
          </div>

          <p style="color: #666; line-height: 1.6; font-size: 14px; margin-top: 30px;">
            Qualquer dúvida, estamos aqui para ajudar. Boa sessão de mentoria!
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} MentorX Connect Hub - Sistema de Mentoria com IA</p>
          <p>Este email foi enviado automaticamente pelo sistema.</p>
        </div>

      </body>
      </html>
    `;

    // Enviar email
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log('✅ Email enviado para mentorado com sucesso!', result.body?.messageId);

    return {
      success: true,
      messageId: result.body?.messageId
    };

  } catch (error) {
    console.error('❌ Erro ao enviar email para mentorado:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ===============================================================================
// 📧 FUNÇÃO: E-mail de Boas-vindas para Mentor
// ===============================================================================
async function enviarEmailBoasVindasMentor(data) {
  console.log(`📧 Enviando boas-vindas para mentor:`, {
    email: data.userEmail,
    nome: data.userName
  });

  try {
    const { default: brevo } = await import('@getbrevo/brevo');

    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || 'Mentora AI',
      email: process.env.BREVO_SENDER_EMAIL || 'contato@mentorx.com.br'
    };

    sendSmtpEmail.to = [{
      email: data.userEmail,
      name: data.userName
    }];

    sendSmtpEmail.subject = `🎯 Bem-vindo à MentorX, ${data.userName}!`;

    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bem-vindo Mentor</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">

        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎯 Seja Bem-vindo!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">MentorX Connect Hub</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0; font-size: 24px;">Olá, ${data.userName}! 👋</h2>

          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Parabéns por se tornar um mentor na MentorX! Você agora faz parte de uma comunidade exclusiva de profissionais que compartilham conhecimento e transformam carreiras.
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="color: #28a745; margin-top: 0;">🚀 Próximos Passos:</h3>
            <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
              <li><strong>📊 Complete seu perfil:</strong> Adicione suas especialidades e experiências</li>
              <li><strong>⏰ Configure sua disponibilidade:</strong> Defina horários para mentorias</li>
              <li><strong>💰 Configure pagamentos:</strong> Conecte sua conta Stripe para receber</li>
              <li><strong>🎥 Crie conteúdos:</strong> Compartilhe seu conhecimento em cursos</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.loginUrl || 'https://www.mentorx.com.br/mentor/dashboard'}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Acessar Dashboard
            </a>
          </div>

          <p style="color: #666; line-height: 1.6; font-size: 14px; margin-top: 30px;">
            Estamos aqui para ajudá-lo a ter sucesso como mentor. Qualquer dúvida, nossa equipe está à disposição!
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} MentorX Connect Hub - Sistema de Mentoria com IA</p>
          <p>Este email foi enviado automaticamente pelo sistema.</p>
        </div>

      </body>
      </html>
    `;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log('✅ Email boas-vindas mentor enviado com sucesso!', result.body?.messageId);

    return {
      success: true,
      messageId: result.body?.messageId
    };

  } catch (error) {
    console.error('❌ Erro ao enviar email boas-vindas mentor:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ===============================================================================
// 📧 FUNÇÃO: E-mail de Boas-vindas para Mentorado
// ===============================================================================
async function enviarEmailBoasVindasMentorado(data) {
  console.log(`📧 Enviando boas-vindas para mentorado:`, {
    email: data.userEmail,
    nome: data.userName
  });

  try {
    const { default: brevo } = await import('@getbrevo/brevo');

    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || 'Mentora AI',
      email: process.env.BREVO_SENDER_EMAIL || 'contato@mentorx.com.br'
    };

    sendSmtpEmail.to = [{
      email: data.userEmail,
      name: data.userName
    }];

    sendSmtpEmail.subject = `🎓 Bem-vindo à MentorX, ${data.userName}!`;

    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bem-vindo Mentorado</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">

        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎓 Seja Bem-vindo!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">MentorX Connect Hub</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0; font-size: 24px;">Olá, ${data.userName}! 👋</h2>

          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Parabéns por dar o primeiro passo na sua jornada de crescimento profissional! Você agora tem acesso aos melhores mentores e conteúdos da MentorX.
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="color: #28a745; margin-top: 0;">🚀 Como começar:</h3>
            <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
              <li><strong>🔍 Explore mentores:</strong> Encontre especialistas na sua área de interesse</li>
              <li><strong>📅 Agende mentorias:</strong> Reserve sessões individuais com mentores</li>
              <li><strong>📚 Acesse cursos:</strong> Aprenda com conteúdos exclusivos</li>
              <li><strong>🎯 Defina objetivos:</strong> Planeje sua evolução profissional</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.loginUrl || 'https://www.mentorx.com.br/mentorado/dashboard'}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Começar Agora
            </a>
          </div>

          <p style="color: #666; line-height: 1.6; font-size: 14px; margin-top: 30px;">
            Estamos aqui para apoiar seu crescimento profissional. Vamos juntos alcançar seus objetivos!
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} MentorX Connect Hub - Sistema de Mentoria com IA</p>
          <p>Este email foi enviado automaticamente pelo sistema.</p>
        </div>

      </body>
      </html>
    `;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log('✅ Email boas-vindas mentorado enviado com sucesso!', result.body?.messageId);

    return {
      success: true,
      messageId: result.body?.messageId
    };

  } catch (error) {
    console.error('❌ Erro ao enviar email boas-vindas mentorado:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ===============================================================================
// 📧 FUNÇÃO: E-mail de Compra de Curso
// ===============================================================================
async function enviarEmailCompraCurso(data) {
  console.log(`📧 Enviando confirmação de compra de curso:`, {
    email: data.menteeEmail,
    curso: data.courseName,
    mentor: data.mentorName
  });

  try {
    const { default: brevo } = await import('@getbrevo/brevo');

    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || 'Mentora AI',
      email: process.env.BREVO_SENDER_EMAIL || 'contato@mentorx.com.br'
    };

    sendSmtpEmail.to = [{
      email: data.menteeEmail,
      name: data.menteeName
    }];

    sendSmtpEmail.subject = `🎉 Curso Adquirido: ${data.courseName}`;

    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Curso Adquirido</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">

        <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Parabéns!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Curso Adquirido com Sucesso</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0; font-size: 24px;">Olá, ${data.menteeName}! 👋</h2>

          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Sua compra foi processada com sucesso! Você agora tem acesso completo ao curso:
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b35; margin: 20px 0;">
            <h3 style="color: #ff6b35; margin-top: 0;">📚 Detalhes do Curso:</h3>
            <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
              <li><strong>🎯 Curso:</strong> ${data.courseName}</li>
              <li><strong>👨‍🏫 Mentor:</strong> ${data.mentorName}</li>
              <li><strong>💰 Valor:</strong> R$ ${data.coursePrice}</li>
              <li><strong>📅 Data de Acesso:</strong> ${new Date().toLocaleDateString('pt-BR')}</li>
            </ul>
          </div>

          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">🎥 Como Acessar:</h4>
            <p style="color: #555; line-height: 1.6; margin: 0;">
              O curso já está disponível no seu dashboard. Clique no botão abaixo para começar a estudar imediatamente!
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.courseUrl || 'https://www.mentorx.com.br/mentorado/cursos'}" style="background: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Acessar Curso
            </a>
          </div>

          <p style="color: #666; line-height: 1.6; font-size: 14px; margin-top: 30px;">
            Aproveite ao máximo seu aprendizado! Qualquer dúvida, estamos aqui para ajudar.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} MentorX Connect Hub - Sistema de Mentoria com IA</p>
          <p>Este email foi enviado automaticamente pelo sistema.</p>
        </div>

      </body>
      </html>
    `;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log('✅ Email compra curso enviado com sucesso!', result.body?.messageId);

    return {
      success: true,
      messageId: result.body?.messageId
    };

  } catch (error) {
    console.error('❌ Erro ao enviar email compra curso:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ===============================================================================
// 📧 FUNÇÃO: E-mail de Cancelamento de Agendamento
// ===============================================================================
async function enviarEmailCancelamentoAgendamento(data) {
  console.log(`📧 Enviando notificação de cancelamento:`, {
    email: data.recipientEmail,
    agendamento: data.appointmentDate
  });

  try {
    const { default: brevo } = await import('@getbrevo/brevo');

    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || 'Mentora AI',
      email: process.env.BREVO_SENDER_EMAIL || 'contato@mentorx.com.br'
    };

    sendSmtpEmail.to = [{
      email: data.recipientEmail,
      name: data.recipientName
    }];

    sendSmtpEmail.subject = `⚠️ Agendamento Cancelado - ${data.appointmentDate}`;

    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Agendamento Cancelado</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">

        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">⚠️ Agendamento Cancelado</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">MentorX Connect Hub</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0; font-size: 24px;">Olá, ${data.recipientName}! 👋</h2>

          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Informamos que o agendamento abaixo foi cancelado:
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;">
            <h3 style="color: #dc3545; margin-top: 0;">📅 Detalhes do Agendamento Cancelado:</h3>
            <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
              <li><strong>📅 Data:</strong> ${data.appointmentDate}</li>
              <li><strong>⏰ Horário:</strong> ${data.appointmentTime}</li>
              <li><strong>🎯 ${data.recipientRole === 'mentor' ? 'Mentorado' : 'Mentor'}:</strong> ${data.otherPartyName}</li>
              ${data.cancellationReason ? `<li><strong>📝 Motivo:</strong> ${data.cancellationReason}</li>` : ''}
            </ul>
          </div>

          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0;">💡 O que fazer agora:</h4>
            <ul style="color: #856404; margin: 0; line-height: 1.6;">
              <li>Verifique sua agenda para reagendar se necessário</li>
              <li>Entre em contato com a outra parte se desejar</li>
              <li>Se houve cobrança, o reembolso será processado automaticamente</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.mentorx.com.br/${data.recipientRole}/agendamentos" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Ver Meus Agendamentos
            </a>
          </div>

          <p style="color: #666; line-height: 1.6; font-size: 14px; margin-top: 30px;">
            Lamentamos pelo inconveniente. Qualquer dúvida, nossa equipe está à disposição.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} MentorX Connect Hub - Sistema de Mentoria com IA</p>
          <p>Este email foi enviado automaticamente pelo sistema.</p>
        </div>

      </body>
      </html>
    `;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log('✅ Email cancelamento enviado com sucesso!', result.body?.messageId);

    return {
      success: true,
      messageId: result.body?.messageId
    };

  } catch (error) {
    console.error('❌ Erro ao enviar email cancelamento:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export {
  notificarMentorNovoAgendamento,
  notificarMentoradoNovoAgendamento,
  enviarEmailBoasVindasMentor,
  enviarEmailBoasVindasMentorado,
  enviarEmailCompraCurso,
  enviarEmailCancelamentoAgendamento
};