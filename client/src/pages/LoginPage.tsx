import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';
import { createOrUpdateStripeConnectedAccount } from '@/services/stripeClientService';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { categories, loading: categoriesLoading } = useCategories();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'mentor' | 'mentorado'>('mentorado');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Capturar a página de origem para redirecionamento após login
  const from = location.state?.from?.pathname || null;

  // Função para redirecionar baseado no role e página de origem
  const redirectAfterLogin = (userRole: string) => {
    // Se veio de uma página específica (via ProtectedRoute), tentar voltar para ela
    if (from) {
      // Verificar se a página de origem é compatível com o role do usuário
      const roleRouteMapping = {
        admin: ['/admin'],
        mentor: ['/mentor'],
        mentorado: ['/mentorado']
      };

      const allowedRoutes = roleRouteMapping[userRole as keyof typeof roleRouteMapping] || [];
      const isAllowed = allowedRoutes.some(route => from.startsWith(route));

      if (isAllowed) {
        console.log(`Redirecionando ${userRole} de volta para: ${from}`);
        navigate(from, { replace: true });
        return;
      }
    }

    // Fallback: redirecionar para dashboard padrão baseado no role
    if (userRole === 'admin') {
      navigate('/admin/dashboard');
    } else if (userRole === 'mentor') {
      navigate('/mentor/dashboard');
    } else if (userRole === 'mentorado') {
      navigate('/mentorado/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // Signup mode
      if (password !== confirmPassword) {
        toast({
          title: "Erro no Cadastro",
          description: "As senhas não coincidem.",
          variant: "destructive",
        });
        setLoading(false);
        return; 
      }
      
      if (!fullName.trim()) {
        toast({ title: "Erro no Cadastro", description: "Por favor, informe seu nome completo.", variant: "destructive" });
        setLoading(false);
        return;
      }
      
      // Validação obrigatória da categoria para mentores
      if (role === 'mentor' && !categoryId) {
        toast({
          title: "Categoria obrigatória",
          description: "Por favor, selecione a categoria que você mais se identifica.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      try {
        console.log(`Signup attempt with email: ${email}, role: ${role}, categoryId: ${categoryId}`);
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) {
          // Se o erro for de usuário já existente, tentar fazer login
          if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
            console.log("User already exists, switching to login mode");
            toast({
              title: "Usuário já existe",
              description: "Este email já está cadastrado. Redirecionando para login...",
              variant: "destructive",
            });
            setIsSignUp(false);
            return;
          }
          throw error;
        }
        
        if (data.user) {
          console.log("User created successfully:", data.user.id);
          
          // Buscar o nome da categoria selecionada
          let categoryName = null;
          if (role === 'mentor' && categoryId) {
            const selectedCategory = categories.find(cat => cat.id === categoryId);
            categoryName = selectedCategory?.name || null;
            console.log("Selected category:", categoryName, "with ID:", categoryId);
          }

          // Create profile with category information using UPSERT to avoid duplicate key errors
          console.log("Creating profile with data:", {
            id: data.user.id,
            full_name: fullName,
            role: role,
            category: categoryName,
            category_id: role === 'mentor' ? categoryId : null,
          });
          
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              full_name: fullName,
              email: email,
              role: role,
              category: categoryName,
              category_id: role === 'mentor' ? categoryId : null,
            }, {
              onConflict: 'id'
            })
            .select()
            .single();
          
          if (profileError) {
            console.error("Profile creation error:", profileError);
            throw profileError;
          }
          
          console.log("User profile after signup:", profileData);
          
          // Criar conta conectada na Stripe para mentores
          if (profileData?.role === 'mentor') {
            console.log("🔄 [LOGIN] Mentor cadastrado - criando conta Stripe básica...");
            
            try {
              // DADOS MÍNIMOS para criação inicial da conta
              const stripeDataMinimo = {
                email: email,
                full_name: fullName,
                phone: '', // Vazio - será preenchido no onboarding
                cpf: '', // Vazio - será preenchido no onboarding
                date_of_birth: '', // Vazio - será preenchido no onboarding
                address: {
                  line1: '',
                  line2: '',
                  city: '',
                  state: '',
                  postal_code: '',
                  country: 'BR' // Apenas país é necessário
                },
                bank_account: {
                  account_type: '',
                  routing_number: '',
                  branch_number: '',
                  account_number: '',
                  account_holder_name: ''
                }
              };

              console.log("📤 [LOGIN] Enviando APENAS dados básicos para Stripe...");
              const stripeResult = await createOrUpdateStripeConnectedAccount(stripeDataMinimo);
              
              if (stripeResult.success && stripeResult.account) {
                console.log("✅ [LOGIN] Conta Stripe básica criada:", stripeResult.account.id);
                
                // Salvar ID da conta Stripe no perfil
                const { error: stripeUpdateError } = await supabase
                  .from('profiles')
                  .update({
                    stripe_account_id: stripeResult.account.id,
                    stripe_onboarding_status: 'pending',
                    stripe_charges_enabled: false,
                    stripe_payouts_enabled: false,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', data.user.id);

                if (stripeUpdateError) {
                  console.error("⚠️ [LOGIN] Erro ao salvar ID Stripe:", stripeUpdateError);
                }

                toast({
                  title: "Cadastro realizado com sucesso!",
                  description: "Bem-vindo! Complete sua configuração de pagamentos.",
                });
              } else {
                console.warn("⚠️ [LOGIN] Erro ao criar conta Stripe:", stripeResult.error);
                toast({
                  title: "Cadastro realizado!",
                  description: "Bem-vindo! Configure pagamentos mais tarde.",
                });
              }
            } catch (error) {
              console.error("❌ [LOGIN] Erro na criação Stripe:", error);
              // Não falhar o cadastro por causa do Stripe
              toast({
                title: "Cadastro realizado!",
                description: "Bem-vindo à plataforma!",
              });
            }
          } else {
            // Para mentorados, apenas mostrar sucesso padrão
            toast({
              title: "Cadastro realizado com sucesso!",
              description: "Bem-vindo à plataforma!",
            });
          }
          
          // Usar a nova função de redirecionamento
          redirectAfterLogin(profileData?.role || '');
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        setError(errorMessage);
        setLoading(false);
      }
    } else {
      // Login mode
      try {
        console.log(`Login attempt with email: ${email}`);
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          console.log("Login successful, user:", data.user.id);
          
          // Fetch user's role to redirect to the appropriate dashboard
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            console.error("Error fetching user profile:", profileError);
            throw profileError;
          }

          console.log("User role:", profileData?.role);
          console.log("Página de origem (from):", from);
          
          toast({ title: "Login bem-sucedido!", description: "Redirecionando..." });
          
          // Usar a nova função de redirecionamento
          redirectAfterLogin(profileData?.role || '');
        } else {
          toast({ title: "Erro de Login", description: "Usuário não encontrado ou credenciais inválidas.", variant: "destructive" });
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        setError(errorMessage);
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{isSignUp ? 'Criar Nova Conta' : 'Acessar Plataforma'}</CardTitle>
          <CardDescription>
            {isSignUp ? 'Preencha os campos para se registrar.' : 'Bem-vindo(a) de volta! Faça login para continuar.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            {isSignUp && ( // Campos visíveis apenas no cadastro
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={isSignUp}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Eu sou:</Label>
                  <RadioGroup
                    defaultValue="mentorado"
                    value={role}
                    onValueChange={(value: 'mentor' | 'mentorado') => setRole(value)}
                    className="flex space-x-4"
                    disabled={loading}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mentorado" id="r-mentorado" />
                      <Label htmlFor="r-mentorado">Mentorado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mentor" id="r-mentor" />
                      <Label htmlFor="r-mentor">Mentor</Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}
            
            {/* Campo de Categoria - visível apenas para mentores no cadastro */}
            {isSignUp && role === 'mentor' && (
              <div className="space-y-2">
                <Label htmlFor="category">Qual a categoria que você mais se identifica? *</Label>
                <Select 
                  value={categoryId} 
                  onValueChange={setCategoryId}
                  disabled={loading || categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? "Carregando categorias..." : "Selecione uma categoria"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {/* Campo de Confirmar Senha - visível apenas no modo SignUp (cadastro) */}
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={isSignUp} // Obrigatório apenas no cadastro
                  disabled={loading}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (isSignUp ? 'Registrando...' : 'Entrando...') : (isSignUp ? 'Registrar' : 'Entrar')}
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setIsSignUp(!isSignUp);
                // Limpar campos ao alternar
                setFullName('');
                setCategoryId('');
                // Manter email se já digitado ou limpar: setEmail('');
                setPassword('');
                setConfirmPassword('');
                setRole('mentorado'); 
              }}
              disabled={loading}
            >
              {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Cadastre-se'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
