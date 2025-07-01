import {
    ArrowLeft,
    Award,
    BookOpen,
    CheckCircle,
    Clock,
    Edit3,
    Eye,
    Play,
    Save,
    Shield,
    Star,
    Users,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MentorSidebar from '../../components/mentor/MentorSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { Textarea } from '../../components/ui/textarea';
import { toast } from '../../hooks/use-toast';
import { supabase } from '../../utils/supabase';

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
  headline: string;
  subheadline: string;
  key_benefits: string[];
  social_proof: string;
  guarantee: string;
  bonus_offer: string;
  urgency_message: string;
}

const CourseLandingPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [landingData, setLandingData] = useState<LandingPageData>({
    headline: "Domine as Habilidades que Vão Transformar Sua Carreira",
    subheadline: "Um curso prático e direto ao ponto para você alcançar resultados reais em tempo recorde",
    key_benefits: [
      "Metodologia testada e aprovada",
      "Suporte direto com o mentor",
      "Acesso vitalício ao conteúdo",
      "Certificado de conclusão"
    ],
    social_proof: "Mais de 1.000 alunos já transformaram suas carreiras",
    guarantee: "Garantia incondicional de 30 dias",
    bonus_offer: "Bônus exclusivo: Kit de ferramentas profissionais",
    urgency_message: "Últimas vagas disponíveis"
  });

  useEffect(() => {
    const loadData = async () => {
      if (!courseId) return;
      
      try {
        const { data: course, error: courseError } = await supabase
          .from('cursos')
          .select('*')
          .eq('id', courseId)
          .single();

        if (courseError) throw courseError;
        setCourseData(course);

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

  const handleSave = async () => {
    if (!courseId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('course_landing_pages')
        .upsert({
          course_id: courseId,
          layout_body: landingData,
          layout_name: 'simple_checkout',
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Página de vendas salva com sucesso!",
        variant: "default"
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateLandingData = (field: keyof LandingPageData, value: string | string[]) => {
    setLandingData(prev => ({ ...prev, [field]: value }));
  };

  const EditableText = ({ 
    value, 
    field, 
    multiline = false, 
    className = "",
    placeholder = ""
  }: { 
    value: string;
    field: keyof LandingPageData;
    multiline?: boolean;
    className?: string;
    placeholder?: string;
  }) => {
    if (!isEditing) {
      return <span className={className}>{value}</span>;
    }

    if (multiline) {
      return (
        <Textarea
          value={value}
          onChange={(e) => updateLandingData(field, e.target.value)}
          className={className}
          placeholder={placeholder}
        />
      );
    }

    return (
      <Input
        value={value}
        onChange={(e) => updateLandingData(field, e.target.value)}
        className={className}
        placeholder={placeholder}
      />
    );
  };

  const EditableBenefits = () => {
    if (!isEditing) {
      return (
        <ul className="space-y-3">
          {landingData.key_benefits.map((benefit, index) => (
            <li key={index} className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="text-gray-700">{benefit}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <div className="space-y-2">
        {landingData.key_benefits.map((benefit, index) => (
          <div key={index} className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <Input
              value={benefit}
              onChange={(e) => {
                const newBenefits = [...landingData.key_benefits];
                newBenefits[index] = e.target.value;
                updateLandingData('key_benefits', newBenefits);
              }}
              className="flex-1"
            />
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateLandingData('key_benefits', [...landingData.key_benefits, 'Novo benefício'])}
        >
          + Adicionar Benefício
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex">
        <MentorSidebar />
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="flex">
        <MentorSidebar />
        <div className="flex-1 p-6">
          <div className="text-center py-10">
            <p className="text-lg text-red-500">Curso não encontrado</p>
                            <Button onClick={() => navigate('/mentor/cursos?tab=meus-cursos')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <MentorSidebar />
      <div className="flex-1">
        {/* Toolbar */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/mentor/cursos?tab=meus-cursos')}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-xl font-bold">Página de Checkout</h1>
              <p className="text-sm text-gray-600">{courseData.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => window.open(`/course-landing/${courseId}`, '_blank')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Visualizar
            </Button>
            
            {isEditing ? (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* Checkout Page Content */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              
              {/* Left Column - Course Info */}
              <div className="space-y-8">
                {/* Hero Section */}
                <div className="text-center lg:text-left">
                  {isEditing && (
                    <Badge variant="secondary" className="mb-4">
                      Editando: Título Principal
                    </Badge>
                  )}
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                    <EditableText
                      value={landingData.headline}
                      field="headline"
                      className="text-4xl lg:text-5xl font-bold text-gray-900"
                      placeholder="Título principal do curso"
                    />
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    <EditableText
                      value={landingData.subheadline}
                      field="subheadline"
                      className="text-xl text-gray-600"
                      placeholder="Subtítulo explicativo"
                    />
                  </p>
                </div>

                {/* Course Image */}
                {courseData.image_url && (
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                    <img
                      src={courseData.image_url}
                      alt={courseData.title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center space-x-2">
                        <Play className="w-5 h-5" />
                        <span className="font-medium">Preview do Curso</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Benefits */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Zap className="w-5 h-5 mr-2 text-blue-600" />
                      O que você vai aprender
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing && (
                      <Badge variant="secondary" className="mb-4">
                        Editando: Benefícios
                      </Badge>
                    )}
                    <EditableBenefits />
                  </CardContent>
                </Card>

                {/* Social Proof */}
                <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardContent className="p-6">
                    {isEditing && (
                      <Badge variant="secondary" className="mb-4">
                        Editando: Prova Social
                      </Badge>
                    )}
                    <div className="flex items-center space-x-3">
                      <div className="flex -space-x-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          <EditableText
                            value={landingData.social_proof}
                            field="social_proof"
                            className="font-semibold text-gray-900"
                            placeholder="Prova social (ex: +1000 alunos)"
                          />
                        </p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">4.9/5</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Checkout Card */}
              <div className="lg:sticky lg:top-8">
                <Card className="shadow-2xl border-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{courseData.title}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold">
                          {courseData.is_paid ? `R$ ${courseData.price}` : 'GRATUITO'}
                        </div>
                        {courseData.is_paid && (
                          <div className="text-sm opacity-90">
                            ou 12x de R$ {(courseData.price / 12).toFixed(2)}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm opacity-90">Acesso</div>
                        <div className="font-semibold">Vitalício</div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-6">
                    {/* Course Features */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold">Conteúdo Completo</div>
                          <div className="text-sm text-gray-600">Módulos práticos e teóricos</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold">Acesso Vitalício</div>
                          <div className="text-sm text-gray-600">Estude no seu ritmo</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Award className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-semibold">Certificado</div>
                          <div className="text-sm text-gray-600">Comprove suas habilidades</div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Bonus Offer */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      {isEditing && (
                        <Badge variant="secondary" className="mb-2">
                          Editando: Bônus
                        </Badge>
                      )}
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        <span className="font-semibold text-yellow-800">Bônus Incluído</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        <EditableText
                          value={landingData.bonus_offer}
                          field="bonus_offer"
                          className="text-sm text-yellow-700"
                          placeholder="Descrição do bônus oferecido"
                        />
                      </p>
                    </div>

                    {/* Urgency Message */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      {isEditing && (
                        <Badge variant="secondary" className="mb-2">
                          Editando: Urgência
                        </Badge>
                      )}
                      <p className="text-red-700 font-medium">
                        ⏰ <EditableText
                          value={landingData.urgency_message}
                          field="urgency_message"
                          className="text-red-700 font-medium"
                          placeholder="Mensagem de urgência"
                        />
                      </p>
                    </div>

                    {/* CTA Button */}
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 text-lg shadow-lg"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      {courseData.is_paid ? 'COMPRAR AGORA' : 'COMEÇAR GRATUITAMENTE'}
                    </Button>

                    {/* Guarantee */}
                    <div className="text-center">
                      {isEditing && (
                        <Badge variant="secondary" className="mb-2">
                          Editando: Garantia
                        </Badge>
                      )}
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span>
                          <EditableText
                            value={landingData.guarantee}
                            field="guarantee"
                            className="text-sm text-gray-600"
                            placeholder="Texto da garantia"
                          />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLandingPage; 