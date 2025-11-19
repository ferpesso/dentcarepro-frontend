import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface HistoricoConsultasProps {
  utenteId: number;
}

const ESTADOS_CONSULTA: Record<string, { label: string; variant: any }> = {
  agendada: { label: "Agendada", variant: "default" },
  confirmada: { label: "Confirmada", variant: "default" },
  em_atendimento: { label: "Em Atendimento", variant: "default" },
  concluida: { label: "Concluída", variant: "secondary" },
  cancelada: { label: "Cancelada", variant: "destructive" },
  faltou: { label: "Faltou", variant: "destructive" },
};

export function HistoricoConsultas({ utenteId }: HistoricoConsultasProps) {
  const { data: consultas, isLoading } = trpc.consultas.porUtente.useQuery({
    utenteId,
    limit: 20,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Consultas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Carregando consultas...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!consultas || consultas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Consultas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma consulta registrada
          </p>
        </CardContent>
      </Card>
    );
  }

  const consultasConcluidas = consultas.filter((c) => c.estado === "concluida").length;
  const consultasFuturas = consultas.filter(
    (c) => new Date(c.dataHora) > new Date() && c.estado !== "cancelada" && c.estado !== "faltou"
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Histórico de Consultas</CardTitle>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground">Concluídas</p>
              <p className="text-2xl font-bold">{consultasConcluidas}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Futuras</p>
              <p className="text-2xl font-bold text-blue-600">{consultasFuturas}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {consultas.map((consulta) => {
            const dataConsulta = new Date(consulta.dataHora);
            const isFutura = dataConsulta > new Date();
            const estado = ESTADOS_CONSULTA[consulta.estado] || {
              label: consulta.estado,
              variant: "default",
            };

            return (
              <div
                key={consulta.id}
                className={`p-4 border rounded-lg hover:bg-accent transition-colors ${
                  isFutura ? "border-blue-200 bg-blue-50/50" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{consulta.tipo || "Consulta"}</h4>
                    <Badge variant={estado.variant}>{estado.label}</Badge>
                  </div>
                  <div className="text-right text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {dataConsulta.toLocaleDateString("pt-PT")}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {dataConsulta.toLocaleTimeString("pt-PT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                {consulta.dentista && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <User className="h-3 w-3" />
                    {consulta.dentista.nome}
                  </div>
                )}

                {consulta.observacoes && (
                  <div className="flex items-start gap-1 text-sm text-muted-foreground">
                    <FileText className="h-3 w-3 mt-0.5" />
                    <p className="flex-1">{consulta.observacoes}</p>
                  </div>
                )}

                {consulta.procedimentos && consulta.procedimentos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {consulta.procedimentos.map((proc: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {proc.nome || proc}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
