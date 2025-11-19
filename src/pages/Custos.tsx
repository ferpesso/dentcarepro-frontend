import { trpc } from "@/lib/trpc";
import { CustosChartsV2 } from "@/components/CustosChartsV2";
import { exportarCustosPDF } from "@/lib/pdf-export";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Euro, TrendingDown, AlertTriangle, PieChart, Plus, Filter, FileDown } from "lucide-react";
import { StatCard } from "@/components/ui/card-modern";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

/**
 * Página de Custos
 * 
 * Gestão de custos operacionais e financeiros
 */
export default function Custos() {
  const [clinicaId, setClinicaId] = useState<number | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [filtroPago, setFiltroPago] = useState<boolean | undefined>(undefined);
  const [dialogAberto, setDialogAberto] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    categoria: "material",
    descricao: "",
    fornecedor: "",
    valor: "",
    data_custo: new Date().toISOString().split("T")[0],
    pago: false,
    observacoes: "",
  });

  // Buscar clínicas do utilizador
  const { data: clinicas, isLoading: loadingClinicas } = trpc.clinicas.minhas.useQuery();

  // Buscar custos
  const { data: custos, isLoading: loadingCustos, refetch } = trpc.custos.listar.useQuery(
    {
      categoria: filtroCategoria === "todos" ? undefined : filtroCategoria as any,
      pago: filtroPago,
      limit: 50,
      offset: 0,
    },
    { enabled: !!clinicaId }
  );

  // Buscar resumo financeiro
  const { data: resumo } = trpc.custos.resumo.useQuery(
    {
      periodo_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      periodo_fim: new Date().toISOString(),
    },
    { enabled: !!clinicaId }
  );

  // Mutation para criar custo
  const criarMutation = trpc.custos.criar.useMutation({
    onSuccess: () => {
      toast.success("Custo registado com sucesso!");
      setDialogAberto(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao registar custo: " + error.message);
    },
  });

  // Mutation para marcar como pago
  const pagarMutation = trpc.custos.marcarPago.useMutation({
    onSuccess: () => {
      toast.success("Custo marcado como pago!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  // Definir clínica ativa
  useEffect(() => {
    if (clinicas && clinicas.length > 0 && !clinicaId) {
      setClinicaId(clinicas[0].clinica.id);
    }
  }, [clinicas, clinicaId]);

  const resetForm = () => {
    setFormData({
      categoria: "material",
      descricao: "",
      fornecedor: "",
      valor: "",
      data_custo: new Date().toISOString().split("T")[0],
      pago: false,
      observacoes: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.descricao || !formData.valor) {
      toast.error("Por favor, preencha os campos obrigatórios");
      return;
    }

    criarMutation.mutate({
      categoria: formData.categoria as any,
      descricao: formData.descricao,
      fornecedor: formData.fornecedor || undefined,
      valor: parseFloat(formData.valor),
      data_custo: new Date(formData.data_custo).toISOString(),
      pago: formData.pago,
      observacoes: formData.observacoes || undefined,
    });
  };

  const handleMarcarPago = (id: number) => {
    pagarMutation.mutate({ id });
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      fixo: "Fixo",
      variavel: "Variável",
      material: "Material",
      equipamento: "Equipamento",
      pessoal: "Pessoal",
      marketing: "Marketing",
      administrativo: "Administrativo",
      infraestrutura: "Infraestrutura",
      formacao: "Formação",
      outro: "Outro",
    };
    return labels[categoria] || categoria;
  };

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      fixo: "bg-blue-100 text-blue-800",
      variavel: "bg-purple-100 text-purple-800",
      material: "bg-green-100 text-green-800",
      equipamento: "bg-orange-100 text-orange-800",
      pessoal: "bg-red-100 text-red-800",
      marketing: "bg-pink-100 text-pink-800",
      administrativo: "bg-gray-100 text-gray-800",
      infraestrutura: "bg-yellow-100 text-yellow-800",
      formacao: "bg-indigo-100 text-indigo-800",
      outro: "bg-slate-100 text-slate-800",
    };
    return colors[categoria] || colors.outro;
  };

  if (loadingClinicas) {
    return <CustosSkeleton />;
  }

  if (!clinicas || clinicas.length === 0) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Nenhuma clínica encontrada</h3>
              <p className="text-muted-foreground">
                Configure uma clínica para começar a gerir custos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Custos</h1>
          <p className="text-muted-foreground mt-1">
            Controlo de despesas e análise financeira
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (!custos || !resumo) {
                toast.error("Sem dados para exportar");
                return;
              }
              exportarCustosPDF({
                titulo: "Relatório de Custos",
                periodo: `Gerado em ${new Date().toLocaleDateString('pt-PT')}`,
                resumo: {
                  total: resumo.custos_totais || 0,
                  fixos: resumo.custos_fixos || 0,
                  variaveis: resumo.custos_variaveis || 0,
                  pendentes: custos.filter((c: any) => !c.pago).length,
                },
                custos: custos.map((custo: any) => ({
                  descricao: custo.descricao,
                  categoria: getCategoriaLabel(custo.categoria),
                  valor: custo.valor,
                  fornecedor: custo.fornecedor,
                  data: new Date(custo.data_custo).toLocaleDateString('pt-PT'),
                  pago: custo.pago,
                })),
              });
              toast.success("Relatório exportado com sucesso!");
            }}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Custo
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registar Novo Custo</DialogTitle>
              <DialogDescription>
                Adicione um novo custo operacional à clínica
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixo">Fixo</SelectItem>
                      <SelectItem value="variavel">Variável</SelectItem>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="equipamento">Equipamento</SelectItem>
                      <SelectItem value="pessoal">Pessoal</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="administrativo">Administrativo</SelectItem>
                      <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                      <SelectItem value="formacao">Formação</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (€) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Input
                  id="descricao"
                  placeholder="Ex: Compra de materiais dentários"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fornecedor">Fornecedor</Label>
                  <Input
                    id="fornecedor"
                    placeholder="Nome do fornecedor"
                    value={formData.fornecedor}
                    onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_custo">Data</Label>
                  <Input
                    id="data_custo"
                    type="date"
                    value={formData.data_custo}
                    onChange={(e) => setFormData({ ...formData, data_custo: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Notas adicionais..."
                  rows={3}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pago"
                  checked={formData.pago}
                  onChange={(e) => setFormData({ ...formData, pago: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="pago" className="cursor-pointer">
                  Marcar como pago
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={criarMutation.isPending}>
                {criarMutation.isPending ? "Guardando..." : "Guardar Custo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Custos Totais (Mês)"
          value={`€${resumo?.custos_totais?.toFixed(2) || "0.00"}`}
          icon={Euro}
          color="red"
        />

        <StatCard
          title="Custos Fixos"
          value={`€${resumo?.custos_fixos?.toFixed(2) || "0.00"}`}
          icon={TrendingDown}
          color="blue"
        />

        <StatCard
          title="Custos Variáveis"
          value={`€${resumo?.custos_variaveis?.toFixed(2) || "0.00"}`}
          icon={PieChart}
          color="purple"
        />

        <StatCard
          title="Pendentes de Pagamento"
          value={custos?.filter((c: any) => !c.pago).length || 0}
          icon={AlertTriangle}
          color="orange"
        />
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as categorias</SelectItem>
                <SelectItem value="fixo">Fixo</SelectItem>
                <SelectItem value="variavel">Variável</SelectItem>
                <SelectItem value="material">Material</SelectItem>
                <SelectItem value="equipamento">Equipamento</SelectItem>
                <SelectItem value="pessoal">Pessoal</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="administrativo">Administrativo</SelectItem>
                <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                <SelectItem value="formacao">Formação</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filtroPago === undefined ? "todos" : filtroPago ? "pagos" : "pendentes"}
              onValueChange={(value) =>
                setFiltroPago(value === "todos" ? undefined : value === "pagos")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pagos">Pagos</SelectItem>
                <SelectItem value="pendentes">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos de Evolução */}
      <CustosChartsV2 />

      {/* Lista de Custos */}
      <Card>
        <CardHeader>
          <CardTitle>Custos Registados</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCustos ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !custos || custos.length === 0 ? (
            <div className="text-center py-12">
              <Euro className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum custo registado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {custos.map((custo: any) => (
                <div
                  key={custo.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold">{custo.descricao}</h4>
                      <Badge className={getCategoriaColor(custo.categoria)}>
                        {getCategoriaLabel(custo.categoria)}
                      </Badge>
                      <Badge variant={custo.pago ? "default" : "destructive"}>
                        {custo.pago ? "Pago" : "Pendente"}
                      </Badge>
                    </div>
                    {custo.fornecedor && (
                      <p className="text-sm text-muted-foreground">
                        Fornecedor: {custo.fornecedor}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(custo.data_custo).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">€{custo.valor.toFixed(2)}</p>
                    </div>
                    {!custo.pago && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarcarPago(custo.id)}
                        disabled={pagarMutation.isPending}
                      >
                        Marcar como Pago
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CustosSkeleton() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
