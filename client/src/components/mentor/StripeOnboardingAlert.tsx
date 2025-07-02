import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CreditCard,
    DollarSign,
    FileText,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface StripeOnboardingAlertProps {
  className?: string;
}

interface StripeData {
  stripe_account_id: string | null;
  stripe_onboarding_status: string | null;
  stripe_charges_enabled: boolean | null;
  stripe_payouts_enabled: boolean | null;
  stripe_requirements: Record<string, unknown> | null;
}

export default function StripeOnboardingAlert({ className }: StripeOnboardingAlertProps) {
  const { user } = useAuth();
  const [stripeData, setStripeData] = useState<StripeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPendencies, setShowPendencies] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
    fetchStripeData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user || userRole !== 'mentor') return;
    
    console.info("StripeOnboardingAlert: Iniciando polling a cada 2 minutos para mentor");
    
    const interval = setInterval(() => {
      console.info("StripeOnboardingAlert: Verificação automática de status Stripe (2min interval)");
      fetchStripeData();
    }, 120000);

    return () => {
      console.info("StripeOnboardingAlert: Limpando polling interval");
      clearInterval(interval);
    };
  }, [user, userRole]);

  const fetchStripeData = async () => {
    try {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role, stripe_account_id, stripe_onboarding_status, stripe_charges_enabled, stripe_payouts_enabled, stripe_requirements')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('StripeOnboardingAlert: Erro ao buscar dados:', error);
        return;
      }

      setUserRole(data?.role || null);
      
      if (data?.role === 'mentor') {
      setStripeData(data);
      } else {
        setStripeData(null);
      }
    } catch (error) {
      console.error('StripeOnboardingAlert: Erro ao buscar dados Stripe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOnboarding = () => {
    console.log('🚀 StripeOnboardingAlert: Redirecionando para página de onboarding Stripe');
    navigate('/mentor/stripe-onboarding');
  };

  if (isLoading || userRole !== 'mentor') {
    return null;
  }

  if (!stripeData) {
    return null;
  }

  const needsOnboarding = !stripeData.stripe_account_id || 
                          stripeData.stripe_onboarding_status !== 'completed' ||
                          !stripeData.stripe_charges_enabled ||
                          !stripeData.stripe_payouts_enabled;

  const requirements = stripeData.stripe_requirements as { currently_due?: string[]; disabled_reason?: string } | null;
  
  const isValidated = stripeData.stripe_charges_enabled === true && 
                      stripeData.stripe_payouts_enabled === true && 
                      (!requirements?.currently_due || requirements.currently_due.length === 0) &&
                      !requirements?.disabled_reason;
  const currentlyDue = requirements?.currently_due || [];
  const disabledReason = requirements?.disabled_reason;
  const hasPendencies = currentlyDue.length > 0 || disabledReason;

  if (isValidated) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-xl shadow-sm mb-6 ${className}`}>
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between gap-4 p-5 cursor-pointer hover:bg-green-100 transition-colors rounded-xl"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <h3 className="font-medium text-gray-800 text-sm leading-tight">
              Parabéns! Sua conta está validada
            </h3>
          </div>
          
          <div className="flex items-center gap-1 text-green-600">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="px-5 pb-5 space-y-4">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 space-y-3">
                <p className="text-gray-600 text-sm leading-relaxed">
                  Sua conta de pagamentos está completamente configurada e validada. 
                  Você já pode receber pagamentos dos seus cursos!
                </p>
                
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 font-medium">Status:</span>
                  <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs px-2 py-0.5 h-auto font-medium">
                    Conta Verificada
                  </Badge>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    <span>Documentos verificados</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <DollarSign className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    <span>Pronto para receber pagamentos</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CreditCard className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    <span>Conta bancária configurada</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <Button 
                  onClick={handleStartOnboarding}
                  className="bg-green-600 hover:bg-green-700 text-white border-0 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors duration-200 flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Atualizar Dados da Conta
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!needsOnboarding && !hasPendencies) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm ${className}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-green-800 text-sm">
                Conta de Pagamentos Configurada
              </span>
              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs px-2 py-0.5 h-auto">
                Ativo
              </Badge>
            </div>
          </div>
          <div className="text-gray-600 text-xs">
            Sua conta está configurada para receber pagamentos dos seus cursos.
          </div>
        </div>
      </div>
    );
  }

  if (hasPendencies) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm p-5 mb-6 ${className}`}>
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900 text-base leading-tight">
                  Pendências na Sua Conta de Pagamentos
                </h3>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed">
              Para ativar sua conta e começar a receber pagamentos, você precisa resolver 
              algumas pendências.
            </p>
            
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium">Status:</span>
              <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200 text-xs px-2 py-0.5 h-auto font-medium">
                {disabledReason === 'requirements.past_due' ? 'Vencido' : 'Pendente'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setShowPendencies(!showPendencies)}
                className="flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                {showPendencies ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                <span>
                  {showPendencies ? 'Ocultar' : 'Ver'} itens pendentes
                </span>
              </button>
              
              {showPendencies && (
                <div className="space-y-1 mt-3 pl-6 border-l-2 border-yellow-200">
                  {currentlyDue.map((item: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
                      <span>{translateRequirement(item)}</span>
                    </div>
                  ))}
                  
                  {disabledReason && (
                    <div className="flex items-center gap-2 text-xs text-red-600 mt-2">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      <span>Motivo: {translateDisabledReason(disabledReason)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <Button 
              onClick={handleStartOnboarding}
              className="bg-yellow-600 hover:bg-yellow-700 text-white border-0 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors duration-200 flex items-center gap-1.5"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Resolver Pendências
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-5 mb-6 ${className}`}>
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900 text-base leading-tight">
                Configure sua Conta para Receber Pagamentos
              </h3>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs text-gray-500 font-medium">Status:</span>
              <Badge className="bg-orange-50 text-orange-700 border border-orange-200 text-xs px-2 py-0.5 h-auto font-medium">
                {!stripeData.stripe_account_id ? 'Não configurado' : 'Configuração pendente'}
              </Badge>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm leading-relaxed">
            Para poder vender seus cursos e receber pagamentos, você precisa completar 
            algumas informações da sua conta de pagamentos.
          </p>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Zap className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
              <span>Processo rápido e seguro</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <DollarSign className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
              <span>Necessário para receber pagamentos</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FileText className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
              <span>Informações bancárias e documentos</span>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <Button 
            onClick={handleStartOnboarding}
            className="bg-orange-600 hover:bg-orange-700 text-white border-0 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors duration-200 flex items-center gap-1.5"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Configurar Agora
          </Button>
        </div>
      </div>
    </div>
  );
}

function translateRequirement(requirement: string): string {
  const translations: Record<string, string> = {
    'external_account': 'Conta bancária externa',
    'individual.email': 'Email do titular',
    'individual.political_exposure': 'Declaração de exposição política',
    'individual.verification.document': 'Documento de identificação',
    'individual.dob': 'Data de nascimento',
    'individual.address': 'Endereço completo',
    'individual.phone': 'Número de telefone',
    'individual.first_name': 'Nome',
    'individual.last_name': 'Sobrenome',
    'business_type': 'Tipo de negócio',
    'tos_acceptance': 'Aceite dos termos de serviço',
    'business_profile.mcc': 'Código de categoria do negócio',
    'business_profile.product_description': 'Descrição do produto/serviço',
    'representative.address.city': 'Cidade do representante',
    'representative.address.line1': 'Endereço do representante',
    'representative.address.postal_code': 'CEP do representante',
    'representative.address.state': 'Estado do representante',
    'representative.dob.day': 'Dia de nascimento do representante',
    'representative.dob.month': 'Mês de nascimento do representante',
    'representative.dob.year': 'Ano de nascimento do representante',
    'representative.email': 'Email do representante',
    'representative.first_name': 'Nome do representante',
    'representative.id_number': 'Número de identificação do representante',
    'representative.last_name': 'Sobrenome do representante',
    'representative.phone': 'Telefone do representante',
    'representative.political_exposure': 'Exposição política do representante',
    'representative.verification.additional_document': 'Documento adicional do representante',
    'representative.verification.document': 'Documento de identificação do representante',
    'tos_acceptance.date': 'Data de aceite dos termos',
    'tos_acceptance.ip': 'Endereço IP do aceite dos termos'
  };
  
  return translations[requirement] || requirement;
}

function translateDisabledReason(reason: string): string {
  const translations: Record<string, string> = {
    'requirements.past_due': 'Requisitos vencidos - ação necessária',
    'requirements.pending': 'Requisitos pendentes',
    'listed': 'Conta em lista restrita',
    'platform_paused': 'Plataforma pausada',
    'rejected.fraud': 'Rejeitado por suspeita de fraude',
    'rejected.listed': 'Rejeitado - em lista restrita',
    'rejected.terms_of_service': 'Rejeitado - violação dos termos',
    'under_review': 'Sob revisão'
  };
  
  return translations[reason] || reason;
} 