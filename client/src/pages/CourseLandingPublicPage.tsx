import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { createFreeEnrollment, redirectAfterEnrollment } from '@/services/courseService';
import { triggerEnrollmentConfetti } from '@/utils/confetti';
import { supabase } from '@/utils/supabase';
import {
    ArrowLeft,
    Award,
    CheckCircle,
    Clock,
    Star,
    Users,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface CourseData {
  id: string;
  title: string;
  description: string;
  price: number;
  is_paid: boolean;
  image_url: string;
  mentor_id: string;
  created_at: string;
}

interface LandingPageData {
  hero_title: string;
  hero_subtitle: string;
  hero_cta: string;
  problem_title: string;
  problem_description: string;
  solution_title: string;
  solution_description: string;
  benefits: string[];
  testimonial_text: string;
  testimonial_author: string;
  guarantee_text: string;
  urgency_text: string;
  bonus_title: string;
  bonus_description: string;
}

const CourseLandingPublicPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [processingEnrollment, setProcessingEnrollment] = useState(false);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [landingData, setLandingData] = useState<LandingPageData>({
    hero_title: "Transforme Sua Vida com Este Curso Incrível",
    hero_subtitle: "Aprenda as habilidades que vão revolucionar sua carreira e abrir novas oportunidades",
    hero_cta: "Quero Começar Agora",
    problem_title: "Você Está Enfrentando Esses Desafios?",
    problem_description: "Muitas pessoas lutam para encontrar direção em suas carreiras, sentem-se estagnadas e não sabem como dar o próximo passo para alcançar seus objetivos.",
    solution_title: "A Solução Que Você Estava Procurando",
    solution_description: "Este curso foi desenvolvido especificamente para pessoas como você, que querem sair da zona de conforto e alcançar resultados extraordinários.",
    benefits: [
      "Metodologia comprovada e testada",
      "Suporte personalizado durante todo o curso",
      "Acesso vitalício ao conteúdo",
      "Certificado de conclusão",
      "Comunidade exclusiva de alunos"
    ],
    testimonial_text: "Este curso mudou completamente minha perspectiva profissional. Em apenas 3 meses consegui resultados que não imaginava serem possíveis!",
    testimonial_author: "Maria Silva, Estudante",
    guarantee_text: "Garantia de 7 dias - Se não ficar satisfeito, devolvemos 100% do seu dinheiro",
    urgency_text: "⚡ Oferta por tempo limitado! Apenas 48 horas restantes",
    bonus_title: "Bônus Exclusivos",
    bonus_description: "Além do curso completo, você também receberá materiais extras que vão acelerar seus resultados"
  });

  useEffect(() => {
    const loadData = async () => {
      if (!courseId) return;
      
      try {
        // Carregar dados do curso
        const { data: course, error: courseError } = await supabase
          .from('cursos')
          .select('*')
          .eq('id', courseId)
          .single();

        if (courseError) throw courseError;
        setCourseData(course);

        // Tentar carregar dados personalizados da landing page
        const { data: landingPage } = await supabase
          .from('course_landing_pages')
          .select('layout_body')
          .eq('course_id', courseId)
          .single();

        if (landingPage?.layout_body) {
          setLandingData(prevData => ({ ...prevData, ...landingPage.layout_body }));
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do curso",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [courseId]);

  const handleEnrollment = async () => {
    try {
      // Verificar se o usuário está logado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Login necessário",
          description: "Você precisa estar logado para se inscrever no curso",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      setProcessingEnrollment(true);

      // Se o curso é gratuito, usar a nova função que preenche todos os campos
      if (!courseData?.is_paid) {
        await createFreeEnrollment(courseId!, user.id);

        // Disparar confete de sucesso
        triggerEnrollmentConfetti();

        toast({
          title: "Sucesso!",
          description: "Que bom que você adquiriu este curso gratuito! Aproveite!",
          variant: "default"
        });
        
        // Aguardar um pouco para que o usuário veja o confete
        setTimeout(async () => {
          // Redirecionar baseado no role do usuário
          await redirectAfterEnrollment(user.id, navigate);
        }, 2000);

      } else {
        // Para cursos pagos, redirecionar para checkout (implementar futuramente)
        toast({
          title: "Em desenvolvimento",
          description: "O sistema de pagamento será implementado em breve",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Erro ao inscrever:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível completar a inscrição",
        variant: "destructive"
      });
    } finally {
      setProcessingEnrollment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando página do curso...</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Curso não encontrado</h1>
          <p className="text-gray-600 mb-6">
            O curso que você está procurando não foi encontrado ou não está mais disponível.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {landingData.hero_title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {landingData.hero_subtitle}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              size="lg" 
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handleEnrollment}
              disabled={processingEnrollment}
            >
              {processingEnrollment ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Inscrevendo você...
                </>
              ) : (
                landingData.hero_cta
              )}
            </Button>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {courseData.is_paid ? `R$ ${courseData.price}` : 'GRATUITO'}
              </div>
              <div className="text-sm opacity-75">
                {courseData.is_paid ? 'Pagamento único' : 'Acesso completo'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Image */}
      {courseData.image_url && (
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <img
              src={courseData.image_url}
              alt={courseData.title}
              className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
            />
          </div>
        </section>
      )}

      {/* Problem Section */}
      <section className="py-16 bg-red-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-red-600 mb-6">
              {landingData.problem_title}
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              {landingData.problem_description}
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 bg-green-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-6">
              {landingData.solution_title}
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              {landingData.solution_description}
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              O Que Você Vai Conquistar
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <ul className="space-y-3">
                {landingData.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Acesso Vitalício</h3>
                    <p className="text-gray-600">Estude no seu ritmo, quando quiser</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Certificado</h3>
                    <p className="text-gray-600">Comprove suas novas habilidades</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Suporte Direto</h3>
                    <p className="text-gray-600">Tire dúvidas com o mentor</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-xl italic text-gray-700 mb-6">
              "{landingData.testimonial_text}"
            </blockquote>
            <cite className="font-semibold text-gray-600">
              {landingData.testimonial_author}
            </cite>
          </Card>
        </div>
      </section>

      {/* Bonus Section */}
      <section className="py-16 bg-yellow-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-600 mb-6">
              {landingData.bonus_title}
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              {landingData.bonus_description}
            </p>
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-12 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-2xl font-bold mb-4">
            {landingData.urgency_text}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Comece Sua Transformação Hoje!
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Não perca mais tempo. Sua nova vida começa agora.
          </p>
          
          <div className="space-y-6">
            <Button 
              size="lg" 
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-12 py-6 text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handleEnrollment}
              disabled={processingEnrollment}
            >
              {processingEnrollment ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Inscrevendo você...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6 mr-2" />
                  QUERO COMEÇAR AGORA
                </>
              )}
            </Button>
            
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {courseData.is_paid ? `R$ ${courseData.price}` : 'GRATUITO'}
              </div>
              {courseData.is_paid && (
                <div className="text-sm opacity-75">
                  Ou 12x de R$ {(courseData.price / 12).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-12 bg-green-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
            <p className="text-lg font-semibold text-green-700">
              {landingData.guarantee_text}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseLandingPublicPage;