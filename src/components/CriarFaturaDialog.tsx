import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface CriarFaturaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicaId: number;
  utenteId?: number;
  consultaId?: number;
}

interface ItemFatura {
  procedimentoId?: number;
  descricao: string;
  quantidade: number;
  precoUnitario: string;
}

export function CriarFaturaDialog({
  open,
  onOpenChange,
  clinicaId,
  utenteId: utenteIdProp,
  consultaId: consultaIdProp,
}: CriarFaturaDialogProps) {
  const utils = trpc.useUtils();

  const [utenteId, setUtenteId] = useState<string>(utenteIdProp?.toString() || "");
  const [consultaId, setConsultaId] = useState<string>(consultaIdProp?.toString() || "");
  const [dataFatura, setDataFatura] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dataVencimento, setDataVencimento] = useState("");
  const [percentagemIVA, setPercentagemIVA] = useState("23");
  const [valorDesconto, setValorDesconto] = useState("0");
  const [observacoes, setObservacoes] = useState("");
  const [itens, setItens] = useState<ItemFatura[]>([
    { descricao: "", quantidade: 1, precoUnitario: "0" },
  ]);

  // Buscar dados necessários
  const { data: utentes } = trpc.utentes.listar.useQuery(
    { clinicaId, pesquisa: "" },
    { enabled: open }
  );

  const { data: procedimentos } = trpc.procedimentos.listar.useQuery(
    { clinicaId },
    { enabled: open }
  );

  const criarFatura = trpc.faturas.criar.useMutation({
    onSuccess: (data) => {
      toast.success(`Fatura ${data.numeroFatura} criada com sucesso!`);
      utils.faturas.listar.invalidate();
      utils.dashboard.stats.invalidate();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar fatura: " + error.message);
    },
  });

  const resetForm = () => {
    setUtenteId("");
    setConsultaId("");
    setDataFatura(new Date().toISOString().split("T")[0]);
    setDataVencimento("");
    setPercentagemIVA("23");
    setValorDesconto("0");
    setObservacoes("");
    setItens([{ descricao: "", quantidade: 1, precoUnitario: "0" }]);
  };

  const adicionarItem = () => {
    setItens([...itens, { descricao: "", quantidade: 1, precoUnitario: "0" }]);
  };

  const removerItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index));
    }
  };

  const atualizarItem = (index: number, campo: keyof ItemFatura, valor: any) => {
    const novosItens = [...itens];
    novosItens[index] = { ...novosItens[index], [campo]: valor };
    setItens(novosItens);
  };

  const selecionarProcedimento = (index: number, procedimentoId: string) => {
    const proc = procedimentos?.find(
      (p) => p.procedimento.id === parseInt(procedimentoId)
    );
    if (proc) {
      atualizarItem(index, "procedimentoId", proc.procedimento.id);
      atualizarItem(index, "descricao", proc.procedimento.nome);
      atualizarItem(index, "precoUnitario", proc.procedimento.precoBase);
    }
  };

  const calcularSubtotal = () => {
    return itens.reduce((acc, item) => {
      return acc + parseFloat(item.precoUnitario || "0") * item.quantidade;
    }, 0);
  };

  const calcularIVA = () => {
    return calcularSubtotal() * (parseFloat(percentagemIVA) / 100);
  };

  const calcularTotal = () => {
    return calcularSubtotal() + calcularIVA() - parseFloat(valorDesconto || "0");
  };

  const handleSubmit = () => {
    if (!utenteId) {
      toast.error("Selecione um utente");
      return;
    }

    if (itens.length === 0 || !itens[0].descricao) {
      toast.error("Adicione pelo menos um item à fatura");
      return;
    }

    criarFatura.mutate({
      clinicaId,
      utenteId: parseInt(utenteId),
      consultaId: consultaId ? parseInt(consultaId) : undefined,
      dataFatura: new Date(dataFatura),
      dataVencimento: dataVencimento ? new Date(dataVencimento) : undefined,
      percentagemIVA,
      valorDesconto,
      observacoes,
      itens: itens.map((item) => ({
        procedimentoId: item.procedimentoId,
        descricao: item.descricao,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
      })),
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Fatura</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar uma nova fatura
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="utente">Utente *</Label>
              <Select value={utenteId} onValueChange={setUtenteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o utente" />
                </SelectTrigger>
                <SelectContent>
                  {utentes?.map((utente: any) => (
                    <SelectItem key={utente.id} value={utente.id.toString()}>
                      {utente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFatura">Data da Fatura *</Label>
              <Input
                id="dataFatura"
                type="date"
                value={dataFatura}
                onChange={(e) => setDataFatura(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataVencimento">Data de Vencimento</Label>
              <Input
                id="dataVencimento"
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentagemIVA">IVA (%)</Label>
              <Input
                id="percentagemIVA"
                type="number"
                step="0.01"
                value={percentagemIVA}
                onChange={(e) => setPercentagemIVA(e.target.value)}
              />
            </div>
          </div>

          {/* Itens da Fatura */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Itens da Fatura *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={adicionarItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Descrição</TableHead>
                    <TableHead className="w-[100px]">Qtd</TableHead>
                    <TableHead className="w-[150px]">Preço Unit.</TableHead>
                    <TableHead className="w-[150px]">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itens.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="space-y-2">
                          <Select
                            value={item.procedimentoId?.toString() || ""}
                            onValueChange={(value) =>
                              selecionarProcedimento(index, value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar procedimento" />
                            </SelectTrigger>
                            <SelectContent>
                              {procedimentos?.map((proc) => (
                                <SelectItem
                                  key={proc.procedimento.id}
                                  value={proc.procedimento.id.toString()}
                                >
                                  {proc.procedimento.nome} -{" "}
                                  {formatCurrency(
                                    parseFloat(proc.procedimento.precoBase)
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Ou digite a descrição"
                            value={item.descricao}
                            onChange={(e) =>
                              atualizarItem(index, "descricao", e.target.value)
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) =>
                            atualizarItem(
                              index,
                              "quantidade",
                              parseInt(e.target.value) || 1
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.precoUnitario}
                          onChange={(e) =>
                            atualizarItem(
                              index,
                              "precoUnitario",
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          parseFloat(item.precoUnitario || "0") * item.quantidade
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removerItem(index)}
                          disabled={itens.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Totais */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">
                {formatCurrency(calcularSubtotal())}
              </span>
            </div>
            <div className="flex justify-between">
              <span>IVA ({percentagemIVA}%):</span>
              <span className="font-semibold">
                {formatCurrency(calcularIVA())}
              </span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="valorDesconto">Desconto</Label>
              <Input
                id="valorDesconto"
                type="number"
                step="0.01"
                value={valorDesconto}
                onChange={(e) => setValorDesconto(e.target.value)}
              />
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span>{formatCurrency(calcularTotal())}</span>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={criarFatura.isPending}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={criarFatura.isPending}>
            {criarFatura.isPending ? "A criar..." : "Criar Fatura"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
