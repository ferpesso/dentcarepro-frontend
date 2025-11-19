import { useLocation } from "wouter";

import { trpc } from "../lib/trpc";
import { descarregarPDFFatura, imprimirPDFFatura } from "../lib/pdf-generator";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { ArrowLeft, Printer, Send, CreditCard, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface FaturaDetalhesProps {
  faturaId: number;
}

export default function FaturaDetalhes({ faturaId }: FaturaDetalhesProps) {
  const [, setLocation] = useLocation();
  const [dialogPagamento, setDialogPagamento] = useState(false);
  const [dialogEnviar, setDialogEnviar] = useState(false);

  // Estado do formulário de pagamento
  const [pagamento, setPagamento] = useState({
    valor: "",
    metodoPagamento: "dinheiro" as const,
    referencia: "",
    observacoes: "",
  });

  // Buscar clínicas do utilizador
  const [clinicaId, setClinicaId] = useState<number | null>(null);
  const { data: clinicas } = trpc.clinicas.minhas.useQuery();

  useEffect(() => {
    if (clinicas && clinicas.length > 0 && !clinicaId) {
      setClinicaId(clinicas[0].clinica.id);
    }
  }, [clinicas, clinicaId]);

  // Carregar fatura
  const { data: fatura, isLoading } = trpc.faturas.porId.useQuery(
    { faturaId, clinicaId: clinicaId! },
    { enabled: !!clinicaId }
  );

  // Mutation para registrar pagamento
  const utils = trpc.useUtils();
  const registrarPagamentoMutation = trpc.faturas.registrarPagamento.useMutation({
    onSuccess: () => {
      toast.success("Pagamento registrado com sucesso!");
      utils.faturas.porId.invalidate({ faturaId, clinicaId: clinicaId! });
      setDialogPagamento(false);
      setPagamento({
        valor: "",
        metodoPagamento: "dinheiro",
        referencia: "",
        observacoes: "",
      });
    },
    onError: (error) => {
      toast.error("Erro ao registrar pagamento: " + error.message);
    },
  });

  // Handler para registrar pagamento
  const handleRegistrarPagamento = () => {
    if (!pagamento.valor || parseFloat(pagamento.valor) <= 0) {
      toast.error("Por favor, insira um valor válido");
      return;
    }

    registrarPagamentoMutation.mutate({
      faturaId,
      clinicaId: clinicaId!,
      valor: pagamento.valor,
      metodoPagamento: pagamento.metodoPagamento,
      dataPagamento: new Date(),
      referencia: pagamento.referencia || undefined,
      observacoes: pagamento.observacoes || undefined,
    });
  };

  // Formatar moeda
  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(num);
  };

  // Formatar data
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-PT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Badge de estado
  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      rascunho: { variant: "outline", label: "Rascunho" },
      enviada: { variant: "default", label: "Enviada" },
      paga: { variant: "success", label: "Paga" },
      parcialmente_paga: { variant: "warning", label: "Parcialmente Paga" },
      vencida: { variant: "destructive", label: "Vencida" },
      cancelada: { variant: "secondary", label: "Cancelada" },
    };
    const config = variants[estado] || variants.rascunho;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Imprimir fatura
  const handleImprimir = () => {
    if (!fatura) return;
    
    // Buscar dados da clínica
    const clinicaData = {
      nome: "Clínica Exemplo", // TODO: Buscar da API
      email: "clinica@exemplo.pt",
      telemovel: "+351 912 345 678",
      morada: "Rua Exemplo, 123",
      cidade: "Lisboa",
      codigoPostal: "1000-000",
      nif: "123456789",
    };
    
    try {
      imprimirPDFFatura(fatura, clinicaData);
      toast.success("Fatura enviada para impressão");
    } catch (error) {
      toast.error("Erro ao imprimir fatura");
    }
  };

  // Exportar PDF
  const handleExportarPDF = async () => {
    if (!fatura) return;
    
    // Buscar dados da clínica
    const clinicaData = {
      nome: "Clínica Exemplo", // TODO: Buscar da API
      email: "clinica@exemplo.pt",
      telemovel: "+351 912 345 678",
      morada: "Rua Exemplo, 123",
      cidade: "Lisboa",
      codigoPostal: "1000-000",
      nif: "123456789",
    };
    
    try {
      descarregarPDFFatura(fatura, clinicaData);
      toast.success("PDF descarregado com sucesso");
    } catch (error) {
      toast.error("Erro ao gerar PDF");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">A carregar fatura...</p>
        </div>
      </div>
    );
  }

  if (!fatura) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg font-semibold">Fatura não encontrada</p>
          <Button onClick={() => setLocation("/faturas")} className="mt-4">
            Voltar às faturas
          </Button>
        </div>
      </div>
    );
  }

  const valorEmDivida = parseFloat(fatura.fatura.valorTotal) - parseFloat(fatura.fatura.valorPago);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/faturas")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{fatura.fatura.numeroFatura}</h1>
            <p className="text-muted-foreground">Detalhes da fatura</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImprimir}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={handleExportarPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          {valorEmDivida > 0 && (
            <Button onClick={() => setDialogPagamento(true)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Registrar Pagamento
            </Button>
          )}
        </div>
      </div>

      {/* Informação da Fatura */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informação da Fatura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              {getEstadoBadge(fatura.fatura.estado)}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data de Emissão:</span>
              <span className="font-medium">{formatDate(fatura.fatura.dataFatura)}</span>
            </div>
            {fatura.fatura.dataVencimento && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data de Vencimento:</span>
                <span className="font-medium">{formatDate(fatura.fatura.dataVencimento)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informação do Utente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{fatura.utente?.nome || "N/A"}</p>
            </div>
            {fatura.utente?.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{fatura.utente.email}</p>
              </div>
            )}
            {fatura.utente?.telemovel && (
              <div>
                <p className="text-sm text-muted-foreground">Telemóvel</p>
                <p className="font-medium">{fatura.utente.telemovel}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Itens da Fatura */}
      <Card>
        <CardHeader>
          <CardTitle>Itens da Fatura</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                <TableHead className="text-right">Preço Unitário</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fatura.itens?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.descricao}</TableCell>
                  <TableCell className="text-center">{item.quantidade}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.precoUnitario)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.precoTotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          {/* Totais */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">{formatCurrency(fatura.fatura.subtotal)}</span>
            </div>
            {parseFloat(fatura.fatura.valorDesconto) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto:</span>
                <span className="font-medium">
                  -{formatCurrency(fatura.fatura.valorDesconto)}
                </span>
              </div>
            )}
            {parseFloat(fatura.fatura.valorIVA) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  IVA ({fatura.fatura.percentagemIVA}%):
                </span>
                <span className="font-medium">{formatCurrency(fatura.fatura.valorIVA)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total:</span>
              <span className="font-bold">{formatCurrency(fatura.fatura.valorTotal)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span className="font-semibold">Pago:</span>
              <span className="font-bold">{formatCurrency(fatura.fatura.valorPago)}</span>
            </div>
            {valorEmDivida > 0 && (
              <div className="flex justify-between text-red-600">
                <span className="font-semibold">Em Dívida:</span>
                <span className="font-bold">{formatCurrency(valorEmDivida)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Pagamentos */}
      {fatura.pagamentos && fatura.pagamentos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Referência</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fatura.pagamentos.map((pag: any) => (
                  <TableRow key={pag.id}>
                    <TableCell>{formatDate(pag.dataPagamento)}</TableCell>
                    <TableCell className="capitalize">
                      {pag.metodoPagamento.replace("_", " ")}
                    </TableCell>
                    <TableCell>{pag.referencia || "-"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(pag.valor)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Observações */}
      {fatura.fatura.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{fatura.fatura.observacoes}</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Registrar Pagamento */}
      <Dialog open={dialogPagamento} onOpenChange={setDialogPagamento}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Registre um pagamento para a fatura {fatura.fatura.numeroFatura}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor do Pagamento *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={pagamento.valor}
                onChange={(e) => setPagamento({ ...pagamento, valor: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Valor em dívida: {formatCurrency(valorEmDivida)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metodoPagamento">Método de Pagamento *</Label>
              <Select
                value={pagamento.metodoPagamento}
                onValueChange={(value: any) =>
                  setPagamento({ ...pagamento, metodoPagamento: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="multibanco">Multibanco</SelectItem>
                  <SelectItem value="mbway">MB Way</SelectItem>
                  <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                  <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="referencia">Referência</Label>
              <Input
                id="referencia"
                placeholder="Número de referência ou transação"
                value={pagamento.referencia}
                onChange={(e) => setPagamento({ ...pagamento, referencia: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações adicionais sobre o pagamento"
                value={pagamento.observacoes}
                onChange={(e) => setPagamento({ ...pagamento, observacoes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogPagamento(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleRegistrarPagamento}
              disabled={registrarPagamentoMutation.isPending}
            >
              {registrarPagamentoMutation.isPending ? "A registrar..." : "Registrar Pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
