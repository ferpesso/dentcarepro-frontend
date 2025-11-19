import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Bell, Check, CheckCheck, X, AlertCircle, TrendingDown, Star, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Notificacao {
  id: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  link?: string | null;
  icone?: string | null;
  cor?: string | null;
  lida: boolean;
  createdAt: Date;
}

export function Notificacoes() {
  const [aberto, setAberto] = useState(false);
  const clinicaId = 1; // TODO: Obter da sessão

  // Queries
  const { data: notificacoes = [], refetch } = trpc.notificacoesSistema.listar.useQuery(
    { clinicaId, limite: 10 },
    { enabled: true, refetchInterval: 30000 } // Atualizar a cada 30s
  );

  const { data: contagem } = trpc.notificacoesSistema.contarNaoLidas.useQuery(
    { clinicaId },
    { enabled: true, refetchInterval: 30000 }
  );

  // Mutations
  const marcarComoLidaMutation = trpc.notificacoesSistema.marcarComoLida.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const marcarTodasComoLidasMutation = trpc.notificacoesSistema.marcarTodasComoLidas.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Todas as notificações foram marcadas como lidas");
    },
  });

  const deletarMutation = trpc.notificacoesSistema.deletar.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Notificação removida");
    },
  });

  // Obter ícone baseado no tipo
  const getIcone = (notif: Notificacao) => {
    const iconProps = { className: "h-4 w-4" };
    
    if (notif.icone) {
      switch (notif.icone) {
        case "AlertCircle": return <AlertCircle {...iconProps} />;
        case "TrendingDown": return <TrendingDown {...iconProps} />;
        case "Star": return <Star {...iconProps} />;
        case "Euro": return <Euro {...iconProps} />;
        default: return <Bell {...iconProps} />;
      }
    }

    // Fallback baseado no tipo
    switch (notif.tipo) {
      case "avaliacao_negativa": return <Star {...iconProps} />;
      case "custo_alto": return <Euro {...iconProps} />;
      case "pagamento_pendente": return <AlertCircle {...iconProps} />;
      default: return <Bell {...iconProps} />;
    }
  };

  // Obter cor baseada na notificação
  const getCor = (notif: Notificacao) => {
    if (notif.cor) return notif.cor;
    
    switch (notif.tipo) {
      case "avaliacao_negativa": return "red";
      case "custo_alto": return "yellow";
      case "pagamento_pendente": return "orange";
      case "nova_avaliacao": return "green";
      default: return "blue";
    }
  };

  // Formatar data relativa
  const formatarDataRelativa = (data: Date) => {
    const agora = new Date();
    const diff = agora.getTime() - new Date(data).getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return "Agora";
    if (minutos < 60) return `${minutos}m atrás`;
    if (horas < 24) return `${horas}h atrás`;
    if (dias === 1) return "Ontem";
    if (dias < 7) return `${dias}d atrás`;
    return new Date(data).toLocaleDateString("pt-PT");
  };

  const naoLidas = contagem?.total || 0;

  return (
    <DropdownMenu open={aberto} onOpenChange={setAberto}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {naoLidas > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {naoLidas > 9 ? "9+" : naoLidas}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Notificações</h3>
            {naoLidas > 0 && (
              <p className="text-xs text-muted-foreground">
                {naoLidas} {naoLidas === 1 ? "nova" : "novas"}
              </p>
            )}
          </div>
          {naoLidas > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => marcarTodasComoLidasMutation.mutate({ clinicaId })}
              disabled={marcarTodasComoLidasMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas
            </Button>
          )}
        </div>

        {/* Lista de Notificações */}
        <div className="max-h-[400px] overflow-y-auto">
          {notificacoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação
              </p>
            </div>
          ) : (
            notificacoes.map((notif: any) => {
              const cor = getCor(notif);
              const corClasses = {
                red: "bg-red-50 text-red-600 hover:bg-red-100",
                yellow: "bg-yellow-50 text-yellow-600 hover:bg-yellow-100",
                orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
                green: "bg-green-50 text-green-600 hover:bg-green-100",
                blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
              };

              return (
                <div
                  key={notif.id}
                  className={cn(
                    "flex items-start gap-3 p-4 border-b transition-colors",
                    !notif.lida && "bg-muted/30",
                    notif.link && "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => {
                    if (!notif.lida) {
                      marcarComoLidaMutation.mutate({ id: notif.id });
                    }
                    if (notif.link) {
                      window.location.href = notif.link;
                      setAberto(false);
                    }
                  }}
                >
                  {/* Ícone */}
                  <div className={cn("p-2 rounded-full", corClasses[cor as keyof typeof corClasses])}>
                    {getIcone(notif)}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-tight">
                          {notif.titulo}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notif.mensagem}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatarDataRelativa(notif.createdAt)}
                        </p>
                      </div>
                      
                      {/* Ações */}
                      <div className="flex items-center gap-1">
                        {!notif.lida && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              marcarComoLidaMutation.mutate({ id: notif.id });
                            }}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletarMutation.mutate({ id: notif.id });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notificacoes.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                // TODO: Navegar para página de notificações
                setAberto(false);
              }}
            >
              Ver todas as notificações
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
