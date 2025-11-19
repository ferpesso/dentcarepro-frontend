import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MarcacaoRapidaDialog } from "./MarcacaoRapidaDialog";
import { toast } from "sonner";

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
  utente?: { nome: string; id: number } | null;
  dentista?: { nome: string; id: number } | null;
  procedimento?: { nome: string } | null;
}

type VisualizacaoTipo = "mes" | "semana" | "dia";

// Componente de consulta arrastável
function ConsultaDraggable({
  consulta,
  onClick,
}: {
  consulta: ConsultaItem;
  onClick?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: consulta.consulta.id.toString(),
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getCorStatus = (estado: string) => {
    switch (estado) {
      case "confirmada":
        return "bg-green-500 hover:bg-green-600";
      case "agendada":
        return "bg-blue-500 hover:bg-blue-600";
      case "concluida":
        return "bg-gray-400 hover:bg-gray-500";
      case "cancelada":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-300 hover:bg-gray-400";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`text-xs px-2 py-1 rounded text-white cursor-move ${getCorStatus(
        consulta.consulta.estado
      )} transition-all`}
      title={`${new Date(consulta.consulta.horaInicio).toLocaleTimeString("pt-PT", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${consulta.utente?.nome || "Sem utente"}`}
    >
      <div className="font-medium">
        {new Date(consulta.consulta.horaInicio).toLocaleTimeString("pt-PT", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      <div className="truncate">{consulta.utente?.nome || "Sem utente"}</div>
      {consulta.procedimento && (
        <div className="text-[10px] opacity-80 truncate">{consulta.procedimento.nome}</div>
      )}
    </div>
  );
}

export function CalendarioAgendaMelhorado({ clinicaId }: CalendarioAgendaProps) {
  const [dataAtual, setDataAtual] = useState(new Date());
  const [visualizacao, setVisualizacao] = useState<VisualizacaoTipo>("semana");
  const [marcacaoRapidaOpen, setMarcacaoRapidaOpen] = useState(false);
  const [horarioSelecionado, setHorarioSelecionado] = useState<{
    data: Date;
    hora: string;
  } | null>(null);

  const utils = trpc.useUtils();

  // Calcular período baseado na visualização
  const calcularPeriodo = () => {
    let dataInicio: Date;
    let dataFim: Date;

    if (visualizacao === "dia") {
      dataInicio = new Date(dataAtual);
      dataInicio.setHours(0, 0, 0, 0);
      dataFim = new Date(dataAtual);
      dataFim.setHours(23, 59, 59, 999);
    } else if (visualizacao === "semana") {
      const diaSemana = dataAtual.getDay();
      dataInicio = new Date(dataAtual);
      dataInicio.setDate(dataAtual.getDate() - diaSemana);
      dataInicio.setHours(0, 0, 0, 0);
      dataFim = new Date(dataInicio);
      dataFim.setDate(dataInicio.getDate() + 6);
      dataFim.setHours(23, 59, 59, 999);
    } else {
      // mês
      dataInicio = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
      dataFim = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
    }

    return { dataInicio, dataFim };
  };

  const periodo = calcularPeriodo();

  // Buscar consultas do período
  const { data: consultas = [], isLoading } = trpc.consultas.listarPorPeriodo.useQuery({
    clinicaId,
    dataInicio: periodo.dataInicio,
    dataFim: periodo.dataFim,
  });

  // Mutation para atualizar consulta
  const atualizarConsultaMutation = trpc.consultas.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Consulta movida com sucesso!");
      utils.consultas.listarPorPeriodo.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao mover consulta: " + error.message);
    },
  });

  const mesesPt = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const diasSemanaPt = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  const anterior = () => {
    if (visualizacao === "dia") {
      setDataAtual(new Date(dataAtual.getTime() - 24 * 60 * 60 * 1000));
    } else if (visualizacao === "semana") {
      setDataAtual(new Date(dataAtual.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, 1));
    }
  };

  const proximo = () => {
    if (visualizacao === "dia") {
      setDataAtual(new Date(dataAtual.getTime() + 24 * 60 * 60 * 1000));
    } else if (visualizacao === "semana") {
      setDataAtual(new Date(dataAtual.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 1));
    }
  };

  const hoje = () => {
    setDataAtual(new Date());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Encontrar a consulta que foi arrastada
    const consultaArrastada = consultas.find(
      (c: ConsultaItem) => c.consulta.id.toString() === active.id
    );

    if (!consultaArrastada) return;

    // Parsear a nova data/hora do destino
    const [novaData, novaHora] = over.id.toString().split("_");

    if (!novaData || !novaHora) return;

    const [ano, mes, dia] = novaData.split("-").map(Number);
    const [hora, minuto] = novaHora.split(":").map(Number);

    const novaDataHora = new Date(ano, mes - 1, dia, hora, minuto);

    // Calcular duração da consulta
    const horaInicio = new Date(consultaArrastada.consulta.horaInicio);
    const horaFim = new Date(consultaArrastada.consulta.horaFim);
    const duracao = horaFim.getTime() - horaInicio.getTime();

    const novaHoraFim = new Date(novaDataHora.getTime() + duracao);

    // Atualizar consulta
    atualizarConsultaMutation.mutate({
      consultaId: consultaArrastada.consulta.id,
      clinicaId: consultaArrastada.consulta.clinicaId,
      horaInicio: novaDataHora,
      horaFim: novaHoraFim,
    });
  };

  const handleClickHorario = (data: Date, hora: string) => {
    setHorarioSelecionado({ data, hora });
    setMarcacaoRapidaOpen(true);
  };

  // Renderizar visualização por dia
  const renderizarVisualizacaoDia = () => {
    const horas = Array.from({ length: 14 }, (_, i) => i + 7); // 7h às 20h

    return (
      <div className="space-y-2">
        {horas.map((hora) => {
          const horaStr = `${hora.toString().padStart(2, "0")}:00`;
          const consultasHora = consultas.filter((c: ConsultaItem) => {
            const horaConsulta = new Date(c.consulta.horaInicio);
            return (
              horaConsulta.getDate() === dataAtual.getDate() &&
              horaConsulta.getMonth() === dataAtual.getMonth() &&
              horaConsulta.getFullYear() === dataAtual.getFullYear() &&
              horaConsulta.getHours() === hora
            );
          });

          const dropId = `${dataAtual.getFullYear()}-${(dataAtual.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${dataAtual
            .getDate()
            .toString()
            .padStart(2, "0")}_${horaStr}`;

          return (
            <div
              key={hora}
              id={dropId}
              className="flex gap-2 border-b pb-2 hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => handleClickHorario(dataAtual, horaStr)}
            >
              <div className="w-20 text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {horaStr}
              </div>
              <div className="flex-1 space-y-1">
                {consultasHora.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic flex items-center gap-1 py-1">
                    <Plus className="h-3 w-3" />
                    Clique para agendar
                  </div>
                ) : (
                  consultasHora.map((consulta: ConsultaItem) => (
                    <ConsultaDraggable key={consulta.consulta.id} consulta={consulta} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Renderizar visualização por semana
  const renderizarVisualizacaoSemana = () => {
    const diasSemana: Date[] = [];
    const inicioSemana = new Date(periodo.dataInicio);

    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicioSemana);
      dia.setDate(inicioSemana.getDate() + i);
      diasSemana.push(dia);
    }

    const horas = Array.from({ length: 14 }, (_, i) => i + 7); // 7h às 20h

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Cabeçalho dos dias */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-sm font-medium"></div>
            {diasSemana.map((dia) => {
              const ehHoje =
                dia.toDateString() === new Date().toDateString();
              return (
                <div
                  key={dia.toISOString()}
                  className={`text-center p-2 rounded ${
                    ehHoje ? "bg-blue-100 font-bold" : ""
                  }`}
                >
                  <div className="text-xs text-muted-foreground">
                    {diasSemanaPt[dia.getDay()].substring(0, 3)}
                  </div>
                  <div className="text-lg">{dia.getDate()}</div>
                </div>
              );
            })}
          </div>

          {/* Grid de horários */}
          {horas.map((hora) => {
            const horaStr = `${hora.toString().padStart(2, "0")}:00`;

            return (
              <div key={hora} className="grid grid-cols-8 gap-2 mb-1">
                <div className="text-xs text-muted-foreground flex items-center">
                  {horaStr}
                </div>
                {diasSemana.map((dia) => {
                  const consultasHora = consultas.filter((c: ConsultaItem) => {
                    const horaConsulta = new Date(c.consulta.horaInicio);
                    return (
                      horaConsulta.getDate() === dia.getDate() &&
                      horaConsulta.getMonth() === dia.getMonth() &&
                      horaConsulta.getFullYear() === dia.getFullYear() &&
                      horaConsulta.getHours() === hora
                    );
                  });

                  const dropId = `${dia.getFullYear()}-${(dia.getMonth() + 1)
                    .toString()
                    .padStart(2, "0")}-${dia
                    .getDate()
                    .toString()
                    .padStart(2, "0")}_${horaStr}`;

                  return (
                    <div
                      key={dia.toISOString()}
                      id={dropId}
                      className="min-h-[60px] border rounded p-1 hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => handleClickHorario(dia, horaStr)}
                    >
                      {consultasHora.length === 0 ? (
                        <div className="text-[10px] text-muted-foreground text-center opacity-0 hover:opacity-100">
                          +
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {consultasHora.map((consulta: ConsultaItem) => (
                            <ConsultaDraggable
                              key={consulta.consulta.id}
                              consulta={consulta}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar visualização por mês (original)
  const renderizarVisualizacaoMes = () => {
    const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
    const ultimoDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
    const primeiroDiaSemana = primeiroDiaMes.getDay();
    const totalDias = ultimoDiaMes.getDate();

    const dias = [];
    for (let i = 0; i < primeiroDiaSemana; i++) {
      dias.push(null);
    }
    for (let dia = 1; dia <= totalDias; dia++) {
      dias.push(dia);
    }

    const obterConsultasDoDia = (dia: number) => {
      return consultas.filter((item: ConsultaItem) => {
        const dataConsulta = new Date(item.consulta.horaInicio);
        return (
          dataConsulta.getDate() === dia &&
          dataConsulta.getMonth() === dataAtual.getMonth() &&
          dataConsulta.getFullYear() === dataAtual.getFullYear()
        );
      });
    };

    const ehHoje = (dia: number) => {
      const hoje = new Date();
      return (
        dia === hoje.getDate() &&
        dataAtual.getMonth() === hoje.getMonth() &&
        dataAtual.getFullYear() === hoje.getFullYear()
      );
    };

    return (
      <div className="grid grid-cols-7 gap-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
          <div
            key={dia}
            className="text-center text-sm font-semibold text-muted-foreground py-2"
          >
            {dia}
          </div>
        ))}

        {dias.map((dia, index) => {
          if (dia === null) {
            return <div key={`empty-${index}`} className="min-h-24" />;
          }

          const consultasDia = obterConsultasDoDia(dia);
          const isHoje = ehHoje(dia);
          const diaData = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dia);

          return (
            <div
              key={dia}
              className={`min-h-24 border rounded-lg p-2 ${
                isHoje ? "bg-blue-50 border-blue-300" : "bg-background"
              } hover:bg-accent/50 cursor-pointer transition-colors`}
              onClick={() => handleClickHorario(diaData, "09:00")}
            >
              <div className={`text-sm font-medium mb-1 ${isHoje ? "text-blue-600" : ""}`}>
                {dia}
              </div>
              <div className="space-y-1">
                {consultasDia.slice(0, 3).map((consulta: ConsultaItem) => (
                  <ConsultaDraggable key={consulta.consulta.id} consulta={consulta} />
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
    );
  };

  const getTituloVisualizacao = () => {
    if (visualizacao === "dia") {
      return `${diasSemanaPt[dataAtual.getDay()]}, ${dataAtual.getDate()} de ${
        mesesPt[dataAtual.getMonth()]
      } ${dataAtual.getFullYear()}`;
    } else if (visualizacao === "semana") {
      const inicioSemana = new Date(periodo.dataInicio);
      const fimSemana = new Date(periodo.dataFim);
      return `${inicioSemana.getDate()} - ${fimSemana.getDate()} de ${
        mesesPt[dataAtual.getMonth()]
      } ${dataAtual.getFullYear()}`;
    } else {
      return `${mesesPt[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {getTituloVisualizacao()}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {/* Botões de visualização */}
              <div className="flex gap-1 border rounded-md p-1">
                <Button
                  variant={visualizacao === "dia" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setVisualizacao("dia")}
                >
                  Dia
                </Button>
                <Button
                  variant={visualizacao === "semana" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setVisualizacao("semana")}
                >
                  Semana
                </Button>
                <Button
                  variant={visualizacao === "mes" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setVisualizacao("mes")}
                >
                  Mês
                </Button>
              </div>

              {/* Navegação */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={hoje}>
                  Hoje
                </Button>
                <Button variant="outline" size="icon" onClick={anterior}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={proximo}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              A carregar consultas...
            </div>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              {visualizacao === "dia" && renderizarVisualizacaoDia()}
              {visualizacao === "semana" && renderizarVisualizacaoSemana()}
              {visualizacao === "mes" && renderizarVisualizacaoMes()}
            </DndContext>
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

      {/* Dialog de marcação rápida */}
      {horarioSelecionado && (
        <MarcacaoRapidaDialog
          open={marcacaoRapidaOpen}
          onOpenChange={setMarcacaoRapidaOpen}
          clinicaId={clinicaId}
          dataHora={horarioSelecionado}
        />
      )}
    </>
  );
}
