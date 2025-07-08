import React, { useState, useEffect } from "react";
import MentoradoSidebar from "@/components/mentorado/MentoradoSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Monitor, Bell, Shield } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Spinner } from "@/components/ui/spinner";
import { Profile } from "@/types/database";

const MentoradoConfiguracoesPage = () => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { settings, loading, updateSetting, isSettingActive } = useUserSettings(currentUser?.id);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setCurrentUser(profile);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogToggle = async (checked: boolean) => {
    if (!currentUser) return;

    await updateSetting(
      'log de cabecalho',
      checked,
      currentUser.full_name || 'Usuário',
      currentUser.role || 'mentorado'
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <MentoradoSidebar />
        <div className="flex-1 transition-all duration-300  flex items-center justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <MentoradoSidebar />
      <div className="flex-1 transition-all duration-300  p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
            <p className="text-gray-600">Gerencie suas preferências e configurações da conta</p>
          </div>

          {/* Configurações de Interface */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Interface e Exibição
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="header-log" className="text-base font-medium">
                    Ativar log de cabeçalho
                  </Label>
                  <p className="text-sm text-gray-500">
                    Exibe informações de debug no cabeçalho da aplicação
                  </p>
                </div>
                <Switch
                  id="header-log"
                  checked={isSettingActive('log de cabecalho')}
                  onCheckedChange={handleLogToggle}
                  disabled={loading}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between opacity-50">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Tema escuro
                  </Label>
                  <p className="text-sm text-gray-500">
                    Alterna entre tema claro e escuro (em breve)
                  </p>
                </div>
                <Switch disabled />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Notificações */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between opacity-50">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Notificações por email
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receba notificações importantes por email (em breve)
                  </p>
                </div>
                <Switch disabled />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between opacity-50">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Notificações push
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receba notificações no navegador (em breve)
                  </p>
                </div>
                <Switch disabled />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Privacidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacidade e Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between opacity-50">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Perfil público
                  </Label>
                  <p className="text-sm text-gray-500">
                    Permite que outros usuários vejam seu perfil (em breve)
                  </p>
                </div>
                <Switch disabled />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between opacity-50">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Autenticação de dois fatores
                  </Label>
                  <p className="text-sm text-gray-500">
                    Adicione uma camada extra de segurança (em breve)
                  </p>
                </div>
                <Switch disabled />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentoradoConfiguracoesPage; 