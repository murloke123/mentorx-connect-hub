import { Link } from 'react-router-dom';
import { BookOpen, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Course {
  id: string;
  title: string;
  description: string | null;
  mentor_id: string;
  mentor_name: string | null;
  is_paid: boolean;
  price: number | null;
  enrollments_count: number;
  created_at: string;
}

interface RecentCoursesTabProps {
  courses: Course[];
  isLoading: boolean;
}

const RecentCoursesTab = ({ courses, isLoading }: RecentCoursesTabProps) => {
  // Helper function to get mentor name
  const getCourseMentorName = (course: Course) => {
    return course.mentor_name || "Mentor desconhecido";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <BookOpen className="mr-2 h-5 w-5" />
          Cursos Recentes
        </CardTitle>
        <CardDescription>
          Últimos cursos criados na plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-1" />
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md">
                <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{course.title}</p>
                  <p className="text-sm text-gray-500">Por {getCourseMentorName(course)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={course.is_paid ? "default" : "secondary"}>
                      {course.is_paid ? `R$${course.price?.toFixed(2)}` : "Gratuito"}
                    </Badge>
                    <Badge variant="outline" className="text-gray-500">
                      {course.enrollments_count} matrículas
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin/cursos">Ver todos os cursos</Link>
              </Button>
            </div>
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Nenhum curso encontrado</AlertTitle>
            <AlertDescription>
              Não há cursos criados na plataforma ainda.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentCoursesTab;
