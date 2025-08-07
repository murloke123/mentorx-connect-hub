import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Book, Calendar, Eye, EyeOff, Heart, MessageCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Mentor {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_public?: boolean | null;
  courses: Array<{
    id: string;
    title: string;
    is_published: boolean;
  }>;
}

interface RecentMentorsTabProps {
  mentors: Mentor[];
  isLoading: boolean;
}

const RecentMentorsTab = ({ mentors, isLoading }: RecentMentorsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <User className="mr-2 h-5 w-5" />
          Mentores Recentes
        </CardTitle>
        <CardDescription>
          Mentores que se juntaram à plataforma recentemente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6">
                <div className="grid grid-cols-4 gap-4 items-stretch">
                  <div className="flex items-center gap-4 h-24">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : mentors.length > 0 ? (
          <div className="space-y-6">
            {mentors.map((mentor) => {
              const publishedCourses = mentor.courses.filter(course => course.is_published);
              const unpublishedCourses = mentor.courses.filter(course => !course.is_published);
              
              return (
                <div key={mentor.id} className="p-6">
                  <div className="grid grid-cols-4 gap-4 items-stretch">
                    {/* Coluna 1: Avatar e Nome */}
                    <div className="flex items-center gap-4 h-24 bg-slate-800/50 rounded-lg shadow-sm border border-gold/20 p-4 hover:shadow-md hover:border-gold/40 transition-all duration-300">
                      <span className="relative flex shrink-0 overflow-hidden rounded-full h-16 w-16 flex-shrink-0">
                        {mentor.avatar_url ? (
                          <img 
                            className="aspect-square h-full w-full" 
                            alt={mentor.full_name || 'Mentor'} 
                            src={mentor.avatar_url}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-white truncate">{mentor.full_name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          {mentor.is_public ? (
                            <Eye className="h-3 w-3 text-green-400" />
                          ) : (
                            <EyeOff className="h-3 w-3 text-red-400" />
                          )}
                          <span className="text-xs text-gray-400">
                            {mentor.is_public ? 'Público' : 'Privado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Coluna 2: Cursos */}
                    <div className="h-24 bg-slate-800/50 rounded-lg shadow-sm border border-gold/20 p-4 hover:shadow-md hover:border-gold/40 transition-all duration-300 overflow-hidden">
                      <div className="flex items-center gap-2 mb-2">
                        <Book className="h-4 w-4 text-gold flex-shrink-0" />
                        <span className="text-sm font-medium text-gold">Cursos:</span>
                      </div>
                      <div className="flex flex-wrap gap-1 overflow-hidden">
                        {mentor.courses.length > 0 ? (
                          mentor.courses.slice(0, 2).map((course) => (
                            <Badge 
                              key={course.id}
                              className={`text-xs cursor-pointer transition-colors ${
                                course.is_published 
                                  ? 'bg-gold/20 text-gold border-gold/30 hover:bg-gold/30 hover:text-gold'
                                  : 'bg-gray-600/20 text-gray-400 border-gray-600/30 hover:bg-gray-600/30'
                              }`}
                            >
                              {course.title.length > 15 ? `${course.title.substring(0, 15)}...` : course.title}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">Nenhum curso</span>
                        )}
                        {mentor.courses.length > 2 && (
                          <Badge className="bg-gold/20 text-gold border-gold/30 text-xs">
                            +{mentor.courses.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Coluna 3: Ações Administrativas */}
                    <div className="h-24 bg-slate-800/50 rounded-lg shadow-sm border border-gold/20 p-4 hover:shadow-md hover:border-gold/40 transition-all duration-300 flex flex-col justify-center gap-2">
                      <Button 
                        asChild
                        className="w-full justify-start text-xs border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 h-9"
                        variant="outline"
                      >
                        <Link to={`/admin/mentores`}>
                          <User className="h-3 w-3 mr-2" />
                          Ver Perfil
                        </Link>
                      </Button>
                      <Button 
                        className="w-full justify-start text-xs border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 h-9"
                        variant="outline"
                      >
                        <Calendar className="h-3 w-3 mr-2" />
                        Agendar
                      </Button>
                    </div>

                    {/* Coluna 4: Ações Especiais */}
                    <div className="h-24 bg-slate-800/50 rounded-lg shadow-sm border border-gold/20 p-4 hover:shadow-md hover:border-gold/40 transition-all duration-300 flex flex-col justify-center gap-2">
                      <Button 
                        className="w-full justify-start text-xs border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 h-9"
                        variant="outline"
                      >
                        <MessageCircle className="h-3 w-3 mr-2" />
                        Notificar
                      </Button>
                      <Button 
                        className="w-full justify-start text-xs bg-gold text-black hover:bg-gold/90 h-9"
                      >
                        <Heart className="h-3 w-3 mr-2" />
                        Seguir
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="pt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin/mentores">Ver todos os mentores</Link>
              </Button>
            </div>
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Nenhum mentor encontrado</AlertTitle>
            <AlertDescription>
              Não há mentores cadastrados na plataforma ainda.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentMentorsTab;
