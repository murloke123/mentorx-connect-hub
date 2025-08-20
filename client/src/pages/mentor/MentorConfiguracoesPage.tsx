import MentorSidebar from "@/components/mentor/MentorSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Bell, Menu, Monitor, Shield } from "lucide-react";
import { useState } from "react";

const MentorConfiguracoesPage = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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

      <div className="flex-1 transition-all duration-300 p-4 md:p-6 pt-8 md:pt-6 min-h-screen bg-black relative">
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
        
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gold">Configurações</h1>
              <p className="text-muted-foreground">Gerencie suas preferências e configurações da conta</p>
            </div>
          </div>

        <div className="space-y-8">

          <div className="space-y-6">
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
                      Receber notificações sobre novos alunos e atividades
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
                      Autenticação de Dois Fatores
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Adicionar uma camada extra de segurança à sua conta
                    </p>
                  </div>
                  <div className="md:hidden">
                    <Checkbox
                       defaultChecked={false}
                       onCheckedChange={(checked: boolean) => handleSettingToggle('Autenticação de Dois Fatores', checked)}
                       className="data-[state=checked]:bg-gold data-[state=checked]:border-gold data-[state=checked]:text-black rounded-sm m-2"
                     />
                  </div>
                  <div className="hidden md:block">
                    <Switch 
                      defaultChecked={false}
                      onCheckedChange={(checked) => handleSettingToggle('Autenticação de Dois Fatores', checked)}
                    />
                  </div>
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
                      Novos Alunos
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando um novo aluno se inscrever
                    </p>
                  </div>
                  <div className="md:hidden">
                    <Checkbox
                       defaultChecked={true}
                       onCheckedChange={(checked: boolean) => handleSettingToggle('Novos Alunos', checked)}
                       className="data-[state=checked]:bg-gold data-[state=checked]:border-gold data-[state=checked]:text-black rounded-sm m-2"
                     />
                  </div>
                  <div className="hidden md:block">
                    <Switch
                      defaultChecked={true}
                      onCheckedChange={(checked) => handleSettingToggle('Novos Alunos', checked)}
                    />
                  </div>
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
                  <div className="md:hidden">
                    <Checkbox
                       defaultChecked={true}
                       onCheckedChange={(checked: boolean) => handleSettingToggle('Conclusão de Módulos', checked)}
                       className="data-[state=checked]:bg-gold data-[state=checked]:border-gold data-[state=checked]:text-black rounded-sm m-2"
                     />
                  </div>
                  <div className="hidden md:block">
                    <Switch
                      defaultChecked={true}
                      onCheckedChange={(checked) => handleSettingToggle('Conclusão de Módulos', checked)}
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
                      Notificar sobre novas mensagens de alunos
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
    </div>
  );
};

export default MentorConfiguracoesPage;