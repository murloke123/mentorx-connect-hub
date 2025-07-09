/**
 * ===============================================================================
 * 🔔 NOTIFICATION SERVICE - Sistema de Notificações da Plataforma
 * ===============================================================================
 * 
 * 🎯 OBJETIVO: Gerenciar todas as notificações internas da plataforma MentorX
 * 
 * 📋 MÉTODOS DISPONÍVEIS:
 * 
 * 🔧 CORE FUNCTIONS:
 * • createNotification() - Cria uma notificação genérica no banco
 * 
 * 📅 NOTIFICAÇÕES DE AGENDAMENTO:
 * • notifyAppointmentCancellation() - Agendamento cancelado (genérico)
 * • notifyScheduleCancelledByMentor() - Cancelamento específico do mentor
 * • notifyNewAppointment() - Novo agendamento criado
 * 
 * 👥 NOTIFICAÇÕES SOCIAIS:
 * • notifyNewFollower() - Novo seguidor adicionado
 * • notifyLostFollower() - Seguidor removido/perdido
 * 
 * 🎓 NOTIFICAÇÕES EDUCACIONAIS:
 * • notifyNewEnrollment() - Nova matrícula em curso
 * • notifyCourseUpdate() - Atualização em curso
 * 
 * 🔧 RECURSOS:
 * • Logs detalhados de todas as operações
 * • Validação automática de dados obrigatórios
 * • Tratamento robusto de erros
 * • Formatação automática de mensagens
 * • Integração direta com tabela notifications
 * • Stack trace completo para debug
 * 
 * 📊 TIPOS DE NOTIFICAÇÃO:
 * • new_follower - Novo seguidor
 * • lost_follower - Seguidor perdido
 * • appointment_cancelled - Agendamento cancelado
 * • cancel_schedule - Cancelamento pelo mentor
 * • schedule - Novo agendamento
 * • new_enrollment - Nova matrícula
 * • course_updated - Curso atualizado
 * 
 * 💡 INTERFACE:
 * • CreateNotificationData - Estrutura base para notificações
 * ===============================================================================
 */

import { supabase } from '../utils/supabase';

export interface CreateNotificationData {
  receiver_id: string;
  receiver_name: string;
  sender_id?: string;
  sender_name?: string;
  type: 'new_follower' | 'lost_follower' | 'appointment_cancelled' | 'cancel_schedule' | 'schedule' | 'new_enrollment' | 'course_updated';
  title: string;
  message: string;
}

/**
 * Criar uma nova notificação
 */
export async function createNotification(data: CreateNotificationData) {
  console.log('🔔 [NOTIFICATION] Iniciando createNotification');
  console.log('📦 [NOTIFICATION] Dados recebidos:', data);
  
  try {
    const insertData = {
      receiver_id: data.receiver_id,
      receiver_name: data.receiver_name,
      sender_id: data.sender_id,
      sender_name: data.sender_name,
      type: data.type,
      title: data.title,
      message: data.message,
      is_read: false,
    };
    
    console.log('📤 [NOTIFICATION] Dados para inserir no banco:', insertData);
    
    const { data: result, error } = await supabase
      .from('notifications')
      .insert(insertData)
      .select();

    if (error) {
      console.error('❌ [NOTIFICATION] Erro do Supabase:', error);
      throw error;
    }

    console.log('✅ [NOTIFICATION] Notificação criada com sucesso:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('💥 [NOTIFICATION] Erro ao criar notificação:', error);
    console.error('📋 [NOTIFICATION] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return { success: false, error };
  }
}

/**
 * Notificar sobre cancelamento de agendamento
 */
export async function notifyAppointmentCancellation({
  receiverId,
  receiverName,
  senderName,
  appointmentDate,
  appointmentTime,
  reason,
}: {
  receiverId: string;
  receiverName: string;
  senderName: string;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
}) {
  console.log('📅 [NOTIFICATION] Criando notificação de cancelamento');
  
  const title = 'Agendamento cancelado';
  const message = `${senderName} cancelou o agendamento de ${appointmentDate} às ${appointmentTime}${reason ? `. Motivo: ${reason}` : ''}`;

  return createNotification({
    receiver_id: receiverId,
    receiver_name: receiverName,
    sender_name: senderName,
    type: 'appointment_cancelled',
    title,
    message,
  });
}

/**
 * Notificar sobre cancelamento de agendamento pelo mentor
 */
export async function notifyScheduleCancelledByMentor({
  receiverId,
  receiverName,
  senderId,
  senderName,
  appointmentDate,
  appointmentTime,
  reason,
}: {
  receiverId: string;
  receiverName: string;
  senderId: string;
  senderName: string;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
}) {
  console.log('📅 [NOTIFICATION] Criando notificação de cancelamento pelo mentor (cancel_schedule)');
  
  const title = 'Agendamento Cancelado';
  const message = `${senderName} cancelou o agendamento de ${appointmentDate} às ${appointmentTime}${reason ? `. Motivo: ${reason}` : ''}`;

  return createNotification({
    receiver_id: receiverId,
    receiver_name: receiverName,
    sender_id: senderId,
    sender_name: senderName,
    type: 'cancel_schedule',
    title,
    message,
  });
}

/**
 * Notificar sobre novo seguidor
 */
export async function notifyNewFollower({
  mentorId,
  mentorName,
  followerId,
  followerName,
}: {
  mentorId: string;
  mentorName: string;
  followerId: string;
  followerName: string;
}) {
  console.log('👥 [NOTIFICATION] Criando notificação de novo seguidor');
  console.log('📋 [NOTIFICATION] Parâmetros recebidos:', {
    mentorId,
    mentorName,
    followerId,
    followerName
  });
  
  const title = 'Novo seguidor!';
  const message = `${followerName} começou a seguir você`;

  console.log('📝 [NOTIFICATION] Título e mensagem preparados:', { title, message });

  return createNotification({
    receiver_id: mentorId,
    receiver_name: mentorName,
    sender_id: followerId,
    sender_name: followerName,
    type: 'new_follower',
    title,
    message,
  });
}

/**
 * Notificar sobre perda de seguidor
 */
export async function notifyLostFollower({
  mentorId,
  mentorName,
  followerId,
  followerName,
}: {
  mentorId: string;
  mentorName: string;
  followerId: string;
  followerName: string;
}) {
  console.log('💔 [NOTIFICATION] Criando notificação de perda de seguidor');
  console.log('📋 [NOTIFICATION] Parâmetros recebidos:', {
    mentorId,
    mentorName,
    followerId,
    followerName
  });
  
  const title = 'Seguidor perdido';
  const message = `${followerName} deixou de seguir você`;

  console.log('📝 [NOTIFICATION] Título e mensagem preparados:', { title, message });

  return createNotification({
    receiver_id: mentorId,
    receiver_name: mentorName,
    sender_id: followerId,
    sender_name: followerName,
    type: 'lost_follower',
    title,
    message,
  });
}

/**
 * Notificar sobre nova matrícula
 */
export async function notifyNewEnrollment({
  mentorId,
  mentorName,
  studentId,
  studentName,
  courseName,
}: {
  mentorId: string;
  mentorName: string;
  studentId: string;
  studentName: string;
  courseName: string;
}) {
  console.log('🎓 [NOTIFICATION] Criando notificação de nova matrícula');
  
  const title = 'Nova matrícula!';
  const message = `${studentName} se matriculou no curso "${courseName}"`;

  return createNotification({
    receiver_id: mentorId,
    receiver_name: mentorName,
    sender_id: studentId,
    sender_name: studentName,
    type: 'new_enrollment',
    title,
    message,
  });
}

/**
 * Notificar sobre atualização de curso
 */
export async function notifyCourseUpdate({
  studentId,
  studentName,
  mentorName,
  courseName,
}: {
  studentId: string;
  studentName: string;
  mentorName: string;
  courseName: string;
}) {
  console.log('📚 [NOTIFICATION] Criando notificação de atualização de curso');
  
  const title = 'Curso atualizado!';
  const message = `${mentorName} atualizou o curso "${courseName}"`;

  return createNotification({
    receiver_id: studentId,
    receiver_name: studentName,
    sender_name: mentorName,
    type: 'course_updated',
    title,
    message,
  });
} 

/**
 * Notificar sobre novo agendamento
 */
export async function notifyNewAppointment({
  receiverId,
  receiverName,
  senderId,
  senderName,
  appointmentDate,
  appointmentTime,
}: {
  receiverId: string;
  receiverName: string;
  senderId: string;
  senderName: string;
  appointmentDate: string;
  appointmentTime: string;
}) {
  console.log('📅 [NOTIFICATION] Criando notificação de novo agendamento');
  
  const title = 'Novo agendamento!';
  const message = `${senderName} agendou uma sessão para ${appointmentDate} às ${appointmentTime}`;

  return createNotification({
    receiver_id: receiverId,
    receiver_name: receiverName,
    sender_id: senderId,
    sender_name: senderName,
    type: 'schedule',
    title,
    message,
  });
} 