import { createFreeEnrollment, redirectAfterEnrollment } from '@/services/courseService';
import { startCourseCheckout } from '@/services/stripeCheckoutService';
import { triggerEnrollmentConfetti } from '@/utils/confetti';
import { supabase } from "@/utils/supabase";
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

interface CourseData {
  id: string;
  title: string;
  description: string;
  mentor_id: string;
  price?: number;
  is_paid: boolean;
  image_url?: string;
}

interface LandingPageData {
  id: string;
  template_type: string;
  course_id: string;
  mentor_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: unknown; // Para aceitar as seções JSONB dinamicamente
}

interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

const CoursePublicView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [landingPageData, setLandingPageData] = useState<LandingPageData | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingEnrollment, setProcessingEnrollment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId) return;

      try {
        console.log('🔍 Carregando dados públicos do curso:', courseId);

        // Carregar usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          setCurrentUser(profile);

          // Verificar se já está matriculado (apenas matrículas ativas)
          const { data: enrollment, error: enrollmentError } = await supabase
            .from('matriculas')
            .select('*')
            .eq('course_id', courseId)
            .eq('student_id', user.id)
            .eq('status', 'active')
            .single();
          
          console.log('🔍 Verificação de matrícula:', {
            courseId,
            userId: user.id,
            enrollment,
            error: enrollmentError
          });
          
          setIsEnrolled(!!enrollment && !enrollmentError);
        }

        // Buscar dados do curso com campos corretos
        const courseResult = await supabase
          .from('cursos')
          .select('id, title, description, mentor_id, price, is_paid, image_url')
          .eq('id', courseId)
          .single();

        if (courseResult.error) {
          console.error('Erro ao buscar curso:', courseResult.error);
          throw new Error('Curso não encontrado');
        }

        setCourseData(courseResult.data);

        // Tentar buscar landing page (opcional)
        const landingPageResult = await supabase
          .from('course_landing_pages')
          .select('*')
          .eq('course_id', courseId)
          .eq('is_active', true)
          .single();

        if (!landingPageResult.error) {
          setLandingPageData(landingPageResult.data);
        }

        console.log('✅ Dados carregados:', {
          curso: courseResult.data.title,
          temLandingPage: !landingPageResult.error
        });

      } catch (err) {
        console.error('❌ Erro ao carregar curso:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseData();
  }, [courseId]);

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
      course: courseData
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

  // Handler quando iframe carrega - apenas carregar dados salvos
  const handleIframeLoad = () => {
    setTimeout(() => {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow && landingPageData) {
        try {
          // Enviar dados salvos para o iframe
          iframe.contentWindow.postMessage({
            type: 'SET_LANDING_PAGE_ID',
            pageId: landingPageData.id,
            isPublicView: true // Flag para indicar que é visualização pública
          }, '*');

          // Definir variável global no iframe
          if (iframe.contentDocument) {
            (iframe.contentDocument.defaultView as Window & { landingPageId?: string; isPublicView?: boolean }).landingPageId = landingPageData.id;
            (iframe.contentDocument.defaultView as Window & { landingPageId?: string; isPublicView?: boolean }).isPublicView = true;
          }

          console.log(`🆔 Dados enviados para iframe (público): ${landingPageData.id}`);
        } catch (error) {
          console.error('❌ Erro ao configurar iframe público:', error);
        }
      }
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando curso...</p>
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Curso não encontrado</h2>
          <p className="text-gray-600 mb-4">
            {error || 'O curso que você está procurando não existe ou não está disponível.'}
          </p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            ← Voltar ao início
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Página de Checkout/Venda do Curso */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informações do Curso */}
          <div>
            {courseData.image_url && (
              <img 
                src={courseData.image_url} 
                alt={courseData.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{courseData.title}</h1>
            <p className="text-lg text-gray-600 mb-6">{courseData.description}</p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-green-600 font-semibold">✓</span>
                <span className="ml-2">Acesso vitalício ao conteúdo</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 font-semibold">✓</span>
                <span className="ml-2">Suporte do mentor</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 font-semibold">✓</span>
                <span className="ml-2">Certificado de conclusão</span>
              </div>
            </div>
          </div>

          {/* Card de Compra */}
          <div className="bg-white border rounded-lg p-6 shadow-lg">
            {/* Status de matrícula */}
            {isEnrolled && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-green-600 font-semibold">✓</span>
                  <span className="ml-2 text-green-800 font-medium">
                    Você já possui este curso!
                  </span>
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {courseData.is_paid ? `R$ ${courseData.price?.toFixed(2) || '0,00'}` : 'GRATUITO'}
              </div>
              <p className="text-gray-600">
                {courseData.is_paid ? 'Pagamento único' : 'Acesso completo'}
              </p>
            </div>

            {/* Verificar se é o criador do curso */}
            {currentUser?.id === courseData.mentor_id ? (
              <button 
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
                                    onClick={() => navigate('/mentor/cursos?tab=meus-cursos')}
              >
                Gerenciar Meu Curso
              </button>
            ) : isEnrolled ? (
              <button 
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors mb-4"
                onClick={() => redirectAfterEnrollment(currentUser!.id, navigate)}
              >
                Ir para Meus Cursos
              </button>
            ) : (
              <button 
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={processingPayment || processingEnrollment}
                onClick={courseData.is_paid ? handlePurchase : handleStartFreeCourse}
              >
                {processingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processando pagamento...
                  </>
                ) : processingEnrollment ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Inscrevendo você...
                  </>
                ) : (
                  courseData.is_paid ? 'Comprar Curso' : 'Inscrever-se Gratuitamente'
                )}
              </button>
            )}

            <div className="text-center text-sm text-gray-500">
              🛡️ Garantia de 30 dias ou seu dinheiro de volta
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePublicView; 