import { Session } from '@supabase/supabase-js';
import { Play, PlusCircle } from "lucide-react";
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import MentorSidebar from "../../components/mentor/MentorSidebar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { checkCoursePaymentStatus, checkUserPaymentIntents, processPendingPayments } from '../../services/stripeCheckoutService';
import { supabase } from '../../utils/supabase';

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

  // Verificar pagamentos pendentes a cada 30 segundos
  useEffect(() => {
    const checkPendingPayments = async () => {
      try {
        await processPendingPayments();
        // Recarregar cursos matriculados após verificar pagamentos
        if (userId) {
          loadEnrolledCourses(userId);
        }
      } catch (error) {
        console.error('Erro ao verificar pagamentos pendentes:', error);
      }
    };

    // Verificar imediatamente ao carregar a página
    checkPendingPayments();

    // Configurar verificação periódica a cada 30 segundos
    const interval = setInterval(checkPendingPayments, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  const loadEnrolledCourses = async (userId: string) => {
    try {
      setLoadingEnrolled(true);
      
      // PRIMEIRO: Verificar payment intents via API do Stripe
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user?.email) {
        console.log('🔄 [Mentor] Iniciando verificação de payment intents...');
        await checkUserPaymentIntents(userId, userData.user.email);
      }
      
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
      
      // Verificar status de pagamento para cada curso pago
      const updatedEnrollments = await Promise.all(
        (enrollments || []).map(async (enrollment) => {
          if (enrollment.course.is_paid && enrollment.status === 'inactive') {
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
      
      setEnrolledCourses(updatedEnrollments);
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
    navigate(`/mentor/publicview/${mentorId}`);
  };

  return (
    <div className="flex">
      <MentorSidebar />
      <div className="flex-1 transition-all duration-300  p-6">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Cursos Adquiridos</h1>
            <p className="text-muted-foreground">Cursos que adquiri de outros mentores</p>
          </div>
          <Button onClick={() => navigate('/courses')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Explorar Mais Cursos
          </Button>
        </div>

        <div>
          {loadingEnrolled ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : enrolledCourses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Play className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
                      {enrollment.course.is_paid && (
                        <span className="text-sm font-medium text-green-600">
                          {formatPrice(enrollment.course.price)}
                        </span>
                      )}
                    </div>
                    {enrollment.progress_percentage > 0 && (
                      <div className="mb-4">
                        <span className="text-sm text-gray-600">
                          {Math.round(enrollment.progress_percentage)}% concluído
                        </span>
                      </div>
                    )}
                    {enrollment.status === 'active' ? (
                      <Button 
                        className="w-full"
                        onClick={() => navigateToCourse(enrollment.course_id)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {enrollment.progress_percentage > 0 ? 'Continuar' : 'Começar'}
                      </Button>
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