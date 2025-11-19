import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, Receipt } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface HistoricoPagamentosProps {
  utenteId: number;
  clinicaId?: number;
}

const METODOS_PAGAMENTO: Record<string, string> = {
  dinheiro: "Dinheiro",
  multibanco: "Multibanco",
  mbway: "MB WAY",
  cartao: "Cartão",
  transferencia: "Transferência",
  cheque: "Cheque",
};

export function HistoricoPagamentos({ utenteId, clinicaId }: HistoricoPagamentosProps) {
  const { data: pagamentos, isLoading } = trpc.faturas.pagamentosUtente.useQuery({
    utenteId,
    clinicaId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Carregando pagamentos...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!pagamentos || pagamentos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum pagamento registrado
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalPago = pagamentos.reduce(
    (sum, pag) => sum + parseFloat(pag.valor.toString()),
    0
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Pago</p>
            <p className="text-2xl font-bold text-green-600">
              €{totalPago.toFixed(2)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pagamentos.map((pagamento) => (
            <div
              key={pagamento.id}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">
                      Fatura {pagamento.fatura?.numero || `#${pagamento.faturaId}`}
                    </p>
                    <Badge variant="outline">
                      {METODOS_PAGAMENTO[pagamento.metodoPagamento] || pagamento.metodoPagamento}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(pagamento.dataPagamento).toLocaleDateString("pt-PT")}
                    </span>
                    {pagamento.referencia && (
                      <span className="flex items-center gap-1">
                        <Receipt className="h-3 w-3" />
                        Ref: {pagamento.referencia}
                      </span>
                    )}
                  </div>
                  {pagamento.observacoes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {pagamento.observacoes}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-600">
                  €{parseFloat(pagamento.valor.toString()).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
