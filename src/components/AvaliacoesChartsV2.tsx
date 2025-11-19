import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Star, ThumbsUp, Download, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface AvaliacoesChartsV2Props {
  evolucaoMensal?: Array<{
    mes: string;
    total: number;
    media: number;
  }>;
  distribuicaoPorTipo?: Array<{
    tipo: string;
    quantidade: number;
  }>;
  distribuicaoPorClassificacao?: Array<{
    classificacao: number;
    quantidade: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

type Periodo = '7dias' | '30dias' | '3meses' | '6meses' | '1ano' | 'tudo';

export function AvaliacoesChartsV2({
  evolucaoMensal = [],
  distribuicaoPorTipo = [],
  distribuicaoPorClassificacao = [],
}: AvaliacoesChartsV2Props) {
  
  const [periodo, setPeriodo] = useState<Periodo>('30dias');
  const evolucaoRef = useRef<HTMLDivElement>(null);
  const tipoRef = useRef<HTMLDivElement>(null);
  const classificacaoRef = useRef<HTMLDivElement>(null);

  // Dados de exemplo expandidos
  const todosOsDados = [
    { mes: 'Jul', total: 10, media: 4.0 },
    { mes: 'Ago', total: 11, media: 4.1 },
    { mes: 'Set', total: 13, media: 4.2 },
    { mes: 'Out', total: 12, media: 4.2 },
    { mes: 'Nov', total: 15, media: 4.3 },
    { mes: 'Dez', total: 18, media: 4.1 },
    { mes: 'Jan', total: 14, media: 4.4 },
    { mes: 'Fev', total: 16, media: 4.5 },
    { mes: 'Mar', total: 20, media: 4.3 },
    { mes: 'Abr', total: 18, media: 4.4 },
    { mes: 'Mai', total: 22, media: 4.6 },
    { mes: 'Jun', total: 19, media: 4.5 },
  ];

  const evolucaoData = evolucaoMensal.length > 0 ? evolucaoMensal : todosOsDados;

  // Filtrar dados por período
  const getFilteredData = () => {
    const mapeamento: Record<Periodo, number> = {
      '7dias': 1,
      '30dias': 1,
      '3meses': 3,
      '6meses': 6,
      '1ano': 12,
      'tudo': todosOsDados.length,
    };
    
    const quantidade = mapeamento[periodo];
    return evolucaoData.slice(-quantidade);
  };

  const dadosFiltrados = getFilteredData();

  // Calcular comparação com período anterior
  const calcularComparacao = () => {
    if (dadosFiltrados.length < 2) return null;
    
    const atual = dadosFiltrados[dadosFiltrados.length - 1];
    const anterior = dadosFiltrados[dadosFiltrados.length - 2];
    
    const diferencaTotal = atual.total - anterior.total;
    const percentualTotal = ((diferencaTotal / anterior.total) * 100).toFixed(1);
    
    const diferencaMedia = atual.media - anterior.media;
    const percentualMedia = ((diferencaMedia / anterior.media) * 100).toFixed(1);
    
    return {
      total: { diferenca: diferencaTotal, percentual: percentualTotal },
      media: { diferenca: diferencaMedia.toFixed(1), percentual: percentualMedia },
    };
  };

  const comparacao = calcularComparacao();

  const tipoData = distribuicaoPorTipo.length > 0 ? distribuicaoPorTipo : [
    { tipo: 'Consulta', quantidade: 8 },
    { tipo: 'Dentista', quantidade: 6 },
    { tipo: 'Clínica', quantidade: 5 },
    { tipo: 'Procedimento', quantidade: 5 },
  ];

  const classificacaoData = distribuicaoPorClassificacao.length > 0 ? distribuicaoPorClassificacao : [
    { classificacao: 5, quantidade: 12 },
    { classificacao: 4, quantidade: 7 },
    { classificacao: 3, quantidade: 3 },
    { classificacao: 2, quantidade: 1 },
    { classificacao: 1, quantidade: 1 },
  ];

  // Exportar gráfico como imagem
  const exportarComoImagem = async (ref: React.RefObject<HTMLDivElement>, nome: string) => {
    if (!ref.current) {
      toast.error("Erro ao exportar gráfico");
      return;
    }

    try {
      // Importação dinâmica do html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(ref.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Melhor qualidade
      });
      
      const link = document.createElement('a');
      link.download = `${nome}-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success("Gráfico exportado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao exportar gráfico");
    }
  };

  return (
    <div className="space-y-4">
      {/* Controles */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Análise de Avaliações
            </CardTitle>
            <Select value={periodo} onValueChange={(v) => setPeriodo(v as Periodo)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                <SelectItem value="3meses">Últimos 3 meses</SelectItem>
                <SelectItem value="6meses">Últimos 6 meses</SelectItem>
                <SelectItem value="1ano">Último ano</SelectItem>
                <SelectItem value="tudo">Todo o período</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        {comparacao && (
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Variação Total</p>
                <p className={`text-2xl font-bold ${Number(comparacao.total.diferenca) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(comparacao.total.diferenca) >= 0 ? '+' : ''}{comparacao.total.diferenca} ({comparacao.total.percentual}%)
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Variação Média</p>
                <p className={`text-2xl font-bold ${Number(comparacao.media.diferenca) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(comparacao.media.diferenca) >= 0 ? '+' : ''}{comparacao.media.diferenca} ({comparacao.media.percentual}%)
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Evolução Mensal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Evolução de Avaliações
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportarComoImagem(evolucaoRef, 'evolucao-avaliacoes')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={evolucaoRef}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosFiltrados}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Total de Avaliações"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="media" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Média de Classificação"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Tipo */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Por Tipo
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportarComoImagem(tipoRef, 'distribuicao-tipo')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={tipoRef}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tipoData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ tipo, quantidade }) => `${tipo}: ${quantidade}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="quantidade"
                  >
                    {tipoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Classificação */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5" />
                Distribuição por Classificação
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportarComoImagem(classificacaoRef, 'distribuicao-classificacao')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={classificacaoRef}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classificacaoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="classificacao" 
                    label={{ value: 'Estrelas', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis label={{ value: 'Quantidade', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#f59e0b" name="Avaliações">
                    {classificacaoData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.classificacao >= 4 ? '#10b981' : entry.classificacao === 3 ? '#f59e0b' : '#ef4444'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
