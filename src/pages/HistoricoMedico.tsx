import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
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
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import {
  ArrowLeft,
  Plus,
  FileText,
  AlertCircle,
  Calendar,
  User,
  Phone,
  Mail,
  Activity,
  Pill,
  Heart,
  Stethoscope,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function HistoricoMedico() {
  const [, params] = useRoute("/utentes/:id/historico");
  const id = params?.id;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [dialogEditar, setDialogEditar] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    alergias: "",
    medicamentos: "",
    condicoesMedicas: "",
    cirurgiasPrevias: "",
    historicoFamiliar: "",
    observacoes: "",
  });

  // Carregar utente
  const { data: utente, isLoading: loadingUtente } = trpc.utentes.porId.useQuery(
    { utenteId: parseInt(id!), clinicaId: 1 },
    { enabled: !!id }
  );

  // Carregar histórico médico
  const { data: historico, isLoading: loadingHistorico } = trpc.utentes.historicoMedico.useQuery(
    { utenteId: parseInt(id!) },
    { enabled: !!id }
  );

  // Atualizar histórico médico
  const atualizarHistoricoMutation = trpc.utentes.atualizarHistorico.useMutation({
    onSuccess: () => {
      toast.success("Histórico médico atualizado com sucesso!");
      setDialogEditar(false);
      queryClient.invalidateQueries({ queryKey: ["historico-medico", id] });
    },
    onError: (error) => {
      toast.error("Erro ao atualizar histórico: " + error.message);
    },
  });

  const handleSubmit = () => {
    if (!id) return;
    atualizarHistoricoMutation.mutate({
      utenteId: parseInt(id),
      ...formData,
    });
  };

  // Abrir dialog com dados atuais
  const abrirDialogEditar = () => {
    if (historico) {
      setFormData({
        alergias: historico.alergias || "",
        medicamentos: historico.medicamentos || "",
        condicoesMedicas: historico.condicoesMedicas || "",
        cirurgiasPrevias: historico.cirurgiasPrevias || "",
        historicoFamiliar: historico.historicoFamiliar || "",
        observacoes: historico.observacoes || "",
      });
    }
    setDialogEditar(true);
  };

  // Formatar data
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-PT", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loadingUtente || loadingHistorico) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">A carregar histórico médico...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!utente) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Utente não encontrado</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setLocation("/utentes")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Utentes
          </Button>
        </div>
      </div>
    );
  }

  // Verificar se há alertas médicos
  const temAlergias = historico?.alergias && historico.alergias.trim() !== "";
  const temMedicamentos = historico?.medicamentos && historico.medicamentos.trim() !== "";
  const temCondicoesMedicas = historico?.condicoesMedicas && historico.condicoesMedicas.trim() !== "";

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation(`/utentes/${id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Histórico Médico</h1>
            <p className="text-muted-foreground">
              Informações médicas de {utente.nome}
            </p>
          </div>
        </div>
        <Button onClick={abrirDialogEditar}>
          <Plus className="h-4 w-4 mr-2" />
          {historico ? "Editar Histórico" : "Adicionar Histórico"}
        </Button>

        {/* Dialog de Edição */}
        <Dialog open={dialogEditar} onOpenChange={setDialogEditar}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Histórico Médico</DialogTitle>
              <DialogDescription>
                Atualize as informações médicas do utente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="alergias">Alergias</Label>
                <Textarea
                  id="alergias"
                  placeholder="Ex: Penicilina, Látex, etc."
                  value={formData.alergias}
                  onChange={(e) =>
                    setFormData({ ...formData, alergias: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="medicamentos">Medicamentos em Uso</Label>
                <Textarea
                  id="medicamentos"
                  placeholder="Ex: Ibuprofeno 400mg, Losartana 50mg, etc."
                  value={formData.medicamentos}
                  onChange={(e) =>
                    setFormData({ ...formData, medicamentos: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="condicoesMedicas">Condições Médicas</Label>
                <Textarea
                  id="condicoesMedicas"
                  placeholder="Ex: Diabetes, Hipertensão, etc."
                  value={formData.condicoesMedicas}
                  onChange={(e) =>
                    setFormData({ ...formData, condicoesMedicas: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="cirurgiasPrevias">Cirurgias Prévias</Label>
                <Textarea
                  id="cirurgiasPrevias"
                  placeholder="Ex: Apendicectomia (2015), etc."
                  value={formData.cirurgiasPrevias}
                  onChange={(e) =>
                    setFormData({ ...formData, cirurgiasPrevias: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="historicoFamiliar">Histórico Familiar</Label>
                <Textarea
                  id="historicoFamiliar"
                  placeholder="Ex: Pai com diabetes, mãe com hipertensão, etc."
                  value={formData.historicoFamiliar}
                  onChange={(e) =>
                    setFormData({ ...formData, historicoFamiliar: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Outras informações relevantes..."
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogEditar(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Informação do Utente */}
      <Card>
        <CardHeader>
          <CardTitle>Informação do Utente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{utente.nome}</p>
              </div>
            </div>
            {utente.dataNascimento && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                  <p className="font-medium">
                    {new Date(utente.dataNascimento).toLocaleDateString("pt-PT")}
                  </p>
                </div>
              </div>
            )}
            {utente.telemovel && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Telemóvel</p>
                  <p className="font-medium">{utente.telemovel}</p>
                </div>
              </div>
            )}
            {utente.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{utente.email}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alertas Médicos */}
      {(temAlergias || temMedicamentos || temCondicoesMedicas) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Alertas Médicos Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {temAlergias && (
                <div className="flex items-start gap-2">
                  <Badge variant="destructive">Alergias</Badge>
                  <p className="text-sm text-red-900">{historico.alergias}</p>
                </div>
              )}
              {temMedicamentos && (
                <div className="flex items-start gap-2">
                  <Badge variant="destructive">Medicamentos</Badge>
                  <p className="text-sm text-red-900">{historico.medicamentos}</p>
                </div>
              )}
              {temCondicoesMedicas && (
                <div className="flex items-start gap-2">
                  <Badge variant="destructive">Condições Médicas</Badge>
                  <p className="text-sm text-red-900">{historico.condicoesMedicas}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico Médico Detalhado */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Histórico Médico Completo</h2>
        {!historico ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  Ainda não existe histórico médico registado
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Adicione informações médicas importantes do utente
                </p>
                <Button onClick={abrirDialogEditar}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Histórico Médico
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Alergias */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Alergias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {historico.alergias || "Nenhuma alergia registada"}
                </p>
              </CardContent>
            </Card>

            {/* Medicamentos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Pill className="h-5 w-5 text-blue-500" />
                  Medicamentos em Uso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {historico.medicamentos || "Nenhum medicamento registado"}
                </p>
              </CardContent>
            </Card>

            {/* Condições Médicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Condições Médicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {historico.condicoesMedicas || "Nenhuma condição médica registada"}
                </p>
              </CardContent>
            </Card>

            {/* Cirurgias Prévias */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="h-5 w-5 text-purple-500" />
                  Cirurgias Prévias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {historico.cirurgiasPrevias || "Nenhuma cirurgia prévia registada"}
                </p>
              </CardContent>
            </Card>

            {/* Histórico Familiar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-green-500" />
                  Histórico Familiar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {historico.historicoFamiliar || "Nenhum histórico familiar registado"}
                </p>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-gray-500" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {historico.observacoes || "Nenhuma observação registada"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Informações de Atualização */}
        {historico && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Última atualização:{" "}
                  {historico.updatedAt
                    ? formatDate(historico.updatedAt)
                    : "Não disponível"}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
