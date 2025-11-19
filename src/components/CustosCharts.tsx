import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from "lucide-react";

interface CustosChartsProps {
  evolucaoMensal?: Array<{
    mes: string;
    total: number;
    fixos: number;
    variaveis: number;
  }>;
  distribuicaoPorCategoria?: Array<{
    categoria: string;
    valor: number;
  }>;
  comparativoMensal?: Array<{
    mes: string;
    custos: number;
    receitas: number;
  }>;
}

const COLORS = {
  fixo: '#3b82f6',
  variavel: '#8b5cf6',
  material: '#10b981',
  equipamento: '#f59e0b',
  pessoal: '#ef4444',
  marketing: '#ec4899',
  administrativo: '#6b7280',
  infraestrutura: '#eab308',
  formacao: '#6366f1',
  outro: '#64748b',
};

export function CustosCharts({
  evolucaoMensal = [],
  distribuicaoPorCategoria = [],
  comparativoMensal = [],
}: CustosChartsProps) {
  
  // Dados de exemplo se não houver dados
  const evolucaoData = evolucaoMensal.length > 0 ? evolucaoMensal : [
    { mes: 'Jan', total: 18500, fixos: 12000, variaveis: 6500 },
    { mes: 'Fev', total: 19200, fixos: 12000, variaveis: 7200 },
    { mes: 'Mar', total: 21000, fixos: 12500, variaveis: 8500 },
    { mes: 'Abr', total: 18800, fixos: 12500, variaveis: 6300 },
    { mes: 'Mai', total: 22500, fixos: 13000, variaveis: 9500 },
    { mes: 'Jun', total: 20100, fixos: 13000, variaveis: 7100 },
  ];

  const categoriaData = distribuicaoPorCategoria.length > 0 ? distribuicaoPorCategoria : [
    { categoria: 'Pessoal', valor: 7900 },
    { categoria: 'Fixo', valor: 5000 },
    { categoria: 'Material', valor: 880 },
    { categoria: 'Equipamento', valor: 4850 },
    { categoria: 'Marketing', valor: 500 },
    { categoria: 'Administrativo', valor: 1450 },
    { categoria: 'Infraestrutura', valor: 310 },
    { categoria: 'Formação', valor: 800 },
    { categoria: 'Variável', valor: 830 },
  ];

  const comparativoData = comparativoMensal.length > 0 ? comparativoMensal : [
    { mes: 'Jan', custos: 18500, receitas: 25000 },
    { mes: 'Fev', custos: 19200, receitas: 27500 },
    { mes: 'Mar', custos: 21000, receitas: 30000 },
    { mes: 'Abr', custos: 18800, receitas: 26000 },
    { mes: 'Mai', custos: 22500, receitas: 32000 },
    { mes: 'Jun', custos: 20100, receitas: 28500 },
  ];

  // Formatar valores em euros
  const formatEuro = (value: number) => `€${value.toLocaleString('pt-PT')}`;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Evolução de Custos Mensal */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução de Custos Mensais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={evolucaoData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFixos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorVariaveis" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={formatEuro} />
              <Tooltip formatter={(value: number) => formatEuro(value)} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorTotal)"
                name="Total"
              />
              <Area 
                type="monotone" 
                dataKey="fixos" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorFixos)"
                name="Custos Fixos"
              />
              <Area 
                type="monotone" 
                dataKey="variaveis" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorVariaveis)"
                name="Custos Variáveis"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribuição por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoriaData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ categoria, valor }) => `${categoria}: €${valor}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="valor"
              >
                {categoriaData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.categoria.toLowerCase() as keyof typeof COLORS] || COLORS.outro} 
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatEuro(value)} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Comparativo Custos vs Receitas */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Custos vs Receitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparativoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={formatEuro} />
              <Tooltip formatter={(value: number) => formatEuro(value)} />
              <Legend />
              <Bar dataKey="custos" fill="#ef4444" name="Custos" />
              <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
