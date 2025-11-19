import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/badge-modern";
import { TableSkeleton } from "@/components/ui/skeleton-modern";
import { FileText, Plus, Search, Eye } from "lucide-react";
import { useLocation } from "wouter";
import { CriarFaturaDialog } from "@/components/CriarFaturaDialog";
import { AIAssistant, PageFooter } from "@/components/AIAssistant";
import { useAIAssistant } from "@/hooks/useAIAssistant";

export default function Faturas() {
  const [, setLocation] = useLocation();
  const [clinicaId, setClinicaId] = useState<number | null>(null);
  const [pesquisa, setPesquisa] = useState("");
  const [dialogCriarOpen, setDialogCriarOpen] = useState(false);
  
  // Assistente IA
  const { recommendations, alerts, quickTips, loading: loadingAI } = useAIAssistant("faturas", clinicaId || undefined);

  const { data: clinicas, isLoading: loadingClinicas } = trpc.clinicas.minhas.useQuery();

  const { data: faturas, isLoading: loadingFaturas } = trpc.faturas.listar.useQuery(
    { clinicaId: clinicaId! },
    { enabled: !!clinicaId }
  );

  useEffect(() => {
    if (clinicas && clinicas.length > 0 && !clinicaId) {
      setClinicaId(clinicas[0].clinica.id);
    }
  }, [clinicas, clinicaId]);

  const getEstadoBadge = (estado: string) => {
    const statusMap: Record<string, "completed" | "pending" | "cancelled" | "active"> = {
      paga: "completed",
      pendente: "pending",
      vencida: "pending",
      cancelada: "cancelled",
    };

    return (
      <StatusBadge 
        status={statusMap[estado] || "pending"}
        pulse={estado === "pendente"}
      />
    );
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(num);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-PT");
  };

  if (loadingClinicas) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Faturas</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center py-8">A carregar...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clinicas || clinicas.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Faturas</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center py-8">
              Nenhuma clínica encontrada. Crie uma clínica primeiro.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Faturas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie faturas e pagamentos
          </p>
        </div>
        <Button onClick={() => setDialogCriarOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Fatura
        </Button>
      </div>

      {/* Assistente IA */}
      {!loadingAI && (
        <AIAssistant
          recommendations={recommendations}
          alerts={alerts}
          quickTips={quickTips}
          showInsights={true}
        />
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por número, utente..."
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingFaturas ? (
            <TableSkeleton rows={7} />
          ) : !faturas || faturas.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma fatura encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {pesquisa
                  ? "Tente ajustar os filtros de pesquisa"
                  : "Crie a primeira fatura para começar"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Utente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faturas.map((fatura) => (
                  <TableRow key={fatura.fatura.id}>
                    <TableCell className="font-medium">{fatura.fatura.numeroFatura}</TableCell>
                    <TableCell>{fatura.utente.nome}</TableCell>
                    <TableCell>{formatDate(fatura.fatura.dataFatura)}</TableCell>
                    <TableCell>{fatura.fatura.dataVencimento ? formatDate(fatura.fatura.dataVencimento) : '-'}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(fatura.fatura.valorTotal)}
                    </TableCell>
                    <TableCell>{getEstadoBadge(fatura.fatura.estado)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocation(`/faturas/${fatura.fatura.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar Fatura */}
      {clinicaId && (
        <CriarFaturaDialog
          open={dialogCriarOpen}
          onOpenChange={setDialogCriarOpen}
          clinicaId={clinicaId}
        />
      )}

      {/* Rodapé com Recomendações */}
      <PageFooter
        recommendations={recommendations}
        stats={[
          { label: "Total Faturas", value: faturas?.length || 0 },
          { label: "Pagas", value: faturas?.filter(f => f.fatura.estado === 'paga').length || 0 },
          { label: "Pendentes", value: faturas?.filter(f => f.fatura.estado === 'pendente').length || 0 },
          { label: "Vencidas", value: faturas?.filter(f => f.fatura.estado === 'vencida').length || 0 },
        ]}
      />
    </div>
  );
}
