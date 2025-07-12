import MentoradoSidebar from "@/components/mentorado/MentoradoSidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { checkCoursePaymentStatus, checkUserPaymentIntents, getUserTransactions, handleCheckoutSuccess, startCourseCheckout } from "@/services/stripeCheckoutService";
import { supabase } from "@/utils/supabase";
import { AlertCircle, Play, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

interface EnrolledCourse {
  id: string;
  course_id: string;
  status: string;
  enrolled_at: string;
  progress_percentage: number;
  course: {
    id: string;
    title: string;
    description: string;
    image_url?: string;
    price: number;
    is_paid: boolean;
    category?: string; // Categoria do curso
    mentor: {
      id: string;
      full_name: string;
      avatar_url?: string;
      category?: string;
    };
  };
}

interface Transaction {
  id: string;
  course_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  course: {
    id: string;
    title: string;
    image_url?: string;
  };
}

const MentoradoMeusCursosPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [failedTransactions, setFailedTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessingStripe, setAccessingStripe] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Função para obter as iniciais do mentor (igual ao CourseCard)
  const getMentorInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Função para navegar ao perfil público do mentor
  const handleMentorClick = (mentorId: string) => {
    navigate(`/mentor/publicview/${mentorId}`);
  };

  // Função para buscar role do usuário e redirecionar corretamente
  const navigateToCourse = async (courseId: string) => {
    try {
      if (!user?.email) {
        navigate(`/mentorado/cursoplayer/${courseId}`);
        return;
      }

      // Buscar role do usuário se ainda não foi carregado
      if (!userRole) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', user.email)
          .single();

        const role = profile?.role;
        setUserRole(role);

        // Redirecionar baseado no role
        if (role === 'mentor') {
          navigate(`/mentor/cursoplayer/${courseId}`);
        } else {
          navigate(`/mentorado/cursoplayer/${courseId}`);
        }
      } else {
        // Se já tem o role, redirecionar diretamente
        if (userRole === 'mentor') {
          navigate(`/mentor/cursoplayer/${courseId}`);
        } else {
          navigate(`/mentorado/cursoplayer/${courseId}`);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar role do usuário:', error);
      // Fallback para mentorado em caso de erro
      navigate(`/mentorado/cursoplayer/${courseId}`);
    }
  };

  useEffect(() => {
    // Processar retorno do checkout se houver
    const sessionId = searchParams.get('session_id');
    const transactionId = searchParams.get('transaction_id');
    
    if (sessionId && transactionId) {
      processCheckoutReturn(sessionId, transactionId);
    } else {
      loadData();
    }
  }, [searchParams, user]);

  // 🚀 OTIMIZAÇÃO: Verificação periódica condicional para pagamentos pendentes
  useEffect(() => {
    if (!user) return;

    const checkPendingPaymentsConditional = async () => {
      try {
        // Verificar se há matrículas inativas antes de processar pagamentos pendentes
        const { data: inactiveEnrollments } = await supabase
          .from('matriculas')
          .select('id')
          .eq('student_id', user.id)
          .eq('status', 'inactive')
          .limit(1);
        
        if (inactiveEnrollments && inactiveEnrollments.length > 0) {
          console.log('🔄 [Mentorado] Verificação periódica: há matrículas inativas, recarregando dados...');
          await loadData();
        } else {
          console.log('✅ [Mentorado] Verificação periódica: todas as matrículas ativas, pulando');
        }
      } catch (error) {
        console.error('Erro na verificação periódica:', error);
      }
    };

    // 🚀 OTIMIZAÇÃO: Configurar verificação periódica apenas se necessário (60 segundos)
    const interval = setInterval(checkPendingPaymentsConditional, 60000);

    return () => clearInterval(interval);
  }, [user]);

  const processCheckoutReturn = async (sessionId: string, transactionId: string) => {
    try {
      setLoading(true);
      await handleCheckoutSuccess(sessionId, transactionId);
      toast.success('Pagamento processado com sucesso! Bem-vindo ao curso!');
      
      // Limpar parâmetros da URL
      navigate('/mentorado/cursos', { replace: true });
      
      // Recarregar dados
      await loadData();
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Carregar cursos matriculados
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('matriculas')
        .select(`
          *,
          course:cursos (
            id,
            title,
            description,
            image_url,
            price,
            is_paid,
            category,
            mentor:mentor_id (
              id,
              full_name,
              avatar_url,
              category
            )
          )
        `)
        .eq('student_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (enrollmentsError) throw enrollmentsError;
      
      // 🚀 OTIMIZAÇÃO: Separar matrículas ativas das inativas
      const activeEnrollments = (enrollments || []).filter(e => e.status === 'active');
      const inactiveEnrollments = (enrollments || []).filter(e => e.status === 'inactive');
      
      console.log('📊 Status das matrículas:', {
        total: enrollments?.length || 0,
        ativas: activeEnrollments.length,
        inativas: inactiveEnrollments.length
      });
      
      // ✅ OTIMIZAÇÃO: Verificar pagamento APENAS para matrículas inativas
      // Matrículas ativas já foram pagas e não precisam de verificação
      let updatedInactiveEnrollments = inactiveEnrollments;
      
      if (inactiveEnrollments.length > 0) {
        console.log('🔄 Verificando payment intents apenas para matrículas inativas...');
        await checkUserPaymentIntents(user.id, user.email || '');
        
        // Verificar status de pagamento apenas para cursos pagos inativos
        updatedInactiveEnrollments = await Promise.all(
          inactiveEnrollments.map(async (enrollment) => {
            if (enrollment.course.is_paid) {
              console.log(`🔍 Verificando pagamento do curso: ${enrollment.course.title}`);
              const paymentStatus = await checkCoursePaymentStatus(enrollment.course_id, user.id);
              
              if (paymentStatus.isPaid) {
                // Se o pagamento foi confirmado, a matrícula já foi ativada pela função
                return { ...enrollment, status: 'active' };
              }
            }
            return enrollment;
          })
        );
      }
      
      // Combinar matrículas ativas (sem verificação) com inativas (verificadas)
      const allEnrollments = [...activeEnrollments, ...updatedInactiveEnrollments];
      setEnrolledCourses(allEnrollments);

      // 🚀 OTIMIZAÇÃO: Carregar transações falhadas/pendentes apenas se há matrículas inativas
      if (inactiveEnrollments.length > 0) {
        const transactions = await getUserTransactions(user.id, 'buyer');
        const allFailed = transactions.filter(t => 
          t.status === 'failed' || t.status === 'pending'
        );
        
        // ✅ CORREÇÃO: Agrupar por course_id e pegar apenas a transação mais recente de cada curso
        const groupedByCourse = allFailed.reduce((acc, transaction) => {
          const courseId = transaction.course_id;
          
          // Se não existe ou se a atual é mais recente
          if (!acc[courseId] || new Date(transaction.created_at) > new Date(acc[courseId].created_at)) {
            acc[courseId] = transaction;
          }
          
          return acc;
        }, {} as Record<string, Transaction>);
        
        // Converter de volta para array apenas com uma transação por curso
        const uniqueFailedTransactions: Transaction[] = Object.values(groupedByCourse);
        
        console.log('📊 Transações agrupadas por curso:', {
          totalTransacoes: allFailed.length,
          cursosUnicos: uniqueFailedTransactions.length,
          cursos: uniqueFailedTransactions.map(t => ({ 
            course_id: t.course_id, 
            status: t.status, 
            created_at: t.created_at 
          }))
        });
        
        setFailedTransactions(uniqueFailedTransactions);
      } else {
        // Se não há matrículas inativas, não há transações pendentes para mostrar
        setFailedTransactions([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar seus cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async (transactionId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    const transaction = failedTransactions.find(t => t.id === transactionId);
    if (!transaction) {
      toast.error('Transação não encontrada');
      return;
    }

    try {
      setAccessingStripe(transactionId);
      
      console.log('🛒 Iniciando novo checkout para curso:', transaction.course_id);
      const result = await startCourseCheckout(transaction.course_id, user.id);
      
      if (!result.sessionUrl) {
        throw new Error('URL da sessão não retornada');
      }
      
      // ✅ DELAY REMOVIDO: Redirect imediato para melhor performance
      
      console.log('🔄 Redirecionando para checkout:', result.sessionUrl);
      window.location.href = result.sessionUrl;
    } catch (error: any) {
      console.error('❌ Erro ao processar pagamento:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
      setAccessingStripe(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <MentoradoSidebar />
        <div className="flex-1 transition-all duration-300  p-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MentoradoSidebar />
      <div className="flex-1 transition-all duration-300  p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Cursos</h1>
          
          {/* Alerta de transações pendentes/falhadas */}
          {(() => {
            // ✅ CORREÇÃO: Verificar se há cursos com status 'inactive' ao invés de transações falhadas
            const coursesWithPendingPayment = enrolledCourses.filter(course => course.status === 'inactive');
            
            console.log('📋 Status do alerta:', {
              totalCursos: enrolledCourses.length,
              cursosPendentes: coursesWithPendingPayment.length,
              cursosDetalhes: enrolledCourses.map(c => ({ 
                title: c.course.title, 
                status: c.status 
              })),
              mostrarAlerta: coursesWithPendingPayment.length > 0
            });
            
            return coursesWithPendingPayment.length > 0 && (
              <Alert className="mb-6 border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Você tem {coursesWithPendingPayment.length} curso(s) com pagamento pendente. 
                  Clique em "Tentar Pagamento" nos cursos com status "Pagamento Pendente" para completar a compra.
                </AlertDescription>
              </Alert>
            );
          })()}

          {/* Cursos Matriculados */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Cursos Matriculados</h2>
            {enrolledCourses.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600 mb-4">
                    Você ainda não está matriculado em nenhum curso.
                  </p>
                  <Button onClick={() => navigate('/cursos')}>
                    Explorar Cursos
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((enrollment) => (
                  <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                    <div className="aspect-video relative">
                                                {enrollment.course.image_url ? (
                            <img 
                              src={enrollment.course.image_url} 
                              alt={enrollment.course.title}
                              className="w-full h-full object-cover rounded-t-lg"
                            />
                          ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg"></div>
                      )}
                      {enrollment.progress_percentage > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${enrollment.progress_percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      {/* Seção do mentor - mesmo padrão do CourseCard */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div 
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '16px',
                            flexShrink: 0,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          onClick={() => handleMentorClick(enrollment.course.mentor.id)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {enrollment.course.mentor.avatar_url ? (
                            <img 
                              src={enrollment.course.mentor.avatar_url} 
                              alt={enrollment.course.mentor.full_name}
                              style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                transition: 'all 0.3s ease'
                              }}
                              onError={(e) => {
                                // Fallback para iniciais se a imagem falhar ao carregar
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = getMentorInitials(enrollment.course.mentor.full_name);
                                  parent.style.display = 'flex';
                                  parent.style.alignItems = 'center';
                                  parent.style.justifyContent = 'center';
                                }
                              }}
                            />
                          ) : (
                            getMentorInitials(enrollment.course.mentor.full_name)
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1a202c',
                            margin: '0 0 4px 0',
                            lineHeight: '1.2'
                          }}>
                            {enrollment.course.mentor.full_name}
                          </h4>
                          <p style={{
                            fontSize: '14px',
                            color: '#64748b',
                            margin: '0'
                          }}>
                            {enrollment.course.category || 'Categoria não definida'}
                          </p>
                        </div>
                      </div>

                      <h3 className="font-semibold mb-2 line-clamp-2">
                        {enrollment.course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {enrollment.course.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant={
                          enrollment.status === 'active' ? 'default' : 
                          enrollment.status === 'inactive' ? 'destructive' : 'secondary'
                        }>
                          {enrollment.status === 'active' ? 'Ativo' : 
                           enrollment.status === 'inactive' ? 'Pagamento Pendente' : 
                           'Suspenso'}
                        </Badge>
                        {enrollment.progress_percentage > 0 && (
                          <span className="text-sm text-gray-600">
                            {Math.round(enrollment.progress_percentage)}% concluído
                          </span>
                        )}
                      </div>
                      {enrollment.status === 'active' ? (
                        <Button 
                          className="w-full"
                          onClick={() => navigateToCourse(enrollment.course_id)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          {enrollment.progress_percentage > 0 ? 'Continuar' : 'Começar'}
                        </Button>
                      ) : (
                        (() => {
                          // Definir existingTransaction no escopo correto
                          const existingTransaction = failedTransactions.find(t => t.course_id === enrollment.course_id);
                          const isAccessingStripe = accessingStripe === enrollment.course_id || 
                                                   (existingTransaction && accessingStripe === existingTransaction.id);
                          
                          return (
                            <Button 
                              className="w-full bg-orange-600 hover:bg-orange-700"
                              onClick={async () => {
                                if (existingTransaction) {
                                  // Reutilizar transação existente
                                  console.log('♻️ Reutilizando transação pendente existente:', existingTransaction.id);
                                  await handleRetryPayment(existingTransaction.id);
                                } else {
                                  // Apenas criar nova se não existir transação pendente
                                  try {
                                    setAccessingStripe(enrollment.course_id);
                                    console.log('🆕 Criando nova sessão de checkout para curso:', enrollment.course_id);
                                    const result = await startCourseCheckout(enrollment.course_id, user.id);
                                    if (result.sessionUrl) {
                                      // ✅ DELAY REMOVIDO: Redirect imediato para Stripe
                                      window.location.href = result.sessionUrl;
                                    }
                                  } catch (error: any) {
                                    console.error('❌ Erro ao criar nova sessão:', error);
                                    toast.error(error.message || 'Erro ao processar pagamento');
                                    setAccessingStripe(null); // Limpar em caso de erro
                                  }
                                  // Nota: Não limpar no finally porque o usuário será redirecionado
                                }
                              }}
                              disabled={isAccessingStripe}
                            >
                              {isAccessingStripe ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Acessando Stripe...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Tentar Pagamento
                                </>
                              )}
                            </Button>
                          );
                        })()
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentoradoMeusCursosPage;