import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientConfig } from "@/config/environment";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";
import { ArrowLeft, Mail } from "lucide-react";
import React, { useState } from 'react';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, informe seu email para recuperar a senha.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Requesting password reset for:', email);
      
      // Verificar se o email existe na nossa base de dados
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('email', email)
        .single();

      if (checkError || !existingProfile) {
        toast({
          title: "Email não encontrado",
          description: "Este email não está cadastrado em nossa plataforma.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Enviar email de reset de senha
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${clientConfig.APP_URL}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        
        if (error.message?.includes('Email rate limit exceeded')) {
          toast({
            title: "Muitas tentativas",
            description: "Aguarde alguns minutos antes de solicitar outro email de recuperação.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao enviar email",
            description: error.message || "Erro desconhecido ao enviar email de recuperação.",
            variant: "destructive",
          });
        }
        setLoading(false);
        return;
      }

      console.log('Password reset email sent successfully');
      setEmailSent(true);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.",
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card className="w-full max-w-md bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-white">Email Enviado!</CardTitle>
          <CardDescription className="text-gray-300">
            Enviamos as instruções para redefinir sua senha para <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-slate-800 p-4 text-sm text-gray-300">
            <p className="mb-2">📧 <strong>Verifique sua caixa de entrada</strong></p>
            <p className="mb-2">🔍 Se não encontrar, verifique a pasta de spam</p>
            <p>⏰ O link expira em 24 horas</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            onClick={onBackToLogin}
            variant="outline"
            className="w-full border-slate-600 text-white hover:bg-slate-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Login
          </Button>
          <Button
            onClick={() => {
              setEmailSent(false);
              setEmail('');
            }}
            variant="link"
            className="text-gray-300 hover:text-white"
          >
            Enviar para outro email
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">Esqueci a Senha</CardTitle>
        <CardDescription className="text-gray-300">
          Digite seu email para receber as instruções de recuperação
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleResetPassword}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
            />
          </div>
          <div className="rounded-lg bg-slate-800 p-3 text-sm text-gray-300">
            <p>💡 Você receberá um email com um link para redefinir sua senha.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-gold to-gold-light text-slate-900 hover:from-gold-light hover:to-gold font-semibold shadow-lg hover:shadow-gold transition-all duration-200" 
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
          </Button>
          <Button
            type="button"
            onClick={onBackToLogin}
            variant="link"
            disabled={loading}
            className="text-gray-300 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Login
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ForgotPassword;