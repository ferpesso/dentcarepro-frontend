import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Star, Lock, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { AdicionarNotaDialog } from "./AdicionarNotaDialog";

interface NotasClinicasProps {
  utenteId: number;
  clinicaId: number;
}

export function NotasClinicas({ utenteId, clinicaId }: NotasClinicasProps) {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [notaSelecionada, setNotaSelecionada] = useState<any>(null);

  const { data: notas, isLoading, refetch } = trpc.notas.listar.useQuery({
    utenteId,
  });

  const { data: estatisticas } = trpc.notas.estatisticas.useQuery({
    utenteId,
  });

  const marcarImportante = trpc.notas.marcarImportante.useMutation({
    onSuccess: () => {
      toast.success("Nota atualizada");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar nota: " + error.message);
    },
  });

  const excluirNota = trpc.notas.excluir.useMutation({
    onSuccess: () => {
      toast.success("Nota excluída");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao excluir nota: " + error.message);
    },
  });

  const handleMarcarImportante = (id: number, importante: boolean) => {
    marcarImportante.mutate({ id, importante: !importante });
  };

  const handleExcluir = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta nota?")) {
      excluirNota.mutate({ id });
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      clinica: "Clínica",
      administrativa: "Administrativa",
      lembrete: "Lembrete",
      observacao: "Observação",
      diagnostico: "Diagnóstico",
      evolucao: "Evolução",
    };
    return tipos[tipo] || tipo;
  };

  const getTipoCor = (tipo: string) => {
    const cores: Record<string, string> = {
      clinica: "bg-blue-100 text-blue-800",
      administrativa: "bg-gray-100 text-gray-800",
      lembrete: "bg-yellow-100 text-yellow-800",
      observacao: "bg-green-100 text-green-800",
      diagnostico: "bg-red-100 text-red-800",
      evolucao: "bg-purple-100 text-purple-800",
    };
    return cores[tipo] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notas Clínicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
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
              <CardTitle>Notas Clínicas</CardTitle>
              {estatisticas && (
                <p className="text-sm text-muted-foreground mt-1">
                  {estatisticas.total} {estatisticas.total === 1 ? "nota" : "notas"}
                  {estatisticas.importantes > 0 && ` • ${estatisticas.importantes} importante${estatisticas.importantes > 1 ? "s" : ""}`}
                </p>
              )}
            </div>
            <Button onClick={() => setDialogAberto(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Nota
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!notas || notas.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma nota registada</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setDialogAberto(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Nota
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {notas.map((nota) => (
                <div
                  key={nota.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getTipoCor(nota.tipo)}>
                        {getTipoLabel(nota.tipo)}
                      </Badge>
                      {nota.importante && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                      {nota.privada && (
                        <Lock className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarcarImportante(nota.id, nota.importante)}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            nota.importante
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-400"
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExcluir(nota.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>

                  {nota.titulo && (
                    <h4 className="font-semibold mb-2">{nota.titulo}</h4>
                  )}

                  <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">
                    {nota.conteudo}
                  </p>

                  {nota.tags && nota.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {nota.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(nota.createdAt).toLocaleDateString("pt-PT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AdicionarNotaDialog
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
