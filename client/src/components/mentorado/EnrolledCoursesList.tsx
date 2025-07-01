
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Meus Cursos</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 mb-4" />
                <Skeleton className="h-10 w-full mb-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Meus Cursos</h2>
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
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Meus Cursos</h2>
        <Button variant="outline" size="sm" asChild>
          <Link to="/courses">
            Ver todos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const progressPercent = course.progress ? Math.round(course.progress * 100) : 0;
          
          return (
            <Card key={course.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription>Por {course.mentor_name || "Mentor"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progresso</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {course.completed_lessons || 0} de {course.total_lessons || 0} aulas concluídas
                  </div>
                </div>
                <Button className="w-full" variant="outline" asChild>
                  <Link to={`/mentorado/cursos/${course.id}`}>
                    Continuar curso
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
