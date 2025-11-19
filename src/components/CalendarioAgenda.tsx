import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface CalendarioAgendaProps {
  clinicaId: number;
}

interface ConsultaItem {
  consulta: {
    id: number;
    horaInicio: Date;
    horaFim: Date;
    estado: string;
  };
  utente?: { nome: string } | null;
  dentista?: { nome: string } | null;
  procedimento?: { nome: string } | null;
}

export function CalendarioAgenda({ clinicaId }: CalendarioAgendaProps) {
  const [mesAtual, setMesAtual] = useState(new Date());

  // Calcular primeiro e último dia do mês
  const primeiroDiaMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
  const ultimoDiaMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);

  // Buscar consultas do mês
  const { data: consultas = [], isLoading } = trpc.consultas.listarPorPeriodo.useQuery({
    clinicaId,
    dataInicio: primeiroDiaMes,
    dataFim: ultimoDiaMes,
  });

  const mesesPt = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
  };

  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  };

  const hoje = () => {
    setMesAtual(new Date());
  };

  // Gerar dias do calendário
  const gerarDiasCalendario = () => {
    const dias = [];
    const primeiroDiaSemana = primeiroDiaMes.getDay();
    const totalDias = ultimoDiaMes.getDate();

    // Dias vazios antes do primeiro dia
    for (let i = 0; i < primeiroDiaSemana; i++) {
      dias.push(null);
    }

    // Dias do mês
    for (let dia = 1; dia <= totalDias; dia++) {
      dias.push(dia);
    }

    return dias;
  };

  const obterConsultasDoDia = (dia: number) => {
    const dataAlvo = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia);
    return consultas.filter((item: ConsultaItem) => {
      const dataConsulta = new Date(item.consulta.horaInicio);
      return (
        dataConsulta.getDate() === dia &&
        dataConsulta.getMonth() === mesAtual.getMonth() &&
        dataConsulta.getFullYear() === mesAtual.getFullYear()
      );
    });
  };

  const ehHoje = (dia: number) => {
    const hoje = new Date();
    return (
      dia === hoje.getDate() &&
      mesAtual.getMonth() === hoje.getMonth() &&
      mesAtual.getFullYear() === hoje.getFullYear()
    );
  };

  const getCorStatus = (estado: string) => {
    switch (estado) {
      case "confirmada":
        return "bg-green-500";
      case "agendada":
        return "bg-blue-500";
      case "concluida":
        return "bg-gray-400";
      case "cancelada":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  const dias = gerarDiasCalendario();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {mesesPt[mesAtual.getMonth()]} {mesAtual.getFullYear()}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={hoje}>
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={mesAnterior}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={proximoMes}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            A carregar consultas...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {/* Cabeçalho dos dias da semana */}
            {diasSemana.map((dia) => (
              <div
                key={dia}
                className="text-center text-sm font-semibold text-muted-foreground py-2"
              >
                {dia}
              </div>
            ))}

            {/* Dias do mês */}
            {dias.map((dia, index) => {
              if (dia === null) {
                return <div key={`empty-${index}`} className="min-h-24" />;
              }

              const consultasDia = obterConsultasDoDia(dia);
              const isHoje = ehHoje(dia);

              return (
                <div
                  key={dia}
                  className={`min-h-24 border rounded-lg p-2 ${
                    isHoje ? "bg-blue-50 border-blue-300" : "bg-background"
                  } hover:bg-accent/50 cursor-pointer transition-colors`}
                >
                  <div className={`text-sm font-medium mb-1 ${isHoje ? "text-blue-600" : ""}`}>
                    {dia}
                  </div>
                  <div className="space-y-1">
                    {consultasDia.slice(0, 3).map((item: ConsultaItem) => (
                      <div
                        key={item.consulta.id}
                        className={`text-xs px-1 py-0.5 rounded text-white truncate ${getCorStatus(
                          item.consulta.estado
                        )}`}
                        title={`${new Date(item.consulta.horaInicio).toLocaleTimeString("pt-PT", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} - ${item.utente?.nome || "Sem utente"}`}
                      >
                        {new Date(item.consulta.horaInicio).toLocaleTimeString("pt-PT", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        {item.utente?.nome?.split(" ")[0]}
                      </div>
                    ))}
                    {consultasDia.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{consultasDia.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legenda */}
        <div className="flex gap-4 mt-6 justify-center flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-sm">Agendada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-sm">Confirmada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-400" />
            <span className="text-sm">Concluída</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-sm">Cancelada</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
