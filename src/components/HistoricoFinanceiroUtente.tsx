import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Euro, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";

interface HistoricoFinanceiroProps {
  utenteId: number;
  resumo: {
    totalFaturado: number;
    totalPago: number;
    totalPendente: number;
    numeroFaturas: number;
    faturasVencidas: number;
  };
  faturas: Array<{
    id: number;
    numeroFatura: string;
    dataFatura: Date;
    valorTotal: number;
    valorPago: number;
    estado: string;
    pagamentos?: Array<{
      id: number;
      valor: number;
      metodoPagamento: string;
      dataPagamento: Date;
      referencia?: string;
    }>;
  }>;
}

/**
 * Componente de Historico Financeiro do Utente
 * 
 * Mostra:
 * - Resumo financeiro (total faturado, pago, pendente)
 * - Lista de faturas
 * - Historico de pagamentos
 * - Alertas de faturas vencidas
 */
export function HistoricoFinanceiroUtente({ utenteId, resumo, faturas }: HistoricoFinanceiroProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-PT");
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paga: "default",
      parcialmente_paga: "secondary",
      enviada: "outline",
      vencida: "destructive",
      cancelada: "outline",
    };

    const labels: Record<string, string> = {
      paga: "Paga",
      parcialmente_paga: "Parcialmente Paga",
      enviada: "Enviada",
      vencida: "Vencida",
      cancelada: "Cancelada",
      rascunho: "Rascunho",
    };

    return (
      <Badge variant={variants[estado] || "outline"}>
        {labels[estado] || estado}
      </Badge>
    );
  };

  const getMetodoPagamentoBadge = (metodo: string) => {
    const labels: Record<string, string> = {
      dinheiro: "Dinheiro",
      cartao: "Cartao",
      transferencia: "Transferencia",
      mbway: "MB WAY",
      multibanco: "Multibanco",
      outro: "Outro",
    };

    return (
      <Badge variant="outline">
        {labels[metodo] || metodo}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Faturado</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(resumo.totalFaturado)}
                </p>
              </div>
              <Euro className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pago</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(resumo.totalPago)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(resumo.totalPendente)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturas</p>
                <p className="text-2xl font-bold">{resumo.numeroFaturas}</p>
                {resumo.faturasVencidas > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {resumo.faturasVencidas} vencida(s)
                  </p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de Faturas Vencidas */}
      {resumo.faturasVencidas > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">
                  {resumo.faturasVencidas} fatura(s) vencida(s)
                </p>
                <p className="text-sm text-red-700">
                  Entre em contacto com o utente para regularizar a situacao.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Faturas e Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Historico de Faturas e Pagamentos</CardTitle>
          <CardDescription>
            Todas as faturas e pagamentos registados para este utente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {faturas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma fatura encontrada para este utente
            </div>
          ) : (
            <div className="space-y-4">
              {faturas.map((fatura) => (
                <div key={fatura.id} className="border rounded-lg p-4">
                  {/* Cabecalho da Fatura */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">{fatura.numeroFatura}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(fatura.dataFatura)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatCurrency(fatura.valorTotal)}
                      </p>
                      {getEstadoBadge(fatura.estado)}
                    </div>
                  </div>

                  {/* Barra de Progresso de Pagamento */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Pago:</span>
                      <span className="font-medium">
                        {formatCurrency(fatura.valorPago)} / {formatCurrency(fatura.valorTotal)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((fatura.valorPago / fatura.valorTotal) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Lista de Pagamentos */}
                  {fatura.pagamentos && fatura.pagamentos.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium mb-2">Pagamentos:</p>
                      <div className="space-y-2">
                        {fatura.pagamentos.map((pagamento) => (
                          <div
                            key={pagamento.id}
                            className="flex items-center justify-between text-sm bg-green-50 p-2 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>{formatDate(pagamento.dataPagamento)}</span>
                              {getMetodoPagamentoBadge(pagamento.metodoPagamento)}
                              {pagamento.referencia && (
                                <span className="text-muted-foreground">
                                  Ref: {pagamento.referencia}
                                </span>
                              )}
                            </div>
                            <span className="font-semibold text-green-700">
                              {formatCurrency(pagamento.valor)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
