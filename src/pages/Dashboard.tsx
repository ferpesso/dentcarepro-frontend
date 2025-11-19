import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, FileText, Euro, TrendingUp, Clock } from "lucide-react";
import { StatCard, FeatureCard } from "@/components/ui/card-modern";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { DashboardCharts } from "@/components/DashboardCharts";
import { AIAssistant, PageFooter } from "@/components/AIAssistant";
import { useAIAssistant } from "@/hooks/useAIAssistant";

/**
 * Dashboard Principal
 * 
 * Exibe estatísticas e resumo da clínica
 */
export default function Dashboard() {
  const [clinicaId, setClinicaId] = useState<number | null>(null);
  
  // Assistente IA
  const { recommendations, alerts, quickTips, loading: loadingAI } = useAIAssistant("dashboard", clinicaId || undefined);

  // Buscar clínicas do utilizador
  const { data: clinicas, isLoading: loadingClinicas } = trpc.clinicas.minhas.useQuery();

  // Buscar estatísticas
  const { data: stats, isLoading: loadingStats } = trpc.dashboard.stats.useQuery(
    { clinicaId: clinicaId! },
    { enabled: !!clinicaId }
  );

  // Buscar dados para gráficos
  const { data: graficos, isLoading: loadingGraficos } = trpc.dashboard.graficos.useQuery(
    { clinicaId: clinicaId! },
    { enabled: !!clinicaId }
  );

  // Mutation para criar clínica (DEVE estar antes de qualquer early return)
  const criarClinica = trpc.clinicas.criar.useMutation({
    onSuccess: (data) => {
      toast.success("Clínica criada com sucesso!");
      setClinicaId(data.id);
      window.location.reload();
    },
    onError: (error) => {
      toast.error("Erro ao criar clínica: " + error.message);
    },
  });

  // Definir clínica ativa (primeira por padrão)
  useEffect(() => {
    console.log("Dashboard - Clínicas recebidas:", clinicas);
    if (clinicas && clinicas.length > 0 && !clinicaId) {
      console.log("Dashboard - Definindo clinicaId:", clinicas[0].clinica.id);
      setClinicaId(clinicas[0].clinica.id);
    }
  }, [clinicas, clinicaId]);

  console.log("Dashboard - clinicaId atual:", clinicaId);
  console.log("Dashboard - stats:", stats);

  if (loadingClinicas) {
    return <DashboardSkeleton />;
  }

  const handleCriarClinicaDemo = () => {
    criarClinica.mutate({
      nome: "Clínica Dental Lisboa",
      email: "contacto@clinicalisboa.pt",
      telemovel: "+351 21 123 4567",
      morada: "Avenida da Liberdade, 123",
      cidade: "Lisboa",
      codigoPostal: "1250-096",
      pais: "PT",
      nif: "123456789",
    });
  };

  if (!clinicas || clinicas.length === 0) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Nenhuma clínica encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Crie a sua primeira clínica para começar a usar o sistema.
              </p>
              <Button 
                onClick={handleCriarClinicaDemo}
                disabled={criarClinica.isPending}
              >
                {criarClinica.isPending ? "Criando..." : "Criar Clínica de Demonstração"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const clinicaAtiva = clinicas.find((c) => c.clinica.id === clinicaId)?.clinica;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo ao {clinicaAtiva?.nome || "DentCarePro"}
        </p>
      </div>

      {/* Stats Cards */}
      {loadingStats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Utentes"
            value={stats?.totalUtentes || 0}
            icon={Users}
            color="blue"
            trend={{ value: 12, isPositive: true }}
          />

          <StatCard
            title="Consultas do Mês"
            value={stats?.consultasMes || 0}
            icon={Calendar}
            color="green"
            trend={{ value: 8, isPositive: true }}
          />

          <StatCard
            title="Receita do Mês"
            value={`€${stats?.receitaMes?.toFixed(2) || "0.00"}`}
            icon={Euro}
            color="purple"
            trend={{ value: 15, isPositive: true }}
          />

          <StatCard
            title="Faturas Pendentes"
            value={stats?.faturasPendentes || 0}
            icon={FileText}
            color="orange"
            trend={{ value: 3, isPositive: false }}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={Users}
          title="Gestão de Utentes"
          description="Ver, adicionar e gerir fichas de utentes"
          onClick={() => window.location.href = '/utentes'}
        />

        <FeatureCard
          icon={Calendar}
          title="Agenda"
          description="Agendar consultas e gerir disponibilidade"
          onClick={() => window.location.href = '/consultas'}
        />

        <FeatureCard
          icon={FileText}
          title="Faturação"
          description="Criar faturas e gerir pagamentos"
          onClick={() => window.location.href = '/faturas'}
        />
      </div>

      {/* Assistente IA */}
      {!loadingAI && (
        <AIAssistant
          recommendations={recommendations}
          alerts={alerts}
          quickTips={quickTips}
          showInsights={true}
        />
      )}

      {/* Gráficos */}
      {!loadingGraficos && graficos && (
        <DashboardCharts
          receitaMensal={graficos.receitaMensal}
          consultasPorMes={graficos.consultasPorMes}
          procedimentosMaisRealizados={graficos.procedimentosMaisRealizados}
        />
      )}

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma atividade recente para mostrar
          </p>
        </CardContent>
      </Card>

      {/* Rodapé com Recomendações */}
      <PageFooter
        recommendations={recommendations}
        stats={[
          { label: "Utentes", value: stats?.totalUtentes || 0 },
          { label: "Consultas", value: stats?.consultasMes || 0 },
          { label: "Receita", value: `€${stats?.receitaMes?.toFixed(0) || 0}` },
          { label: "Pendentes", value: stats?.faturasPendentes || 0 },
        ]}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
