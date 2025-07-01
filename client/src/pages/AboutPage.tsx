
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Sobre a MentorX</h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg mb-6">
              A MentorX nasceu para transformar conhecimento em conexões. Aqui, mentores experientes compartilham seus saberes com quem deseja aprender de forma simples, prática e acessível.
              Nossos pilares são: autonomia, conhecimento e resultado real.
            </p>
            <p className="text-lg mb-8">
              Com tecnologia moderna, oferecemos uma experiência fluida e eficiente, seja para ensinar ou aprender.
            </p>
            <Link to="/courses">
              <Button size="lg">Explorar Plataforma</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-12 text-center">Nossa Missão e Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-3">Autonomia</h3>
              <p className="text-gray-600">
                Acreditamos no poder da autonomia para o desenvolvimento pessoal e profissional. Na MentorX, cada usuário tem liberdade para escolher seu caminho de aprendizado.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-3">Conhecimento</h3>
              <p className="text-gray-600">
                Valorizamos o compartilhamento de conhecimento de forma ética e responsável, garantindo conteúdos relevantes e atualizados para todos os usuários.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-3">Resultado Real</h3>
              <p className="text-gray-600">
                Nossa plataforma é focada em resultados tangíveis. Queremos que cada interação na MentorX gere impacto positivo e transformação na vida dos mentorados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Como Funcionamos</h2>
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col space-y-8">
              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 mr-4">
                  <span className="font-semibold">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Conexão Mentor-Mentorado</h3>
                  <p className="text-gray-600">
                    Facilitamos o encontro entre mentores qualificados e pessoas em busca de conhecimento específico, permitindo uma troca de experiência personalizada.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 mr-4">
                  <span className="font-semibold">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Conteúdo Diversificado</h3>
                  <p className="text-gray-600">
                    Oferecemos diversos formatos de conteúdo: cursos completos, vídeos, PDFs e materiais de apoio, todos organizados para facilitar o aprendizado.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 mr-4">
                  <span className="font-semibold">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Agendamento Inteligente</h3>
                  <p className="text-gray-600">
                    Nossa plataforma de agendamento permite que mentores definam sua disponibilidade e mentorados reservem sessões com facilidade e praticidade.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">Faça Parte da MentorX</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Seja você um especialista querendo compartilhar conhecimento ou alguém em busca de evolução, a MentorX está aqui para conectar pessoas e transformar vidas através do aprendizado.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register?role=mentor">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Quero ser Mentor
              </Button>
            </Link>
            <Link to="/register?role=mentee">
              <Button variant="secondary">Quero ser Mentorado</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
