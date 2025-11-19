import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  Target,
  Award,
  ArrowUp,
  ArrowDown,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";

export default function DashboardExecutivo() {
  const clinicaId = 1; // TODO: Obter da sessao
  
  // Periodo atual (ultimos 30 dias)
  const hoje = new Date();
  const dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const [periodo, setPeriodo] = useState({
    dataInicio: dataInicio.toISOString().split("T")[0],
    dataFim: hoje.toISOString().split("T")[0],
  });

  // Queries
  const { data: kpis, isLoading: loadingKPIs } = trpc.relatoriosAvancados.getKPIs.useQuery({
    clinicaId,
    dataInicio: periodo.dataInicio,
    dataFim: periodo.dataFim,
    compararComPeriodoAnterior: true,
  });

  const { data: rentabilidade } = trpc.relatoriosAvancados.getAnaliseRentabilidade.useQuery({
    clinicaId,
    dataInicio: periodo.dataInicio,
    dataFim: periodo.dataFim,
  });

  const { data: dentistas } = trpc.relatoriosAvancados.getAnaliseDentistas.useQuery({
    clinicaId,
    dataInicio: periodo.dataInicio,
    dataFim: periodo.dataFim,
  });

  const { data: previsao } = trpc.relatoriosAvancados.getPrevisaoFinanceira.useQuery({
    clinicaId,
    mesesFuturos: 3,
  });

  if (loadingKPIs) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            Dashboard Executivo
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise completa de performance e KPIs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Receita Total */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Receita Total
                </CardTitle>
                <DollarSign className="w-4 h-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{kpis.receitaTotal.toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
              </div>
              {kpis.crescimentoReceita !== 0 && (
                <div className={`flex items-center gap-1 text-sm mt-1 ${
                  kpis.crescimentoReceita > 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {kpis.crescimentoReceita > 0 ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  {Math.abs(kpis.crescimentoReceita).toFixed(1)}% vs período anterior
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-2">
                Pago: €{kpis.receitaPaga.toFixed(2)} | Pendente: €{kpis.receitaPendente.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          {/* Total Consultas */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Consultas
                </CardTitle>
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalConsultas}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Realizadas: {kpis.consultasRealizadas} | Canceladas: {kpis.consultasCanceladas}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={kpis.taxaComparecimento >= 80 ? "default" : "destructive"}>
                  {kpis.taxaComparecimento.toFixed(1)}% comparecimento
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Utentes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Utentes
                </CardTitle>
                <Users className="w-4 h-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalUtentes}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Novos: {kpis.utentesNovos} | Ativos: {kpis.utentesAtivos}
              </div>
              <div className="text-xs text-green-600 mt-2">
                +{kpis.utentesNovos} novos este período
              </div>
            </CardContent>
          </Card>

          {/* Ticket Médio */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ticket Médio
                </CardTitle>
                <Target className="w-4 h-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{kpis.ticketMedio.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Por consulta: €{kpis.receitaPorConsulta.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {kpis.consultasPorDia.toFixed(1)} consultas/dia
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs de Análises */}
      <Tabs defaultValue="rentabilidade" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rentabilidade">
            <PieChart className="w-4 h-4 mr-2" />
            Rentabilidade
          </TabsTrigger>
          <TabsTrigger value="dentistas">
            <Award className="w-4 h-4 mr-2" />
            Performance Dentistas
          </TabsTrigger>
          <TabsTrigger value="previsao">
            <LineChart className="w-4 h-4 mr-2" />
            Previsão Financeira
          </TabsTrigger>
        </TabsList>

        {/* Tab: Rentabilidade */}
        <TabsContent value="rentabilidade">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Rentabilidade por Procedimento</CardTitle>
              <CardDescription>
                Procedimentos mais lucrativos do período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rentabilidade && rentabilidade.length > 0 ? (
                  rentabilidade.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className="font-medium">{item.procedimento}</p>
                            <p className="text-sm text-muted-foreground">{item.categoria}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              €{item.receitaTotal.toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantidade} × €{item.receitaMedia.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${item.percentualReceita}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {item.percentualReceita.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        {item.tendencia === "subindo" && (
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        )}
                        {item.tendencia === "descendo" && (
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum dado de rentabilidade disponível
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Dentistas */}
        <TabsContent value="dentistas">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Dentista</CardTitle>
              <CardDescription>
                Ranking de dentistas por receita gerada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dentistas && dentistas.length > 0 ? (
                  dentistas.map((dentista) => (
                    <div key={dentista.dentistaId} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            #{dentista.ranking}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-bold text-lg">{dentista.dentistaNome}</p>
                            <p className="text-sm text-muted-foreground">
                              {dentista.totalConsultas} consultas
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl text-green-600">
                              €{dentista.receitaGerada.toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Ticket: €{dentista.ticketMedio.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Comparecimento:</span>
                            <Badge 
                              variant={dentista.taxaComparecimento >= 80 ? "default" : "destructive"}
                              className="ml-2"
                            >
                              {dentista.taxaComparecimento.toFixed(1)}%
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avaliação:</span>
                            <span className="ml-2 font-medium">
                              ⭐ {dentista.avaliacaoMedia.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum dado de dentistas disponível
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Previsão */}
        <TabsContent value="previsao">
          <Card>
            <CardHeader>
              <CardTitle>Previsão Financeira</CardTitle>
              <CardDescription>
                Projeção de receita baseada em histórico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {previsao && previsao.length > 0 ? (
                  previsao.map((prev, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-lg capitalize">{prev.mes}</p>
                          <p className="text-sm text-muted-foreground">
                            Confiança: {prev.confianca}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl text-blue-600">
                            €{prev.receitaPrevista.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">Previsto</p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${prev.confianca}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Dados insuficientes para previsão
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
