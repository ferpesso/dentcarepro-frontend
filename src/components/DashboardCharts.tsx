import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DashboardChartsProps {
  receitaMensal: Array<{ mes: string; valor: number }>;
  consultasPorMes: Array<{ mes: string; total: number }>;
  procedimentosMaisRealizados: Array<{ nome: string; quantidade: number }>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

export function DashboardCharts({
  receitaMensal,
  consultasPorMes,
  procedimentosMaisRealizados,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gráfico de Receita Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Receita Mensal (€)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={receitaMensal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat("pt-PT", {
                    style: "currency",
                    currency: "EUR",
                  }).format(value)
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="#8884d8"
                strokeWidth={2}
                name="Receita"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Consultas por Mês */}
      <Card>
        <CardHeader>
          <CardTitle>Consultas por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={consultasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#82ca9d" name="Consultas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Procedimentos Mais Realizados */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Procedimentos Mais Realizados</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={procedimentosMaisRealizados} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="nome" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantidade" fill="#8884d8" name="Quantidade">
                {procedimentosMaisRealizados.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
