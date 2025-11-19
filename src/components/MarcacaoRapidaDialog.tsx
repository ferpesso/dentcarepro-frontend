import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Search, UserPlus, Clock, User, Stethoscope } from "lucide-react";
import { CadastroRapidoUtenteDialog } from "./CadastroRapidoUtenteDialog";

interface MarcacaoRapidaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicaId: number;
  dataHora: {
    data: Date;
    hora: string;
  };
}

export function MarcacaoRapidaDialog({
  open,
  onOpenChange,
  clinicaId,
  dataHora,
}: MarcacaoRapidaDialogProps) {
  const [buscaUtente, setBuscaUtente] = useState("");
  const [utenteId, setUtenteId] = useState<number | null>(null);
  const [dentistaId, setDentistaId] = useState<number | null>(null);
  const [procedimentoId, setProcedimentoId] = useState<number | null>(null);
  const [duracao, setDuracao] = useState("30");
  const [observacoes, setObservacoes] = useState("");
  const [cadastroRapidoOpen, setCadastroRapidoOpen] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const utils = trpc.useUtils();

  // Buscar utentes
  const { data: utentes = [] } = trpc.utentes.listar.useQuery(
    { clinicaId, pesquisa: buscaUtente },
    { enabled: buscaUtente.length >= 2 }
  );

  // Buscar dentistas
  const { data: dentistas = [] } = trpc.dentistas.listar.useQuery({ clinicaId });

  // Buscar procedimentos
  const { data: procedimentos = [] } = trpc.procedimentos.listar.useQuery({ clinicaId });

  // Mutation para criar consulta
  const criarConsultaMutation = trpc.consultas.criar.useMutation({
    onSuccess: () => {
      toast.success("Consulta agendada com sucesso!");
      onOpenChange(false);
      utils.consultas.listarPorPeriodo.invalidate();
      limparFormulario();
    },
    onError: (error) => {
      toast.error("Erro ao agendar consulta: " + error.message);
    },
  });

  const limparFormulario = () => {
    setBuscaUtente("");
    setUtenteId(null);
    setDentistaId(null);
    setProcedimentoId(null);
    setDuracao("30");
    setObservacoes("");
    setMostrarResultados(false);
  };

  const handleSelecionarUtente = (id: number, nome: string) => {
    setUtenteId(id);
    setBuscaUtente(nome);
    setMostrarResultados(false);
  };

  const handleAgendar = () => {
    if (!utenteId) {
      toast.error("Selecione um utente");
      return;
    }

    if (!dentistaId) {
      toast.error("Selecione um dentista");
      return;
    }

    // Calcular hora de início e fim
    const [hora, minuto] = dataHora.hora.split(":").map(Number);
    const horaInicio = new Date(dataHora.data);
    horaInicio.setHours(hora, minuto, 0, 0);

    const horaFim = new Date(horaInicio);
    horaFim.setMinutes(horaFim.getMinutes() + parseInt(duracao));

    criarConsultaMutation.mutate({
      clinicaId,
      utenteId,
      dentistaId,
      procedimentoId: procedimentoId || undefined,
      horaInicio,
      horaFim,
      observacoes: observacoes || undefined,
    });
  };

  const handleCadastroRapidoConcluido = (novoUtenteId: number, nome: string) => {
    setUtenteId(novoUtenteId);
    setBuscaUtente(nome);
    setCadastroRapidoOpen(false);
    toast.success("Utente cadastrado! Agora você pode agendar a consulta.");
  };

  useEffect(() => {
    if (buscaUtente.length >= 2 && utentes.length > 0) {
      setMostrarResultados(true);
    } else {
      setMostrarResultados(false);
    }
  }, [buscaUtente, utentes]);

  useEffect(() => {
    if (!open) {
      limparFormulario();
    }
  }, [open]);

  const formatarData = () => {
    return dataHora.data.toLocaleDateString("pt-PT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Marcação Rápida</DialogTitle>
            <DialogDescription>
              Agende uma consulta para {formatarData()} às {dataHora.hora}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Busca de Utente */}
            <div className="space-y-2">
              <Label htmlFor="utente" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Utente *
              </Label>
              <div className="relative">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="utente"
                      placeholder="Digite o nome ou telemóvel do utente..."
                      value={buscaUtente}
                      onChange={(e) => setBuscaUtente(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCadastroRapidoOpen(true)}
                    title="Cadastrar novo utente"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Resultados da busca */}
                {mostrarResultados && utentes.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {utentes.map((utente: any) => (
                      <div
                        key={utente.id}
                        className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                        onClick={() => handleSelecionarUtente(utente.id, utente.nome)}
                      >
                        <div className="font-medium">{utente.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          {utente.telemovel && `Tel: ${utente.telemovel}`}
                          {utente.email && ` • ${utente.email}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Mensagem quando não encontra */}
                {mostrarResultados && utentes.length === 0 && buscaUtente.length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Nenhum utente encontrado com "{buscaUtente}"
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCadastroRapidoOpen(true)}
                      className="w-full"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Cadastrar Novo Utente
                    </Button>
                  </div>
                )}
              </div>
              {utenteId && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  ✓ Utente selecionado
                </p>
              )}
            </div>

            {/* Dentista */}
            <div className="space-y-2">
              <Label htmlFor="dentista" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Dentista *
              </Label>
              <Select
                value={dentistaId?.toString()}
                onValueChange={(value) => setDentistaId(parseInt(value))}
              >
                <SelectTrigger id="dentista">
                  <SelectValue placeholder="Selecione o dentista" />
                </SelectTrigger>
                <SelectContent>
                  {dentistas.map((dentista: any) => (
                    <SelectItem key={dentista.id} value={dentista.id.toString()}>
                      {dentista.nome}
                      {dentista.especialidade && ` - ${dentista.especialidade}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Procedimento */}
            <div className="space-y-2">
              <Label htmlFor="procedimento">Procedimento (Opcional)</Label>
              <Select
                value={procedimentoId?.toString()}
                onValueChange={(value) =>
                  setProcedimentoId(value ? parseInt(value) : null)
                }
              >
                <SelectTrigger id="procedimento">
                  <SelectValue placeholder="Nenhum (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {procedimentos.map((proc: any) => (
                    <SelectItem key={proc.id} value={proc.id.toString()}>
                      {proc.nome}
                      {proc.preco && ` - €${proc.preco}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duração */}
            <div className="space-y-2">
              <Label htmlFor="duracao" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duração (minutos)
              </Label>
              <Select value={duracao} onValueChange={setDuracao}>
                <SelectTrigger id="duracao">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1h 30min</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações sobre a consulta..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAgendar}
              disabled={!utenteId || !dentistaId || criarConsultaMutation.isPending}
            >
              {criarConsultaMutation.isPending ? "Agendando..." : "Agendar Consulta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de cadastro rápido */}
      <CadastroRapidoUtenteDialog
        open={cadastroRapidoOpen}
        onOpenChange={setCadastroRapidoOpen}
        clinicaId={clinicaId}
        onSuccess={handleCadastroRapidoConcluido}
        nomeInicial={buscaUtente}
      />
    </>
  );
}
