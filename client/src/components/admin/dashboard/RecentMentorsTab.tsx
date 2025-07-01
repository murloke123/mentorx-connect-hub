import { Link } from 'react-router-dom';
import { User, Book, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Mentor {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  courses_count: number;
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
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-1" />
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : mentors.length > 0 ? (
          <div className="space-y-4">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {mentor.avatar_url ? (
                    <img
                      src={mentor.avatar_url}
                      alt={mentor.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{mentor.full_name}</p>
                  <p className="text-sm text-gray-500">{mentor.bio || "Sem bio"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-gray-500">
                      <Book className="mr-1 h-3 w-3" />
                      {mentor.courses_count} cursos
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            
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
