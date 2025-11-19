/**
 * Página de Configurações de Comunicação
 * WhatsApp Business API + Email Marketing
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Mail, 
  Send, 
  CheckCircle2, 
  XCircle,
  Settings,
  TestTube,
  Save,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function ConfiguracoesComunicacao() {
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("Olá! Esta é uma mensagem de teste do DentCarePro.");
  const [testEmail, setTestEmail] = useState("");
  const [testEmailSubject, setTestEmailSubject] = useState("Teste de Email - DentCarePro");
  const [testEmailBody, setTestEmailBody] = useState("Esta é uma mensagem de teste.");

  // Verificar configuração do WhatsApp
  const { data: whatsappConfig, isLoading: loadingWhatsapp } = trpc.whatsapp.checkConfig.useQuery();

  // Testar envio de WhatsApp
  const testWhatsappMutation = trpc.whatsapp.testMessage.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Mensagem WhatsApp enviada com sucesso!");
      } else {
        toast.error(`Erro ao enviar: ${result.error}`);
      }
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleTestWhatsApp = () => {
    if (!testPhone) {
      toast.error("Por favor, insira um número de telefone");
      return;
    }

    testWhatsappMutation.mutate({
      phoneNumber: testPhone,
      message: testMessage,
    });
  };

  const handleTestEmail = () => {
    if (!testEmail) {
      toast.error("Por favor, insira um endereço de email");
      return;
    }

    // TODO: Implementar teste de email
    toast.info("Funcionalidade de teste de email em desenvolvimento");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações de Comunicação</h1>
          <p className="text-muted-foreground">
            Configure WhatsApp Business API e Email Marketing
          </p>
        </div>
      </div>

      <Tabs defaultValue="whatsapp" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="whatsapp">
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email Marketing
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Settings className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* TAB: WHATSAPP */}
        <TabsContent value="whatsapp" className="space-y-6">
          {/* Status da Configuração */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Status da Configuração
                {whatsappConfig?.configured ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Configurado
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Não Configurado
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {whatsappConfig?.configured
                  ? `Provedor ativo: ${whatsappConfig.provider === 'meta' ? 'Meta WhatsApp Business API' : 'Twilio'}`
                  : "Configure as credenciais do WhatsApp Business API para começar a enviar mensagens"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!whatsappConfig?.configured && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-amber-900">
                        Configuração necessária
                      </p>
                      <p className="text-sm text-amber-700">
                        Para ativar o WhatsApp, adicione as seguintes variáveis de ambiente no Vercel:
                      </p>
                      <div className="bg-white rounded border border-amber-200 p-3 mt-2 font-mono text-xs space-y-1">
                        <div><strong>Meta WhatsApp:</strong></div>
                        <div>WHATSAPP_PROVIDER=meta</div>
                        <div>META_WHATSAPP_ACCESS_TOKEN=seu_token</div>
                        <div>META_WHATSAPP_PHONE_NUMBER_ID=seu_id</div>
                        <div>META_WHATSAPP_BUSINESS_ACCOUNT_ID=seu_account_id</div>
                        <div className="pt-2"><strong>OU Twilio:</strong></div>
                        <div>WHATSAPP_PROVIDER=twilio</div>
                        <div>TWILIO_ACCOUNT_SID=seu_sid</div>
                        <div>TWILIO_AUTH_TOKEN=seu_token</div>
                        <div>TWILIO_WHATSAPP_NUMBER=+351912345678</div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('https://business.facebook.com', '_blank')}
                        >
                          Configurar Meta
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('https://www.twilio.com', '_blank')}
                        >
                          Configurar Twilio
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teste de Envio */}
          {whatsappConfig?.configured && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Testar Envio de Mensagem
                </CardTitle>
                <CardDescription>
                  Envie uma mensagem de teste para verificar se está tudo a funcionar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testPhone">Número de Telefone</Label>
                  <Input
                    id="testPhone"
                    type="tel"
                    placeholder="+351 912 345 678"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Formato: +351912345678 (com código do país)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testMessage">Mensagem</Label>
                  <Textarea
                    id="testMessage"
                    placeholder="Digite a mensagem de teste..."
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    {testMessage.length} caracteres
                  </p>
                </div>

                <Button 
                  onClick={handleTestWhatsApp}
                  disabled={testWhatsappMutation.isPending || !testPhone}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {testWhatsappMutation.isPending ? "A enviar..." : "Enviar Mensagem de Teste"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Estatísticas */}
          {whatsappConfig?.configured && (
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Envio</CardTitle>
                <CardDescription>
                  Mensagens enviadas via WhatsApp nos últimos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">0</div>
                    <div className="text-sm text-muted-foreground">Enviadas</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-muted-foreground">Lidas</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <div className="text-3xl font-bold text-amber-600">0</div>
                    <div className="text-sm text-muted-foreground">Respondidas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB: EMAIL MARKETING */}
        <TabsContent value="email" className="space-y-6">
          {/* Status da Configuração */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Status da Configuração
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Não Configurado
                </Badge>
              </CardTitle>
              <CardDescription>
                Configure o provedor de email para enviar campanhas de marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-amber-900">
                      Configuração necessária
                    </p>
                    <p className="text-sm text-amber-700">
                      Para ativar Email Marketing, adicione as seguintes variáveis de ambiente no Vercel:
                    </p>
                    <div className="bg-white rounded border border-amber-200 p-3 mt-2 font-mono text-xs space-y-1">
                      <div><strong>Resend (Recomendado):</strong></div>
                      <div>EMAIL_PROVIDER=resend</div>
                      <div>RESEND_API_KEY=re_seu_token</div>
                      <div>EMAIL_FROM=noreply@suaclinica.com</div>
                      <div>EMAIL_FROM_NAME=Sua Clínica</div>
                      <div className="pt-2"><strong>OU SendGrid:</strong></div>
                      <div>EMAIL_PROVIDER=sendgrid</div>
                      <div>EMAIL_API_KEY=SG.seu_token</div>
                      <div>EMAIL_FROM=noreply@suaclinica.com</div>
                      <div>EMAIL_FROM_NAME=Sua Clínica</div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('https://resend.com', '_blank')}
                      >
                        Configurar Resend
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('https://sendgrid.com', '_blank')}
                      >
                        Configurar SendGrid
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teste de Envio de Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Testar Envio de Email
              </CardTitle>
              <CardDescription>
                Envie um email de teste para verificar a configuração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testEmail">Endereço de Email</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="seu@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testEmailSubject">Assunto</Label>
                <Input
                  id="testEmailSubject"
                  placeholder="Assunto do email..."
                  value={testEmailSubject}
                  onChange={(e) => setTestEmailSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testEmailBody">Mensagem</Label>
                <Textarea
                  id="testEmailBody"
                  placeholder="Digite a mensagem..."
                  value={testEmailBody}
                  onChange={(e) => setTestEmailBody(e.target.value)}
                  rows={6}
                />
              </div>

              <Button 
                onClick={handleTestEmail}
                disabled={!testEmail}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Email de Teste
              </Button>
            </CardContent>
          </Card>

          {/* Estatísticas de Email */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Campanhas</CardTitle>
              <CardDescription>
                Performance das campanhas de email nos últimos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-muted-foreground">Enviados</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">0%</div>
                  <div className="text-sm text-muted-foreground">Taxa Abertura</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">0%</div>
                  <div className="text-sm text-muted-foreground">Taxa Clique</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <div className="text-3xl font-bold text-amber-600">0%</div>
                  <div className="text-sm text-muted-foreground">Conversão</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: TEMPLATES */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Mensagens</CardTitle>
              <CardDescription>
                Templates predefinidos para WhatsApp e Email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Lembrete de Consulta</h4>
                    <Badge>WhatsApp</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Olá {'{{nome}}'}, lembrete da sua consulta amanhã às {'{{hora}}'} com {'{{dentista}}'}.
                  </p>
                  <Button variant="outline" size="sm">
                    Editar Template
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Boas-vindas</h4>
                    <Badge variant="secondary">Email</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Bem-vindo(a) à {'{{clinica}}'}, {'{{nome}}'}! Estamos felizes em tê-lo(a) como nosso utente.
                  </p>
                  <Button variant="outline" size="sm">
                    Editar Template
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Aniversário</h4>
                    <Badge variant="secondary">Email</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Feliz aniversário, {'{{nome}}'}! 🎉 Oferta especial: 20% de desconto na próxima consulta.
                  </p>
                  <Button variant="outline" size="sm">
                    Editar Template
                  </Button>
                </div>

                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Criar Novo Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
