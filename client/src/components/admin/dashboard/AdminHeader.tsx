
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface AdminHeaderProps {
  fullName: string | undefined;
}

const AdminHeader = ({ fullName }: AdminHeaderProps) => {
  return (
    <div className="mb-8 relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard de Administração</h1>
          <p className="text-gray-600">Bem-vindo {fullName || 'Administrador'}</p>
        </div>
        
        {/* Verification Card - Responsive */}
        <Card className="relative md:absolute md:top-0 md:right-0 w-full md:w-auto bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Sistema Verificado</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHeader;
