import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Euro,
  Calendar,
  Users,
  TrendingUp,
  Heart,
  UserX,
  Star,
  PieChart,
  RefreshCw,
  Download,
  FileText,
} from 'lucide-react';
import { KPICard } from '@/components/bi/KPICard';
import { InsightCard } from '@/components/bi/InsightCard';
import { ReceitaChart } from '@/components/bi/ReceitaChart';
import { TableSkeleton } from '@/components/ui/skeleton-modern';

/**
 * Business Intelligence - Dashboard Executivo
 * 
 * Oferece uma visão estratégica e consolidada dos principais KPIs da clínica
 */
export default function BusinessIntelligence() {
  const [clinicaId, setClinicaId] = useState<number | null>(null);
  const [periodo, setPeriodo] = useState<'mes' | 'trimestre' | 'ano'>('mes');
  const [granularidade, setGranularidade] = useState<'diaria' | 'semanal' | 'mensal'>('mensal');

  // Buscar clínicas do utilizador
  const { data: clinicas } = trpc.clinicas.minhas.useQuery();

  // Buscar KPIs
  const { data: kpis, isLoading: loadingKPIs, refetch: refetchKPIs } = trpc.bi.kpis.useQuery(
    { clinicaId: clinicaId!, periodo },
    { enabled: !!clinicaId }
  );

  // Buscar evolução da receita
  const { data: evolucaoReceita, isLoading: loadingReceita } = trpc.bi.evolucaoReceita.useQuery(
    { clinicaId: clinicaId!, granularidade, meses: 6 },
    { enabled: !!clinicaId }
  );

  // Buscar procedimentos rentáveis
  const { data: procedimentosRentaveis, isLoading: loadingProcedimentos } = trpc.bi.procedimentosRentaveis.useQuery(
    { clinicaId: clinicaId!, limite: 5 },
    { enabled: !!clinicaId }
  );

  // Buscar insights de IA
  const { data: insights } = trpc.bi.insights.useQuery(
    { clinicaId: clinicaId! },
    { enabled: !!clinicaId }
  );

  // Definir clínica ativa
  useEffect(() => {
    if (clinicas && clinicas.length > 0 && !clinicaId) {
      setClinicaId(clinicas[0].clinica.id);
    }
  }, [clinicas, clinicaId]);

  const handleAtualizar = () => {
    refetchKPIs();
  };

  const handleExportar = () => {
    // TODO: Implementar exportação de relatório
    console.log('Exportar relatório');
  };

  if (!clinicaId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Selecione uma clínica</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Business Intelligence</h1>
          <p className="text-muted-foreground mt-1">
            Dashboard Executivo com insights estratégicos
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtro de Período */}
          <Select value={periodo} onValueChange={(v: any) => setPeriodo(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Mês Atual</SelectItem>
              <SelectItem value="trimestre">Trimestre Atual</SelectItem>
              <SelectItem value="ano">Ano Atual</SelectItem>
            </SelectContent>
          </Select>

          {/* Botão Atualizar */}
          <Button variant="outline" size="icon" onClick={handleAtualizar}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Botão Exportar */}
          <Button onClick={handleExportar}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div>
        <h2 className="text-xl font-semibold mb-4">KPIs Estratégicos</h2>
        {loadingKPIs ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <TableSkeleton rows={2} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              titulo="Receita Total"
              valor={kpis?.receitaTotal.valor || 0}
              variacao={kpis?.receitaTotal.variacao || 0}
              meta={kpis?.receitaTotal.meta}
              icone={Euro}
              cor="purple"
              formato="moeda"
            />

            <KPICard
              titulo="Consultas Realizadas"
              valor={kpis?.consultasRealizadas.valor || 0}
              variacao={kpis?.consultasRealizadas.variacao || 0}
              meta={kpis?.consultasRealizadas.meta}
              icone={Calendar}
              cor="blue"
            />

            <KPICard
              titulo="Novos Clientes"
              valor={kpis?.novosClientes.valor || 0}
              variacao={kpis?.novosClientes.variacao || 0}
              meta={kpis?.novosClientes.meta}
              icone={Users}
              cor="green"
            />

            <KPICard
              titulo="Ticket Médio"
              valor={kpis?.ticketMedio.valor || 0}
              variacao={kpis?.ticketMedio.variacao || 0}
              meta={kpis?.ticketMedio.meta}
              icone={TrendingUp}
              cor="orange"
              formato="moeda"
            />

            <KPICard
              titulo="Taxa de Retenção"
              valor={kpis?.taxaRetencao.valor || 0}
              variacao={kpis?.taxaRetencao.variacao || 0}
              meta={kpis?.taxaRetencao.meta}
              icone={Heart}
              cor="green"
              formato="percentual"
            />

            <KPICard
              titulo="Taxa No-Show"
              valor={kpis?.taxaNoShow.valor || 0}
              variacao={kpis?.taxaNoShow.variacao || 0}
              meta={kpis?.taxaNoShow.meta}
              icone={UserX}
              cor="orange"
              formato="percentual"
            />

            <KPICard
              titulo="Satisfação Cliente"
              valor={kpis?.satisfacaoCliente.valor || 0}
              variacao={kpis?.satisfacaoCliente.variacao || 0}
              meta={kpis?.satisfacaoCliente.meta}
              icone={Star}
              cor="purple"
              sufixo="/5"
            />

            <KPICard
              titulo="Margem de Lucro"
              valor={kpis?.margemLucro.valor || 0}
              variacao={kpis?.margemLucro.variacao || 0}
              meta={kpis?.margemLucro.meta}
              icone={PieChart}
              cor="blue"
              formato="percentual"
            />
          </div>
        )}
      </div>

      {/* Gráfico de Evolução da Receita */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Evolução da Receita</CardTitle>
            <Select value={granularidade} onValueChange={(v: any) => setGranularidade(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diaria">Diária</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loadingReceita ? (
            <TableSkeleton rows={6} />
          ) : evolucaoReceita && evolucaoReceita.length > 0 ? (
            <ReceitaChart dados={evolucaoReceita} granularidade={granularidade} />
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Sem dados suficientes para gerar o gráfico
            </p>
          )}
        </CardContent>
      </Card>

      {/* Procedimentos Mais Rentáveis */}
      <Card>
        <CardHeader>
          <CardTitle>Procedimentos Mais Rentáveis</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingProcedimentos ? (
            <TableSkeleton rows={5} />
          ) : procedimentosRentaveis && procedimentosRentaveis.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Procedimento
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Quantidade
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Receita
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Lucro
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Margem
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      €/Hora
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {procedimentosRentaveis.map((proc: any, index: number) => (
                    <tr
                      key={proc.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                            {index + 1}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {proc.nome}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                        {proc.quantidade}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('pt-PT', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(proc.receita)}
                      </td>
                      <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-semibold">
                        {new Intl.NumberFormat('pt-PT', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(proc.lucro)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {proc.margem}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                        {new Intl.NumberFormat('pt-PT', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(proc.euroPorHora)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhum procedimento encontrado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Insights Inteligentes */}
      {insights && insights.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Insights Inteligentes</h2>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Configurar Alertas
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => (
              <InsightCard
                key={insight.id}
                prioridade={insight.prioridade as any}
                tipo={insight.tipo as any}
                titulo={insight.titulo}
                descricao={insight.descricao}
                acaoSugerida={insight.acaoSugerida}
                link={insight.link}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
