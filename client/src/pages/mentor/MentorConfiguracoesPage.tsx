import MentorSidebar from "@/components/mentor/MentorSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Profile } from "@/types/database";
import { supabase } from "@/utils/supabase";
import { Bell, Menu, Monitor, Settings, Shield } from "lucide-react";
import { useEffect, useState } from "react";

const MentorConfiguracoesPage = () => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const { settings, loading, updateSetting, isSettingActive } = useUserSettings(currentUser?.id);
  const { toast } = useToast();

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
      currentUser.role || 'mentor'
    );
  };

  if (isLoading || loading) {
    return (
      <div className="flex">
        <MentorSidebar />
        <div className="flex-1 transition-all duration-300 p-6 overflow-auto">
          <div className="space-y-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <MentorSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <MentorSidebar />
      </div>

      <div className="flex-1 transition-all duration-300 p-4 md:p-6 overflow-auto relative">
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
          </Sheet>
        </div>
        
        <div className="pt-16 md:pt-0">
        <div className="space-y-8">
          <h1 className="text-3xl font-bold flex items-center">
            <Settings className="mr-3" />
            Configurações
          </h1>

          <div className="space-y-6">
            {/* Configurações Gerais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="mr-2" />
                  Configurações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="log-toggle" className="text-base font-medium">
                      Log de Cabeçalho
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar logs detalhados para debugging
                    </p>
                  </div>
                  <Switch
                    id="log-toggle"
                    checked={isSettingActive('log de cabecalho')}
                    onCheckedChange={handleLogToggle}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      Notificações por Email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações sobre novos alunos e atividades
                    </p>
                  </div>
                  <Switch
                    defaultChecked={true}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      Perfil Público
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que outros usuários vejam seu perfil
                    </p>
                  </div>
                  <Switch
                    defaultChecked={true}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacidade e Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2" />
                  Privacidade e Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      Autenticação de Dois Fatores
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Adicionar uma camada extra de segurança à sua conta
                    </p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      Dados de Analytics
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir coleta de dados para melhorar a experiência
                    </p>
                  </div>
                  <Switch
                    defaultChecked={true}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      Novos Alunos
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando um novo aluno se inscrever
                    </p>
                  </div>
                  <Switch
                    defaultChecked={true}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      Conclusão de Módulos
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando alunos completarem módulos
                    </p>
                  </div>
                  <Switch
                    defaultChecked={true}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      Mensagens Diretas
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar sobre novas mensagens de alunos
                    </p>
                  </div>
                  <Switch
                    defaultChecked={true}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default MentorConfiguracoesPage;