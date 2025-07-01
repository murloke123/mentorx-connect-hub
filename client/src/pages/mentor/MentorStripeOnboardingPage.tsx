import { DocumentSection } from "@/components/DocumentSection";
import MentorSidebar from '@/components/mentor/MentorSidebar';
import StripeErrorModal from "@/components/StripeErrorModal";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createOrUpdateStripeConnectedAccount, type StripeOnboardingData } from "@/services/stripeClientService";
import { supabase } from '@/utils/supabase';
import { ArrowLeft, ArrowRight, Building2, Calendar, CheckCircle2, CreditCard, FileText, MapPin, Phone, Shield, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface OnboardingFormData {
  // Informações Pessoais
  phone: string;
  dateOfBirth: string;
  cpf: string;
  
  // Endereço
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressPostalCode: string;
  
  // Informações Bancárias
  bankAccountType: string;
  bankRoutingNumber: string;
  bankBranchNumber: string;
  bankAccountNumber: string;
  bankAccountHolderName: string;
  
  // Documentos
  documentType: string;
  documentFrontUploaded: boolean;
  documentBackUploaded: boolean;
  
  // Termos
  tosAccepted: boolean;
}

const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

export default function MentorStripeOnboardingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  // ✅ Estado isAnalyzingAccount removido - não há mais delay de análise
  const [userProfile, setUserProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  
  const [formData, setFormData] = useState<OnboardingFormData>({
    phone: '',
    dateOfBirth: '',
    addressLine1: '',
    addressLine2: '',
    addressCity: '',
    addressState: '',
    addressPostalCode: '',
    bankAccountType: '',
    bankRoutingNumber: '',
    bankBranchNumber: '',
    bankAccountNumber: '',
    bankAccountHolderName: '',
    documentType: '',
    documentFrontUploaded: false,
    documentBackUploaded: false,
    tosAccepted: false,
    cpf: '',
  });

  const [stripeError, setStripeError] = useState<{ type: string; message: string; code: string; timestamp: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchUser();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }
      
      // Adicionar o email do auth.users ao perfil se não existir
      const profileWithEmail = {
        ...data,
        email: data.email || user.email // Usar email do auth.users se não tiver no profile
      };

      setUserProfile(profileWithEmail);
      
      // Preencher campos que já existem
      setFormData(prev => ({
        ...prev,
        phone: data.phone || '',
        dateOfBirth: data.date_of_birth || '',
        addressLine1: data.address_line1 || '',
        addressLine2: data.address_line2 || '',
        addressCity: data.address_city || '',
        addressState: data.address_state || '',
        addressPostalCode: data.address_postal_code || '',
        bankAccountType: data.bank_account_type || '',
        bankRoutingNumber: data.bank_routing_number || '',
        bankBranchNumber: data.bank_branch_number || '',
        bankAccountNumber: data.bank_account_number || '',
        bankAccountHolderName: data.bank_account_holder_name || data.full_name || '',
        cpf: data.cpf || '',
        // Campos de documentos
        documentType: data.document_type || '',
        documentFrontUploaded: !!data.document_front_url,
        documentBackUploaded: !!data.document_back_url
      }));
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas informações.",
        variant: "destructive",
      });
    }
  };

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas informações.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = useCallback((field: keyof OnboardingFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Função memoizada para evitar loop infinito no DocumentSection
  const handleDocumentChange = useCallback((data: {
    documentType: string;
    frontUploaded: boolean;
    backUploaded: boolean;
  }) => {
    handleInputChange('documentType', data.documentType);
    handleInputChange('documentFrontUploaded', data.frontUploaded);
    handleInputChange('documentBackUploaded', data.backUploaded);
  }, [handleInputChange]);

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.phone && formData.dateOfBirth && formData.cpf);
      case 2:
        return !!(formData.addressLine1 && formData.addressCity && formData.addressState && formData.addressPostalCode);
      case 3:
        return !!(formData.bankAccountType && formData.bankRoutingNumber && formData.bankBranchNumber && formData.bankAccountNumber && formData.bankAccountHolderName);
      case 4:
        // Se os documentos já foram verificados, step é válido
        if (userProfile?.document_verification_status === 'verified') {
          return true;
        }
        // Se a conta já está validada, não precisa de documentos
        const isValidated = userProfile?.stripe_charges_enabled === true && 
                           userProfile?.stripe_payouts_enabled === true && 
                           (!userProfile?.stripe_requirements?.currently_due || userProfile.stripe_requirements.currently_due.length === 0) &&
                           !userProfile?.stripe_requirements?.disabled_reason;
        if (isValidated) {
          return true;
        }
        return !!(formData.documentType && formData.documentFrontUploaded && formData.documentBackUploaded);
      case 5:
        return formData.tosAccepted;
      default:
        return false;
    }
  }, [formData, userProfile?.stripe_onboarding_status, userProfile?.document_verification_status]);

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      toast({
        title: "Erro",
        description: "Por favor, aceite os termos de serviço para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const stripeData: StripeOnboardingData = {
        email: user?.email || userProfile?.email || '',
        full_name: userProfile?.full_name || '',
        phone: formData.phone.replace(/\D/g, ''),
        cpf: formData.cpf.replace(/\D/g, ''),
        date_of_birth: formData.dateOfBirth,
        stripe_account_id: userProfile?.stripe_account_id || null,
        address: {
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.addressCity,
          state: formData.addressState,
          postal_code: formData.addressPostalCode.replace(/\D/g, ''),
          country: 'BR'
        },
        bank_account: {
          account_type: formData.bankAccountType,
          routing_number: formData.bankRoutingNumber,
          branch_number: formData.bankBranchNumber,
          account_number: formData.bankAccountNumber,
          account_holder_name: formData.bankAccountHolderName
        },
        tos_ip: '127.0.0.1' // TODO: Capturar IP real
      };

      // Processar data de nascimento
      const [year, month, day] = formData.dateOfBirth.split('-');
      
      // Os logs do payload real que vai para a Stripe estão no servidor (stripeServerService.ts)
      // Procure por "🚀 [STRIPE-SERVER-SERVICE]" no console do servidor

      // PRIMEIRO: Salvar todos os dados do formulário no perfil do usuário
      const formDataUpdate = {
        email: user?.email || userProfile?.email || '', // Garantir que o email seja salvo
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth,
        cpf: formData.cpf,
        address_line1: formData.addressLine1,
        address_line2: formData.addressLine2,
        address_city: formData.addressCity,
        address_state: formData.addressState,
        address_postal_code: formData.addressPostalCode,
        address_country: 'BR',
        bank_account_type: formData.bankAccountType,
        bank_routing_number: formData.bankRoutingNumber,
        bank_branch_number: formData.bankBranchNumber,
        bank_account_number: formData.bankAccountNumber,
        bank_account_holder_name: formData.bankAccountHolderName,
        business_type: 'individual',
        tos_accepted_at: new Date().toISOString(),
        tos_ip_address: '127.0.0.1',
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update(formDataUpdate)
        .eq('id', user.id);

      if (profileUpdateError) {
        throw profileUpdateError;
      }

      // SEGUNDO: Chamar a API do Stripe via novo serviço seguro
      console.log('🚀 [ONBOARDING] Chamando stripeClientService.ts (seguro)');
      const stripeResponse = await createOrUpdateStripeConnectedAccount(stripeData);

      if (!stripeResponse.success) {
        throw new Error(stripeResponse.error || 'Erro ao criar conta Stripe');
      }

      const account = stripeResponse.account!;

      // Atualizar perfil com dados do Stripe
      const stripeUpdateData = {
        stripe_account_id: account.id,
        stripe_onboarding_status: account.details_submitted ? 'completed' : 'pending',
        stripe_charges_enabled: account.charges_enabled,
        stripe_payouts_enabled: account.payouts_enabled,
        updated_at: new Date().toISOString()
      };

      const { error: stripeUpdateError } = await supabase
        .from('profiles')
        .update(stripeUpdateData)
        .eq('id', user.id);

      if (stripeUpdateError) {
        throw stripeUpdateError;
      }

      // TERCEIRO: Associar documentos ao Stripe se foram enviados
      if (formData.documentFrontUploaded && formData.documentBackUploaded && userProfile?.stripe_document_front_id && userProfile?.stripe_document_back_id) {
        try {
          const { associateDocumentToAccount } = await import('@/services/stripeDocumentService');
          
          // Associar documento da frente
          await associateDocumentToAccount(
            account.id,
            userProfile.stripe_document_front_id,
            'front'
          );
          
          // Associar documento do verso
          await associateDocumentToAccount(
            account.id,
            userProfile.stripe_document_back_id,
            'back'
          );
          
          console.log('✅ Documentos associados ao Stripe com sucesso');
        } catch (docError) {
          console.error('⚠️ Erro ao associar documentos ao Stripe:', docError);
          // Não falha o onboarding por causa dos documentos
        }
      }

      toast({
        title: "Sucesso!",
        description: "Suas informações foram salvas com sucesso. Iniciando análise da conta...",
      });

      // ✅ DELAY REMOVIDO: Navegação imediata para melhor UX
      console.log('✅ Finalizando configuração e navegando imediatamente para dashboard');
      navigate('/mentor/dashboard');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [ONBOARDING] Erro:', errorMessage);
      
      // Se for um erro específico da Stripe, criar objeto estruturado
      if (errorMessage.includes('Invalid') || errorMessage.includes('stripe')) {
        setStripeError({
          type: 'api_error',
          message: errorMessage,
          code: 'general_error',
          timestamp: new Date().toISOString()
        });
        setIsOpen(true);
      }
      
        toast({
          title: "Erro",
        description: `Não foi possível salvar suas informações. ${errorMessage}`,
          variant: "destructive",
        });
    } finally {
      setIsLoading(false);

    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <User className="w-12 h-12 text-orange-600 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Informações Pessoais</h2>
              <p className="text-gray-600">Precisamos de algumas informações básicas sobre você.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Telefone *
                </Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                    className="pl-10"
                    maxLength={15}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">
                  CPF *
                </Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                    className="pl-10"
                    maxLength={14}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                  Data de Nascimento *
                </Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="pl-10"
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <MapPin className="w-12 h-12 text-orange-600 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Endereço</h2>
              <p className="text-gray-600">Informe seu endereço completo.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="addressLine1" className="text-sm font-medium text-gray-700">
                  Endereço *
                </Label>
                <Input
                  id="addressLine1"
                  placeholder="Rua/Avenida e número"
                  value={formData.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="addressLine2" className="text-sm font-medium text-gray-700">
                  Complemento
                </Label>
                <Input
                  id="addressLine2"
                  placeholder="Apartamento, bloco, etc. (opcional)"
                  value={formData.addressLine2}
                  onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="addressCity" className="text-sm font-medium text-gray-700">
                    Cidade *
                  </Label>
                  <Input
                    id="addressCity"
                    placeholder="Cidade"
                    value={formData.addressCity}
                    onChange={(e) => handleInputChange('addressCity', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="addressState" className="text-sm font-medium text-gray-700">
                    Estado *
                  </Label>
                  <Select value={formData.addressState} onValueChange={(value) => handleInputChange('addressState', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="addressPostalCode" className="text-sm font-medium text-gray-700">
                  CEP *
                </Label>
                <Input
                  id="addressPostalCode"
                  placeholder="00000-000"
                  value={formData.addressPostalCode}
                  onChange={(e) => handleInputChange('addressPostalCode', formatCEP(e.target.value))}
                  maxLength={9}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Building2 className="w-12 h-12 text-orange-600 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Informações Bancárias</h2>
              <p className="text-gray-600">Configure sua conta para receber pagamentos.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="bankAccountType" className="text-sm font-medium text-gray-700">
                  Tipo de Conta *
                </Label>
                <Select value={formData.bankAccountType} onValueChange={(value) => handleInputChange('bankAccountType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Conta Corrente</SelectItem>
                    <SelectItem value="savings">Conta Poupança</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankRoutingNumber" className="text-sm font-medium text-gray-700">
                    Código do Banco *
                  </Label>
                  <Input
                    id="bankRoutingNumber"
                    placeholder="001, 237, 341, etc."
                    value={formData.bankRoutingNumber}
                    onChange={(e) => handleInputChange('bankRoutingNumber', e.target.value.replace(/\D/g, ''))}
                    maxLength={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bankBranchNumber" className="text-sm font-medium text-gray-700">
                    Agência *
                  </Label>
                  <Input
                    id="bankBranchNumber"
                    placeholder="1739"
                    value={formData.bankBranchNumber}
                    onChange={(e) => handleInputChange('bankBranchNumber', e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bankAccountNumber" className="text-sm font-medium text-gray-700">
                  Número da Conta *
                </Label>
                <Input
                  id="bankAccountNumber"
                  placeholder="125837-0"
                  value={formData.bankAccountNumber}
                  onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Inclua o dígito verificador (ex: 125837-0)
                </p>
              </div>
              
              <div>
                <Label htmlFor="bankAccountHolderName" className="text-sm font-medium text-gray-700">
                  Nome do Titular *
                </Label>
                <Input
                  id="bankAccountHolderName"
                  placeholder="Nome completo como no banco"
                  value={formData.bankAccountHolderName}
                  onChange={(e) => handleInputChange('bankAccountHolderName', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Digite exatamente como aparece na sua conta bancária
                </p>
              </div>
              
              {/* Exemplo visual */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Exemplo:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Banco:</strong> 341 (Itaú)</p>
                  <p><strong>Agência:</strong> 1739</p>
                  <p><strong>Conta:</strong> 125837-0</p>
                  <p><strong>Titular:</strong> João Silva Santos</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <FileText className="w-12 h-12 text-purple-600 mx-auto" />
            </div>
            
            {/* Verificar se o documento já foi verificado */}
            {userProfile?.document_verification_status === 'verified' ? (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Seus documentos já foram verificados
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Você pode prosseguir para a próxima etapa.
                </p>
              </div>
            ) : (
              user?.id && (
                <DocumentSection
                  userId={user.id}
                  initialDocumentType={formData.documentType}
                  initialFrontUrl={userProfile?.document_front_url}
                  initialBackUrl={userProfile?.document_back_url}
                  onDocumentChange={handleDocumentChange}
                />
              )
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Shield className="w-12 h-12 text-orange-600 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Termos e Condições</h2>
              <p className="text-gray-600">Revise e aceite os termos para finalizar.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Resumo das Informações</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Nome:</span>
                  <span className="ml-2 font-medium">{userProfile?.full_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{userProfile?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Telefone:</span>
                  <span className="ml-2 font-medium">{formData.phone}</span>
                </div>
                <div>
                  <span className="text-gray-600">Cidade:</span>
                  <span className="ml-2 font-medium">{formData.addressCity}, {formData.addressState}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="tosAccepted"
                  checked={formData.tosAccepted}
                  onCheckedChange={(checked) => handleInputChange('tosAccepted', checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="tosAccepted" className="text-sm text-gray-700 leading-relaxed">
                  Eu aceito os{' '}
                  <a href="#" className="text-orange-600 hover:underline">
                    Termos de Serviço do Stripe
                  </a>{' '}
                  e confirmo que todas as informações fornecidas são verdadeiras e precisas.
                  Entendo que essas informações serão usadas para processar pagamentos e
                  cumprir obrigações regulamentares.
                </Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <MentorSidebar />
      <div className="flex-1 min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="text-center">
              <CreditCard className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Configuração de Pagamentos
              </h1>
              <p className="text-gray-600">
                Complete seu perfil para começar a receber pagamentos dos seus cursos
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                    step <= currentStep
                      ? 'bg-orange-600 border-orange-600 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {step < currentStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Pessoal</span>
              <span>Endereço</span>
              <span>Bancário</span>
              <span>Documentos</span>
              <span>Finalizar</span>
            </div>
          </div>

          {/* Form Card */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            
            {currentStep < 5 ? (
              <Button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="bg-orange-600 hover:bg-orange-700 px-6"
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep(5) || isLoading}
                className="bg-green-600 hover:bg-green-700 px-6"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Finalizar Configuração
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Suas informações estão seguras</p>
                <p>
                  Utilizamos criptografia de ponta e processamento seguro através do Stripe,
                  líder mundial em pagamentos online. Seus dados bancários são protegidos
                  pelos mais altos padrões de segurança.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {stripeError && (
        <StripeErrorModal
          error={stripeError}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 