import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Clock, 
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Save,
  RefreshCw
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

export default function ConfiguracoesLembretes() {
  const { toast } = useToast();
  const clinicaId = 1; // TODO: Obter da sessao

  // Estados
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewTipo, setPreviewTipo] = useState<"consulta" | "pagamento">("consulta");
  const [previewCanal, setPreviewCanal] = useState<"email" | "sms" | "whatsapp">("email");

  // Queries
  const { data: configData, refetch: refetchConfig } = trpc.lembretesConfig.getConfig.useQuery(
    { clinicaId },
    { enabled: true }
  );

  const { data: estatisticas } = trpc.lembretesConfig.getEstatisticas.useQuery({
    clinicaId,
    periodoInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    periodoFim: new Date().toISOString(),
  });

  const { data: preview } = trpc.lembretesConfig.previewMensagem.useQuery({
    clinicaId,
    tipo: previewTipo,
    canal: previewCanal,
  });

  const { data: historico } = trpc.lembretesConfig.getHistorico.useQuery({
    clinicaId,
    limite: 20,
  });

  // Mutations
  const updateConfigMutation = trpc.lembretesConfig.updateConfig.useMutation({
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As configurações de lembretes foram atualizadas com sucesso.",
      });
      refetchConfig();
      setSaving(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
      setSaving(false);
    },
  });

  // Carregar configurações
  useEffect(() => {
    if (configData) {
      setConfig(configData);
      setLoading(false);
    }
  }, [configData]);

  // Salvar configurações
  const handleSave = async () => {
    if (!config) return;
    
    setSaving(true);
    updateConfigMutation.mutate({
      clinicaId,
      ...config,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="w-8 h-8 text-primary" />
            Configurações de Lembretes
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure lembretes automáticos para consultas e pagamentos
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              A guardar...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Alterações
            </>
          )}
        </Button>
      </div>

      {/* Estatísticas Rápidas */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Enviados (30 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Taxa de sucesso: {estatisticas.taxaSucesso}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalEmail}</div>
              <p className="text-xs text-green-600 mt-1">Grátis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                SMS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalSms}</div>
              <p className="text-xs text-muted-foreground mt-1">
                €{(estatisticas.totalSms * 0.06).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalWhatsapp}</div>
              <p className="text-xs text-muted-foreground mt-1">
                €{(estatisticas.totalWhatsapp * 0.01).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs Principais */}
      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList>
          <TabsTrigger value="geral">Configurações Gerais</TabsTrigger>
          <TabsTrigger value="canais">Canais de Comunicação</TabsTrigger>
          <TabsTrigger value="preview">Preview de Mensagens</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        {/* Tab: Configurações Gerais */}
        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configure quando e como os lembretes serão enviados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ativar/Desativar Lembretes */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Lembretes Automáticos</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar ou desativar todos os lembretes automáticos
                  </p>
                </div>
                <Switch
                  checked={config?.lembretesAtivos}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, lembretesAtivos: checked })
                  }
                />
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Lembretes de Consultas
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Antecedência do Lembrete (horas)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="168"
                      value={config?.lembreteConsultaHoras || 24}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          lembreteConsultaHoras: parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Enviar lembrete X horas antes da consulta
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Confirmação (horas)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="168"
                      value={config?.lembreteConfirmacaoHoras || 48}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          lembreteConfirmacaoHoras: parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Pedir confirmação X horas antes
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Lembretes de Pagamento
                </h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lembretes de Faturas Vencidas</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar lembretes para faturas em atraso
                    </p>
                  </div>
                  <Switch
                    checked={config?.lembretePagamentoAtivo}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, lembretePagamentoAtivo: checked })
                    }
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Horários de Envio
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Horário Início</Label>
                    <Input
                      type="time"
                      value={config?.horarioEnvioInicio || "09:00"}
                      onChange={(e) =>
                        setConfig({ ...config, horarioEnvioInicio: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Horário Fim</Label>
                    <Input
                      type="time"
                      value={config?.horarioEnvioFim || "20:00"}
                      onChange={(e) =>
                        setConfig({ ...config, horarioEnvioFim: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enviar aos Fins de Semana</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar lembretes aos sábados e domingos
                    </p>
                  </div>
                  <Switch
                    checked={config?.enviarFinsSemana}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, enviarFinsSemana: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Canais de Comunicação */}
        <TabsContent value="canais" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Canais de Comunicação</CardTitle>
              <CardDescription>
                Escolha quais canais usar para enviar lembretes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-blue-500 mt-1" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-base">Email</Label>
                      <Badge variant="secondary">Grátis</Badge>
                      <Badge variant="outline" className="text-green-600">
                        Recomendado
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Envio gratuito via SendGrid (até 3000/mês)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      • Melhor para mensagens longas<br />
                      • Inclui formatação e links<br />
                      • Alta taxa de entrega
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config?.canalEmailAtivo}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, canalEmailAtivo: checked })
                  }
                />
              </div>

              {/* WhatsApp */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-4">
                  <MessageSquare className="w-6 h-6 text-green-500 mt-1" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-base">WhatsApp</Label>
                      <Badge variant="secondary">€0.01/msg</Badge>
                      <Badge variant="outline" className="text-green-600">
                        Melhor ROI
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      WhatsApp Business API - Mais barato que SMS
                    </p>
                    <p className="text-xs text-muted-foreground">
                      • Taxa de abertura: 98%<br />
                      • Resposta rápida<br />
                      • Muito mais barato que SMS
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config?.canalWhatsappAtivo}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, canalWhatsappAtivo: checked })
                  }
                />
              </div>

              {/* SMS */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-4">
                  <Smartphone className="w-6 h-6 text-orange-500 mt-1" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-base">SMS</Label>
                      <Badge variant="secondary">€0.06/msg</Badge>
                      <Badge variant="outline" className="text-orange-600">
                        Mais caro
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      SMS via Twilio - Usar apenas se necessário
                    </p>
                    <p className="text-xs text-muted-foreground">
                      • Garantia de entrega<br />
                      • Funciona sem internet<br />
                      • Custo mais elevado
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config?.canalSmsAtivo}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, canalSmsAtivo: checked })
                  }
                />
              </div>

              <Alert>
                <TrendingUp className="w-4 h-4" />
                <AlertDescription>
                  <strong>Recomendação:</strong> Use Email (grátis) + WhatsApp (€0.01/msg) para
                  melhor custo-benefício. Reserve SMS apenas para urgências.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Preview */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview de Mensagens
              </CardTitle>
              <CardDescription>
                Veja como as mensagens serão enviadas aos utentes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Mensagem</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={previewTipo === "consulta" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewTipo("consulta")}
                    >
                      Consulta
                    </Button>
                    <Button
                      variant={previewTipo === "pagamento" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewTipo("pagamento")}
                    >
                      Pagamento
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Canal</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={previewCanal === "email" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewCanal("email")}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </Button>
                    <Button
                      variant={previewCanal === "sms" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewCanal("sms")}
                    >
                      <Smartphone className="w-4 h-4 mr-1" />
                      SMS
                    </Button>
                    <Button
                      variant={previewCanal === "whatsapp" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewCanal("whatsapp")}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>

              {preview && (
                <>
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {preview.mensagem}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{preview.caracteres} caracteres</span>
                    <span>Custo estimado: €{preview.custoEstimado}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Histórico */}
        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Mensagens</CardTitle>
              <CardDescription>
                Últimas 20 mensagens enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {historico && historico.length > 0 ? (
                  historico.map((msg: any) => (
                    <div
                      key={msg.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {msg.canal === "email" && <Mail className="w-4 h-4 text-blue-500" />}
                        {msg.canal === "sms" && <Smartphone className="w-4 h-4 text-orange-500" />}
                        {msg.canal === "whatsapp" && (
                          <MessageSquare className="w-4 h-4 text-green-500" />
                        )}
                        <div>
                          <p className="font-medium">{msg.utenteNome}</p>
                          <p className="text-sm text-muted-foreground">{msg.assunto}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {msg.estado === "enviada" && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Enviada
                          </Badge>
                        )}
                        {msg.estado === "falhada" && (
                          <Badge variant="outline" className="text-red-600">
                            <XCircle className="w-3 h-3 mr-1" />
                            Falhada
                          </Badge>
                        )}
                        {msg.estado === "pendente" && (
                          <Badge variant="outline" className="text-yellow-600">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {new Date(msg.criadoEm).toLocaleDateString("pt-PT")}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma mensagem enviada ainda
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
