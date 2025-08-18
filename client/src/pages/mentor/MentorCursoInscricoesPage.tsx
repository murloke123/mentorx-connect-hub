import MentorSidebar from "@/components/mentor/MentorSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";
import {
    AlertTriangle,
    Award,
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Mail,
    Menu,
    MessageSquare,
    Phone,
    PlayCircle,
    Search,
    TrendingUp,
    Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface StudentProgress {
  student_id: string;
  student_email: string;
  student_name: string | null;
  student_avatar: string | null;
  student_phone: string | null;
  enrolled_at: string;
  last_accessed_at: string | null;
  completed_contents: number;
  total_contents: number;
  progress_percentage: number;
  status: string;
}

interface CourseInfo {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  price: number;
  total_modules: number;
  total_contents: number;
}

const MentorCursoInscricoesPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [studentsProgress, setStudentsProgress] = useState<StudentProgress[]>([]);
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'enrolled_date' | 'last_access'>('progress');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!courseId) {
      toast({
        title: "Erro",
        description: "ID do curso não encontrado.",
        variant: "destructive"
      });
      navigate('/mentor/meus-cursos');
      return;
    }

    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      console.log('🔍 Buscando dados do curso:', courseId);

      // 1. Buscar informações do curso
      const { data: course, error: courseError } = await supabase
        .from("cursos")
        .select(`
          id,
          title,
          description,
          image_url,
          price
        `)
        .eq("id", courseId)
        .eq("mentor_id", user.id)
        .single();

      if (courseError) {
        console.error('❌ Erro ao buscar curso:', courseError);
        throw courseError;
      }

      if (!course) {
        throw new Error("Curso não encontrado ou você não tem permissão para visualizá-lo");
      }

      console.log('✅ Curso encontrado:', course.title);

      // 2. Buscar total de conteúdos do curso
      const { data: totalContentsData, error: contentsError } = await supabase
        .from("conteudos")
        .select(`
          id,
          modulos!inner (
            course_id
          )
        `)
        .eq("modulos.course_id", courseId);

      if (contentsError) {
        console.error('❌ Erro ao buscar conteúdos:', contentsError);
        throw contentsError;
      }

      const totalContents = totalContentsData?.length || 0;
      console.log('📚 Total de conteúdos no curso:', totalContents);

      // 3. Buscar módulos para contar
      const { data: modulesData, error: modulesError } = await supabase
        .from("modulos")
        .select("id")
        .eq("course_id", courseId);

      if (modulesError) {
        console.error('❌ Erro ao buscar módulos:', modulesError);
        throw modulesError;
      }

      const totalModules = modulesData?.length || 0;
      console.log('📖 Total de módulos no curso:', totalModules);

      setCourseInfo({
        id: course.id,
        title: course.title,
        description: course.description,
        image_url: course.image_url,
        price: course.price,
        total_modules: totalModules,
        total_contents: totalContents
      });

      // 4. Buscar matrículas do curso
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("matriculas")
        .select(`
          student_id,
          enrolled_at,
          status,
          progress_percentage,
          updated_at
        `)
        .eq("course_id", courseId);

      if (enrollmentsError) {
        console.error('❌ Erro ao buscar matrículas:', enrollmentsError);
        throw enrollmentsError;
      }

      console.log('👥 Matrículas encontradas:', enrollments?.length || 0);

      if (!enrollments || enrollments.length === 0) {
        setStudentsProgress([]);
        setIsLoading(false);
        return;
      }

      // 5. Buscar dados dos estudantes
      const studentIds = enrollments.map(e => e.student_id);
      const { data: students, error: studentsError } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          full_name,
          avatar_url,
          phone,
          updated_at
        `)
        .in("id", studentIds);

      if (studentsError) {
        console.error('❌ Erro ao buscar estudantes:', studentsError);
        throw studentsError;
      }

      console.log('👤 Estudantes encontrados:', students?.length || 0);

      // 6. Para cada estudante, calcular progresso
      const progressPromises = enrollments.map(async (enrollment) => {
        // Buscar conteúdos concluídos pelo estudante neste curso
        const { data: completedContents, error: progressError } = await supabase
          .from("conteudo_concluido")
          .select("content_id")
          .eq("user_id", enrollment.student_id)
          .eq("course_id", courseId);

        if (progressError) {
          console.error(`❌ Erro ao buscar progresso do estudante ${enrollment.student_id}:`, progressError);
        }

        const completedCount = completedContents?.length || 0;
        const progressPercentage = totalContents > 0 ? Math.round((completedCount / totalContents) * 100) : 0;

        // Encontrar dados do estudante
        const student = students?.find(s => s.id === enrollment.student_id);

        console.log(`📊 Progresso de ${student?.full_name || student?.email}: ${completedCount}/${totalContents} (${progressPercentage}%)`);

        return {
          student_id: enrollment.student_id,
          student_email: student?.email || 'Email não encontrado',
          student_name: student?.full_name || null,
          student_avatar: student?.avatar_url || null,
          student_phone: student?.phone || null,
          enrolled_at: enrollment.enrolled_at,
          last_accessed_at: enrollment.updated_at, // Usando updated_at da matrícula como último acesso
          completed_contents: completedCount,
          total_contents: totalContents,
          progress_percentage: progressPercentage,
          status: enrollment.status
        };
      });

      const progressResults = await Promise.all(progressPromises);
      setStudentsProgress(progressResults);

      console.log('✅ Dados carregados com sucesso!');

    } catch (error: any) {
      console.error("❌ Erro ao buscar dados do curso:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar dados do curso.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress === 0) return "bg-gray-400";
    if (progress < 25) return "bg-red-500";
    if (progress < 50) return "bg-orange-500";
    if (progress < 75) return "bg-yellow-500";
    if (progress < 100) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStatusBadge = (student: StudentProgress) => {
    const progress = student.progress_percentage;
    const daysSinceEnrollment = Math.floor(
      (Date.now() - new Date(student.enrolled_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (progress === 100) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">
        <Award className="w-3 h-3 mr-1" />
        Concluído
      </Badge>;
    }
    
    if (progress === 0 && daysSinceEnrollment > 7) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Inativo
      </Badge>;
    }
    
    if (progress > 0) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">
        <PlayCircle className="w-3 h-3 mr-1" />
        Em Progresso
      </Badge>;
    }
    
    return <Badge className="bg-gray-100 text-gray-800 border-gray-200">
      <Clock className="w-3 h-3 mr-1" />
      Não Iniciado
    </Badge>;
  };

  const filteredStudents = studentsProgress.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.student_name?.toLowerCase().includes(searchLower) ||
      student.student_email.toLowerCase().includes(searchLower)
    );
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.student_name || a.student_email).localeCompare(b.student_name || b.student_email);
      case 'progress':
        return b.progress_percentage - a.progress_percentage;
      case 'enrolled_date':
        return new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime();
      case 'last_access':
        const lastAccessA = a.last_accessed_at ? new Date(a.last_accessed_at).getTime() : 0;
        const lastAccessB = b.last_accessed_at ? new Date(b.last_accessed_at).getTime() : 0;
        return lastAccessB - lastAccessA;
      default:
        return 0;
    }
  });

  const stats = {
    totalStudents: studentsProgress.length,
    activeStudents: studentsProgress.filter(s => s.progress_percentage > 0).length,
    completedStudents: studentsProgress.filter(s => s.progress_percentage === 100).length,
    averageProgress: studentsProgress.length > 0 
      ? studentsProgress.reduce((sum, s) => sum + s.progress_percentage, 0) / studentsProgress.length 
      : 0,
    totalRevenue: studentsProgress.length * (courseInfo?.price || 0)
  };

  if (isLoading) {
    return (
      <div className="flex">
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

        <div className="flex-1 p-4 md:p-6 relative">
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
          
          <div className="pt-8 md:pt-0">
            <div className="text-center py-10">
              <Users className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
              <p className="mt-2 text-muted-foreground">Carregando progresso dos alunos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
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
      <div className="flex-1 transition-all duration-300 p-4 md:p-6 min-h-screen bg-black relative">
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
          {/* Header */}
          <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gold">
            Progresso dos Alunos
          </h1>
          <p className="text-gray-300 text-lg">
            {courseInfo?.title}
          </p>
        </div>

        {/* Course Info Card */}
        {courseInfo && (
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl shadow-gold/20 mb-6">
              <div className="flex items-start gap-4">
                {courseInfo.image_url ? (
                  <img 
                    src={courseInfo.image_url} 
                    alt={courseInfo.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gold/20 to-gold/40 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-gold" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2 text-white">{courseInfo.title}</h2>
                  <p className="text-gray-300 mb-3 line-clamp-2">{courseInfo.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {courseInfo.total_modules} módulos
                    </span>
                    <span className="flex items-center gap-1">
                      <PlayCircle className="w-4 h-4" />
                      {courseInfo.total_contents} conteúdos
                    </span>
                    <span className="flex items-center gap-1 text-gold">
                      <DollarSign className="w-4 h-4" />
                      R$ {courseInfo.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl p-4 backdrop-blur-xl shadow-2xl shadow-gold/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold/20 rounded-lg">
                  <Users className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total de Alunos</p>
                  <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl p-4 backdrop-blur-xl shadow-2xl shadow-gold/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Alunos Ativos</p>
                  <p className="text-2xl font-bold text-white">{stats.activeStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl p-4 backdrop-blur-xl shadow-2xl shadow-gold/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Award className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Concluíram</p>
                  <p className="text-2xl font-bold text-white">{stats.completedStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl p-4 backdrop-blur-xl shadow-2xl shadow-gold/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Progresso Médio</p>
                  <p className="text-2xl font-bold text-white">{stats.averageProgress.toFixed(0)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl p-4 backdrop-blur-xl shadow-2xl shadow-gold/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Receita Total</p>
                  <p className="text-2xl font-bold text-gold">R$ {stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-800/50 border-gold/30 text-white placeholder:text-gray-400 focus:border-gold"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'progress' ? 'default' : 'outline'}
                onClick={() => setSortBy('progress')}
                size="sm"
                className={sortBy === 'progress' ? 'bg-gold text-slate-900 hover:bg-gold/90' : 'border-gold/30 text-gray-300 hover:bg-gold/10 hover:text-gold'}
              >
                Progresso
              </Button>
              <Button
                variant={sortBy === 'name' ? 'default' : 'outline'}
                onClick={() => setSortBy('name')}
                size="sm"
                className={sortBy === 'name' ? 'bg-gold text-slate-900 hover:bg-gold/90' : 'border-gold/30 text-gray-300 hover:bg-gold/10 hover:text-gold'}
              >
                Nome
              </Button>
              <Button
                variant={sortBy === 'enrolled_date' ? 'default' : 'outline'}
                onClick={() => setSortBy('enrolled_date')}
                size="sm"
                className={sortBy === 'enrolled_date' ? 'bg-gold text-slate-900 hover:bg-gold/90' : 'border-gold/30 text-gray-300 hover:bg-gold/10 hover:text-gold'}
              >
                Data de Inscrição
              </Button>
              <Button
                variant={sortBy === 'last_access' ? 'default' : 'outline'}
                onClick={() => setSortBy('last_access')}
                size="sm"
                className={sortBy === 'last_access' ? 'bg-gold text-slate-900 hover:bg-gold/90' : 'border-gold/30 text-gray-300 hover:bg-gold/10 hover:text-gold'}
              >
                Último Acesso
              </Button>
            </div>
        </div>

        {/* Students Progress List */}
        {sortedStudents.length === 0 ? (
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-gold/20 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">Nenhum aluno encontrado</h3>
            <p className="text-gray-300">
              {searchTerm ? 'Nenhum aluno encontrado com os critérios de busca.' : 'Este curso ainda não possui alunos inscritos.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedStudents.map((student) => {
              const daysSinceEnrollment = Math.floor(
                (Date.now() - new Date(student.enrolled_at).getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div key={student.student_id} className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl shadow-gold/20 hover:shadow-gold/30 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={student.student_avatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {getInitials(student.student_name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Student Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {student.student_name || 'Nome não informado'}
                            </h3>
                            <p className="text-gray-300">{student.student_email}</p>
                          </div>
                          {getStatusBadge(student)}
                        </div>

                        {/* Progress Bar - Destaque Principal */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-gold">
                              Progresso: {student.progress_percentage}%
                            </span>
                            <span className="text-sm text-gray-400">
                              {student.completed_contents}/{student.total_contents} conteúdos
                            </span>
                          </div>
                          <Progress 
                            value={student.progress_percentage} 
                            className="h-3"
                          />
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-gray-400">Inscrito em</p>
                              <p className="font-medium text-white">{formatDate(student.enrolled_at)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-gray-400">Tempo no curso</p>
                              <p className="font-medium text-white">{daysSinceEnrollment} dias</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-gray-400">Status</p>
                              <p className="font-medium text-white">{student.status}</p>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Contact Actions */}
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`mailto:${student.student_email}`, '_blank')}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                          </Button>
                          
                          {student.student_phone && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(`tel:${student.student_phone}`, '_blank')}
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                Telefone
                              </Button>

                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(`https://wa.me/${student.student_phone?.replace(/\D/g, '')}`, '_blank')}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                WhatsApp
                              </Button>
                            </>
                          )}

                          {/* Progress Insights */}
                          {student.progress_percentage === 0 && daysSinceEnrollment > 7 && (
                            <Badge variant="outline" className="ml-auto text-orange-600 border-orange-200">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Precisa de atenção
                            </Badge>
                          )}
                          
                          {student.progress_percentage === 100 && (
                            <Badge variant="outline" className="ml-auto text-green-600 border-green-200">
                              <Award className="w-3 h-3 mr-1" />
                              Curso concluído!
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default MentorCursoInscricoesPage;