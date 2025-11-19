import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Star, ThumbsUp } from "lucide-react";

interface AvaliacoesChartsProps {
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

export function AvaliacoesCharts({
  evolucaoMensal = [],
  distribuicaoPorTipo = [],
  distribuicaoPorClassificacao = [],
}: AvaliacoesChartsProps) {
  
  // Dados de exemplo se não houver dados
  const evolucaoData = evolucaoMensal.length > 0 ? evolucaoMensal : [
    { mes: 'Jan', total: 12, media: 4.2 },
    { mes: 'Fev', total: 15, media: 4.3 },
    { mes: 'Mar', total: 18, media: 4.1 },
    { mes: 'Abr', total: 14, media: 4.4 },
    { mes: 'Mai', total: 20, media: 4.5 },
    { mes: 'Jun', total: 16, media: 4.3 },
  ];

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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Evolução Mensal */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução de Avaliações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolucaoData}>
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
        </CardContent>
      </Card>

      {/* Distribuição por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Distribuição por Classificação */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5" />
            Distribuição por Classificação
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
