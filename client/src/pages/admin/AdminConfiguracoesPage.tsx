import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Profile } from "@/types/database";
import { supabase } from "@/utils/supabase";
import { Bell, Menu, Monitor, Shield } from "lucide-react";
import { useEffect, useState } from "react";

const AdminConfiguracoesPage = () => {
    const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
      currentUser.role || 'admin'
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <AdminSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto relative">
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
              

            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfiguracoesPage;