import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Calendar, Pill, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AdicionarPrescricaoDialog } from "./AdicionarPrescricaoDialog";

interface PrescricoesUtenteProps {
  utenteId: number;
  clinicaId: number;
}

export function PrescricoesUtente({ utenteId, clinicaId }: PrescricoesUtenteProps) {
  const [dialogAberto, setDialogAberto] = useState(false);

  const { data: prescricoes, isLoading, refetch } = trpc.prescricoes.listar.useQuery({
    utenteId,
  });

  const { data: estatisticas } = trpc.prescricoes.estatisticas.useQuery({
    utenteId,
  });

  const marcarDispensada = trpc.prescricoes.marcarDispensada.useMutation({
    onSuccess: () => {
      toast.success("Prescrição atualizada");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar prescrição: " + error.message);
    },
  });

  const excluirPrescricao = trpc.prescricoes.excluir.useMutation({
    onSuccess: () => {
      toast.success("Prescrição excluída");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao excluir prescrição: " + error.message);
    },
  });

  const handleMarcarDispensada = (id: number, dispensada: boolean) => {
    marcarDispensada.mutate({
      id,
      dispensada: !dispensada,
      dataDispensacao: !dispensada ? new Date() : undefined,
    });
  };

  const handleExcluir = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta prescrição?")) {
      excluirPrescricao.mutate({ id });
    }
  };

  const isExpirada = (dataValidade: Date | string | null) => {
    if (!dataValidade) return false;
    return new Date(dataValidade) < new Date();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prescrições Médicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prescrições Médicas</CardTitle>
              {estatisticas && (
                <p className="text-sm text-muted-foreground mt-1">
                  {estatisticas.total} {estatisticas.total === 1 ? "prescrição" : "prescrições"}
                  {estatisticas.ativas > 0 && ` • ${estatisticas.ativas} ativa${estatisticas.ativas > 1 ? "s" : ""}`}
                </p>
              )}
            </div>
            <Button onClick={() => setDialogAberto(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Prescrição
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!prescricoes || prescricoes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma prescrição registada</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setDialogAberto(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Prescrição
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {prescricoes.map((prescricao) => {
                const expirada = isExpirada(prescricao.dataValidade);
                
                return (
                  <div
                    key={prescricao.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            prescricao.dispensada
                              ? "default"
                              : expirada
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {prescricao.dispensada
                            ? "Dispensada"
                            : expirada
                            ? "Expirada"
                            : "Ativa"}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(prescricao.dataPrescricao).toLocaleDateString("pt-PT")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!prescricao.dispensada && !expirada && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleMarcarDispensada(prescricao.id, prescricao.dispensada)
                            }
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Marcar Dispensada
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExcluir(prescricao.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>

                    {prescricao.diagnostico && (
                      <div className="mb-3">
                        <p className="text-sm font-medium">Diagnóstico:</p>
                        <p className="text-sm text-muted-foreground">
                          {prescricao.diagnostico}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        Medicamentos:
                      </p>
                      {prescricao.medicamentos && Array.isArray(prescricao.medicamentos) && prescricao.medicamentos.map((med: any, index: number) => (
                        <div
                          key={index}
                          className="bg-accent/30 rounded p-3 text-sm"
                        >
                          <p className="font-medium">{med.nome}</p>
                          {med.principioAtivo && (
                            <p className="text-xs text-muted-foreground">
                              {med.principioAtivo}
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Dosagem:</span>{" "}
                              {med.dosagem}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Via:</span>{" "}
                              {med.via}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Frequência:</span>{" "}
                              {med.frequencia}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Duração:</span>{" "}
                              {med.duracao}
                            </div>
                          </div>
                          {med.instrucoes && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {med.instrucoes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {prescricao.observacoes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium">Observações:</p>
                        <p className="text-sm text-muted-foreground">
                          {prescricao.observacoes}
                        </p>
                      </div>
                    )}

                    {prescricao.dataValidade && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Válida até:{" "}
                        {new Date(prescricao.dataValidade).toLocaleDateString("pt-PT")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AdicionarPrescricaoDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        utenteId={utenteId}
        onSuccess={() => {
          refetch();
          setDialogAberto(false);
        }}
      />
    </>
  );
}
