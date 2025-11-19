import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Building2, Calendar, FileText, Users, Check, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

/**
 * Landing Page do DentCarePro SaaS
 * 
 * Página pública que apresenta o sistema e permite login
 */
export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Se já estiver autenticado, redirecionar para dashboard
  if (user && !loading) {
    setLocation("/dashboard");
    return null;
  }

  const planos = [
    {
      nome: "Básico",
      preco: "29",
      descricao: "Ideal para clínicas pequenas",
      features: [
        "Até 2 dentistas",
        "Até 100 utentes",
        "1 clínica",
        "1GB armazenamento",
        "Suporte por email",
      ],
    },
    {
      nome: "Pro",
      preco: "79",
      descricao: "Para clínicas em crescimento",
      popular: true,
      features: [
        "Até 10 dentistas",
        "Até 1.000 utentes",
        "Até 3 clínicas",
        "10GB armazenamento",
        "Mensagens IA",
        "Relatórios avançados",
        "Suporte prioritário",
        "Integração WhatsApp",
      ],
    },
    {
      nome: "Enterprise",
      preco: "199",
      descricao: "Solução completa",
      features: [
        "Dentistas ilimitados",
        "Utentes ilimitados",
        "Clínicas ilimitadas",
        "100GB armazenamento",
        "Todas as funcionalidades Pro",
        "API access",
        "Branding personalizado",
        "Gestor de conta dedicado",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-10 rounded-lg" />
            <span className="text-xl font-bold text-gray-900">{APP_TITLE}</span>
          </div>
          <Button asChild>
            <a href={getLoginUrl()}>Entrar</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Gestão Dentária Profissional
          <br />
          <span className="text-blue-600">para toda a Europa</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Sistema completo de gestão para clínicas dentárias. Agenda, utentes, faturação e muito mais numa única plataforma.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <a href={getLoginUrl()}>
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <Button size="lg" variant="outline">
            Ver Demonstração
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          ✨ 14 dias de teste grátis · Sem cartão de crédito
        </p>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Funcionalidades Principais</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Gestão de Utentes</h3>
            <p className="text-gray-600 text-sm">
              Fichas completas com histórico médico, alergias e tratamentos anteriores.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Agenda Inteligente</h3>
            <p className="text-gray-600 text-sm">
              Agendamento online, lembretes automáticos e gestão de disponibilidade.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Faturação Automática</h3>
            <p className="text-gray-600 text-sm">
              Criação de faturas, controlo de pagamentos e relatórios financeiros.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Multi-Clínica</h3>
            <p className="text-gray-600 text-sm">
              Gerir múltiplas clínicas numa única conta com dados isolados.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Planos e Preços</h2>
        <p className="text-gray-600 text-center mb-12">
          Escolha o plano ideal para a sua clínica. Todos incluem 14 dias de teste grátis.
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {planos.map((plano) => (
            <div
              key={plano.nome}
              className={`bg-white rounded-xl shadow-sm border-2 p-8 ${
                plano.popular ? "border-blue-500 relative" : "border-gray-200"
              }`}
            >
              {plano.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Mais Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plano.nome}</h3>
              <p className="text-gray-600 text-sm mb-4">{plano.descricao}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">€{plano.preco}</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <Button
                className="w-full mb-6"
                variant={plano.popular ? "default" : "outline"}
                asChild
              >
                <a href={getLoginUrl()}>Começar Agora</a>
              </Button>
              <ul className="space-y-3">
                {plano.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para modernizar a sua clínica?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a centenas de clínicas que já confiam no DentCarePro
          </p>
          <Button size="lg" variant="secondary" asChild>
            <a href={getLoginUrl()}>
              Começar Teste Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2025 {APP_TITLE}. Todos os direitos reservados.</p>
          <p className="mt-2">Sistema de gestão dentária para toda a Europa e mundo.</p>
        </div>
      </footer>
    </div>
  );
}
