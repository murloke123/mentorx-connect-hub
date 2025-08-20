import { Session } from '@supabase/supabase-js';
import { Menu, Play, PlusCircle } from "lucide-react";
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import MentorSidebar from "../../components/mentor/MentorSidebar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import { checkCoursePaymentStatus, checkUserPaymentIntents, processPendingPayments } from '../../services/stripeCheckoutService';
import { supabase } from '../../utils/supabase';
import { navigateToTop } from '../../utils/utils';

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

const MentorCursosAdquiridosPage = () => {
  const navigate = useNavigate();
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Função para buscar role do usuário e redirecionar corretamente
  const navigateToCourse = async (courseId: string) => {
    try {
      if (!currentSession?.user?.email) {
        navigate(`/mentor/cursoplayer/${courseId}`);
        return;
      }

      // Buscar role do usuário se ainda não foi carregado
      if (!userRole) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', currentSession.user.email)
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
      // Fallback para mentor em caso de erro (já que está na página do mentor)
      navigate(`/mentor/cursoplayer/${courseId}`);
    }
  };

  useEffect(() => {
    setIsAuthLoading(true);
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setCurrentSession(initialSession);
      setIsAuthLoading(false);
      if (initialSession?.user?.id) {
        loadEnrolledCourses(initialSession.user.id);
      }
    }).catch((error) => {
      console.error("Error getting initial session:", error);
      setIsAuthLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      const oldUserId = currentSession?.user?.id;
      const newUserId = newSession?.user?.id;
      
      setCurrentSession(newSession);
      setIsAuthLoading(false);

      if (oldUserId !== newUserId) {
        if (newUserId) {
          loadEnrolledCourses(newUserId);
        }
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const userId = currentSession?.user?.id;

  // 🚀 OTIMIZAÇÃO: Verificar pagamentos pendentes apenas se houver matrículas inativas
  useEffect(() => {
    const checkPendingPayments = async () => {
      if (!userId) return;
      
      try {
        // Verificar se há matrículas inativas antes de processar pagamentos pendentes
        const { data: inactiveEnrollments } = await supabase
          .from('matriculas')
          .select('id')
          .eq('student_id', userId)
          .eq('status', 'inactive')
          .limit(1);
        
        if (inactiveEnrollments && inactiveEnrollments.length > 0) {
          console.log('🔄 [Mentor] Há matrículas inativas, verificando pagamentos pendentes...');
          await processPendingPayments();
          // Recarregar cursos matriculados após verificar pagamentos
          loadEnrolledCourses(userId);
        } else {
          console.log('✅ [Mentor] Todas as matrículas estão ativas, pulando verificação de pagamentos');
          // Carregar apenas as matrículas sem verificação de pagamento
          loadEnrolledCourses(userId);
        }
      } catch (error) {
        console.error('Erro ao verificar pagamentos pendentes:', error);
        // Em caso de erro, carregar as matrículas normalmente
        loadEnrolledCourses(userId);
      }
    };

    // Verificar imediatamente ao carregar a página
    checkPendingPayments();

    // 🚀 OTIMIZAÇÃO: Configurar verificação periódica mais espaçada (60 segundos) e condicional
    const interval = setInterval(async () => {
      if (!userId) return;
      
      // Verificar se há matrículas inativas antes de executar verificação completa
      const { data: inactiveEnrollments } = await supabase
        .from('matriculas')
        .select('id')
        .eq('student_id', userId)
        .eq('status', 'inactive')
        .limit(1);
      
      if (inactiveEnrollments && inactiveEnrollments.length > 0) {
        console.log('🔄 [Mentor] Verificação periódica: há matrículas inativas');
        await processPendingPayments();
        loadEnrolledCourses(userId);
      } else {
        console.log('✅ [Mentor] Verificação periódica: todas as matrículas ativas, pulando');
      }
    }, 60000); // Aumentado para 60 segundos

    return () => clearInterval(interval);
  }, [userId]);

  const loadEnrolledCourses = async (userId: string) => {
    try {
      setLoadingEnrolled(true);
      
      const { data: enrollments, error } = await supabase
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
        .eq('student_id', userId)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      
      // 🚀 OTIMIZAÇÃO: Separar matrículas ativas das inativas
      const activeEnrollments = (enrollments || []).filter(e => e.status === 'active');
      const inactiveEnrollments = (enrollments || []).filter(e => e.status === 'inactive');
      
      console.log('📊 [Mentor] Status das matrículas:', {
        total: enrollments?.length || 0,
        ativas: activeEnrollments.length,
        inativas: inactiveEnrollments.length
      });
      
      // ✅ OTIMIZAÇÃO: Verificar pagamento APENAS para matrículas inativas
      // Matrículas ativas já foram pagas e não precisam de verificação
      let updatedInactiveEnrollments = inactiveEnrollments;
      
      if (inactiveEnrollments.length > 0) {
        // Verificar payment intents via API do Stripe apenas se há matrículas inativas
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user?.email) {
          console.log('🔄 [Mentor] Verificando payment intents apenas para matrículas inativas...');
          await checkUserPaymentIntents(userId, userData.user.email);
        }
        
        // Verificar status de pagamento apenas para cursos pagos inativos
        updatedInactiveEnrollments = await Promise.all(
          inactiveEnrollments.map(async (enrollment) => {
            if (enrollment.course.is_paid) {
              console.log(`🔍 [Mentor] Verificando pagamento do curso: ${enrollment.course.title}`);
              const paymentStatus = await checkCoursePaymentStatus(enrollment.course_id, userId);
              
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
    } catch (error) {
      console.error('Erro ao carregar cursos matriculados:', error);
    } finally {
      setLoadingEnrolled(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

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

  return (
    <div className="flex-col md:flex-row flex min-h-screen">
      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden bg-slate-900/80 backdrop-blur-sm border border-gold/20 hover:bg-slate-800/80 hover:border-gold/40"
          >
            <Menu className="h-6 w-6 text-gold" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <MentorSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <MentorSidebar />
      </div>

      <div className="flex-1 transition-all duration-300 p-4 md:p-6 pt-8 md:pt-6 min-h-screen bg-black relative">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gold">Cursos Adquiridos</h1>
            <p className="text-muted-foreground">Cursos que adquiri de outros mentores</p>
          </div>
          <Button onClick={() => navigate('/courses')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Explorar Mais Cursos
          </Button>
        </div>

        <div>
          {loadingEnrolled ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              {/* Loading Premium Dourado */}
              <div className="flex flex-col items-center space-y-6">
                {/* Círculo de Loading Dourado */}
                <div className="relative">
                  {/* Círculo externo com glow */}
                  <div className="w-24 h-24 rounded-full border-4 border-gold/20 animate-pulse"></div>
                  
                  {/* Círculo de loading principal */}
                  <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-gold border-r-gold animate-spin"></div>
                  
                  {/* Círculo interno com gradiente */}
                  <div className="absolute inset-2 w-20 h-20 rounded-full bg-gradient-to-br from-gold/20 via-gold-light/10 to-transparent animate-pulse"></div>
                  
                  {/* Ponto central */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-gold rounded-full animate-pulse shadow-lg shadow-gold/50"></div>
                  </div>
                  
                  {/* Efeito de brilho */}
                  <div className="absolute -inset-2 w-28 h-28 rounded-full bg-gradient-to-r from-gold/10 via-gold-light/20 to-gold/10 blur-xl animate-pulse"></div>
                </div>
                
                {/* Texto de loading */}
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-gold animate-pulse">
                    Carregando Cursos
                  </h3>
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Buscando seus cursos adquiridos...
                  </p>
                </div>
                
                {/* Pontos de loading */}
                <div className="flex space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-gold rounded-full animate-bounce"
                      style={{
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '1s'
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ) : enrolledCourses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Play className="mx-auto h-12 w-12 text-gold mb-4" />
                <p className="text-gray-600 mb-4">
                  Você ainda não adquiriu nenhum curso de outros mentores.
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
                        onClick={() => navigate(`/curso/${enrollment.course_id}`)}
                      >
                        Finalizar Pagamento
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
  );
};

export default MentorCursosAdquiridosPage;