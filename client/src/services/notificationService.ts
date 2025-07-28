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
 * • course_buy - Compra de curso
 * • message - Mensagem de mentorado
 * 
 * 💡 INTERFACE:
 * • CreateNotificationData - Estrutura base para notificações
 * • sender_role/receiver_role - Roles automáticos (mentor/mentorado)
 * • getUserRole() - Função utilitária para buscar role do usuário
 * ===============================================================================
 */

import { supabase } from '../utils/supabase';

/**
 * Buscar o role de um usuário pelo ID
 */
async function getUserRole(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ [NOTIFICATION] Erro ao buscar role do usuário:', error);
      return null;
    }

    return data?.role || null;
  } catch (error) {
    console.error('💥 [NOTIFICATION] Erro ao buscar role do usuário:', error);
    return null;
  }
}

export interface CreateNotificationData {
  receiver_id: string;
  receiver_name: string;
  receiver_role?: string;
  sender_id?: string;
  sender_name?: string;
  sender_role?: string;
  type: 'new_follower' | 'lost_follower' | 'appointment_cancelled' | 'cancel_schedule' | 'schedule' | 'new_enrollment' | 'course_updated' | 'message' | 'course_buy';
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
    // Buscar roles automaticamente se não fornecidos
    let receiverRole = data.receiver_role;
    let senderRole = data.sender_role;

    if (!receiverRole) {
      console.log('🔍 [NOTIFICATION] Buscando role do receiver:', data.receiver_id);
      receiverRole = await getUserRole(data.receiver_id) || undefined;
    }

    if (data.sender_id && !senderRole) {
      console.log('🔍 [NOTIFICATION] Buscando role do sender:', data.sender_id);
      senderRole = await getUserRole(data.sender_id) || undefined;
    }

    const insertData = {
      receiver_id: data.receiver_id,
      receiver_name: data.receiver_name,
      receiver_role: receiverRole,
      sender_id: data.sender_id,
      sender_name: data.sender_name,
      sender_role: senderRole,
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
    receiver_role: 'mentor', // Receptor é sempre mentor
    sender_id: followerId,
    sender_name: followerName,
    sender_role: 'mentorado', // Quem segue é sempre mentorado
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
    receiver_role: 'mentor', // Receptor é sempre mentor
    sender_id: followerId,
    sender_name: followerName,
    sender_role: 'mentorado', // Quem deixa de seguir é sempre mentorado
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
    receiver_role: 'mentor', // Receptor é sempre mentor
    sender_id: studentId,
    sender_name: studentName,
    sender_role: 'mentorado', // Quem se matricula é sempre mentorado
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
    receiver_role: 'mentorado', // Receptor é sempre mentorado
    sender_name: mentorName,
    sender_role: 'mentor', // Quem atualiza curso é sempre mentor
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

/**
 * Notificar sobre compra de curso
 */
export async function notifyCoursePurchase({
  mentorId,
  mentorName,
  buyerId,
  buyerName,
  courseName,
  coursePrice,
}: {
  mentorId: string;
  mentorName: string;
  buyerId: string;
  buyerName: string;
  courseName: string;
  coursePrice: number;
}) {
  console.log('💰 [NOTIFICATION] Criando notificação de compra de curso');
  console.log('📋 [NOTIFICATION] Parâmetros recebidos:', {
    mentorId,
    mentorName,
    buyerId,
    buyerName,
    courseName,
    coursePrice
  });
  
  // 🛡️ PREVENÇÃO DE DUPLICAÇÃO: Verificar se já existe notificação similar recente
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: existingNotification } = await supabase
      .from('notifications')
      .select('id, created_at')
      .eq('receiver_id', mentorId)
      .eq('sender_id', buyerId)
      .eq('type', 'course_buy')
      .ilike('message', `%${courseName}%`)
      .gte('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingNotification) {
      console.log('⚠️ [NOTIFICATION] Notificação de compra duplicada detectada e bloqueada:', {
        existingId: existingNotification.id,
        createdAt: existingNotification.created_at,
        mentorId,
        buyerId,
        courseName
      });
      return { success: true, data: null, message: 'Notificação duplicada bloqueada' };
    }
  } catch (error) {
    // Se der erro na verificação, continuar com a criação (melhor criar duplicada que não criar)
    console.log('⚠️ [NOTIFICATION] Erro ao verificar duplicação, continuando:', error);
  }
  
  const title = 'Novo curso vendido!';
  const priceFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(coursePrice / 100); // Convertendo de centavos para reais
  
  const message = `${buyerName} comprou o curso "${courseName}" por ${priceFormatted}`;

  console.log('📝 [NOTIFICATION] Título e mensagem preparados:', { title, message });

  return createNotification({
    receiver_id: mentorId,
    receiver_name: mentorName,
    receiver_role: 'mentor', // Receptor é sempre mentor
    sender_id: buyerId,
    sender_name: buyerName,
    sender_role: 'mentorado', // Quem compra é sempre mentorado
    type: 'course_buy',
    title,
    message,
  });
}