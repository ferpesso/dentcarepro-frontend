import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Users,
  Building2,
  FileText,
  HardDrive,
  Calendar,
  Receipt,
  Zap
} from "lucide-react";
import { toast } from "sonner";

export default function Assinatura() {
  const [clinicaId, setClinicaId] = useState<number | null>(null);
  const [dialogMudarPlano, setDialogMudarPlano] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState<number | null>(null);

  const { data: clinicas } = trpc.clinicas.minhas.useQuery();
  
  const { data: assinatura, isLoading: loadingAssinatura } = trpc.saas.minhaAssinatura.useQuery(
    { clinicaId: clinicaId! },
    { enabled: !!clinicaId }
  );

  const { data: planos } = trpc.saas.planos.useQuery();

  const { data: metricas } = trpc.saas.metricas.useQuery(
    {
      clinicaId: clinicaId!,
      dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      dataFim: new Date(),
    },
    { enabled: !!clinicaId }
  );

  useEffect(() => {
    if (clinicas && clinicas.length > 0 && !clinicaId) {
      setClinicaId(clinicas[0].clinica.id);
    }
  }, [clinicas, clinicaId]);

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(num);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-PT");
  };

  const calcularPercentagemUso = (usado: number, limite: number) => {
    if (limite === 0) return 0;
    return Math.min((usado / limite) * 100, 100);
  };

  const getCorProgresso = (percentagem: number) => {
    if (percentagem >= 90) return "bg-red-500";
    if (percentagem >= 70) return "bg-orange-500";
    return "bg-green-500";
  };

  if (loadingAssinatura) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Assinatura</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center py-8">A carregar...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const planoAtual = planos?.find(p => p.id === assinatura?.assinatura.planoId);
  const usoUtentes = metricas?.totalUtentes || 0;
  const usoDentistas = metricas?.dentistasAtivos || 0;
  const usoConsultas = metricas?.totalConsultas || 0;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold">Assinatura</h1>
        <p className="text-muted-foreground">
          Gerir o seu plano e acompanhar o uso de recursos
        </p>
      </div>

      {/* Plano Atual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Plano Atual
                </CardTitle>
                <CardDescription>Informações sobre a sua assinatura</CardDescription>
              </div>
              {planoAtual?.popular && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                  Mais Popular
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold">{planoAtual?.nome || "Sem Plano"}</h3>
                <p className="text-muted-foreground mt-1">
                  {planoAtual?.descricao || "Nenhum plano ativo"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">
                  {planoAtual ? formatCurrency(planoAtual.precoMensal) : "-"}
                </p>
                <p className="text-sm text-muted-foreground">por mês</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge variant={assinatura?.assinatura.estado === "ativo" ? "default" : "secondary"}>
                  {assinatura?.assinatura.estado === "ativo" ? "Ativa" : assinatura?.assinatura.estado || "Inativa"}
                </Badge>
              </div>
              {assinatura?.assinatura?.inicioPeriodoAtual && (
                <div>
                  <p className="text-sm text-muted-foreground">Data de Início</p>
                  <p className="font-medium">{formatDate(assinatura.assinatura.inicioPeriodoAtual)}</p>
                </div>
              )}
              {assinatura?.assinatura?.fimPeriodoAtual && (
                <div>
                  <p className="text-sm text-muted-foreground">Próxima Renovação</p>
                  <p className="font-medium">{formatDate(assinatura.assinatura.fimPeriodoAtual)}</p>
                </div>
              )}
              {assinatura?.assinatura?.stripePaymentMethodId && (
                <div>
                  <p className="text-sm text-muted-foreground">Método de Pagamento</p>
                  <p className="font-medium">Cartão configurado</p>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex gap-2">
              <Dialog open={dialogMudarPlano} onOpenChange={setDialogMudarPlano}>
                <DialogTrigger asChild>
                  <Button variant="default">
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Mudar de Plano
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Escolher Novo Plano</DialogTitle>
                    <DialogDescription>
                      Selecione o plano que melhor se adequa às suas necessidades
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    {planos?.map((plano) => (
                      <Card 
                        key={plano.id}
                        className={`cursor-pointer transition-all ${
                          planoSelecionado === plano.id 
                            ? "ring-2 ring-primary" 
                            : "hover:shadow-lg"
                        }`}
                        onClick={() => setPlanoSelecionado(plano.id)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">{plano.nome}</CardTitle>
                          <div className="text-2xl font-bold">
                            {formatCurrency(plano.precoMensal)}
                            <span className="text-sm font-normal text-muted-foreground">/mês</span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{plano.maxDentistas} dentistas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{plano.maxUtentes} utentes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>{plano.maxClinicas} clínica(s)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4" />
                            <span>{plano.maxArmazenamentoGB} GB armazenamento</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogMudarPlano(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => {
                        toast.info("Funcionalidade de mudança de plano em desenvolvimento");
                        setDialogMudarPlano(false);
                      }}
                      disabled={!planoSelecionado}
                    >
                      Confirmar Mudança
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline">
                <Receipt className="h-4 w-4 mr-2" />
                Histórico de Pagamentos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Faturação */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Faturação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Valor Mensal</p>
              <p className="text-2xl font-bold">
                {planoAtual ? formatCurrency(planoAtual.precoMensal) : "-"}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Próximo Pagamento</p>
              <p className="font-medium">
                {assinatura?.assinatura?.fimPeriodoAtual 
                  ? formatDate(assinatura.assinatura.fimPeriodoAtual)
                  : "-"}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Método de Pagamento</p>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">
                  {assinatura?.assinatura?.stripePaymentMethodId ? "Cartão configurado" : "Não configurado"}
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Atualizar Método
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Uso de Recursos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Uso de Recursos
          </CardTitle>
          <CardDescription>
            Acompanhe o uso dos recursos do seu plano
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Utentes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Utentes</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {usoUtentes} / {planoAtual?.maxUtentes || 0}
              </span>
            </div>
            <Progress 
              value={calcularPercentagemUso(usoUtentes, planoAtual?.maxUtentes || 0)}
              className="h-2"
            />
            {calcularPercentagemUso(usoUtentes, planoAtual?.maxUtentes || 0) >= 90 && (
              <p className="text-xs text-orange-600">
                Está próximo do limite. Considere fazer upgrade do plano.
              </p>
            )}
          </div>

          {/* Dentistas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Dentistas</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {usoDentistas} / {planoAtual?.maxDentistas || 0}
              </span>
            </div>
            <Progress 
              value={calcularPercentagemUso(usoDentistas, planoAtual?.maxDentistas || 0)}
              className="h-2"
            />
          </div>

          {/* Clínicas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Clínicas</span>
              </div>
              <span className="text-sm text-muted-foreground">
                1 / {planoAtual?.maxClinicas || 0}
              </span>
            </div>
            <Progress 
              value={calcularPercentagemUso(1, planoAtual?.maxClinicas || 0)}
              className="h-2"
            />
          </div>

          {/* Armazenamento */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Armazenamento</span>
              </div>
              <span className="text-sm text-muted-foreground">
                0.5 GB / {planoAtual?.maxArmazenamentoGB || 0} GB
              </span>
            </div>
            <Progress 
              value={calcularPercentagemUso(0.5, planoAtual?.maxArmazenamentoGB || 0)}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Funcionalidades do Plano */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades Incluídas</CardTitle>
          <CardDescription>
            Recursos disponíveis no seu plano atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {planoAtual?.funcionalidades && Object.entries(planoAtual.funcionalidades).map(([key, value]) => {
              const labels: Record<string, string> = {
                multiClinica: "Múltiplas Clínicas",
                mensagensIA: "Mensagens com IA",
                relatoriosAvancados: "Relatórios Avançados",
                acessoAPI: "Acesso à API",
                suportePrioritario: "Suporte Prioritário",
                marcaPersonalizada: "Marca Personalizada",
                integracaoWhatsapp: "Integração WhatsApp",
                notificacoesSMS: "Notificações SMS",
              };

              return (
                <div key={key} className="flex items-center gap-2">
                  {value ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={value ? "font-medium" : "text-muted-foreground"}>
                    {labels[key] || key}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas do Mês */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Estatísticas do Mês
          </CardTitle>
          <CardDescription>
            Resumo da atividade no mês atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{metricas?.totalConsultas || 0}</p>
              <p className="text-sm text-muted-foreground">Consultas</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{metricas?.totalUtentes || 0}</p>
              <p className="text-sm text-muted-foreground">Utentes Ativos</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{metricas?.totalFaturas || 0}</p>
              <p className="text-sm text-muted-foreground">Faturas Emitidas</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">
                {metricas?.receitaTotal ? formatCurrency(metricas.receitaTotal) : "-"}
              </p>
              <p className="text-sm text-muted-foreground">Receita</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
