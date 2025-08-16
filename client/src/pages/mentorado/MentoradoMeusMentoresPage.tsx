import MentoradoSidebar from "@/components/mentorado/MentoradoSidebar";
import LoadingComponent from "@/components/shared/LoadingComponent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { createNotification } from "@/services/notificationService";
import { supabase } from "@/utils/supabase";
import { navigateToTop } from "@/utils/utils";
import {
    BookOpen,
    Calendar,
    Heart,
    HeartOff,
    Menu,
    MessageCircle,
    Search,
    TrendingUp,
    User,
    Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  price: number;
}

interface Mentor {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  category: string | null;
  is_following: boolean;
  courses_acquired: number;
  total_spent: number;
  total_courses_created: number;
  courses_created: Course[];
  first_interaction_date: string;
}

const MentoradoMeusMentoresPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentores, setMentores] = useState<Mentor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      fetchMentores();
    }
  }, [user]);

  const fetchMentores = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Buscar mentores que o usuário segue
      const { data: followers, error: followersError } = await supabase
        .from("mentor_followers")
        .select(`
          mentor_id,
          followed_at,
          mentor:profiles!mentor_id (
            id,
            full_name,
            avatar_url,
            email,
            bio,
            category
          )
        `)
        .eq("follower_id", user.id);

      if (followersError) throw followersError;

      // Buscar cursos adquiridos para identificar mentores dos cursos
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("matriculas")
        .select(`
          course_id,
          enrolled_at,
          course:cursos!inner (
            id,
            title,
            price,
            created_at,
            mentor_id,
            mentor:profiles!mentor_id (
              id,
              full_name,
              avatar_url,
              email,
              bio,
              category
            )
          )
        `)
        .eq("student_id", user.id)
        .eq("status", "active");

      if (enrollmentsError) throw enrollmentsError;

      // Processar dados para agregar por mentor
      const mentoresMap = new Map<string, Mentor>();

      // Primeiro, adicionar todos os mentores seguidos
      followers?.forEach((follower: any) => {
        const mentor = follower.mentor;
        if (mentor) {
          mentoresMap.set(mentor.id, {
            id: mentor.id,
            email: mentor.email || '',
            full_name: mentor.full_name || null,
            avatar_url: mentor.avatar_url || null,
            bio: mentor.bio || null,
            category: mentor.category || null,
            is_following: true,
            courses_acquired: 0,
            total_spent: 0,
            total_courses_created: 0,
            courses_created: [],
            first_interaction_date: follower.followed_at
          });
        }
      });

      // Depois, processar matrículas (adicionar mentores de cursos adquiridos)
      enrollments?.forEach((enrollment: any) => {
        const mentor = enrollment.course.mentor;
        if (mentor) {
          if (!mentoresMap.has(mentor.id)) {
            // Mentor de curso adquirido mas não seguido
            mentoresMap.set(mentor.id, {
              id: mentor.id,
              email: mentor.email || '',
              full_name: mentor.full_name || null,
              avatar_url: mentor.avatar_url || null,
              bio: mentor.bio || null,
              category: mentor.category || null,
              is_following: false,
              courses_acquired: 0,
              total_spent: 0,
              total_courses_created: 0,
              courses_created: [],
              first_interaction_date: enrollment.enrolled_at
            });
          }
          
          const mentorData = mentoresMap.get(mentor.id)!;
          mentorData.courses_acquired += 1;
          mentorData.total_spent += enrollment.course.price || 0;
          
          // Atualizar primeiro contato se for mais antigo
          if (new Date(enrollment.enrolled_at) < new Date(mentorData.first_interaction_date)) {
            mentorData.first_interaction_date = enrollment.enrolled_at;
          }
        }
      });

      // Buscar todos os cursos criados por cada mentor
      const mentorIds = Array.from(mentoresMap.keys());
      
      if (mentorIds.length > 0) {
        const { data: coursesData, error: coursesError } = await supabase
          .from("cursos")
          .select("mentor_id, id, title, price")
          .in("mentor_id", mentorIds)
          .order("created_at", { ascending: false });

        if (coursesError) throw coursesError;

        // Agregar cursos por mentor
        coursesData?.forEach((course: any) => {
          const mentorData = mentoresMap.get(course.mentor_id);
          if (mentorData) {
            mentorData.total_courses_created += 1;
            mentorData.courses_created.push({
              id: course.id,
              title: course.title,
              price: course.price || 0
            });
          }
        });
      }

      setMentores(Array.from(mentoresMap.values()));
    } catch (error) {
      console.error("Erro ao buscar mentores:", error);
      toast.error("Erro ao carregar mentores");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFollow = async (mentorId: string, isCurrentlyFollowing: boolean) => {
    if (!user) return;

    try {
      if (isCurrentlyFollowing) {
        // Deixar de seguir
        const { error } = await supabase
          .from("mentor_followers")
          .delete()
          .eq("mentor_id", mentorId)
          .eq("follower_id", user.id);

        if (error) throw error;
        toast.success("Você deixou de seguir este mentor");
      } else {
        // Seguir
        const { error } = await supabase
          .from("mentor_followers")
          .insert({
            mentor_id: mentorId,
            follower_id: user.id
          });

        if (error) throw error;
        toast.success("Agora você está seguindo este mentor");
      }

      // Atualizar estado local
      setMentores(prev => prev.map(mentor => 
        mentor.id === mentorId 
          ? { ...mentor, is_following: !isCurrentlyFollowing }
          : mentor
      ));
    } catch (error) {
      console.error("Erro ao alterar seguimento:", error);
      toast.error("Erro ao alterar seguimento");
    }
  };

  const handleSendMessage = async () => {
    if (!selectedMentor || !messageText.trim() || !user) return;

    setSendingMessage(true);
    try {
      console.log('🔔 Enviando notificação para mentor:', selectedMentor.full_name);
      console.log('👤 Dados do usuário:', {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata
      });
      console.log('🎯 Mentor selecionado:', {
        id: selectedMentor.id,
        name: selectedMentor.full_name
      });
      
      // Criar notificação no banco de dados
      const result = await createNotification({
        receiver_id: selectedMentor.id,
        receiver_name: selectedMentor.full_name || 'Mentor',
        receiver_role: 'mentor', // Receptor é sempre mentor
        sender_id: user.id,
        sender_name: user.user_metadata?.full_name || user.email || 'Mentorado',
        sender_role: 'mentorado', // Quem envia mensagem é sempre mentorado
        type: 'message',
        title: 'Nova mensagem de mentorado',
        message: messageText.trim()
      });

      if (result.success) {
        toast.success(`Notificação enviada para ${selectedMentor.full_name}`);
        setMessageText("");
        setSelectedMentor(null);
        setOpenDialogs(prev => ({ ...prev, [selectedMentor.id]: false })); // Fechar o dialog específico
        console.log('✅ Notificação criada com sucesso:', result.data);
      } else {
        throw new Error('Falha ao criar notificação');
      }
    } catch (error) {
      console.error("❌ Erro ao enviar notificação:", error);
      toast.error("Erro ao enviar notificação");
    } finally {
      setSendingMessage(false);
    }
  };

  const getMentorInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Filtrar mentores baseado na busca
  const filteredMentores = mentores.filter(mentor => {
    const searchLower = searchTerm.toLowerCase();
    return (
      mentor.full_name?.toLowerCase().includes(searchLower) ||
      mentor.email.toLowerCase().includes(searchLower) ||
      mentor.category?.toLowerCase().includes(searchLower)
    );
  });

  // Estatísticas gerais
  const stats = {
    total: mentores.length,
    following: mentores.filter(m => m.is_following).length,
    withCourses: mentores.filter(m => m.courses_acquired > 0).length,
    totalSpent: mentores.reduce((sum, m) => sum + m.total_spent, 0)
  };

  if (isLoading) {
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
          
          <div className="pt-16 md:pt-0">
            <LoadingComponent message="Carregando Dados" />
          </div>
        </div>
      </div>
    );
  }

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
        
        <div className="pt-16 md:pt-0">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gold mb-2">Meus Mentores</h1>
            <p className="text-muted-foreground">Mentores que estou seguindo e seus cursos disponíveis</p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-center text-center gap-3">
                <Users className="h-8 w-8 text-gold" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-sm text-gold">Total de Mentores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-center text-center gap-3">
                <Heart className="h-8 w-8 text-gold" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.following}</p>
                  <p className="text-sm text-gold">Seguindo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-center text-center gap-3">
                <BookOpen className="h-8 w-8 text-gold" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.withCourses}</p>
                  <p className="text-sm text-gold">Com Cursos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-center text-center gap-3">
                <TrendingUp className="h-8 w-8 text-gold" />
                <div>
                  <p className="text-2xl font-bold text-white">{formatPrice(stats.totalSpent)}</p>
                  <p className="text-sm text-gold">Total Investido</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold/60 h-4 w-4" />
            <Input
              placeholder="Buscar mentores por nome, email ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-gold/20 text-white placeholder:text-gray-400 focus:border-gold/40"
            />
          </div>
        </div>

        {/* Lista de mentores */}
        {filteredMentores.length === 0 ? (
          <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg">
            <CardContent className="p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-gold/60 mb-4" />
              <p className="text-gray-400 mb-4">
                {searchTerm ? "Nenhum mentor encontrado com esse termo de busca." : "Você ainda não segue nenhum mentor e não possui cursos adquiridos."}
              </p>
              <Button 
                onClick={() => navigate('/mentores')}
                className="bg-gold text-black hover:bg-gold/90"
              >
                Explorar Mentores
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMentores.map((mentor) => (
              <Card key={mentor.id} className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
                <CardContent className="p-6">
                  <div className="grid grid-cols-4 gap-4 items-stretch">
                    {/* Coluna 1: Avatar + Nome do mentor */}
                    <div className="flex items-center gap-4 h-24 bg-slate-800/50 rounded-lg shadow-sm border border-gold/20 p-4 hover:shadow-md hover:border-gold/40 transition-all duration-300">
                      <Avatar className="h-16 w-16 flex-shrink-0">
                        <AvatarImage src={mentor.avatar_url || ""} alt={mentor.full_name || ""} />
                        <AvatarFallback className="bg-gradient-to-r from-gold/80 to-yellow-500/80 text-black">
                          {mentor.full_name ? getMentorInitials(mentor.full_name) : "M"}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-lg text-white truncate">{mentor.full_name || "Nome não informado"}</h3>
                    </div>

                    {/* Coluna 2: Cursos do mentor */}
                    <div className="h-24 bg-slate-800/50 rounded-lg shadow-sm border border-gold/20 p-4 hover:shadow-md hover:border-gold/40 transition-all duration-300 overflow-hidden">
                      {/* Título com ícone */}
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-gold flex-shrink-0" />
                        <span className="text-sm font-medium text-gold">Cursos:</span>
                      </div>
                      
                      {/* Tags dos cursos */}
                      <div className="flex flex-wrap gap-1 overflow-hidden">
                        {mentor.courses_created.length > 0 ? (
                          mentor.courses_created.slice(0, 3).map((course) => (
                            <Badge
                              key={course.id}
                              variant="secondary"
                              className="cursor-pointer bg-gold/20 text-gold border-gold/30 hover:bg-gold/30 hover:text-gold transition-colors text-xs"
                              onClick={() => navigate(`/curso/${course.id}`)}
                            >
                              {course.title.length > 15 ? `${course.title.substring(0, 15)}...` : course.title}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">Nenhum curso</span>
                        )}
                        {mentor.courses_created.length > 3 && (
                          <Badge variant="outline" className="text-xs border-gold/30 text-gold">
                            +{mentor.courses_created.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Coluna 3: Botões de ação 1 */}
                    <div className="h-24 bg-slate-800/50 rounded-lg shadow-sm border border-gold/20 p-4 hover:shadow-md hover:border-gold/40 transition-all duration-300 flex flex-col justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateToTop(navigate, `/mentor/publicview/${mentor.id}`)}
                        className="w-full justify-start text-xs border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50"
                      >
                        <User className="h-3 w-3 mr-2" />
                        Ver Perfil
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/mentor/publicschedule/${mentor.id}`)}
                        className="w-full justify-start text-xs border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50"
                      >
                        <Calendar className="h-3 w-3 mr-2" />
                        Agendar
                      </Button>
                    </div>

                    {/* Coluna 4: Botões de ação 2 */}
                    <div className="h-24 bg-slate-800/50 rounded-lg shadow-sm border border-gold/20 p-4 hover:shadow-md hover:border-gold/40 transition-all duration-300 flex flex-col justify-center gap-2">
                      <Dialog 
                        open={openDialogs[mentor.id] || false} 
                        onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, [mentor.id]: open }))}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMentor(mentor);
                              setOpenDialogs(prev => ({ ...prev, [mentor.id]: true }));
                            }}
                            className="w-full justify-start text-xs border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50"
                          >
                            <MessageCircle className="h-3 w-3 mr-2" />
                            Notificar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-gold/30">
                          <DialogHeader>
                            <DialogTitle className="text-white">Enviar Notificação para {selectedMentor?.full_name || mentor.full_name}</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Envie uma mensagem de notificação para este mentor.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Digite sua mensagem..."
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              rows={4}
                              className="bg-slate-800/50 border-gold/20 text-white placeholder:text-gray-400 focus:border-gold/40"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={handleSendMessage}
                              disabled={!messageText.trim() || sendingMessage}
                              className="bg-gold text-black hover:bg-gold/90"
                            >
                              {sendingMessage ? "Enviando..." : "Enviar Notificação"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant={mentor.is_following ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleToggleFollow(mentor.id, mentor.is_following)}
                        className={`w-full justify-start text-xs ${
                          mentor.is_following 
                            ? 'border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500/70' 
                            : 'bg-gold text-black hover:bg-gold/90'
                        }`}
                      >
                        {mentor.is_following ? (
                          <>
                            <HeartOff className="h-3 w-3 mr-2" />
                            Parar de Seguir
                          </>
                        ) : (
                          <>
                            <Heart className="h-3 w-3 mr-2" />
                            Seguir
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default MentoradoMeusMentoresPage;