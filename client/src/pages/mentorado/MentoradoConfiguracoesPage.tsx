import MentoradoSidebar from "@/components/mentorado/MentoradoSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";
import { Bell, Eye, EyeOff, Menu, Monitor, Shield } from "lucide-react";
import { useState } from "react";

const MentoradoConfiguracoesPage = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { toast } = useToast();

  const handleLogToggle = async (checked: boolean) => {
    // Funcionalidade será implementada futuramente
    toast({
      title: "Configuração atualizada",
      description: "Esta funcionalidade será implementada em breve.",
    });
  };

  const handleSettingToggle = async (settingName: string, checked: boolean) => {
    // Funcionalidade será implementada futuramente
    toast({
      title: "Configuração atualizada",
      description: `${settingName} ${checked ? 'ativado' : 'desativado'}.`,
    });
  };

  const handleChangePassword = async () => {
    // Validação básica
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Chamar endpoint do backend para trocar senha
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          newPassword: newPassword
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao alterar senha');
      }
      
      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!",
      });
      
      // Fechar modal e limpar campos
      setShowChangePasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao alterar senha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <MentoradoSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <MentoradoSidebar />
      </div>

      <div className="flex-1 transition-all duration-300 p-4 md:p-6 relative">
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
        
        <div className="pt-0 md:pt-0">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold mb-2 text-gold">Configurações</h1>
            <p className="text-gray-300 text-base md:text-lg">Gerencie suas preferências e configurações da conta</p>
          </div>

          <div className="space-y-8">

          {/* Configurações Gerais */}
          <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
            <CardHeader>
              <CardTitle className="flex items-center text-gold text-lg md:text-xl">
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
                <div className="md:hidden">
                   <Checkbox
                     id="log-toggle"
                     defaultChecked={false}
                     onCheckedChange={handleLogToggle}
                     className="data-[state=checked]:bg-gold data-[state=checked]:border-gold data-[state=checked]:text-black rounded-sm m-2"
                   />
                 </div>
                <div className="hidden md:block">
                  <Switch
                    id="log-toggle"
                    defaultChecked={false}
                    onCheckedChange={handleLogToggle}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">
                    Notificações por Email
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações sobre atividades e atualizações
                  </p>
                </div>
                <div className="md:hidden">
                   <Checkbox
                      defaultChecked={true}
                      onCheckedChange={(checked: boolean) => handleSettingToggle('Notificações por Email', checked)}
                      className="data-[state=checked]:bg-gold data-[state=checked]:border-gold data-[state=checked]:text-black rounded-sm m-2"
                    />
                 </div>
                <div className="hidden md:block">
                  <Switch
                    defaultChecked={true}
                    onCheckedChange={(checked) => handleSettingToggle('Notificações por Email', checked)}
                  />
                </div>
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
                <div className="md:hidden">
                   <Checkbox
                      defaultChecked={true}
                      onCheckedChange={(checked: boolean) => handleSettingToggle('Perfil Público', checked)}
                      className="data-[state=checked]:bg-gold data-[state=checked]:border-gold data-[state=checked]:text-black rounded-sm m-2"
                    />
                 </div>
                <div className="hidden md:block">
                  <Switch
                    defaultChecked={true}
                    onCheckedChange={(checked) => handleSettingToggle('Perfil Público', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacidade e Segurança */}
          <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
            <CardHeader>
              <CardTitle className="flex items-center text-gold text-lg md:text-xl">
                <Shield className="mr-2" />
                Privacidade e Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">


              <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      Dados de Analytics
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir coleta de dados para melhorar a experiência
                    </p>
                  </div>
                  <div className="md:hidden">
                    <Checkbox
                       defaultChecked={true}
                       onCheckedChange={(checked: boolean) => handleSettingToggle('Dados de Analytics', checked)}
                       className="data-[state=checked]:bg-gold data-[state=checked]:border-gold data-[state=checked]:text-black rounded-sm m-2"
                     />
                  </div>
                  <div className="hidden md:block">
                    <Switch
                      defaultChecked={true}
                      onCheckedChange={(checked) => handleSettingToggle('Dados de Analytics', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      Trocar Senha
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Alterar a senha da sua conta
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50"
                    onClick={() => setShowChangePasswordModal(true)}
                  >
                    Alterar Senha
                  </Button>
                </div>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
            <CardHeader>
              <CardTitle className="flex items-center text-gold text-lg md:text-xl">
                <Bell className="mr-2" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">
                    Novos Mentores
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar quando novos mentores se cadastrarem
                  </p>
                </div>
                <div className="md:hidden">
                  <Checkbox
                     defaultChecked={true}
                     onCheckedChange={(checked: boolean) => handleSettingToggle('Novos Mentores', checked)}
                     className="data-[state=checked]:bg-gold data-[state=checked]:border-gold data-[state=checked]:text-black rounded-sm m-2"
                   />
                </div>
                <div className="hidden md:block">
                  <Switch
                    defaultChecked={true}
                    onCheckedChange={(checked) => handleSettingToggle('Novos Mentores', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">
                    Agendamentos
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre confirmações e lembretes de sessões
                  </p>
                </div>
                <div className="md:hidden">
                  <Checkbox
                     defaultChecked={true}
                     onCheckedChange={(checked: boolean) => handleSettingToggle('Agendamentos', checked)}
                     className="data-[state=checked]:bg-gold data-[state=checked]:border-gold data-[state=checked]:text-black rounded-sm m-2"
                   />
                </div>
                <div className="hidden md:block">
                  <Switch
                    defaultChecked={true}
                    onCheckedChange={(checked) => handleSettingToggle('Agendamentos', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">
                    Mensagens Diretas
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre novas mensagens de mentores
                  </p>
                </div>
                <div className="md:hidden">
                  <Checkbox
                     defaultChecked={false}
                     onCheckedChange={(checked: boolean) => handleSettingToggle('Mensagens Diretas', checked)}
                     className="data-[state=checked]:bg-gold data-[state=checked]:border-gold data-[state=checked]:text-black rounded-sm m-2"
                   />
                </div>
                <div className="hidden md:block">
                  <Switch
                    defaultChecked={true}
                    onCheckedChange={(checked) => handleSettingToggle('Mensagens Diretas', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>

      {/* Modal de Troca de Senha */}
      <Dialog open={showChangePasswordModal} onOpenChange={setShowChangePasswordModal}>
        <DialogContent className="sm:max-w-[425px] bg-black border-gold/30">
          <DialogHeader>
            <DialogTitle className="text-gold">Trocar Senha</DialogTitle>
            <DialogDescription className="text-gray-400">
              Digite sua nova senha e confirme para alterar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white pr-10"
                  placeholder="Digite sua nova senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white pr-10"
                  placeholder="Confirme sua nova senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowChangePasswordModal(false);
                setNewPassword("");
                setConfirmPassword("");
                setShowNewPassword(false);
                setShowConfirmPassword(false);
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !newPassword || !confirmPassword}
              className="bg-gold text-black hover:bg-gold/90"
            >
              {isChangingPassword ? "Alterando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MentoradoConfiguracoesPage;