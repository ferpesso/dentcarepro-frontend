import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, Table as TableIcon, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Contabilidade() {
  const [clinicaId, setClinicaId] = useState<number | null>(null);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [trimestreSelecionado, setTrimestreSelecionado] = useState(1);

  const { data: clinicas } = trpc.clinicas.minhas.useQuery();

  useEffect(() => {
    if (clinicas && clinicas.length > 0 && !clinicaId) {
      setClinicaId(clinicas[0].clinica.id);
    }
  }, [clinicas, clinicaId]);

  // Relatorio IVA
  const { data: relatorioIVA, isLoading: loadingIVA } = trpc.contabilidade.relatorioIVA.useQuery(
    {
      clinicaId: clinicaId!,
      ano: anoSelecionado,
      trimestre: trimestreSelecionado,
    },
    { enabled: !!clinicaId }
  );

  // Resumo anual
  const { data: resumoAnual, isLoading: loadingResumo } = trpc.contabilidade.resumoAnual.useQuery(
    {
      clinicaId: clinicaId!,
      ano: anoSelecionado,
    },
    { enabled: !!clinicaId }
  );

  // Mutation para exportar SAF-T
  const exportarSAFT = trpc.contabilidade.exportarSAFT.useMutation({
    onSuccess: (data) => {
      // Download do arquivo XML
      const blob = new Blob([data.xml], { type: "application/xml" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("SAF-T PT exportado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao exportar SAF-T: " + error.message);
    },
  });

  const handleExportarSAFT = () => {
    if (!clinicaId) return;

    // Calcular datas do trimestre
    const mesInicio = (trimestreSelecionado - 1) * 3 + 1;
    const mesFim = trimestreSelecionado * 3;
    const dataInicio = new Date(anoSelecionado, mesInicio - 1, 1);
    const dataFim = new Date(anoSelecionado, mesFim, 0);

    exportarSAFT.mutate({
      clinicaId,
      dataInicio,
      dataFim,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  if (!clinicaId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Selecione uma clinica</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contabilidade</h1>
        <p className="text-muted-foreground mt-1">
          Relatorios e exportacoes para contabilistas
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Periodo</CardTitle>
          <CardDescription>Selecione o periodo para analise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Ano</Label>
              <Select
                value={anoSelecionado.toString()}
                onValueChange={(value) => setAnoSelecionado(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Trimestre</Label>
              <Select
                value={trimestreSelecionado.toString()}
                onValueChange={(value) => setTrimestreSelecionado(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1º Trimestre (Jan-Mar)</SelectItem>
                  <SelectItem value="2">2º Trimestre (Abr-Jun)</SelectItem>
                  <SelectItem value="3">3º Trimestre (Jul-Set)</SelectItem>
                  <SelectItem value="4">4º Trimestre (Out-Dez)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exportacoes */}
      <Card>
        <CardHeader>
          <CardTitle>Exportacoes</CardTitle>
          <CardDescription>Exporte dados para o contabilista</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleExportarSAFT}
              disabled={exportarSAFT.isPending}
              className="h-auto py-4"
            >
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-8 w-8" />
                <div>
                  <div className="font-semibold">Exportar SAF-T PT</div>
                  <div className="text-xs text-muted-foreground">
                    Formato XML para AT
                  </div>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto py-4">
              <div className="flex flex-col items-center gap-2">
                <TableIcon className="h-8 w-8" />
                <div>
                  <div className="font-semibold">Exportar Excel</div>
                  <div className="text-xs text-muted-foreground">
                    Listagem de faturas
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Relatorio IVA Trimestral */}
      {relatorioIVA && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Relatorio de IVA - {relatorioIVA.relatorio.periodo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Numero de Faturas</p>
                <p className="text-2xl font-bold">{relatorioIVA.relatorio.numeroFaturas}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Faturado</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(relatorioIVA.relatorio.totalFaturado)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pago</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(relatorioIVA.relatorio.totalPago)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">IVA Cobrado</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(relatorioIVA.relatorio.ivaCobrado)}
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                {relatorioIVA.relatorio.observacoes}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo Anual */}
      {resumoAnual && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumo Anual {anoSelecionado}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Totais Anuais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Faturas</p>
                <p className="text-2xl font-bold">{resumoAnual.totais.numeroFaturas}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Faturado</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(resumoAnual.totais.totalFaturado)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pago</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(resumoAnual.totais.totalPago)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">IVA Isento</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(resumoAnual.totais.ivaIsento)}
                </p>
              </div>
            </div>

            {/* Tabela por Trimestre */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trimestre</TableHead>
                    <TableHead className="text-right">Faturas</TableHead>
                    <TableHead className="text-right">Faturado</TableHead>
                    <TableHead className="text-right">Pago</TableHead>
                    <TableHead className="text-right">Taxa Pagamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resumoAnual.trimestres.map((t, index) => {
                    const taxaPagamento = t.totalFaturado > 0
                      ? (t.totalPago / t.totalFaturado) * 100
                      : 0;

                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{t.periodo}</TableCell>
                        <TableCell className="text-right">{t.numeroFaturas}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(t.totalFaturado)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(t.totalPago)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={taxaPagamento >= 80 ? "default" : "secondary"}
                          >
                            {taxaPagamento.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informacoes para Contabilista */}
      <Card>
        <CardHeader>
          <CardTitle>Informacoes para o Contabilista</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
              <p>
                <strong>Servicos Medicos:</strong> Isentos de IVA nos termos do artigo 9 do CIVA
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
              <p>
                <strong>SAF-T PT:</strong> Formato XML obrigatorio para comunicacao com a AT
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
              <p>
                <strong>Numeracao:</strong> Faturas com numeracao sequencial por serie
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
              <p>
                <strong>Retencao na Fonte:</strong> Nao aplicavel a servicos medicos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
