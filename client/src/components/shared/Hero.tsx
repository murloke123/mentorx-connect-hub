import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
const Hero = () => {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-purple-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Conecte-se \o/ com os melhores<br />
                <span className="text-primary">mentores</span> para evoluir
              </h1>
              <p className="text-lg text-gray-700 mb-6">Na Mentora Ai, você encontra especialistas prontos para compartilhar conhecimento através de cursos, materiais exclusivos e sessões de mentoria personalizadas = ).</p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="px-6">Começar Agora</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-xl">Bem-vindo(a) à Mentora Ai! 👋</DialogTitle>
                      <DialogDescription className="py-4">
                        Você quer aprender com um mentor ou compartilhar seu conhecimento com o mundo?
                        Escolha uma opção para começar:
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <Link to="/courses" className="flex flex-col items-center justify-center p-4 border rounded-lg text-center hover:bg-gray-50">
                        <span className="text-2xl mb-2">📚</span>
                        <span>Explorar cursos</span>
                      </Link>
                      <Link to="/profile/setup" className="flex flex-col items-center justify-center p-4 border rounded-lg text-center hover:bg-gray-50">
                        <span className="text-2xl mb-2">👨‍🏫</span>
                        <span>Configurar perfil como Mentor</span>
                      </Link>
                      <Link to="/mentors" className="flex flex-col items-center justify-center p-4 border rounded-lg text-center hover:bg-gray-50">
                        <span className="text-2xl mb-2">📅</span>
                        <span>Agendar sessão com Mentor</span>
                      </Link>
                    </div>
                  </DialogContent>
                </Dialog>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="px-6">Saiba Mais</Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img src="/placeholder.svg" alt="Mentora Ai Platform" className="rounded-xl shadow-lg w-full max-w-md" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Hero;