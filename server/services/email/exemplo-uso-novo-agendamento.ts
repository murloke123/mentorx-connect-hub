/**
 * Exemplo de como usar o serviço de e-mail para notificar mentores sobre novos agendamentos
 * Este arquivo demonstra como integrar o serviço emailNewSchedule na sua aplicação
 */

import { notificarMentorNovoAgendamento } from './emailService';

/**
 * Exemplo 1: Função simples para notificar mentor sobre novo agendamento
 * Deve ser chamada sempre que um novo agendamento for criado
 */
export async function exemploNotificarMentor() {
  const resultado = await notificarMentorNovoAgendamento({
    mentorName: 'João Silva',
    mentorEmail: 'joao.silva@email.com',
    menteeName: 'Maria Santos',
    appointmentDate: '15/01/2025',
    appointmentTime: '14:00 - 15:00',
    timezone: 'America/Sao_Paulo (UTC-3)',
    notes: 'Primeira sessão de mentoria sobre desenvolvimento de carreira'
  });

  if (resultado.success) {
    console.log('✅ E-mail enviado com sucesso! ID:', resultado.messageId);
  } else {
    console.error('❌ Erro ao enviar e-mail:', resultado.error);
  }

  return resultado;
}

/**
 * Exemplo 2: Como integrar no seu código quando um agendamento é criado
 * Este é um exemplo de como você pode usar em uma rota ou controlador
 */
export async function aoCreateNovoAgendamento(agendamentoData: any) {
  try {
    // 1. Criar o agendamento no banco (seu código existente)
    // const novoAgendamento = await criarAgendamentoDB(agendamentoData);

    // 2. Buscar dados do mentor
    // const mentor = await buscarMentorPorId(agendamentoData.mentor_id);
    
    // 3. Formatar dados para o e-mail
    const dadosEmail = {
      mentorName: 'Nome do Mentor', // mentor.name
      mentorEmail: 'email@mentor.com', // mentor.email
      menteeName: 'Nome do Mentorado', // agendamentoData.mentee_name
      appointmentDate: '15/01/2025', // formatarData(agendamentoData.scheduled_date)
      appointmentTime: '14:00 - 15:00', // formatarHorario(agendamentoData.start_time, agendamentoData.end_time)
      timezone: 'America/Sao_Paulo (UTC-3)', // agendamentoData.timezone
      notes: agendamentoData.notes || undefined
    };

    // 4. Enviar e-mail de notificação
    const resultadoEmail = await notificarMentorNovoAgendamento(dadosEmail);
    
    if (resultadoEmail.success) {
      console.log('📧 Mentor notificado por e-mail sobre novo agendamento');
    } else {
      console.error('❌ Falha ao notificar mentor por e-mail:', resultadoEmail.error);
      // Não quebrar o fluxo - agendamento já foi criado
    }

    return {
      agendamento: 'criado com sucesso',
      emailNotificacao: resultadoEmail.success
    };

  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error);
    throw error;
  }
}

/**
 * Exemplo 3: Trigger no banco de dados (conceitual)
 * Se você quiser usar um trigger no Supabase:
 */
/*
-- SQL Trigger Example (Supabase)
CREATE OR REPLACE FUNCTION notify_mentor_new_appointment()
RETURNS TRIGGER AS $$
BEGIN
  -- Chamar função edge function que usa o serviço de e-mail
  PERFORM net.http_post(
    url := 'https://seu-projeto.supabase.co/functions/v1/notify-new-appointment',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb,
    body := row_to_json(NEW)::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_mentor_new_appointment
  AFTER INSERT ON calendar
  FOR EACH ROW
  EXECUTE FUNCTION notify_mentor_new_appointment();
*/

/**
 * Exemplo 4: Uso em uma API route (Express/Node.js)
 */
export function exemploAPIRoute() {
  // app.post('/api/agendamentos', async (req, res) => {
  //   try {
  //     const { mentor_id, mentee_name, scheduled_date, start_time, end_time, timezone, notes } = req.body;
  //     
  //     // Criar agendamento
  //     const agendamento = await criarAgendamento(req.body);
  //     
  //     // Buscar dados do mentor
  //     const mentor = await buscarMentor(mentor_id);
  //     
  //     // Enviar notificação por e-mail
  //     await notificarMentorNovoAgendamento({
  //       mentorName: mentor.name,
  //       mentorEmail: mentor.email,
  //       menteeName: mentee_name,
  //       appointmentDate: formatDate(scheduled_date),
  //       appointmentTime: `${start_time} - ${end_time}`,
  //       timezone: timezone,
  //       notes: notes
  //     });
  //     
  //     res.json({ success: true, agendamento });
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // });
}

export default {
  exemploNotificarMentor,
  aoCreateNovoAgendamento,
  exemploAPIRoute
}; 