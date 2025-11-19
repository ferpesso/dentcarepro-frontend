import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Save, 
  Upload, 
  Clock, 
  Calendar,
  Euro,
  Bell,
  Shield
} from "lucide-react";
import { toast } from "sonner";

export default function Configuracoes() {
  const [clinicaId, setClinicaId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telemovel: "",
    morada: "",
    cidade: "",
    codigoPostal: "",
    nif: "",
  });

  const { data: clinicas, isLoading: loadingClinicas } = trpc.clinicas.minhas.useQuery();
  
  const { data: clinicaData, isLoading: loadingClinica } = trpc.clinicas.porId.useQuery(
    { clinicaId: clinicaId! },
    { enabled: !!clinicaId }
  );

  const atualizarClinicaMutation = trpc.clinicas.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Configurações atualizadas com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar configurações: ${error.message}`);
    },
  });

  useEffect(() => {
    if (clinicas && clinicas.length > 0 && !clinicaId) {
      setClinicaId(clinicas[0].clinica.id);
    }
  }, [clinicas, clinicaId]);

  useEffect(() => {
    if (clinicaData) {
      setFormData({
        nome: clinicaData.nome || "",
        email: clinicaData.email || "",
        telemovel: clinicaData.telemovel || "",
        morada: clinicaData.morada || "",
        cidade: clinicaData.cidade || "",
        codigoPostal: clinicaData.codigoPostal || "",
        nif: clinicaData.nif || "",
      });
    }
  }, [clinicaData]);

  const handleSalvar = () => {
    if (!clinicaId) return;

    atualizarClinicaMutation.mutate({
      clinicaId,
      ...formData,
    });
  };

  if (loadingClinicas || loadingClinica) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center py-8">A carregar...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerir as configurações da sua clínica
          </p>
        </div>
        <Button onClick={handleSalvar} disabled={atualizarClinicaMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {atualizarClinicaMutation.isPending ? "A guardar..." : "Guardar Alterações"}
        </Button>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="geral">
            <Building2 className="h-4 w-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="horarios">
            <Clock className="h-4 w-4 mr-2" />
            Horários
          </TabsTrigger>
          <TabsTrigger value="financeiro">
            <Euro className="h-4 w-4 mr-2" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="notificacoes">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="seguranca">
            <Shield className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* TAB: GERAL */}
        <TabsContent value="geral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Clínica</CardTitle>
              <CardDescription>
                Dados básicos da sua clínica que aparecem em faturas e documentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Clínica *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome da clínica"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nif">NIF</Label>
                  <Input
                    id="nif"
                    value={formData.nif}
                    onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                    placeholder="Número de identificação fiscal"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@clinica.pt"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telemovel">Telemóvel</Label>
                  <Input
                    id="telemovel"
                    value={formData.telemovel}
                    onChange={(e) => setFormData({ ...formData, telemovel: e.target.value })}
                    placeholder="+351 912 345 678"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="morada">Morada</Label>
                <Textarea
                  id="morada"
                  value={formData.morada}
                  onChange={(e) => setFormData({ ...formData, morada: e.target.value })}
                  placeholder="Rua, número, andar"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigoPostal">Código Postal</Label>
                  <Input
                    id="codigoPostal"
                    value={formData.codigoPostal}
                    onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                    placeholder="0000-000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    placeholder="Lisboa"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logotipo da Clínica</CardTitle>
              <CardDescription>
                Adicione o logotipo da sua clínica para aparecer em documentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Recomendado: PNG ou JPG, tamanho máximo 2MB
                  </p>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Carregar Logotipo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: HORÁRIOS */}
        <TabsContent value="horarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Horário de Funcionamento</CardTitle>
              <CardDescription>
                Configure os horários de funcionamento da clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((dia) => (
                  <div key={dia} className="flex items-center gap-4">
                    <div className="w-24">
                      <Label>{dia}</Label>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Input type="time" defaultValue="09:00" className="w-32" />
                      <span className="text-muted-foreground">às</span>
                      <Input type="time" defaultValue="18:00" className="w-32" />
                    </div>
                    <Button variant="outline" size="sm">
                      Fechado
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações de Agendamento</CardTitle>
              <CardDescription>
                Configure intervalos e durações padrão para consultas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="intervaloConsulta">Intervalo entre Consultas</Label>
                  <select 
                    id="intervaloConsulta"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="15">15 minutos</option>
                    <option value="30" selected>30 minutos</option>
                    <option value="60">60 minutos</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duracaoPadrao">Duração Padrão da Consulta</Label>
                  <select 
                    id="duracaoPadrao"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="30" selected>30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">60 minutos</option>
                    <option value="90">90 minutos</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: FINANCEIRO */}
        <TabsContent value="financeiro" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Financeiras</CardTitle>
              <CardDescription>
                Configure IVA, métodos de pagamento e outras opções financeiras
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ivaPadrao">Taxa de IVA Padrão (%)</Label>
                  <Input
                    id="ivaPadrao"
                    type="number"
                    step="0.01"
                    defaultValue="23"
                    placeholder="23"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prazoVencimento">Prazo de Vencimento (dias)</Label>
                  <Input
                    id="prazoVencimento"
                    type="number"
                    defaultValue="30"
                    placeholder="30"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Métodos de Pagamento Aceites</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Dinheiro", "Cartão", "Transferência", "MB Way", "Multibanco", "Cheque"].map((metodo) => (
                    <label key={metodo} className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">{metodo}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Bancárias</CardTitle>
              <CardDescription>
                Dados bancários para aparecer nas faturas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  placeholder="PT50 0000 0000 0000 0000 0000 0"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="banco">Banco</Label>
                  <Input
                    id="banco"
                    placeholder="Nome do banco"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="swift">SWIFT/BIC</Label>
                  <Input
                    id="swift"
                    placeholder="SWIFT/BIC"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: NOTIFICAÇÕES */}
        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificações por Email</CardTitle>
              <CardDescription>
                Configure quando enviar emails automáticos aos utentes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Confirmação de Consulta</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar email quando uma consulta for agendada
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
                <Separator />
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Lembrete 24h Antes</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar lembrete 24 horas antes da consulta
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
                <Separator />
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Consulta Cancelada</p>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando uma consulta for cancelada
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
                <Separator />
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Fatura Emitida</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar fatura por email quando for emitida
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações de SMS</CardTitle>
              <CardDescription>
                Configure notificações por SMS (requer plano Pro ou superior)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                As notificações por SMS estão disponíveis nos planos Pro e Enterprise.
              </p>
              <Button variant="outline" disabled>
                Configurar SMS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: SEGURANÇA */}
        <TabsContent value="seguranca" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Segurança e Privacidade</CardTitle>
              <CardDescription>
                Configurações de segurança e proteção de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Autenticação de Dois Fatores</p>
                    <p className="text-sm text-muted-foreground">
                      Adicionar camada extra de segurança ao login
                    </p>
                  </div>
                  <input type="checkbox" className="rounded" />
                </label>
                <Separator />
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Registo de Atividades</p>
                    <p className="text-sm text-muted-foreground">
                      Manter histórico de todas as ações no sistema
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
                <Separator />
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Backup Automático</p>
                    <p className="text-sm text-muted-foreground">
                      Criar backups automáticos dos dados diariamente
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gestão de Utilizadores</CardTitle>
              <CardDescription>
                Gerir permissões e acessos dos utilizadores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">
                Gerir Utilizadores
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botão de guardar fixo no fundo */}
      <div className="flex justify-end pt-6 border-t">
        <Button 
          size="lg" 
          onClick={handleSalvar}
          disabled={atualizarClinicaMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {atualizarClinicaMutation.isPending ? "A guardar..." : "Guardar Todas as Alterações"}
        </Button>
      </div>
    </div>
  );
}
