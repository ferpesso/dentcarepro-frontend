import { trpc } from "@/lib/trpc";
import { AvaliacoesChartsV2 } from "@/components/AvaliacoesChartsV2";
import { exportarAvaliacoesPDF } from "@/lib/pdf-export";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, ThumbsUp, TrendingUp, Filter, Search, FileDown } from "lucide-react";
import { StatCard } from "@/components/ui/card-modern";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Página de Avaliações
 * 
 * Gestão de avaliações de clientes
 */
export default function Avaliacoes() {
  const [clinicaId, setClinicaId] = useState<number | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroAprovadas, setFiltroAprovadas] = useState<boolean | undefined>(undefined);
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<any>(null);
  const [resposta, setResposta] = useState("");

  // Buscar clínicas do utilizador
  const { data: clinicas, isLoading: loadingClinicas } = trpc.clinicas.minhas.useQuery();

  // Buscar avaliações
  const { data: avaliacoes, isLoading: loadingAvaliacoes, refetch } = trpc.avaliacoes.listar.useQuery(
    {
      tipo: filtroTipo === "todos" ? undefined : filtroTipo as any,
      aprovadas: filtroAprovadas,
      limit: 50,
      offset: 0,
    },
    { enabled: !!clinicaId }
  );

  // Buscar estatísticas
  const { data: stats } = trpc.avaliacoes.estatisticas.useQuery(
    { periodo: "mes", ano: new Date().getFullYear(), mes: new Date().getMonth() + 1 },
    { enabled: !!clinicaId }
  );

  // Mutation para aprovar avaliação
  const aprovarMutation = trpc.avaliacoes.aprovar.useMutation({
    onSuccess: () => {
      toast.success("Avaliação aprovada!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao aprovar: " + error.message);
    },
  });

  // Mutation para responder avaliação
  const responderMutation = trpc.avaliacoes.responder.useMutation({
    onSuccess: () => {
      toast.success("Resposta enviada!");
      setAvaliacaoSelecionada(null);
      setResposta("");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao responder: " + error.message);
    },
  });

  // Definir clínica ativa
  useEffect(() => {
    if (clinicas && clinicas.length > 0 && !clinicaId) {
      setClinicaId(clinicas[0].clinica.id);
    }
  }, [clinicas, clinicaId]);

  if (loadingClinicas) {
    return <AvaliacoesSkeleton />;
  }

  if (!clinicas || clinicas.length === 0) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Nenhuma clínica encontrada</h3>
              <p className="text-muted-foreground">
                Configure uma clínica para começar a gerir avaliações.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAprovar = (id: number) => {
    aprovarMutation.mutate({ id });
  };

  const handleResponder = () => {
    if (!avaliacaoSelecionada || !resposta.trim()) {
      toast.error("Por favor, escreva uma resposta");
      return;
    }
    responderMutation.mutate({
      avaliacaoId: avaliacaoSelecionada.avaliacao.id,
      resposta: resposta.trim(),
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Avaliações</h1>
          <p className="text-muted-foreground mt-1">
            Gerir feedback dos clientes
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            if (!avaliacoes || !stats) {
              toast.error("Sem dados para exportar");
              return;
            }
            exportarAvaliacoesPDF({
              titulo: "Relatório de Avaliações",
              periodo: `Gerado em ${new Date().toLocaleDateString('pt-PT')}`,
              estatisticas: {
                total: stats.total_avaliacoes || 0,
                media: stats.media_classificacao || 0,
                taxaRecomendacao: stats.taxa_recomendacao || 0,
                nps: stats.nps_score || 0,
              },
              avaliacoes: avaliacoes.map((item: any) => ({
                utente: item.utente?.nome || "Anónimo",
                classificacao: item.avaliacao.classificacao,
                tipo: item.avaliacao.tipo,
                comentario: item.avaliacao.comentario || "",
                data: new Date(item.avaliacao.createdAt).toLocaleDateString('pt-PT'),
                aprovada: item.avaliacao.aprovada,
              })),
            });
            toast.success("Relatório exportado com sucesso!");
          }}
        >
          <FileDown className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Avaliações"
          value={stats?.total_avaliacoes || 0}
          icon={MessageSquare}
          color="blue"
        />

        <StatCard
          title="Média de Classificação"
          value={stats?.media_classificacao?.toFixed(1) || "0.0"}
          icon={Star}
          color="yellow"
          suffix="/5"
        />

        <StatCard
          title="Taxa de Recomendação"
          value={`${stats?.taxa_recomendacao?.toFixed(0) || 0}%`}
          icon={ThumbsUp}
          color="green"
        />

        <StatCard
          title="NPS Score"
          value={stats?.nps_score?.toFixed(0) || 0}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="consulta">Consulta</SelectItem>
                <SelectItem value="dentista">Dentista</SelectItem>
                <SelectItem value="clinica">Clínica</SelectItem>
                <SelectItem value="procedimento">Procedimento</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filtroAprovadas === undefined ? "todas" : filtroAprovadas ? "aprovadas" : "pendentes"}
              onValueChange={(value) =>
                setFiltroAprovadas(value === "todas" ? undefined : value === "aprovadas")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="aprovadas">Aprovadas</SelectItem>
                <SelectItem value="pendentes">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos de Evolução */}
      <AvaliacoesChartsV2 />

      {/* Lista de Avaliações */}
      <Card>
        <CardHeader>
          <CardTitle>Avaliações Recebidas</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAvaliacoes ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : !avaliacoes || avaliacoes.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma avaliação encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {avaliacoes.map((item: any) => (
                <Card key={item.avaliacao.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{item.utente?.nome || "Anónimo"}</h3>
                          {renderStars(item.avaliacao.classificacao)}
                          <Badge variant={item.avaliacao.aprovada ? "default" : "secondary"}>
                            {item.avaliacao.aprovada ? "Aprovada" : "Pendente"}
                          </Badge>
                          <Badge variant="outline">{item.avaliacao.tipo}</Badge>
                        </div>
                        {item.avaliacao.titulo && (
                          <h4 className="font-medium mb-2">{item.avaliacao.titulo}</h4>
                        )}
                        {item.avaliacao.comentario && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {item.avaliacao.comentario}
                          </p>
                        )}
                        {item.dentista && (
                          <p className="text-xs text-muted-foreground">
                            Dentista: {item.dentista.nome}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(item.avaliacao.createdAt).toLocaleDateString("pt-PT", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!item.avaliacao.aprovada && (
                          <Button
                            size="sm"
                            onClick={() => handleAprovar(item.avaliacao.id)}
                            disabled={aprovarMutation.isPending}
                          >
                            Aprovar
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setAvaliacaoSelecionada(item)}
                            >
                              Responder
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Responder à Avaliação</DialogTitle>
                              <DialogDescription>
                                Escreva uma resposta profissional ao feedback do cliente
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div className="p-4 bg-muted rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  {renderStars(item.avaliacao.classificacao)}
                                </div>
                                <p className="text-sm">{item.avaliacao.comentario}</p>
                              </div>
                              <Textarea
                                placeholder="Escreva a sua resposta..."
                                value={resposta}
                                onChange={(e) => setResposta(e.target.value)}
                                rows={5}
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setAvaliacaoSelecionada(null);
                                    setResposta("");
                                  }}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={handleResponder}
                                  disabled={responderMutation.isPending || !resposta.trim()}
                                >
                                  {responderMutation.isPending ? "Enviando..." : "Enviar Resposta"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AvaliacoesSkeleton() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
