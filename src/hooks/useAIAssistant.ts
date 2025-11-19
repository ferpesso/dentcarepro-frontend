import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface AIAlert {
  type: "warning" | "info" | "success" | "error";
  message: string;
}

/**
 * Hook personalizado para usar o assistente IA
 * Conecta com o backend via tRPC para obter recomendações reais
 */
export function useAIAssistant(pagina: string, clinicaId?: number) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [quickTips, setQuickTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Queries tRPC baseadas na página
  const dashboardQuery = trpc.aiAssistant.getDashboardRecommendations.useQuery(
    { clinicaId: clinicaId! },
    { enabled: pagina === "dashboard" && !!clinicaId }
  );

  const utentesQuery = trpc.aiAssistant.getUtentesRecommendations.useQuery(
    { clinicaId: clinicaId!, totalUtentes: 0 },
    { enabled: pagina === "utentes" && !!clinicaId }
  );

  const agendaQuery = trpc.aiAssistant.getAgendaRecommendations.useQuery(
    { clinicaId: clinicaId! },
    { enabled: pagina === "agenda" && !!clinicaId }
  );

  const faturasQuery = trpc.aiAssistant.getFaturasRecommendations.useQuery(
    { clinicaId: clinicaId! },
    { enabled: pagina === "faturas" && !!clinicaId }
  );

  const procedimentosQuery = trpc.aiAssistant.getProcedimentosRecommendations.useQuery(
    { clinicaId: clinicaId! },
    { enabled: pagina === "procedimentos" && !!clinicaId }
  );

  const relatoriosQuery = trpc.aiAssistant.getRelatoriosRecommendations.useQuery(
    { clinicaId: clinicaId! },
    { enabled: pagina === "relatorios" && !!clinicaId }
  );

  useEffect(() => {
    // Determinar qual query usar baseado na página
    let currentQuery;
    switch (pagina) {
      case "dashboard":
        currentQuery = dashboardQuery;
        break;
      case "utentes":
        currentQuery = utentesQuery;
        break;
      case "agenda":
        currentQuery = agendaQuery;
        break;
      case "faturas":
        currentQuery = faturasQuery;
        break;
      case "procedimentos":
        currentQuery = procedimentosQuery;
        break;
      case "relatorios":
        currentQuery = relatoriosQuery;
        break;
      default:
        currentQuery = null;
    }

    if (currentQuery) {
      setLoading(currentQuery.isLoading);

      if (currentQuery.data) {
        setRecommendations(currentQuery.data.recommendations || []);
        setAlerts(currentQuery.data.alerts || []);
        setQuickTips(currentQuery.data.quickTips || []);
      }
    } else {
      // Fallback para dados de exemplo se não houver clinicaId
      loadFallbackData();
    }
  }, [
    pagina,
    clinicaId,
    dashboardQuery.data,
    utentesQuery.data,
    agendaQuery.data,
    faturasQuery.data,
    procedimentosQuery.data,
    relatoriosQuery.data,
  ]);

  const loadFallbackData = () => {
    setLoading(true);

    // Dados de exemplo baseados na página
    const exampleData: Record<string, any> = {
      dashboard: {
        recommendations: [
          "📅 Não há consultas agendadas para hoje. Considere contactar utentes para marcar consultas.",
          "💡 Dica: Use o calendário para visualizar a agenda semanal e otimizar horários.",
          "📊 Verifique os relatórios mensais para identificar procedimentos mais lucrativos.",
        ],
        quickTips: [
          "⌨️ Atalho: Ctrl+K para pesquisa rápida",
          "📊 Clique nos gráficos para ver detalhes",
          "🔄 Dados atualizados em tempo real",
        ],
        alerts: [
          {
            type: "info" as const,
            message: "🔒 Sistema conforme RGPD. Todos os acessos são auditados.",
          },
        ],
      },
      utentes: {
        recommendations: [
          "✅ Base de utentes estabelecida. Use os filtros para encontrar utentes rapidamente.",
          "📧 Considere enviar lembretes automáticos para utentes inativos há mais de 6 meses.",
          "💡 Dica: Mantenha os dados de contacto atualizados para melhor comunicação.",
        ],
        quickTips: [
          "⌨️ Atalho: Ctrl+N para novo utente",
          "🔍 Use filtros para pesquisa avançada",
          "📱 Clique no telemóvel para ligar diretamente",
        ],
      },
      agenda: {
        recommendations: [
          "💡 Dica: Use drag & drop para reorganizar consultas rapidamente.",
          "⏰ Configure lembretes automáticos 24h antes para reduzir faltas.",
          "📱 Envie confirmações por SMS/WhatsApp para melhor taxa de comparência.",
        ],
        quickTips: [
          "🖱️ Arraste consultas para reorganizar",
          "⌨️ Atalho: Ctrl+M para marcação rápida",
          "🎨 Clique com botão direito para mais opções",
        ],
      },
      faturas: {
        recommendations: [
          "💡 Dica: Configure pagamentos automáticos via Multibanco ou SEPA.",
          "📊 Faturas com QR Code AT-CUDE são obrigatórias em Portugal.",
          "🔄 Automatize a criação de faturas após cada consulta.",
        ],
        quickTips: [
          "⌨️ Atalho: Ctrl+F para nova fatura",
          "📧 Clique no email para enviar fatura",
          "💳 Registe pagamentos parciais",
        ],
      },
      procedimentos: {
        recommendations: [
          "💡 Dica: Organize procedimentos por categorias para facilitar a busca.",
          "💰 Mantenha os preços atualizados conforme tabela da OMD.",
          "📊 Analise quais procedimentos são mais realizados.",
        ],
        quickTips: [
          "⌨️ Atalho: Ctrl+P para novo procedimento",
          "📋 Duplique procedimentos similares",
          "💰 Atualize preços em lote",
        ],
      },
      relatorios: {
        recommendations: [
          "📊 Analise relatórios mensalmente para identificar tendências.",
          "💰 Compare receita mês a mês para avaliar crescimento.",
          "👥 Identifique utentes inativos e crie campanhas.",
        ],
        quickTips: [
          "📊 Exporte para Excel para análise",
          "📅 Compare períodos diferentes",
          "🖨️ Imprima relatórios formatados",
        ],
      },
    };

    const data = exampleData[pagina] || exampleData.dashboard;

    setRecommendations(data.recommendations || []);
    setQuickTips(data.quickTips || []);
    setAlerts(data.alerts || []);
    setLoading(false);
  };

  return {
    recommendations,
    alerts,
    quickTips,
    loading,
  };
}
