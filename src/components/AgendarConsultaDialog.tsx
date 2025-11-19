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
import { toast } from "sonner";
import { useState } from "react";

interface AgendarConsultaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicaId: number;
  dataInicial?: Date;
}

export function AgendarConsultaDialog({
  open,
  onOpenChange,
  clinicaId,
  dataInicial,
}: AgendarConsultaDialogProps) {
  const utils = trpc.useUtils();
  
  const [utenteId, setUtenteId] = useState<string | undefined>(undefined);
  const [dentistaId, setDentistaId] = useState<string | undefined>(undefined);
  const [procedimentoId, setProcedimentoId] = useState<string | undefined>(undefined);
  const [data, setData] = useState(
    dataInicial ? dataInicial.toISOString().split("T")[0] : ""
  );
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFim, setHoraFim] = useState("10:00");
  const [observacoes, setObservacoes] = useState("");

  // Buscar dados necessários
  const { data: utentes } = trpc.utentes.listar.useQuery(
    { clinicaId, pesquisa: "" },
    { enabled: open }
  );
  
  const { data: dentistas } = trpc.dentistas.listar.useQuery(
    { clinicaId },
    { enabled: open }
  );
  
  const { data: procedimentos } = trpc.procedimentos.listar.useQuery(
    { clinicaId },
    { enabled: open }
  );

  const criarConsulta = trpc.consultas.criar.useMutation({
    onSuccess: () => {
      toast.success("Consulta agendada com sucesso!");
      utils.consultas.listarPorPeriodo.invalidate();
      utils.dashboard.stats.invalidate();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao agendar consulta: " + error.message);
    },
  });

  const resetForm = () => {
    setUtenteId(undefined);
    setDentistaId(undefined);
    setProcedimentoId(undefined);
    setData("");
    setHoraInicio("09:00");
    setHoraFim("10:00");
    setObservacoes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!utenteId || !dentistaId || !data || !horaInicio || !horaFim) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const horaInicioDate = new Date(`${data}T${horaInicio}:00`);
    const horaFimDate = new Date(`${data}T${horaFim}:00`);

    if (horaFimDate <= horaInicioDate) {
      toast.error("A hora de fim deve ser posterior à hora de início");
      return;
    }

    criarConsulta.mutate({
      clinicaId,
      utenteId: parseInt(utenteId),
      dentistaId: parseInt(dentistaId),
      procedimentoId: procedimentoId ? parseInt(procedimentoId) : undefined,
      horaInicio: horaInicioDate,
      horaFim: horaFimDate,
      observacoes: observacoes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agendar Consulta</DialogTitle>
          <DialogDescription>
            Preencha os dados para agendar uma nova consulta
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="utente">Utente *</Label>
            <Select value={utenteId} onValueChange={setUtenteId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o utente" />
              </SelectTrigger>
              <SelectContent>
                {utentes?.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.nome} - {u.numeroUtente}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dentista">Dentista *</Label>
            <Select value={dentistaId} onValueChange={setDentistaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dentista" />
              </SelectTrigger>
              <SelectContent>
                {dentistas?.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.nome}{d.especializacao ? ` - ${d.especializacao}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="procedimento">Procedimento</Label>
            <Select value={procedimentoId} onValueChange={setProcedimentoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o procedimento (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {procedimentos?.map((proc) => (
                  <SelectItem key={proc.procedimento.id} value={proc.procedimento.id.toString()}>
                    {proc.procedimento.nome} - €{proc.procedimento.precoBase}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data *</Label>
            <Input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horaInicio">Hora Início *</Label>
              <Input
                id="horaInicio"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horaFim">Hora Fim *</Label>
              <Input
                id="horaFim"
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={criarConsulta.isPending}>
              {criarConsulta.isPending ? "Agendando..." : "Agendar Consulta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
