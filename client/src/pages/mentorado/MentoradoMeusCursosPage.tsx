import MentoradoSidebar from "@/components/mentorado/MentoradoSidebar";
import LoadingComponent from "@/components/shared/LoadingComponent";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { checkCoursePaymentStatus, checkUserPaymentIntents, getUserTransactions, handleCheckoutSuccess, startCourseCheckout } from "@/services/stripeCheckoutService";
import { supabase } from "@/utils/supabase";
import { navigateToTop } from "@/utils/utils";
import { AlertCircle, Menu, Play, PlusCircle, RefreshCw } from "lucide-react";
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
    navigateToTop(navigate, `/mentor/publicview/${mentorId}`);
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
      window.open(result.sessionUrl, '_blank');
    } catch (error: any) {
      console.error('❌ Erro ao processar pagamento:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
      setAccessingStripe(null);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <MentoradoSidebar />
        <div className="flex-1 transition-all duration-300  p-6">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gold mb-2">Meus Cursos</h1>
              <p className="text-muted-foreground">Cursos que foram adquiridos por mim</p>
            </div>
            <Button onClick={() => navigate('/courses')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Explorar Mais Cursos
            </Button>
          </div>

          <LoadingComponent message="Carregando Cursos" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <MentoradoSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <MentoradoSidebar />
      </div>

      <div className="flex-1 transition-all duration-300 p-6 relative">
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
          </Sheet>
        </div>
        
        <div className="pt-8 md:pt-0">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gold mb-2">Meus Cursos</h1>
              <p className="text-muted-foreground">Cursos que foram adquiridos por mim</p>
            </div>
            <Button onClick={() => navigate('/courses')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Explorar Mais Cursos
            </Button>
          </div>
          
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

        <div>
          {enrolledCourses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Play className="mx-auto h-12 w-12 text-gold mb-4" />
                <p className="text-gray-600 mb-4">
                  Você ainda não está matriculado em nenhum curso.
                </p>
                <Button onClick={() => navigate('/courses')}>
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
                    
                    {/* Tag de status no canto superior direito */}
                    <div className="absolute top-2 right-2 z-20">
                      <Badge variant={
                        enrollment.status === 'active' ? 'default' : 
                        enrollment.status === 'inactive' ? 'destructive' : 'secondary'
                      } className="shadow-lg">
                        {enrollment.status === 'active' ? 'Ativo' : 
                         enrollment.status === 'inactive' ? 'Pagamento Pendente' : 
                         'Suspenso'}
                      </Badge>
                    </div>
                    
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
                          color: 'white',
                          margin: '0 0 4px 0',
                          lineHeight: '1.2'
                        }}>
                          {enrollment.course.mentor.full_name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {enrollment.course.category || 'Categoria não definida'}
                        </p>
                      </div>
                    </div>

                    <h3 className="font-semibold mb-2 truncate" title={enrollment.course.title}>
                      {enrollment.course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {enrollment.course.description ? 
                        (enrollment.course.description.length > 120 ? 
                          enrollment.course.description.substring(0, 120) + '...' : 
                          enrollment.course.description
                        ) : 
                        "Aprenda com um dos melhores mentores da plataforma e transforme sua carreira profissional."
                      }
                    </p>
                    {enrollment.progress_percentage > 0 && (
                      <div className="mb-4">
                        <span className="text-sm text-gray-600">
                          {Math.round(enrollment.progress_percentage)}% concluído
                        </span>
                      </div>
                    )}
                    {enrollment.status === 'active' ? (
                      <button 
                        onClick={() => navigateToCourse(enrollment.course_id)}
                        className="w-full bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-background font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-xs mt-auto flex items-center justify-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        {enrollment.progress_percentage > 0 ? 'Continuar' : 'Começar'}
                      </button>
                    ) : (
                      <Button 
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        onClick={async () => {
                          const existingTransaction = failedTransactions.find(t => t.course_id === enrollment.course_id);
                          if (existingTransaction) {
                            // Reutilizar transação existente
                            console.log('♻️ Reutilizando transação pendente existente:', existingTransaction.id);
                            await handleRetryPayment(existingTransaction.id);
                          } else {
                            // Apenas criar nova se não existir transação pendente
                            try {
                              setAccessingStripe(enrollment.course_id);
                              console.log('🆕 Criando nova sessão de checkout para curso:', enrollment.course_id);
                              const result = await startCourseCheckout(enrollment.course_id, user!.id);
                              if (result.sessionUrl) {
                                // ✅ DELAY REMOVIDO: Redirect imediato para Stripe
                                window.open(result.sessionUrl, '_blank');
                              }
                            } catch (error: any) {
                              console.error('❌ Erro ao criar nova sessão:', error);
                              toast.error(error.message || 'Erro ao processar pagamento');
                              setAccessingStripe(null); // Limpar em caso de erro
                            }
                            // Nota: Não limpar no finally porque o usuário será redirecionado
                          }
                        }}
                        disabled={accessingStripe === enrollment.course_id}
                      >
                        {accessingStripe === enrollment.course_id ? (
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