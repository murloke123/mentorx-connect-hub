import { AlertCircle, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { notifyNewAppointment } from "@/services/notificationService";
import { supabase } from '../utils/supabase';

interface AppointmentData {
  id: string;
  mentee_id: string;
  mentee_name: string;
  mentor_id: string;
  mentor_name: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  meet_link?: string;
  price: number;
  payment_status: string;
  stripe_product_id?: string;
  stripe_price_id?: string;
  payment_intent_id?: string;
}

interface TransactionData {
  id: string;
  appointment_id?: string;
  buyer_id: string;
  mentor_id: string;
  stripe_session_id: string;
  stripe_payment_intent_id?: string;
  stripe_account_id: string;
  total_amount: number;
  status: string;
  metadata?: any;
}

// Cache global para evitar múltiplas execuções por sessionId
const globalProcessingCache = new Set<string>();

const AppointmentCheckoutSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  const sessionId = searchParams.get('session_id');
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      // Aguardar autenticação ser carregada
      if (authLoading) return;
      
      // Evitar múltiplas execuções usando cache por sessionId
       if (hasProcessed || (sessionId && globalProcessingCache.has(sessionId))) {
         console.log('⚠️ [AppointmentCheckoutSuccess] Processamento já realizado para esta sessão, ignorando...');
         return;
       }
       
       if (sessionId && user) {
         setHasProcessed(true);
         globalProcessingCache.add(sessionId);
         processPaymentSuccess();
       } else if (!sessionId) {
        setError('Session ID não encontrado');
        setLoading(false);
      }
    };
    
    handlePaymentSuccess();
  }, [sessionId, user, authLoading, hasProcessed]);

  const processPaymentSuccess = async () => {
    if (!user) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    // Evitar processamento duplicado
    if (processing) {
      console.log('⚠️ [AppointmentCheckoutSuccess] Processamento já em andamento, ignorando...');
      return;
    }

    setProcessing(true);
    
    try {
      console.log('🔄 [AppointmentCheckoutSuccess] Processando pagamento bem-sucedido:', {
        sessionId,
        transactionId,
        userId: user.id
      });

      // Buscar transação no banco
      const { data: transaction, error: transactionError } = await supabase
        .from('stripe_connect_transactions')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .eq('buyer_id', user.id)
        .eq('type', 'appointment')
        .single();

      if (transactionError || !transaction) {
        console.error('❌ [AppointmentCheckoutSuccess] Transação não encontrada:', transactionError);
        throw new Error('Transação não encontrada');
      }

      console.log('✅ [AppointmentCheckoutSuccess] Transação encontrada:', transaction);

      // Verificar se já foi processada
      if (transaction.status === 'completed' && transaction.appointment_id) {
        console.log('⚠️ [AppointmentCheckoutSuccess] Transação já processada');
        
        // Buscar agendamento existente
        const { data: existingAppointment } = await supabase
          .from('calendar')
          .select('*')
          .eq('id', transaction.appointment_id)
          .single();

        if (existingAppointment) {
          setAppointment(existingAppointment);
          setSuccess(true);
          setLoading(false);
          return;
        }
      }

      // Verificar status do pagamento no Stripe
      const paymentResult = await verifyStripePayment(transaction);
      
      if (paymentResult.status !== 'succeeded') {
        throw new Error('Pagamento não foi confirmado pelo Stripe');
      }
      
      // Atualizar transação local com payment_intent_id se disponível
      if (paymentResult.paymentIntentId) {
        transaction.stripe_payment_intent_id = paymentResult.paymentIntentId;
      }

      // Verificar se já existe agendamento para esta transação ou payment_intent_id
      console.log('🔍 [AppointmentCheckoutSuccess] Verificando agendamentos existentes...');
      const { data: existingAppointments } = await supabase
        .from('calendar')
        .select('*')
        .or(`payment_intent_id.eq.${paymentResult.paymentIntentId},mentee_id.eq.${user.id}`);
      
      // Verificar se já existe um agendamento com o mesmo payment_intent_id
      const duplicateByPaymentIntent = existingAppointments?.find(
        apt => apt.payment_intent_id === paymentResult.paymentIntentId
      );
      
      if (duplicateByPaymentIntent) {
        console.log('⚠️ [AppointmentCheckoutSuccess] Agendamento já existe para este payment_intent_id:', duplicateByPaymentIntent.id);
        
        // Atualizar transação com o appointment_id existente
        await updateTransaction(transaction.id, duplicateByPaymentIntent.id, paymentResult.status);
        
        setAppointment(duplicateByPaymentIntent);
        setSuccess(true);
        setLoading(false);
        return;
      }

      // Criar agendamento apenas se não existir
      const appointmentData = await createAppointment(transaction);
      
      // Atualizar transação
      await updateTransaction(transaction.id, appointmentData.id, paymentResult.status);
      
      // Enviar notificações e e-mails
      await sendNotificationsAndEmails(appointmentData);
      
      setAppointment(appointmentData);
      setSuccess(true);
      
      toast({
        title: "Pagamento confirmado!",
        description: "Seu agendamento foi criado com sucesso.",
        duration: 5000,
      });

    } catch (err) {
      console.error('❌ [AppointmentCheckoutSuccess] Erro no processamento:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
      
      toast({
        title: "Erro no processamento",
        description: err instanceof Error ? err.message : "Não foi possível processar o pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProcessing(false);
      // Limpar cache apenas em caso de erro para permitir retry
      if (error && sessionId) {
        globalProcessingCache.delete(sessionId);
        setHasProcessed(false);
      }
    }
  };

  const verifyStripePayment = async (transaction: TransactionData): Promise<{ status: string; paymentIntentId?: string }> => {
    try {
      console.log('🔍 [AppointmentCheckoutSuccess] Verificando pagamento no Stripe...');
      
      // Buscar stripe_account_id da transação
      const stripeAccountId = transaction.stripe_account_id;
      if (!stripeAccountId) {
        throw new Error('stripe_account_id não encontrado na transação');
      }
      
      console.log('🏦 [AppointmentCheckoutSuccess] Stripe Account ID:', stripeAccountId);
      console.log('🔑 [AppointmentCheckoutSuccess] Session ID:', sessionId);
      
      // Log do payload da requisição
      const requestUrl = `/api/stripe/checkout/session/${stripeAccountId}/${sessionId}`;
      console.log('📤 [AppointmentCheckoutSuccess] Request URL:', requestUrl);
      console.log('📤 [AppointmentCheckoutSuccess] Request Method: GET');
      console.log('📤 [AppointmentCheckoutSuccess] Request Headers:', {
        'Content-Type': 'application/json'
      });
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      // Log do payload da resposta
      console.log('📥 [AppointmentCheckoutSuccess] Response Status:', response.status);
      console.log('📥 [AppointmentCheckoutSuccess] Response OK:', response.ok);
      console.log('📥 [AppointmentCheckoutSuccess] Response Payload:', JSON.stringify(result, null, 2));
      
      if (!response.ok || !result.success) {
        throw new Error('Erro ao verificar pagamento no Stripe');
      }

      console.log('✅ [AppointmentCheckoutSuccess] Status do pagamento:', result.transaction.payment_status);
      console.log('💳 [AppointmentCheckoutSuccess] Payment Intent ID:', result.transaction.payment_intent_id);
      
      // Atualizar transação com payment_intent_id se não estiver presente
      if (result.transaction.payment_intent_id && !transaction.stripe_payment_intent_id) {
        await supabase
          .from('stripe_connect_transactions')
          .update({
            stripe_payment_intent_id: result.transaction.payment_intent_id
          })
          .eq('id', transaction.id);
        
        console.log('✅ [AppointmentCheckoutSuccess] Payment Intent ID atualizado na transação');
      }
      
      // Converter status do Stripe para formato esperado
      // Stripe retorna 'paid' para sessões bem-sucedidas
      const normalizedStatus = result.transaction.payment_status === 'paid' ? 'succeeded' : result.transaction.payment_status;
      
      return {
        status: normalizedStatus,
        paymentIntentId: result.transaction.payment_intent_id
      };
      
    } catch (error) {
      console.error('❌ [AppointmentCheckoutSuccess] Erro ao verificar Stripe:', error);
      throw new Error('Erro ao verificar pagamento');
    }
  };

  const createAppointment = async (transaction: TransactionData): Promise<AppointmentData> => {
    try {
      console.log('📅 [AppointmentCheckoutSuccess] Criando agendamento...');
      
      const appointmentData = transaction.metadata?.appointment_data;
      if (!appointmentData) {
        throw new Error('Dados do agendamento não encontrados');
      }

      // Buscar informações do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error('Erro ao buscar perfil do usuário');
      }

      // Buscar informações do mentor
      const { data: mentorProfile, error: mentorError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', transaction.mentor_id)
        .single();

      if (mentorError) {
        throw new Error('Erro ao buscar perfil do mentor');
      }

      // Gerar link Jitsi Meet
      let meetLink = '';
      try {
        const jitsiResponse = await fetch('/api/jitsi-meet/create-appointment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mentor: {
              nome: mentorProfile.full_name || 'Mentor'
            },
            mentorado: {
              nome: profile.full_name || 'Usuário'
            },
            dataInicio: `${appointmentData.scheduledDate}T${appointmentData.startTime}`,
            dataFim: `${appointmentData.scheduledDate}T${appointmentData.endTime}`
          })
        });

        if (jitsiResponse.ok) {
          const jitsiData = await jitsiResponse.json();
          meetLink = jitsiData.data?.linkMeet || '';
        }
      } catch (jitsiError) {
        console.error('⚠️ [AppointmentCheckoutSuccess] Erro ao criar link Jitsi:', jitsiError);
      }

      // Verificação final antes de criar - evitar duplicatas por race condition
      console.log('🔍 [AppointmentCheckoutSuccess] Verificação final de duplicatas...');
      const { data: finalCheck } = await supabase
        .from('calendar')
        .select('*')
        .eq('payment_intent_id', transaction.stripe_payment_intent_id)
        .maybeSingle();
      
      if (finalCheck) {
        console.log('⚠️ [AppointmentCheckoutSuccess] Agendamento já existe (verificação final):', finalCheck.id);
        return finalCheck;
      }
      
      // Verificação adicional por mentee_id, mentor_id e data/hora para evitar duplicatas
      const { data: duplicateCheck } = await supabase
        .from('calendar')
        .select('*')
        .eq('mentee_id', user.id)
        .eq('mentor_id', transaction.mentor_id)
        .eq('scheduled_date', appointmentData.scheduledDate)
        .eq('start_time', appointmentData.startTime)
        .maybeSingle();
      
      if (duplicateCheck) {
        console.log('⚠️ [AppointmentCheckoutSuccess] Agendamento duplicado encontrado por dados:', duplicateCheck.id);
        return duplicateCheck;
      }

      // Criar agendamento no banco
      const newAppointment = {
        mentee_id: user.id,
        mentee_name: profile.full_name || 'Usuário',
        mentor_id: transaction.mentor_id,
        mentor_name: mentorProfile.full_name || 'Mentor',
        scheduled_date: appointmentData.scheduledDate,
        start_time: appointmentData.startTime,
        end_time: appointmentData.endTime,
        status: 'scheduled',
        notes: appointmentData.notes || null,
        meet_link: meetLink,
        price: transaction.total_amount,
        payment_status: 'paid',
        stripe_product_id: transaction.metadata?.stripe_product_id,
        stripe_price_id: appointmentData.stripePriceId,
        payment_intent_id: transaction.stripe_payment_intent_id
      };

      console.log('📝 [AppointmentCheckoutSuccess] Dados do novo agendamento:', JSON.stringify(newAppointment, null, 2));

      const { data: appointment, error: appointmentError } = await supabase
        .from('calendar')
        .insert(newAppointment)
        .select()
        .single();

      if (appointmentError) {
        console.error('❌ [AppointmentCheckoutSuccess] Erro ao criar agendamento:', appointmentError);
        
        // Se o erro for de duplicata, tentar buscar o agendamento existente
        if (appointmentError.code === '23505') { // Unique constraint violation
          console.log('🔍 [AppointmentCheckoutSuccess] Erro de duplicata detectado, buscando agendamento existente...');
          const { data: existingAppointment } = await supabase
            .from('calendar')
            .select('*')
            .eq('payment_intent_id', transaction.stripe_payment_intent_id)
            .single();
          
          if (existingAppointment) {
            console.log('✅ [AppointmentCheckoutSuccess] Agendamento existente encontrado:', existingAppointment.id);
            return existingAppointment;
          }
        }
        
        throw new Error('Erro ao criar agendamento no banco de dados');
      }

      console.log('✅ [AppointmentCheckoutSuccess] Agendamento criado com sucesso:', appointment.id);
      return appointment;

    } catch (error) {
      console.error('❌ [AppointmentCheckoutSuccess] Erro ao criar agendamento:', error);
      throw error;
    }
  };

  const updateTransaction = async (transactionId: string, appointmentId: string, paymentStatus: string) => {
    try {
      console.log('🔄 [AppointmentCheckoutSuccess] Atualizando transação...');
      console.log('📊 [AppointmentCheckoutSuccess] Payment Status recebido:', paymentStatus);
      
      // Mapear status para o formato do banco
      const dbStatus = paymentStatus === 'succeeded' ? 'completed' : 'failed';
      console.log('📊 [AppointmentCheckoutSuccess] Status para o banco:', dbStatus);
      
      const updateData = {
        appointment_id: appointmentId,
        status: dbStatus,
        updated_at: new Date().toISOString()
      };
      
      console.log('📤 [AppointmentCheckoutSuccess] Dados para atualização:', JSON.stringify(updateData, null, 2));
      
      const { error } = await supabase
        .from('stripe_connect_transactions')
        .update(updateData)
        .eq('id', transactionId);

      if (error) {
        console.error('❌ [AppointmentCheckoutSuccess] Erro ao atualizar transação:', error);
        throw new Error('Erro ao atualizar transação');
      }

      console.log('✅ [AppointmentCheckoutSuccess] Transação atualizada com sucesso');
    } catch (error) {
      console.error('❌ [AppointmentCheckoutSuccess] Erro ao atualizar transação:', error);
      throw error;
    }
  };

  const sendNotificationsAndEmails = async (appointmentData: AppointmentData) => {
    try {
      console.log('📧 [AppointmentCheckoutSuccess] Enviando notificações...');
      
      // Função para formatação
      const formatDate = (dateString: string) => {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
      };

      const formatTime = (timeString: string) => {
        return timeString.substring(0, 5);
      };

      // Criar notificação para o mentor
      try {
        await notifyNewAppointment({
          receiverId: appointmentData.mentor_id,
          receiverName: appointmentData.mentor_name,
          senderId: appointmentData.mentee_id,
          senderName: appointmentData.mentee_name,
          appointmentDate: formatDate(appointmentData.scheduled_date),
          appointmentTime: `${formatTime(appointmentData.start_time)} - ${formatTime(appointmentData.end_time)}`,
        });
        console.log('✅ [AppointmentCheckoutSuccess] Notificação enviada');
      } catch (notificationError) {
        console.error('⚠️ [AppointmentCheckoutSuccess] Erro ao enviar notificação:', notificationError);
      }

      // Enviar e-mail para o mentor
      try {
        const mentorEmailData = {
          mentorId: appointmentData.mentor_id,
          mentorName: appointmentData.mentor_name,
          menteeName: appointmentData.mentee_name,
          appointmentDate: formatDate(appointmentData.scheduled_date),
          appointmentTime: `${formatTime(appointmentData.start_time)} - ${formatTime(appointmentData.end_time)}`,
          timezone: 'America/Sao_Paulo (UTC-3)',
          notes: appointmentData.notes || undefined,
          meetLink: appointmentData.meet_link || undefined
        };

        const mentorEmailResponse = await fetch('/api/calendar/new-appointment-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mentorEmailData),
        });

        if (mentorEmailResponse.ok) {
          console.log('✅ [AppointmentCheckoutSuccess] E-mail do mentor enviado');
        }
      } catch (mentorEmailError) {
        console.error('⚠️ [AppointmentCheckoutSuccess] Erro ao enviar e-mail do mentor:', mentorEmailError);
      }

      // Enviar e-mail para o mentorado
      try {
        const { data: menteeProfile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', appointmentData.mentee_id)
          .single();

        const menteeEmailData = {
          mentorName: appointmentData.mentor_name,
          menteeName: appointmentData.mentee_name,
          menteeEmail: menteeProfile?.email || user?.email,
          appointmentDate: formatDate(appointmentData.scheduled_date),
          appointmentTime: `${formatTime(appointmentData.start_time)} - ${formatTime(appointmentData.end_time)}`,
          timezone: 'America/Sao_Paulo (UTC-3)',
          notes: appointmentData.notes || undefined,
          meetLink: appointmentData.meet_link || undefined
        };

        const menteeEmailResponse = await fetch('/api/calendar/new-appointment-email/mentee', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(menteeEmailData),
        });

        if (menteeEmailResponse.ok) {
          console.log('✅ [AppointmentCheckoutSuccess] E-mail do mentorado enviado');
        }
      } catch (menteeEmailError) {
        console.error('⚠️ [AppointmentCheckoutSuccess] Erro ao enviar e-mail do mentorado:', menteeEmailError);
      }

    } catch (error) {
      console.error('❌ [AppointmentCheckoutSuccess] Erro ao enviar notificações:', error);
    }
  };

  const handleViewAppointments = async () => {
    try {
      // Buscar role do usuário para redirecionamento
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      const userRole = profile?.role || 'mentorado';
      
      if (userRole === 'mentor') {
        navigate('/mentor/agendamentos-adquiridos');
      } else {
        navigate('/mentorado/meus-agendamentos');
      }
    } catch (error) {
      console.error('Erro ao obter role do usuário:', error);
      navigate('/mentorado/meus-agendamentos');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl">
          <CardHeader className="text-center border-b border-slate-700 pb-6">
            <div className="mx-auto flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gold via-gold-light to-gold-dark rounded-full mb-4 shadow-lg">
              <Clock className="w-6 h-6 text-slate-900 animate-spin" />
            </div>
            <CardTitle className="text-white text-xl font-semibold">Processando Pagamento</CardTitle>
            <CardDescription className="text-gray-300">
              Aguarde enquanto confirmamos seu pagamento...
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-2 bg-gradient-to-r from-gold/30 via-gold-light/30 to-gold/30 rounded w-full mb-2"></div>
                <div className="h-2 bg-gradient-to-r from-gold/20 via-gold-light/20 to-gold/20 rounded w-3/4 mx-auto"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl">
          <CardHeader className="text-center border-b border-slate-700 pb-6">
            <div className="mx-auto flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full mb-4 shadow-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-red-400 text-xl font-semibold">Erro no Pagamento</CardTitle>
            <CardDescription className="text-gray-300">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-gold via-gold-light to-gold-dark hover:from-gold-dark hover:via-gold hover:to-gold-light text-slate-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                variant="outline"
              >
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success && appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl">
          <CardHeader className="text-center border-b border-slate-700 pb-6">
            <div className="mx-auto flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gold via-gold-light to-gold-dark rounded-full mb-4 shadow-lg">
              <CheckCircle className="w-6 h-6 text-slate-900" />
            </div>
            <CardTitle className="text-white text-xl font-semibold">Agendamento Confirmado!</CardTitle>
            <CardDescription className="text-gray-300">
              Seu pagamento foi processado com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-gold/10 via-gold-light/5 to-gold/10 p-4 rounded-lg border border-gold/30 shadow-gold/20">
                <h3 className="font-semibold text-gold mb-2">Detalhes do Agendamento</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong className="text-white">Mentor:</strong> {appointment.mentor_name}</p>
                  <p><strong className="text-white">Data:</strong> {new Date(appointment.scheduled_date + 'T00:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}</p>
                  <p><strong className="text-white">Horário:</strong> {appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}</p>
                  <p><strong className="text-white">Valor:</strong> R$ {appointment.price.toFixed(2).replace('.', ',')}</p>
                  <p><strong className="text-white">Status:</strong> <span className="text-gold font-medium">Confirmado</span></p>
                </div>
              </div>

              <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                <h3 className="font-semibold text-white mb-2">Próximos Passos</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Você receberá um e-mail de confirmação</p>
                  <p>• O mentor também foi notificado</p>
                  <p>• O link da reunião será enviado antes do agendamento</p>
                  <p>• Você pode gerenciar seus agendamentos na área do usuário</p>
                </div>
              </div>

              <Button
                onClick={handleViewAppointments}
                className="w-full bg-gradient-to-r from-gold via-gold-light to-gold-dark hover:from-gold-dark hover:via-gold hover:to-gold-light text-slate-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Ver Meus Agendamentos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AppointmentCheckoutSuccessPage;