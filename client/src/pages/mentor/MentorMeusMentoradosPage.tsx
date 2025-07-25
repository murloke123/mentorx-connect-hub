import MentorSidebar from "@/components/mentor/MentorSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { supabase } from "@/utils/supabase";
import {
    BookOpen,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Frown,
    Heart,
    Mail,
    Search,
    TrendingUp,
    User,
    Users
} from "lucide-react";
import { useEffect, useState } from "react";

interface Mentorado {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  courses_acquired: number;
  total_spent: number;
  is_following: boolean;
  first_enrollment_date: string;
}

type SortField = 'name' | 'email' | 'courses_acquired' | 'total_spent' | 'is_following';
type SortDirection = 'asc' | 'desc';
type FilterType = 'students' | 'followers';

const MentorMeusMentoradosPage = () => {
  const [mentorados, setMentorados] = useState<Mentorado[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMentorados, setSelectedMentorados] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [activeFilter, setActiveFilter] = useState<FilterType>('students');

  useEffect(() => {
    const fetchMentorados = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("Usuário não autenticado");
        }
        
        // Buscar mentorados que compraram cursos do mentor
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from("matriculas")
          .select(`
            student_id,
            enrolled_at,
            course:cursos!inner (
              id,
              title,
              price,
              mentor_id
            ),
            student:profiles!student_id (
              id,
              full_name,
              avatar_url,
              email
            )
          `)
          .eq("course.mentor_id", user.id)
          .eq("status", "active");

        if (enrollmentsError) throw enrollmentsError;

        // Buscar seguidores com dados completos do perfil
        const { data: followers, error: followersError } = await supabase
          .from("mentor_followers")
          .select(`
            follower_id,
            followed_at,
            profile:profiles!follower_id (
              id,
              full_name,
              avatar_url,
              email
            )
          `)
          .eq("mentor_id", user.id);

        if (followersError) throw followersError;

        // Processar dados para agregar por mentorado
        const mentoradosMap = new Map<string, Mentorado>();

        // Primeiro, adicionar todos os seguidores
        followers?.forEach((follower: any) => {
          const followerId = follower.follower_id;
          const profile = follower.profile;
          
          mentoradosMap.set(followerId, {
            id: followerId,
            email: profile?.email || '',
            full_name: profile?.full_name || null,
            avatar_url: profile?.avatar_url || null,
            courses_acquired: 0,
            total_spent: 0,
            is_following: true,
            first_enrollment_date: follower.followed_at // usar data que começou a seguir como referência
          });
        });

        // Depois, processar matrículas (sobrescreve dados se já existir ou cria novo registro)
        enrollments?.forEach((enrollment: any) => {
          const studentId = enrollment.student_id;
          const student = enrollment.student;
          const course = enrollment.course;
          
          if (!mentoradosMap.has(studentId)) {
            // Pessoa que comprou curso mas não segue o mentor
            mentoradosMap.set(studentId, {
              id: studentId,
              email: student?.email || '',
              full_name: student?.full_name || null,
              avatar_url: student?.avatar_url || null,
              courses_acquired: 0,
              total_spent: 0,
              is_following: false,
              first_enrollment_date: enrollment.enrolled_at
            });
          }
          
          const mentorado = mentoradosMap.get(studentId)!;
          mentorado.courses_acquired += 1;
          mentorado.total_spent += course?.price || 0;
          
          // Se é a primeira matrícula, usar essa data como referência principal
          if (mentorado.courses_acquired === 1) {
            mentorado.first_enrollment_date = enrollment.enrolled_at;
          } else {
            // Manter a primeira data de matrícula
            if (new Date(enrollment.enrolled_at) < new Date(mentorado.first_enrollment_date)) {
              mentorado.first_enrollment_date = enrollment.enrolled_at;
            }
          }
        });

        setMentorados(Array.from(mentoradosMap.values()));
      } catch (error) {
        console.error("Erro ao buscar mentorados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentorados();
  }, []);

  // Limpar seleções quando o filtro mudar
  useEffect(() => {
    setSelectedMentorados([]);
  }, [activeFilter]);

  // Função de ordenação
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtrar e ordenar mentorados
  const filteredAndSortedMentorados = mentorados
    .filter((mentorado) => {
      // Filtro por tipo
      const typeFilter = activeFilter === 'students' 
        ? mentorado.courses_acquired > 0 
        : mentorado.is_following && mentorado.courses_acquired === 0;
      
      if (!typeFilter) return false;
      
      // Filtro por busca
      const searchLower = searchTerm.toLowerCase();
      return (
        mentorado.full_name?.toLowerCase().includes(searchLower) ||
        mentorado.email.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.full_name || '';
          bValue = b.full_name || '';
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'courses_acquired':
          aValue = a.courses_acquired;
          bValue = b.courses_acquired;
          break;
        case 'total_spent':
          aValue = a.total_spent;
          bValue = b.total_spent;
          break;
        case 'is_following':
          aValue = a.is_following ? 1 : 0;
          bValue = b.is_following ? 1 : 0;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
    });

  // Função para selecionar/deselecionar mentorado
  const toggleSelectMentorado = (id: string) => {
    setSelectedMentorados(prev => 
      prev.includes(id) 
        ? prev.filter(mentId => mentId !== id)
        : [...prev, id]
    );
  };

  // Função para selecionar/deselecionar todos
  const toggleSelectAll = () => {
    if (selectedMentorados.length === filteredAndSortedMentorados.length) {
      setSelectedMentorados([]);
    } else {
      setSelectedMentorados(filteredAndSortedMentorados.map(m => m.id));
    }
  };

  // Função para obter ícone de ordenação
  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  // Estatísticas
  const stats = {
    total: mentorados.length,
    totalRevenue: mentorados.reduce((sum, m) => sum + m.total_spent, 0),
    followers: mentorados.filter(m => m.is_following).length,
    students: mentorados.filter(m => m.courses_acquired > 0).length, // Alunos únicos com matrículas ativas
    followersWithoutCourse: mentorados.filter(m => m.is_following && m.courses_acquired === 0).length,
    avgCoursesPerStudent: mentorados.length > 0 
      ? mentorados.reduce((sum, m) => sum + m.courses_acquired, 0) / mentorados.length 
      : 0
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MentorSidebar />
      <div className="flex-1 transition-all duration-300 p-6 overflow-auto">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Mentorados</h1>
            <p className="text-gray-600">Gerencie e acompanhe seus alunos, seguidores e suas métricas de engajamento</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total de Alunos</p>
                    <p className="text-3xl font-bold">{stats.students}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total de Seguidores</p>
                    <p className="text-3xl font-bold">{stats.followers}</p>
                  </div>
                  <Heart className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Seguidores sem Curso</p>
                    <p className="text-3xl font-bold">{stats.followersWithoutCourse}</p>
                  </div>
                  <Frown className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Cursos por Aluno</p>
                    <p className="text-3xl font-bold">{stats.avgCoursesPerStudent.toFixed(1)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder={activeFilter === 'students' 
                      ? "Buscar alunos por nome ou email..." 
                      : "Buscar seguidores por nome ou email..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-3 py-1">
                    {selectedMentorados.length} selecionados
                  </Badge>
                  {selectedMentorados.length > 0 && (
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar Email
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant={activeFilter === 'students' ? 'default' : 'outline'}
                    onClick={() => setActiveFilter('students')}
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Alunos Matriculados ({stats.students})
                  </Button>
                  <Button
                    variant={activeFilter === 'followers' ? 'default' : 'outline'}
                    onClick={() => setActiveFilter('followers')}
                    className="flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    Seguidores sem Curso ({stats.followersWithoutCourse})
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  {filteredAndSortedMentorados.length} registros
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Carregando mentorados...</span>
                </div>
              ) : mentorados.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    {/* Header da Tabela */}
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 w-12">
                          <Checkbox 
                            checked={selectedMentorados.length === filteredAndSortedMentorados.length && filteredAndSortedMentorados.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </th>
                        <th 
                          className="text-left p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-2 font-semibold text-gray-900">
                            <User className="w-4 h-4" />
                            Nome do Mentorado
                            {getSortIcon('name')}
                          </div>
                        </th>
                        <th 
                          className="text-left p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('email')}
                        >
                          <div className="flex items-center gap-2 font-semibold text-gray-900">
                            <Mail className="w-4 h-4" />
                            Email
                            {getSortIcon('email')}
                          </div>
                        </th>
                        <th 
                          className="text-center p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('courses_acquired')}
                        >
                          <div className="flex items-center justify-center gap-2 font-semibold text-gray-900">
                            <BookOpen className="w-4 h-4" />
                            Cursos Adquiridos
                            {getSortIcon('courses_acquired')}
                          </div>
                        </th>
                        <th 
                          className="text-center p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('total_spent')}
                        >
                          <div className="flex items-center justify-center gap-2 font-semibold text-gray-900">
                            <DollarSign className="w-4 h-4" />
                            Total Gasto
                            {getSortIcon('total_spent')}
                          </div>
                        </th>
                        <th 
                          className="text-center p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('is_following')}
                        >
                          <div className="flex items-center justify-center gap-2 font-semibold text-gray-900">
                            <Heart className="w-4 h-4" />
                            Me Segue?
                            {getSortIcon('is_following')}
                          </div>
                        </th>
                      </tr>
                    </thead>

                    {/* Body da Tabela */}
                    <tbody>
                      {filteredAndSortedMentorados.map((mentorado, index) => (
                        <tr 
                          key={mentorado.id} 
                          className={`border-b hover:bg-gray-50 transition-colors ${
                            selectedMentorados.includes(mentorado.id) ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className="p-4">
                            <Checkbox 
                              checked={selectedMentorados.includes(mentorado.id)}
                              onCheckedChange={() => toggleSelectMentorado(mentorado.id)}
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                {mentorado.avatar_url ? (
                                  <AvatarImage src={mentorado.avatar_url} alt={mentorado.full_name || ''} />
                                ) : (
                                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                    {mentorado.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {mentorado.full_name || 'Nome não informado'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {mentorado.courses_acquired > 0 
                                    ? `Aluno desde ${new Date(mentorado.first_enrollment_date).toLocaleDateString('pt-BR')}`
                                    : `Segue desde ${new Date(mentorado.first_enrollment_date).toLocaleDateString('pt-BR')}`
                                  }
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-gray-900">{mentorado.email}</p>
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {mentorado.courses_acquired}
                            </Badge>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-semibold text-green-600">
                              R$ {mentorado.total_spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {mentorado.is_following ? (
                              <Badge className="bg-red-100 text-red-800 border-red-200">
                                <Heart className="w-3 h-3 mr-1 fill-current" />
                                Sim
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-600">
                                Não
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  {activeFilter === 'students' ? (
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  ) : (
                    <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  )}
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {activeFilter === 'students' 
                      ? 'Nenhum aluno matriculado encontrado'
                      : 'Nenhum seguidor sem curso encontrado'
                    }
                  </h3>
                  <p className="text-gray-500">
                    {activeFilter === 'students'
                      ? 'Quando alguém adquirir seus cursos, aparecerá aqui!'
                      : 'Quando alguém te seguir sem ter adquirido cursos, aparecerá aqui!'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentorMeusMentoradosPage;
