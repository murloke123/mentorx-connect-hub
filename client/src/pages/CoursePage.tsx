import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createFreeEnrollment, redirectAfterEnrollment } from '@/services/courseService';
import { triggerEnrollmentConfetti } from '@/utils/confetti';
import { CheckCircle, Clock, Play, ShoppingCart, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { startCourseCheckout } from '../services/stripeCheckoutService';
import { supabase } from '../utils/supabase';

interface CourseData {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  is_paid: boolean;
  price?: number;
  discount?: number;
  discounted_price?: number;
  mentor_id: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingEnrollment, setProcessingEnrollment] = useState(false);

  // Status de pagamento simulado
  const paymentStatus = { isPaid: false };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          setCurrentUser(profile);

          // Verificar se já está matriculado
          if (courseId) {
            const { data: enrollment } = await supabase
              .from('matriculas')
              .select('*')
              .eq('course_id', courseId)
              .eq('student_id', user.id)
              .single();
            
            setIsEnrolled(!!enrollment);
          }
        }

        // Carregar dados do curso
        if (courseId) {
          const { data: courseData } = await supabase
            .from('cursos')
            .select(`
              *,
              profiles:mentor_id (full_name, avatar_url)
            `)
            .eq('id', courseId)
            .single();

          setCourse(courseData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handlePurchase = async () => {
    if (!currentUser) {
      toast.error('Você precisa estar logado para comprar este curso');
      navigate('/login');
      return;
    }

    if (!courseId) {
      toast.error('ID do curso não encontrado');
      return;
    }

    console.log('🛒 Iniciando processo de compra:', {
      courseId,
      userId: currentUser.id,
      course: course
    });

    setProcessingPayment(true);
    try {
      const result = await startCourseCheckout(courseId, currentUser.id);
      console.log('✅ Sessão de checkout criada:', result);
      
      if (!result.sessionUrl) {
        throw new Error('URL da sessão não retornada');
      }
      
      // Redirecionar para o Stripe Checkout
      console.log('🔄 Redirecionando para:', result.sessionUrl);
      window.location.href = result.sessionUrl;
    } catch (error: any) {
      console.error('❌ Erro ao processar pagamento:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleStartFreeCourse = async () => {
    if (!currentUser) {
      toast.error('Você precisa estar logado para se inscrever');
      navigate('/login');
      return;
    }

    if (!courseId) return;

    setProcessingEnrollment(true);

    try {
      // Usar a nova função que preenche todos os campos obrigatórios
      await createFreeEnrollment(courseId, currentUser.id);

      // Disparar confete de sucesso
      triggerEnrollmentConfetti();

      // Toast personalizado com a mensagem solicitada
      toast.success('Que bom que você adquiriu este curso gratuito! Aproveite!', {
        duration: 4000,
      });
      
      // Aguardar um pouco para que o usuário veja o confete
      setTimeout(async () => {
        // Redirecionar baseado no role do usuário
        await redirectAfterEnrollment(currentUser.id, navigate);
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao se inscrever:', error);
      toast.error(error.message || 'Erro ao se inscrever no curso');
    } finally {
      setProcessingEnrollment(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-lg">Carregando...</div>
    </div>;
  }

  if (!course) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-lg">Curso não encontrado</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header do Curso */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="relative h-64 bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-lg">
            {course.image_url && (
              <img 
                src={course.image_url} 
                alt={course.title}
                className="w-full h-full object-cover rounded-t-lg"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-t-lg" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <p className="text-lg opacity-90">{course.description}</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <img 
                    src={course.profiles?.avatar_url || '/placeholder-avatar.png'} 
                    alt="Mentor"
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium">{course.profiles?.full_name}</p>
                    <p className="text-sm text-gray-600">Instrutor</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>2h 30min</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>1,234 alunos</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    <span>4.8 (156 avaliações)</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                {course.is_paid ? (
                  <div>
                    {course.discount > 0 && (
                      <p className="text-sm text-gray-500 line-through">
                        {formatPrice(course.price)}
                      </p>
                    )}
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(course.discounted_price || course.price)}
                    </p>
                  </div>
                ) : (
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Gratuito
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sobre este curso</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {course.description || 'Descrição não disponível.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>O que você vai aprender</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                    <span>Fundamentos essenciais do tema</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                    <span>Técnicas avançadas e melhores práticas</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                    <span>Projetos práticos para aplicar o conhecimento</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                    <span>Certificado de conclusão</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar de Compra */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                {/* Status do Pagamento */}
                {isEnrolled ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">
                        Você já possui este curso!
                      </span>
                    </div>
                  </div>
                ) : null}

                {/* Preço */}
                {course.is_paid && !isEnrolled && (
                  <div className="text-center mb-6">
                    {course.discount > 0 && (
                      <p className="text-lg text-gray-500 line-through">
                        {formatPrice(course.price)}
                      </p>
                    )}
                    <p className="text-3xl font-bold text-green-600">
                      {formatPrice(course.discounted_price || course.price)}
                    </p>
                    {course.discount > 0 && (
                      <Badge className="mt-2 bg-red-500">
                        {course.discount}% OFF
                      </Badge>
                    )}
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="space-y-3">
                  {isEnrolled ? (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => redirectAfterEnrollment(currentUser!.id, navigate)}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Continuar Assistindo
                    </Button>
                  ) : (
                    <>
                      {course.is_paid ? (
                        currentUser ? (
                          <Button 
                            className="w-full" 
                            size="lg"
                            onClick={handlePurchase}
                            disabled={processingPayment}
                          >
                            {processingPayment ? (
                              <>Processando...</>
                            ) : (
                              <>
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Comprar Curso
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button 
                            className="w-full" 
                            size="lg"
                            onClick={() => navigate('/login')}
                          >
                            Faça login para comprar
                          </Button>
                        )
                      ) : (
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={handleStartFreeCourse}
                          disabled={processingEnrollment}
                        >
                          {processingEnrollment ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Inscrevendo você...
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-5 w-5" />
                              Começar Agora (Grátis)
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  )}
                  
                  <Button variant="outline" className="w-full" size="lg">
                    Adicionar à Lista de Desejos
                  </Button>
                </div>

                {/* Garantia */}
                {course.is_paid && (
                  <div className="mt-6 pt-6 border-t text-center">
                    <p className="text-sm text-gray-600">
                      🛡️ Garantia de 30 dias
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Devolução do dinheiro se não ficar satisfeito
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Adicional */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Este curso inclui:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <Play className="w-4 h-4 mr-3 text-gray-600" />
                  <span>2 horas de vídeo sob demanda</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-3 text-gray-600" />
                  <span>Certificado de conclusão</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-3 text-gray-600" />
                  <span>Acesso vitalício</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage; 