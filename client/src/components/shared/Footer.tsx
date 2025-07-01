
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">MentorX</h3>
            <p className="mb-4">
              Conectando mentores e mentorados para um futuro de conhecimento compartilhado.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">Sobre</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">Cursos</Link>
              </li>
              <li>
                <Link to="/mentors" className="hover:text-white transition-colors">Mentores</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Usuários</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register?role=mentor" className="hover:text-white transition-colors">Torne-se um Mentor</Link>
              </li>
              <li>
                <Link to="/register?role=mentee" className="hover:text-white transition-colors">Inscreva-se como Mentorado</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Login</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Contato</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:contato@mentorx.com" className="hover:text-white transition-colors">contato@mentorx.com</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Suporte</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">FAQ</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} MentorX. Todos os direitos reservados.</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
