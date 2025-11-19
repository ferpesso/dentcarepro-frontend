import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { UserPlus, Mail, Phone, Stethoscope, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Dentistas() {
  const [clinicaId, setClinicaId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editandoDentista, setEditandoDentista] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telemovel: "",
    especialidade: "",
    numeroOrdem: "",
  });

  const { data: clinicas, isLoading: loadingClinicas } = trpc.clinicas.minhas.useQuery();

  const { data: dentistas, isLoading: loadingDentistas } = trpc.dentistas.listar.useQuery(
    { clinicaId: clinicaId! },
    { enabled: !!clinicaId }
  );

  const utils = trpc.useUtils();

  const criarDentista = trpc.dentistas.criar.useMutation({
    onSuccess: () => {
      toast.success("Dentista adicionado com sucesso!");
      utils.dentistas.listar.invalidate();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao adicionar dentista: " + error.message);
    },
  });

  const atualizarDentista = trpc.dentistas.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Dentista atualizado com sucesso!");
      utils.dentistas.listar.invalidate();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar dentista: " + error.message);
    },
  });

  const eliminarDentista = trpc.dentistas.eliminar.useMutation({
    onSuccess: () => {
      toast.success("Dentista removido com sucesso!");
      utils.dentistas.listar.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao remover dentista: " + error.message);
    },
  });

  useEffect(() => {
    if (clinicas && clinicas.length > 0 && !clinicaId) {
      setClinicaId(clinicas[0].clinica.id);
    }
  }, [clinicas, clinicaId]);

  const handleEditar = (dentista: any) => {
    setEditandoDentista(dentista.id);
    setFormData({
      nome: dentista.nome,
      email: dentista.email || "",
      telemovel: dentista.telemovel,
      especialidade: dentista.especializacao || "",
      numeroOrdem: dentista.numeroCedula || "",
    });
    setDialogOpen(true);
  };

  const handleEliminar = (dentistaId: number, nome: string) => {
    if (confirm(`Tem certeza que deseja remover o dentista ${nome}?`)) {
      eliminarDentista.mutate({ id: dentistaId, clinicaId: clinicaId! });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telemovel: "",
      especialidade: "",
      numeroOrdem: "",
    });
    setEditandoDentista(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.telemovel) {
      toast.error("Nome e telemóvel são obrigatórios");
      return;
    }

    if (editandoDentista) {
      atualizarDentista.mutate({
        id: editandoDentista,
        clinicaId: clinicaId!,
        nome: formData.nome,
        email: formData.email || undefined,
        telemovel: formData.telemovel,
        especializacao: formData.especialidade || undefined,
        numeroCedula: formData.numeroOrdem || undefined,
      });
    } else {
      criarDentista.mutate({
        clinicaId: clinicaId!,
        nome: formData.nome,
        email: formData.email || undefined,
        telemovel: formData.telemovel,
        especializacao: formData.especialidade || undefined,
        numeroCedula: formData.numeroOrdem || undefined,
      });
    }
  };

  if (loadingClinicas) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Dentistas</h1>
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
        <h1 className="text-3xl font-bold mb-6">Dentistas</h1>
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
          <h1 className="text-3xl font-bold">Dentistas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie a equipa de profissionais da clínica
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Dentista
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipa de Dentistas</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingDentistas ? (
            <TableSkeleton rows={5} />
          ) : !dentistas || dentistas.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum dentista encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione o primeiro dentista à equipa
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Nº Ordem</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dentistas.map((dentista) => (
                  <TableRow key={dentista.id}>
                    <TableCell className="font-medium">{dentista.nome}</TableCell>
                    <TableCell>
                      {dentista.especializacao ? (
                        <Badge variant="secondary">{dentista.especializacao}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {dentista.telemovel && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {dentista.telemovel}
                          </div>
                        )}
                        {dentista.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {dentista.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {dentista.numeroCedula || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge 
                        status={dentista.ativo ? "active" : "inactive"}
                        pulse={dentista.ativo}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditar(dentista)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminar(dentista.id, dentista.nome)}
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

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editandoDentista ? "Editar Dentista" : "Adicionar Dentista"}
            </DialogTitle>
            <DialogDescription>
              {editandoDentista 
                ? "Atualize os dados do dentista" 
                : "Preencha os dados do novo dentista da equipa"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Dr. João Silva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="especialidade">Especialidade</Label>
              <Input
                id="especialidade"
                value={formData.especialidade}
                onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                placeholder="Ortodontia, Implantologia, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telemovel">Telemóvel *</Label>
              <Input
                id="telemovel"
                value={formData.telemovel}
                onChange={(e) => setFormData({ ...formData, telemovel: e.target.value })}
                placeholder="+351 912 345 678"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="joao.silva@clinica.pt"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroOrdem">Número da Ordem</Label>
              <Input
                id="numeroOrdem"
                value={formData.numeroOrdem}
                onChange={(e) => setFormData({ ...formData, numeroOrdem: e.target.value })}
                placeholder="12345"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={criarDentista.isPending || atualizarDentista.isPending}>
                {editandoDentista ? "Atualizar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
