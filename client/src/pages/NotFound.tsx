
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Algo deu errado...</h2>
        <p className="text-gray-600">
          Não conseguimos encontrar a página que você procurava. Verifique o endereço ou volte para a página inicial da MentorX.
        </p>
        <Link to="/">
          <Button>Voltar para Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
