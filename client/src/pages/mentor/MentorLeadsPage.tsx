import MentorSidebar from "@/components/mentor/MentorSidebar";
import LoadingComponent from "@/components/shared/LoadingComponent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";
import {
  Calendar,
  Download,
  Mail,
  Menu,
  Phone,
  Search,
  TrendingUp,
  User,
  UserCheck,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Lead {
  id: string;
  course_id: string;
  course_name: string;
  mentor_name: string;
  mentor_email: string | null;
  lead_name: string;
  lead_email: string;
  lead_phone: string;
  created_at: string;
}

const MentorLeadsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadLeads();
    }
  }, [currentUser]);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setCurrentUser(profile);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const loadLeads = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      // Buscar leads diretamente pelo email do mentor
      const { data: leadsData, error } = await supabase
        .from('leads')
        .select('*')
        .eq('mentor_email', currentUser.email)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLeads(leadsData || []);
    } catch (error: any) {
      console.error('Erro ao carregar leads:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os leads",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar leads baseado na busca
  const filteredLeads = leads.filter(lead => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.lead_name.toLowerCase().includes(searchLower) ||
      lead.lead_email.toLowerCase().includes(searchLower) ||
      lead.lead_phone.toLowerCase().includes(searchLower) ||
      lead.course_name.toLowerCase().includes(searchLower)
    );
  });

  // Estatísticas
  const stats = {
    total: leads.length,
    thisMonth: leads.filter(lead => {
      const leadDate = new Date(lead.created_at);
      const now = new Date();
      return leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear();
    }).length,
    uniqueCourses: new Set(leads.map(lead => lead.course_id)).size,
    thisWeek: leads.filter(lead => {
      const leadDate = new Date(lead.created_at);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return leadDate >= weekAgo;
    }).length
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há leads para exportar.",
        variant: "destructive"
      });
      return;
    }

    // Cabeçalhos das colunas
    const headers = ['Nome do Lead', 'Email', 'Telefone', 'Data de Cadastro', 'Curso Adquirido'];
    
    // Converter dados para CSV
    const csvData = filteredLeads.map(lead => [
      lead.lead_name,
      lead.lead_email,
      lead.lead_phone,
      formatDate(lead.created_at),
      lead.course_name
    ]);
    
    // Adicionar cabeçalhos no início
    csvData.unshift(headers);
    
    // Converter para string CSV
    const csvContent = csvData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
    
    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportação concluída",
      description: `${filteredLeads.length} leads exportados com sucesso!`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-black">
        {/* Mobile Sidebar */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 md:hidden bg-slate-900/80 backdrop-blur-sm border border-gold/20 hover:bg-slate-800/80 hover:border-gold/40"
            >
              <Menu className="h-6 w-6 text-gold" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <MentorSidebar />
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <MentorSidebar />
        </div>

        <div className="flex-1 transition-all duration-300 p-4 md:p-6 pt-8 md:pt-6 min-h-screen bg-black">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black">
      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden bg-slate-900/80 backdrop-blur-sm border border-gold/20 hover:bg-slate-800/80 hover:border-gold/40"
          >
            <Menu className="h-6 w-6 text-gold" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <MentorSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <MentorSidebar />
      </div>

      <div className="flex-1 transition-all duration-300 p-4 md:p-6 pt-8 md:pt-6 min-h-screen bg-black">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gold flex items-center gap-3">
              <UserCheck className="h-6 w-6 md:h-8 md:w-8 text-gold" />
              Leads Capturados
            </h1>
            <p className="text-gray-400 mt-2">
              Visualize todos os leads interessados em seus cursos
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total de Leads</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-gold" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Este Mês</p>
                    <p className="text-2xl font-bold text-white">{stats.thisMonth}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Esta Semana</p>
                    <p className="text-2xl font-bold text-white">{stats.thisWeek}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Cursos com Leads</p>
                    <p className="text-2xl font-bold text-white">{stats.uniqueCourses}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Export */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email, telefone ou curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder-gray-400"
              />
            </div>
            <Button
              onClick={exportToCSV}
              className="bg-gold text-black hover:bg-gold/90 flex items-center gap-2 px-4 py-2"
              disabled={filteredLeads.length === 0}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </Button>
          </div>

          {/* Leads List */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Lista de Leads ({filteredLeads.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredLeads.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400 text-lg">
                    {leads.length === 0 
                      ? "Nenhum lead capturado ainda" 
                      : "Nenhum lead encontrado com os filtros aplicados"
                    }
                  </p>
                  {leads.length === 0 && (
                    <p className="text-gray-500 text-sm mt-2">
                      Os leads aparecerão aqui quando alguém se interessar pelos seus cursos
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="" alt={lead.lead_name} />
                          <AvatarFallback className="bg-gold text-black font-semibold">
                            {getInitials(lead.lead_name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{lead.lead_name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {lead.course_name}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              <span>{lead.lead_email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              <span>{lead.lead_phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-400 mb-1">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          {formatDate(lead.created_at)}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Lead Capturado
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentorLeadsPage;