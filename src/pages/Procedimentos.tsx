import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Clipboard, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AIAssistant, PageFooter } from "@/components/AIAssistant";
import { useAIAssistant } from "@/hooks/useAIAssistant";

export default function Procedimentos() {
  const [clinicaId, setClinicaId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoriaDialogOpen, setCategoriaDialogOpen] = useState(false);
  const [editandoProcedimento, setEditandoProcedimento] = useState<number | null>(null);
  
  // Assistente IA
  const { recommendations, alerts, quickTips, loading: loadingAI } = useAIAssistant("procedimentos", clinicaId || undefined);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    precoBase: "",
    duracao: "",
    categoriaId: "",
  });
  const [novaCategoria, setNovaCategoria] = useState({
    nome: "",
    descricao: "",
  });

  const { data: clinicas, isLoading: loadingClinicas } = trpc.clinicas.minhas.useQuery();

  const { data: procedimentos, isLoading: loadingProcedimentos } = trpc.procedimentos.listar.useQuery(
    { clinicaId: clinicaId! },
    { enabled: !!clinicaId }
  );

  const { data: categorias } = trpc.procedimentos.categorias.useQuery(
    { clinicaId: clinicaId! },
    { enabled: !!clinicaId }
  );

  const utils = trpc.useUtils();

  const criarProcedimento = trpc.procedimentos.criar.useMutation({
    onSuccess: () => {
      toast.success("Procedimento criado com sucesso!");
      utils.procedimentos.listar.invalidate();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar procedimento: " + error.message);
    },
  });

  const atualizarProcedimento = trpc.procedimentos.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Procedimento atualizado com sucesso!");
      utils.procedimentos.listar.invalidate();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar procedimento: " + error.message);
    },
  });

  const eliminarProcedimento = trpc.procedimentos.eliminar.useMutation({
    onSuccess: () => {
      toast.success("Procedimento removido com sucesso!");
      utils.procedimentos.listar.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao remover procedimento: " + error.message);
    },
  });

  const criarCategoria = trpc.procedimentos.criarCategoria.useMutation({
    onSuccess: () => {
      toast.success("Categoria criada com sucesso!");
      utils.procedimentos.categorias.invalidate();
      setCategoriaDialogOpen(false);
      setNovaCategoria({ nome: "", descricao: "" });
    },
    onError: (error) => {
      toast.error("Erro ao criar categoria: " + error.message);
    },
  });

  useEffect(() => {
    if (clinicas && clinicas.length > 0 && !clinicaId) {
      setClinicaId(clinicas[0].clinica.id);
    }
  }, [clinicas, clinicaId]);

  const handleEditar = (proc: any) => {
    setEditandoProcedimento(proc.procedimento.id);
    setFormData({
      nome: proc.procedimento.nome,
      descricao: proc.procedimento.descricao || "",
      precoBase: proc.procedimento.precoBase,
      duracao: proc.procedimento.duracaoMinutos?.toString() || "",
      categoriaId: proc.procedimento.categoriaId?.toString() || "",
    });
    setDialogOpen(true);
  };

  const handleEliminar = (procId: number, nome: string) => {
    if (confirm(`Tem certeza que deseja remover o procedimento "${nome}"?`)) {
      eliminarProcedimento.mutate({ id: procId, clinicaId: clinicaId! });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      precoBase: "",
      duracao: "",
      categoriaId: "",
    });
    setEditandoProcedimento(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.precoBase) {
      toast.error("Nome e preço base são obrigatórios");
      return;
    }

    const data = {
      clinicaId: clinicaId!,
      nome: formData.nome,
      descricao: formData.descricao || undefined,
      precoBase: formData.precoBase,
      duracaoMinutos: formData.duracao ? parseInt(formData.duracao) : undefined,
      categoriaId: formData.categoriaId ? parseInt(formData.categoriaId) : undefined,
    };

    if (editandoProcedimento) {
      atualizarProcedimento.mutate({
        id: editandoProcedimento,
        ...data,
      });
    } else {
      criarProcedimento.mutate(data);
    }
  };

  const handleCategoriaSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!novaCategoria.nome) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    criarCategoria.mutate({
      clinicaId: clinicaId!,
      nome: novaCategoria.nome,
      descricao: novaCategoria.descricao || undefined,
    });
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(parseFloat(value));
  };

  if (loadingClinicas) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Procedimentos</h1>
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
        <h1 className="text-3xl font-bold mb-6">Procedimentos</h1>
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
          <h1 className="text-3xl font-bold">Procedimentos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie o catálogo de procedimentos da clínica
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCategoriaDialogOpen(true)}>
            Nova Categoria
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Procedimento
          </Button>
        </div>
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
          <CardTitle>Lista de Procedimentos</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingProcedimentos ? (
            <TableSkeleton rows={6} />
          ) : !procedimentos || procedimentos.length === 0 ? (
            <div className="text-center py-12">
              <Clipboard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum procedimento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Crie o primeiro procedimento do catálogo
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Preço Base</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procedimentos.map((proc) => (
                  <TableRow key={proc.procedimento.id}>
                    <TableCell className="font-medium">
                      {proc.procedimento.nome}
                    </TableCell>
                    <TableCell>
                      {proc.categoria ? (
                        <Badge variant="outline">{proc.categoria.nome}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(proc.procedimento.precoBase)}
                    </TableCell>
                    <TableCell>
                      {proc.procedimento.duracaoMinutos ? `${proc.procedimento.duracaoMinutos} min` : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge 
                        status={proc.procedimento.ativo ? "active" : "inactive"}
                        pulse={proc.procedimento.ativo}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditar(proc)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminar(proc.procedimento.id, proc.procedimento.nome)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Novo/Editar Procedimento */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editandoProcedimento ? "Editar Procedimento" : "Novo Procedimento"}
            </DialogTitle>
            <DialogDescription>
              {editandoProcedimento 
                ? "Atualize os dados do procedimento" 
                : "Adicione um novo procedimento ao catálogo da clínica"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Procedimento *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Limpeza Dentária"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={formData.categoriaId}
                onValueChange={(value) => setFormData({ ...formData, categoriaId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precoBase">Preço Base (€) *</Label>
                <Input
                  id="precoBase"
                  type="number"
                  step="0.01"
                  value={formData.precoBase}
                  onChange={(e) => setFormData({ ...formData, precoBase: e.target.value })}
                  placeholder="50.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (min)</Label>
                <Input
                  id="duracao"
                  type="number"
                  value={formData.duracao}
                  onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                  placeholder="30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição detalhada do procedimento..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={criarProcedimento.isPending || atualizarProcedimento.isPending}>
                {editandoProcedimento ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Nova Categoria */}
      <Dialog open={categoriaDialogOpen} onOpenChange={setCategoriaDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para organizar os procedimentos
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCategoriaSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoriaNome">Nome da Categoria *</Label>
              <Input
                id="categoriaNome"
                value={novaCategoria.nome}
                onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
                placeholder="Ortodontia"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoriaDescricao">Descrição</Label>
              <Textarea
                id="categoriaDescricao"
                value={novaCategoria.descricao}
                onChange={(e) => setNovaCategoria({ ...novaCategoria, descricao: e.target.value })}
                placeholder="Descrição da categoria..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCategoriaDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={criarCategoria.isPending}>
                Criar Categoria
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer com Assistente IA */}
      <PageFooter />
    </div>
  );
}
