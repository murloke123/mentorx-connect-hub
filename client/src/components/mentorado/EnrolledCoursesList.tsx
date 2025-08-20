
import LoadingComponent from "@/components/shared/LoadingComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, BookOpen, Play } from "lucide-react";
import { Link } from "react-router-dom";

interface Course {
  id: string;
  title: string;
  description?: string;
  mentor_name?: string;
  mentor_id: string;
  progress?: number;
  completed_lessons?: number;
  total_lessons?: number;
}

interface EnrolledCoursesListProps {
  courses: Course[];
  isLoading: boolean;
}

const EnrolledCoursesList = ({ courses, isLoading }: EnrolledCoursesListProps) => {
  if (isLoading) {
    return (
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-2xl font-semibold mb-3 md:mb-4">Meus Cursos</h2>
        <LoadingComponent message="Carregando seus cursos" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-2xl font-semibold mb-3 md:mb-4">Meus Cursos</h2>
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <BookOpen className="h-12 w-12 mb-4 text-muted-foreground/80" />
            <p className="text-muted-foreground text-center mb-4">
              Você ainda não está inscrito em nenhum curso
            </p>
            <Button asChild>
              <Link to="/courses">Explorar cursos disponíveis</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h2 className="text-lg md:text-2xl font-semibold">Meus Cursos</h2>
        <Button variant="outline" size="sm" asChild className="text-xs md:text-sm px-2 md:px-4">
          <Link to="/mentorado/cursos">
            <span className="hidden md:inline">Ver todos</span>
            <span className="md:hidden">Ver +</span>
            <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-3 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const progressPercent = course.progress ? Math.round(course.progress * 100) : 0;
          const truncatedTitle = course.title.length > 50 ? `${course.title.substring(0, 50)}...` : course.title;
          
          return (
            <Card key={course.id} className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30">
              <CardHeader className="pb-2 md:pb-3 px-3 md:px-6 pt-3 md:pt-6">
                <CardTitle className="text-sm md:text-lg font-medium md:font-semibold" title={course.title}>
                  <span className="block md:hidden">{truncatedTitle}</span>
                  <span className="hidden md:block">{course.title}</span>
                </CardTitle>
                <CardDescription className="text-xs md:text-sm text-gold/80">Por {course.mentor_name || "Mentor"}</CardDescription>
              </CardHeader>
              <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
                <div className="mb-3 md:mb-4">
                  <div className="flex justify-between text-xs md:text-sm mb-1">
                    <span>Progresso</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <Progress 
                    value={progressPercent} 
                    className="h-1.5 md:h-2 bg-slate-700/50 [&>div]:bg-gold" 
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {course.completed_lessons || 0} de {course.total_lessons || 0} aulas
                  </div>
                </div>
                <Button 
                  className="w-full bg-gold hover:bg-gold/90 text-slate-900 font-medium shadow-lg hover:shadow-xl backdrop-blur-sm text-xs md:text-sm py-2 md:py-3" 
                  asChild
                >
                  <Link to={`/mentorado/cursoplayer/${course.id}`} className="flex items-center gap-1 md:gap-2">
                    <Play className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="block md:hidden">{progressPercent === 0 ? "Iniciar" : "Continuar"}</span>
                    <span className="hidden md:block">{progressPercent === 0 ? "Iniciar Curso" : "Continuar Curso"}</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default EnrolledCoursesList;
