export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  'booking-confirmation': {
    id: 'booking-confirmation',
    name: 'Confirmação de Agendamento',
    subject: 'Confirmação de Agendamento - {{appointmentTitle}}',
    variables: ['mentorName', 'appointmentTitle', 'appointmentDate', 'appointmentTime', 'duration', 'meetingType', 'meetingLink', 'location'],
    textContent: `
Olá!

Seu agendamento com {{mentorName}} foi confirmado com sucesso.

Detalhes do Agendamento:
- Sessão: {{appointmentTitle}}
- Data: {{appointmentDate}}
- Horário: {{appointmentTime}}
- Duração: {{duration}} minutos
- Tipo: {{meetingType}}
{{#if meetingLink}}- Link: {{meetingLink}}{{/if}}
{{#if location}}- Local: {{location}}{{/if}}

Você receberá um lembrete antes da sessão.

Atenciosamente,
Equipe MentorX Connect Hub
    `.trim(),
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0;">✅ Agendamento Confirmado</h1>
  </div>
  
  <div style="padding: 30px; background: white; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
    <p>Olá!</p>
    
    <p>Seu agendamento com <strong>{{mentorName}}</strong> foi confirmado com sucesso.</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h3 style="margin-top: 0; color: #667eea;">📅 Detalhes do Agendamento</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0; font-weight: bold; color: #555;">Sessão:</td>
          <td style="padding: 8px 0;">{{appointmentTitle}}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0; font-weight: bold; color: #555;">Data:</td>
          <td style="padding: 8px 0;">{{appointmentDate}}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0; font-weight: bold; color: #555;">Horário:</td>
          <td style="padding: 8px 0;">{{appointmentTime}}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0; font-weight: bold; color: #555;">Duração:</td>
          <td style="padding: 8px 0;">{{duration}} minutos</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0; font-weight: bold; color: #555;">Tipo:</td>
          <td style="padding: 8px 0;">{{meetingType}}</td>
        </tr>
        {{#if meetingLink}}
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0; font-weight: bold; color: #555;">Link:</td>
          <td style="padding: 8px 0;"><a href="{{meetingLink}}" style="color: #667eea;">{{meetingLink}}</a></td>
        </tr>
        {{/if}}
        {{#if location}}
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #555;">Local:</td>
          <td style="padding: 8px 0;">{{location}}</td>
        </tr>
        {{/if}}
      </table>
    </div>
    
    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #1565c0;">
        <strong>💡 Lembrete:</strong> Você receberá uma notificação antes da sessão. Se precisar remarcar ou cancelar, entre em contato conosco.
      </p>
    </div>
    
    <p>Atenciosamente,<br><strong>Equipe MentorX Connect Hub</strong></p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>MentorX Connect Hub - Conectando mentores e mentorados</p>
  </div>
</div>
    `.trim(),
  },

  'booking-reminder': {
    id: 'booking-reminder',
    name: 'Lembrete de Agendamento',
    subject: '🔔 Lembrete: Sua sessão com {{mentorName}} é em breve',
    variables: ['mentorName', 'appointmentTitle', 'appointmentDate', 'appointmentTime', 'meetingLink', 'location'],
    textContent: `
Olá!

Este é um lembrete de que você tem uma sessão agendada com {{mentorName}}.

Detalhes da Sessão:
- Sessão: {{appointmentTitle}}
- Data: {{appointmentDate}}
- Horário: {{appointmentTime}}
{{#if meetingLink}}- Link: {{meetingLink}}{{/if}}
{{#if location}}- Local: {{location}}{{/if}}

Estamos ansiosos para sua sessão!

Atenciosamente,
Equipe MentorX Connect Hub
    `.trim(),
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0;">🔔 Lembrete de Sessão</h1>
  </div>
  
  <div style="padding: 30px; background: white; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
    <p>Olá!</p>
    
    <p>Este é um lembrete de que você tem uma sessão agendada com <strong>{{mentorName}}</strong>.</p>
    
    <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #e65100;">⏰ Sua sessão é em breve!</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #ffcc80;">
          <td style="padding: 8px 0; font-weight: bold; color: #e65100;">Sessão:</td>
          <td style="padding: 8px 0;">{{appointmentTitle}}</td>
        </tr>
        <tr style="border-bottom: 1px solid #ffcc80;">
          <td style="padding: 8px 0; font-weight: bold; color: #e65100;">Data:</td>
          <td style="padding: 8px 0;">{{appointmentDate}}</td>
        </tr>
        <tr style="border-bottom: 1px solid #ffcc80;">
          <td style="padding: 8px 0; font-weight: bold; color: #e65100;">Horário:</td>
          <td style="padding: 8px 0;">{{appointmentTime}}</td>
        </tr>
        {{#if meetingLink}}
        <tr style="border-bottom: 1px solid #ffcc80;">
          <td style="padding: 8px 0; font-weight: bold; color: #e65100;">Link:</td>
          <td style="padding: 8px 0;"><a href="{{meetingLink}}" style="color: #e65100;">{{meetingLink}}</a></td>
        </tr>
        {{/if}}
        {{#if location}}
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #e65100;">Local:</td>
          <td style="padding: 8px 0;">{{location}}</td>
        </tr>
        {{/if}}
      </table>
    </div>
    
    {{#if meetingLink}}
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{meetingLink}}" style="background: #ff9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
        🎥 Entrar na Reunião
      </a>
    </div>
    {{/if}}
    
    <p>Estamos ansiosos para sua sessão!</p>
    
    <p>Atenciosamente,<br><strong>Equipe MentorX Connect Hub</strong></p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>MentorX Connect Hub - Conectando mentores e mentorados</p>
  </div>
</div>
    `.trim(),
  },

  'booking-cancellation': {
    id: 'booking-cancellation',
    name: 'Cancelamento de Agendamento',
    subject: '❌ Agendamento Cancelado - {{appointmentTitle}}',
    variables: ['recipientName', 'appointmentTitle', 'appointmentDate', 'appointmentTime', 'reason'],
    textContent: `
Olá {{recipientName}}!

Informamos que o seguinte agendamento foi cancelado:

Agendamento Cancelado:
- Sessão: {{appointmentTitle}}
- Data: {{appointmentDate}}
- Horário: {{appointmentTime}}
{{#if reason}}- Motivo: {{reason}}{{/if}}

Se desejar reagendar, entre em contato conosco. Pedimos desculpas por qualquer inconveniente.

Atenciosamente,
Equipe MentorX Connect Hub
    `.trim(),
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #f44336; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0;">❌ Agendamento Cancelado</h1>
  </div>
  
  <div style="padding: 30px; background: white; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
    <p>Olá <strong>{{recipientName}}</strong>!</p>
    
    <p>Informamos que o seguinte agendamento foi cancelado:</p>
    
    <div style="background: #ffebee; border-left: 4px solid #f44336; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #c62828;">📅 Agendamento Cancelado</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #ffcdd2;">
          <td style="padding: 8px 0; font-weight: bold; color: #c62828;">Sessão:</td>
          <td style="padding: 8px 0;">{{appointmentTitle}}</td>
        </tr>
        <tr style="border-bottom: 1px solid #ffcdd2;">
          <td style="padding: 8px 0; font-weight: bold; color: #c62828;">Data:</td>
          <td style="padding: 8px 0;">{{appointmentDate}}</td>
        </tr>
        <tr style="border-bottom: 1px solid #ffcdd2;">
          <td style="padding: 8px 0; font-weight: bold; color: #c62828;">Horário:</td>
          <td style="padding: 8px 0;">{{appointmentTime}}</td>
        </tr>
        {{#if reason}}
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #c62828;">Motivo:</td>
          <td style="padding: 8px 0;">{{reason}}</td>
        </tr>
        {{/if}}
      </table>
    </div>
    
    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #1565c0;">
        <strong>💡 Quer reagendar?</strong> Entre em contato conosco para encontrarmos um novo horário que funcione para você.
      </p>
    </div>
    
    <p>Pedimos desculpas por qualquer inconveniente causado.</p>
    
    <p>Atenciosamente,<br><strong>Equipe MentorX Connect Hub</strong></p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>MentorX Connect Hub - Conectando mentores e mentorados</p>
  </div>
</div>
    `.trim(),
  },

  'new-booking-notification': {
    id: 'new-booking-notification',
    name: 'Notificação de Novo Agendamento',
    subject: '🎉 Novo Agendamento - {{appointmentTitle}}',
    variables: ['mentorName', 'menteeName', 'menteeEmail', 'menteePhone', 'appointmentTitle', 'appointmentDate', 'appointmentTime', 'duration', 'message'],
    textContent: `
Olá {{mentorName}}!

Você recebeu um novo agendamento na plataforma MentorX Connect Hub.

Detalhes do Agendamento:
- Sessão: {{appointmentTitle}}
- Data: {{appointmentDate}}
- Horário: {{appointmentTime}}
- Duração: {{duration}} minutos

Informações do Mentorado:
- Nome: {{menteeName}}
- Email: {{menteeEmail}}
{{#if menteePhone}}- Telefone: {{menteePhone}}{{/if}}
{{#if message}}- Mensagem: {{message}}{{/if}}

Prepare-se para uma ótima sessão de mentoria!

Atenciosamente,
Equipe MentorX Connect Hub
    `.trim(),
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0;">🎉 Novo Agendamento!</h1>
  </div>
  
  <div style="padding: 30px; background: white; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
    <p>Olá <strong>{{mentorName}}</strong>!</p>
    
    <p>Você recebeu um novo agendamento na plataforma <strong>MentorX Connect Hub</strong>.</p>
    
    <div style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #2e7d32;">📅 Detalhes do Agendamento</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #c8e6c9;">
          <td style="padding: 8px 0; font-weight: bold; color: #2e7d32;">Sessão:</td>
          <td style="padding: 8px 0;">{{appointmentTitle}}</td>
        </tr>
        <tr style="border-bottom: 1px solid #c8e6c9;">
          <td style="padding: 8px 0; font-weight: bold; color: #2e7d32;">Data:</td>
          <td style="padding: 8px 0;">{{appointmentDate}}</td>
        </tr>
        <tr style="border-bottom: 1px solid #c8e6c9;">
          <td style="padding: 8px 0; font-weight: bold; color: #2e7d32;">Horário:</td>
          <td style="padding: 8px 0;">{{appointmentTime}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #2e7d32;">Duração:</td>
          <td style="padding: 8px 0;">{{duration}} minutos</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #f5f5f5; border-left: 4px solid #666; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #333;">👤 Informações do Mentorado</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px 0; font-weight: bold; color: #333;">Nome:</td>
          <td style="padding: 8px 0;">{{menteeName}}</td>
        </tr>
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px 0; font-weight: bold; color: #333;">Email:</td>
          <td style="padding: 8px 0;"><a href="mailto:{{menteeEmail}}" style="color: #333;">{{menteeEmail}}</a></td>
        </tr>
        {{#if menteePhone}}
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px 0; font-weight: bold; color: #333;">Telefone:</td>
          <td style="padding: 8px 0;">{{menteePhone}}</td>
        </tr>
        {{/if}}
        {{#if message}}
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #333; vertical-align: top;">Mensagem:</td>
          <td style="padding: 8px 0;">{{message}}</td>
        </tr>
        {{/if}}
      </table>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{frontendUrl}}/mentor/agendamentos" style="background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
        📅 Ver no Calendário
      </a>
    </div>
    
    <p>Prepare-se para uma ótima sessão de mentoria!</p>
    
    <p>Atenciosamente,<br><strong>Equipe MentorX Connect Hub</strong></p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>MentorX Connect Hub - Conectando mentores e mentorados</p>
  </div>
</div>
    `.trim(),
  },

  'welcome-mentor': {
    id: 'welcome-mentor',
    name: 'Boas-vindas - Mentor',
    subject: '🎉 Bem-vindo ao MentorX Connect Hub, {{userName}}!',
    variables: ['userName', 'dashboardUrl'],
    textContent: `
Olá {{userName}}!

Bem-vindo ao MentorX Connect Hub! Estamos muito felizes em tê-lo como mentor em nossa plataforma.

Como mentor, você poderá:
- Criar e gerenciar seus horários de mentoria
- Conectar-se com mentorados interessados em sua expertise
- Acompanhar seu progresso e ganhos
- Receber avaliações e feedbacks

Acesse seu dashboard em: {{dashboardUrl}}

Se tiver alguma dúvida, nossa equipe está aqui para ajudar.

Atenciosamente,
Equipe MentorX Connect Hub
    `.trim(),
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">🎉 Bem-vindo!</h1>
    <p style="margin: 10px 0 0 0; font-size: 18px;">{{userName}}</p>
  </div>
  
  <div style="padding: 40px; background: white; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; color: #333;">Parabéns por se juntar ao <strong>MentorX Connect Hub</strong>!</p>
    
    <p>Estamos muito felizes em tê-lo como mentor em nossa plataforma. Sua experiência e conhecimento irão fazer a diferença na vida de muitos mentorados.</p>
    
    <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #667eea;">🌟 Como mentor, você poderá:</h3>
      <ul style="margin: 15px 0; padding-left: 20px; color: #555;">
        <li style="margin-bottom: 8px;">📅 Criar e gerenciar seus horários de mentoria</li>
        <li style="margin-bottom: 8px;">🤝 Conectar-se com mentorados interessados em sua expertise</li>
        <li style="margin-bottom: 8px;">📊 Acompanhar seu progresso e ganhos</li>
        <li style="margin-bottom: 8px;">⭐ Receber avaliações e feedbacks valiosos</li>
        <li style="margin-bottom: 8px;">💰 Monetizar seu conhecimento de forma flexível</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboardUrl}}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">
        🚀 Acessar Meu Dashboard
      </a>
    </div>
    
    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #1565c0;">
        <strong>💡 Dica:</strong> Complete seu perfil e configure seus horários para começar a receber agendamentos de mentorados interessados em sua área de expertise.
      </p>
    </div>
    
    <p>Se tiver alguma dúvida ou precisar de ajuda, nossa equipe está sempre disponível para apoiá-lo.</p>
    
    <p>Vamos juntos construir uma comunidade incrível de aprendizado e crescimento!</p>
    
    <p>Atenciosamente,<br><strong>Equipe MentorX Connect Hub</strong></p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>MentorX Connect Hub - Conectando mentores e mentorados</p>
  </div>
</div>
    `.trim(),
  },

  'welcome-mentee': {
    id: 'welcome-mentee',
    name: 'Boas-vindas - Mentorado',
    subject: '🎉 Bem-vindo ao MentorX Connect Hub, {{userName}}!',
    variables: ['userName', 'dashboardUrl'],
    textContent: `
Olá {{userName}}!

Bem-vindo ao MentorX Connect Hub! Estamos muito felizes em tê-lo como mentorado em nossa plataforma.

Como mentorado, você poderá:
- Encontrar mentores especialistas em diversas áreas
- Agendar sessões de mentoria personalizadas
- Acompanhar seu progresso de aprendizado
- Avaliar e dar feedback sobre as sessões

Acesse seu dashboard em: {{dashboardUrl}}

Se tiver alguma dúvida, nossa equipe está aqui para ajudar.

Atenciosamente,
Equipe MentorX Connect Hub
    `.trim(),
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">🎉 Bem-vindo!</h1>
    <p style="margin: 10px 0 0 0; font-size: 18px;">{{userName}}</p>
  </div>
  
  <div style="padding: 40px; background: white; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; color: #333;">Parabéns por se juntar ao <strong>MentorX Connect Hub</strong>!</p>
    
    <p>Estamos muito felizes em tê-lo como mentorado em nossa plataforma. Sua jornada de aprendizado e crescimento profissional começa agora!</p>
    
    <div style="background: #f8f9fa; border-left: 4px solid #4caf50; padding: 20px; margin: 30px 0; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #4caf50;">🌟 Como mentorado, você poderá:</h3>
      <ul style="margin: 15px 0; padding-left: 20px; color: #555;">
        <li style="margin-bottom: 8px;">🔍 Encontrar mentores especialistas em diversas áreas</li>
        <li style="margin-bottom: 8px;">📅 Agendar sessões de mentoria personalizadas</li>
        <li style="margin-bottom: 8px;">📈 Acompanhar seu progresso de aprendizado</li>
        <li style="margin-bottom: 8px;">⭐ Avaliar e dar feedback sobre as sessões</li>
        <li style="margin-bottom: 8px;">🎯 Definir e alcançar seus objetivos profissionais</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{dashboardUrl}}" style="background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">
        🚀 Acessar Meu Dashboard
      </a>
    </div>
    
    <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #2e7d32;">
        <strong>💡 Dica:</strong> Explore nossa lista de mentores e encontre aqueles que podem ajudá-lo a alcançar seus objetivos. Não hesite em agendar sua primeira sessão!
      </p>
    </div>
    
    <p>Se tiver alguma dúvida ou precisar de ajuda para encontrar o mentor ideal, nossa equipe está sempre disponível para apoiá-lo.</p>
    
    <p>Prepare-se para uma jornada incrível de aprendizado e crescimento!</p>
    
    <p>Atenciosamente,<br><strong>Equipe MentorX Connect Hub</strong></p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>MentorX Connect Hub - Conectando mentores e mentorados</p>
  </div>
</div>
    `.trim(),
  },

  'password-reset': {
    id: 'password-reset',
    name: 'Redefinição de Senha',
    subject: '🔑 Solicitação de Redefinição de Senha',
    variables: ['userName', 'resetUrl', 'expirationTime'],
    textContent: `
Olá {{userName}}!

Recebemos uma solicitação para redefinir a senha de sua conta no MentorX Connect Hub.

Para redefinir sua senha, clique no link abaixo:
{{resetUrl}}

Este link é válido por {{expirationTime}}.

Se você não solicitou esta redefinição, pode ignorar este email com segurança.

Atenciosamente,
Equipe MentorX Connect Hub
    `.trim(),
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #ff9800; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0;">🔑 Redefinição de Senha</h1>
  </div>
  
  <div style="padding: 30px; background: white; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
    <p>Olá <strong>{{userName}}</strong>!</p>
    
    <p>Recebemos uma solicitação para redefinir a senha de sua conta no <strong>MentorX Connect Hub</strong>.</p>
    
    <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #e65100;">
        <strong>⚠️ Atenção:</strong> Este link é válido por <strong>{{expirationTime}}</strong>. Após este período, você precisará solicitar uma nova redefinição.
      </p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{resetUrl}}" style="background: #ff9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">
        🔑 Redefinir Minha Senha
      </a>
    </div>
    
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #666; font-size: 14px;">
        <strong>Não solicitou esta redefinição?</strong><br>
        Se você não solicitou a redefinição de senha, pode ignorar este email com segurança. Sua senha permanecerá inalterada.
      </p>
    </div>
    
    <p>Por motivos de segurança, recomendamos que você:</p>
    <ul style="color: #555;">
      <li>Use uma senha forte e única</li>
      <li>Não compartilhe suas credenciais com terceiros</li>
      <li>Mantenha seu email seguro</li>
    </ul>
    
    <p>Se tiver alguma dúvida ou precisar de ajuda, entre em contato conosco.</p>
    
    <p>Atenciosamente,<br><strong>Equipe MentorX Connect Hub</strong></p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>MentorX Connect Hub - Conectando mentores e mentorados</p>
  </div>
</div>
    `.trim(),
  },
};

/**
 * Substitui variáveis no template
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, any>
): string {
  let result = template;

  // Replace simple variables {{variable}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value || ''));
  });

  // Handle conditional blocks {{#if variable}}...{{/if}}
  result = result.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/gs, (match, variable, content) => {
    return variables[variable] ? content : '';
  });

  // Clean up any remaining template syntax
  result = result.replace(/{{.*?}}/g, '');

  return result;
}

/**
 * Obtém template por ID
 */
export function getTemplate(templateId: string): EmailTemplate | null {
  return EMAIL_TEMPLATES[templateId] || null;
}

/**
 * Lista todos os templates disponíveis
 */
export function getAllTemplates(): EmailTemplate[] {
  return Object.values(EMAIL_TEMPLATES);
}

/**
 * Renderiza template com variáveis
 */
export function renderTemplate(
  templateId: string,
  variables: Record<string, any>
): { subject: string; htmlContent: string; textContent: string } | null {
  const template = getTemplate(templateId);
  if (!template) {
    return null;
  }

  return {
    subject: replaceTemplateVariables(template.subject, variables),
    htmlContent: replaceTemplateVariables(template.htmlContent, variables),
    textContent: replaceTemplateVariables(template.textContent, variables),
  };
}

export default {
  EMAIL_TEMPLATES,
  replaceTemplateVariables,
  getTemplate,
  getAllTemplates,
  renderTemplate,
};