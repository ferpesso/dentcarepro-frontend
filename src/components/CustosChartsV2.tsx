import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Download, Calendar, TrendingDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface CustosChartsV2Props {
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

type Periodo = '7dias' | '30dias' | '3meses' | '6meses' | '1ano' | 'tudo';

export function CustosChartsV2({
  evolucaoMensal = [],
  distribuicaoPorCategoria = [],
  comparativoMensal = [],
}: CustosChartsV2Props) {
  
  const [periodo, setPeriodo] = useState<Periodo>('30dias');
  const evolucaoRef = useRef<HTMLDivElement>(null);
  const categoriaRef = useRef<HTMLDivElement>(null);
  const comparativoRef = useRef<HTMLDivElement>(null);

  // Dados de exemplo expandidos
  const todosOsDados = [
    { mes: 'Jul', total: 17500, fixos: 11000, variaveis: 6500 },
    { mes: 'Ago', total: 18200, fixos: 11500, variaveis: 6700 },
    { mes: 'Set', total: 19000, fixos: 11500, variaveis: 7500 },
    { mes: 'Out', total: 18500, fixos: 12000, variaveis: 6500 },
    { mes: 'Nov', total: 19200, fixos: 12000, variaveis: 7200 },
    { mes: 'Dez', total: 21000, fixos: 12500, variaveis: 8500 },
    { mes: 'Jan', total: 18800, fixos: 12500, variaveis: 6300 },
    { mes: 'Fev', total: 20000, fixos: 13000, variaveis: 7000 },
    { mes: 'Mar', total: 22500, fixos: 13000, variaveis: 9500 },
    { mes: 'Abr', total: 20100, fixos: 13500, variaveis: 6600 },
    { mes: 'Mai', total: 23000, fixos: 13500, variaveis: 9500 },
    { mes: 'Jun', total: 21500, fixos: 14000, variaveis: 7500 },
  ];

  const todosComparativo = [
    { mes: 'Jul', custos: 17500, receitas: 23000 },
    { mes: 'Ago', custos: 18200, receitas: 25000 },
    { mes: 'Set', custos: 19000, receitas: 26500 },
    { mes: 'Out', custos: 18500, receitas: 24000 },
    { mes: 'Nov', custos: 19200, receitas: 27500 },
    { mes: 'Dez', custos: 21000, receitas: 30000 },
    { mes: 'Jan', custos: 18800, receitas: 26000 },
    { mes: 'Fev', custos: 20000, receitas: 28000 },
    { mes: 'Mar', custos: 22500, receitas: 32000 },
    { mes: 'Abr', custos: 20100, receitas: 28500 },
    { mes: 'Mai', custos: 23000, receitas: 34000 },
    { mes: 'Jun', custos: 21500, receitas: 30500 },
  ];

  const evolucaoData = evolucaoMensal.length > 0 ? evolucaoMensal : todosOsDados;
  const comparativoData = comparativoMensal.length > 0 ? comparativoMensal : todosComparativo;

  // Filtrar dados por período
  const getFilteredData = (data: any[]) => {
    const mapeamento: Record<Periodo, number> = {
      '7dias': 1,
      '30dias': 1,
      '3meses': 3,
      '6meses': 6,
      '1ano': 12,
      'tudo': data.length,
    };
    
    const quantidade = mapeamento[periodo];
    return data.slice(-quantidade);
  };

  const dadosFiltrados = getFilteredData(evolucaoData);
  const comparativoFiltrado = getFilteredData(comparativoData);

  // Calcular comparação com período anterior
  const calcularComparacao = () => {
    if (dadosFiltrados.length < 2) return null;
    
    const atual = dadosFiltrados[dadosFiltrados.length - 1];
    const anterior = dadosFiltrados[dadosFiltrados.length - 2];
    
    const diferencaTotal = atual.total - anterior.total;
    const percentualTotal = ((diferencaTotal / anterior.total) * 100).toFixed(1);
    
    const diferencaFixos = atual.fixos - anterior.fixos;
    const percentualFixos = ((diferencaFixos / anterior.fixos) * 100).toFixed(1);
    
    const diferencaVariaveis = atual.variaveis - anterior.variaveis;
    const percentualVariaveis = ((diferencaVariaveis / anterior.variaveis) * 100).toFixed(1);
    
    return {
      total: { diferenca: diferencaTotal, percentual: percentualTotal },
      fixos: { diferenca: diferencaFixos, percentual: percentualFixos },
      variaveis: { diferenca: diferencaVariaveis, percentual: percentualVariaveis },
    };
  };

  const comparacao = calcularComparacao();

  // Calcular margem média
  const calcularMargem = () => {
    if (comparativoFiltrado.length === 0) return null;
    
    const totalCustos = comparativoFiltrado.reduce((acc, item) => acc + item.custos, 0);
    const totalReceitas = comparativoFiltrado.reduce((acc, item) => acc + item.receitas, 0);
    const margem = ((totalReceitas - totalCustos) / totalReceitas * 100).toFixed(1);
    
    return { margem, lucro: totalReceitas - totalCustos };
  };

  const margemData = calcularMargem();

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

  // Formatar valores em euros
  const formatEuro = (value: number) => `€${value.toLocaleString('pt-PT')}`;

  // Exportar gráfico como imagem
  const exportarComoImagem = async (ref: React.RefObject<HTMLDivElement>, nome: string) => {
    if (!ref.current) {
      toast.error("Erro ao exportar gráfico");
      return;
    }

    try {
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(ref.current, {
        backgroundColor: '#ffffff',
        scale: 2,
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
              Análise Financeira
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
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {comparacao && (
              <>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Variação Total</p>
                  <p className={`text-xl font-bold ${Number(comparacao.total.diferenca) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {Number(comparacao.total.diferenca) >= 0 ? '+' : ''}{formatEuro(comparacao.total.diferenca)} ({comparacao.total.percentual}%)
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Variação Fixos</p>
                  <p className={`text-xl font-bold ${Number(comparacao.fixos.diferenca) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {Number(comparacao.fixos.diferenca) >= 0 ? '+' : ''}{formatEuro(comparacao.fixos.diferenca)} ({comparacao.fixos.percentual}%)
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Variação Variáveis</p>
                  <p className={`text-xl font-bold ${Number(comparacao.variaveis.diferenca) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {Number(comparacao.variaveis.diferenca) >= 0 ? '+' : ''}{formatEuro(comparacao.variaveis.diferenca)} ({comparacao.variaveis.percentual}%)
                  </p>
                </div>
              </>
            )}
            {margemData && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Margem Média</p>
                <p className="text-xl font-bold text-green-600">
                  {margemData.margem}%
                </p>
                <p className="text-xs text-muted-foreground">Lucro: {formatEuro(margemData.lucro)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Evolução de Custos Mensal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Evolução de Custos Mensais
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportarComoImagem(evolucaoRef, 'evolucao-custos')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={evolucaoRef}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dadosFiltrados}>
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
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Por Categoria
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportarComoImagem(categoriaRef, 'distribuicao-categoria')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={categoriaRef}>
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
            </div>
          </CardContent>
        </Card>

        {/* Comparativo Custos vs Receitas */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Custos vs Receitas
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportarComoImagem(comparativoRef, 'custos-vs-receitas')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={comparativoRef}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparativoFiltrado}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={formatEuro} />
                  <Tooltip formatter={(value: number) => formatEuro(value)} />
                  <Legend />
                  <Bar dataKey="custos" fill="#ef4444" name="Custos" />
                  <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
