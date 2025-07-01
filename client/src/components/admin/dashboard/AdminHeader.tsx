
import { ReactNode } from 'react';

interface AdminHeaderProps {
  fullName: string | undefined;
}

const AdminHeader = ({ fullName }: AdminHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">Dashboard de Administração</h1>
      <p className="text-gray-600">Bem-vindo {fullName || 'Administrador'}</p>
    </div>
  );
};

export default AdminHeader;
