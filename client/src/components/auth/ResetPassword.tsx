import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";
import { CheckCircle, Eye, EyeOff, Lock } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se há uma sessão válida de recuperação de senha
    const checkPasswordRecoverySession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setIsValidSession(false);
        } else if (session?.user) {
          console.log('Valid password recovery session found');
          setIsValidSession(true);
          // Capturar o email do usuário
          if (session.user.email) {
            setUserEmail(session.user.email);
          }
        } else {
          console.log('No valid session found');
          setIsValidSession(false);
        }
      } catch (error) {
        console.error('Unexpected error checking session:', error);
        setIsValidSession(false);
      } finally {
        setCheckingSession(false);
      }
    };

    checkPasswordRecoverySession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (event === 'PASSWORD_RECOVERY' && session?.user) {
        console.log('Password recovery event detected');
        setIsValidSession(true);
        setCheckingSession(false);
        // Capturar o email do usuário
        if (session.user.email) {
          setUserEmail(session.user.email);
        }
      } else if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in during password recovery');
        setIsValidSession(true);
        setCheckingSession(false);
        // Capturar o email do usuário
        if (session.user.email) {
          setUserEmail(session.user.email);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "A senha deve conter pelo menos uma letra minúscula";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "A senha deve conter pelo menos uma letra maiúscula";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "A senha deve conter pelo menos um número";
    }
    return null;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast({
        title: "Senha obrigatória",
        description: "Por favor, informe sua nova senha.",
        variant: "destructive",
      });
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        title: "Senha inválida",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A confirmação de senha deve ser igual à nova senha.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Updating user password...');
      
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        
        if (error.message?.includes('Password should be at least')) {
          toast({
            title: "Senha muito fraca",
            description: "A senha deve ter pelo menos 6 caracteres.",
            variant: "destructive",
          });
        } else if (error.message?.includes('invalid request')) {
          toast({
            title: "Sessão inválida",
            description: "O link de recuperação expirou. Solicite um novo email de recuperação.",
            variant: "destructive",
          });
          setTimeout(() => navigate('/login'), 2000);
        } else {
          toast({
            title: "Erro ao atualizar senha",
            description: error.message || "Erro desconhecido ao atualizar senha.",
            variant: "destructive",
          });
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('Password updated successfully');
        toast({
          title: "Senha atualizada!",
          description: "Sua senha foi redefinida com sucesso. Redirecionando para o login...",
        });

        // Redirecionar para o login com email preenchido após 2 segundos
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              email: userEmail,
              message: 'Senha redefinida com sucesso! Faça login com sua nova senha.'
            } 
          });
        }, 2000);
      }

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Card className="w-full max-w-md bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-xl">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-4"></div>
              <p className="text-white">Verificando sessão...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Card className="w-full max-w-md bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Link Inválido</CardTitle>
            <CardDescription className="text-gray-300">
              O link de recuperação de senha é inválido ou expirou.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-red-900/20 border border-red-500/20 p-4 text-sm text-red-300">
              <p className="mb-2">❌ <strong>Link expirado ou inválido</strong></p>
              <p>Por favor, solicite um novo email de recuperação de senha.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-gold to-gold-light text-slate-900 hover:from-gold-light hover:to-gold font-semibold"
            >
              Voltar ao Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black py-12 px-4">
      <Card className="w-full max-w-md bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
            <Lock className="h-6 w-6 text-gold" />
          </div>
          <CardTitle className="text-2xl text-white">Redefinir Senha</CardTitle>
          <CardDescription className="text-gray-300">
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-slate-800 p-3 text-sm text-gray-300">
              <p className="mb-2">🔒 <strong>Requisitos da senha:</strong></p>
              <ul className="space-y-1 text-xs">
                <li className={`flex items-center gap-2 ${password.length >= 6 ? 'text-green-400' : 'text-gray-400'}`}>
                  <CheckCircle className="h-3 w-3" />
                  Pelo menos 6 caracteres
                </li>
                <li className={`flex items-center gap-2 ${/(?=.*[a-z])/.test(password) ? 'text-green-400' : 'text-gray-400'}`}>
                  <CheckCircle className="h-3 w-3" />
                  Uma letra minúscula
                </li>
                <li className={`flex items-center gap-2 ${/(?=.*[A-Z])/.test(password) ? 'text-green-400' : 'text-gray-400'}`}>
                  <CheckCircle className="h-3 w-3" />
                  Uma letra maiúscula
                </li>
                <li className={`flex items-center gap-2 ${/(?=.*\d)/.test(password) ? 'text-green-400' : 'text-gray-400'}`}>
                  <CheckCircle className="h-3 w-3" />
                  Um número
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-gold to-gold-light text-slate-900 hover:from-gold-light hover:to-gold font-semibold shadow-lg hover:shadow-gold transition-all duration-200" 
              disabled={loading}
            >
              {loading ? 'Atualizando...' : 'Redefinir Senha'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;