import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  Pill,
  Activity,
  ArrowLeft,
  Wallet,
  Camera,
  ClipboardList,
  Stethoscope,
  TrendingUp,
  CheckCircle2,
  Clock,
  Euro,
} from "lucide-react";
import { Odontograma } from "@/components/Odontograma";
import { PeriodontogramaCompleto } from "@/components/PeriodontogramaCompleto";
import { GaleriaImagens } from "@/components/GaleriaImagens";
import { HistoricoPagamentos } from "@/components/HistoricoPagamentos";
import { HistoricoConsultas } from "@/components/HistoricoConsultas";
import { NotasClinicas } from "@/components/NotasClinicas";
import { PrescricoesUtente } from "@/components/PrescricoesUtente";
import { useLocation } from "wouter";

interface UtenteDetalhesProps {
  utenteId: number;
}

export default function UtenteDetalhes({ utenteId }: UtenteDetalhesProps) {
  const [, setLocation] = useLocation();
  const [clinicaId, setClinicaId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("visao-geral");

  // Buscar clínicas do utilizador
  const { data: clinicas } = trpc.clinicas.minhas.useQuery();

  // Definir clínica ativa
  useEffect(() => {
    if (clinicas && clinicas.length > 0 && !clinicaId) {
      setClinicaId(clinicas[0].clinica.id);
    }
  }, [clinicas, clinicaId]);

  const { data: utente, isLoading } = trpc.utentes.porId.useQuery(
    { utenteId, clinicaId: clinicaId! },
    { enabled: !!clinicaId }
  );
  const { data: historico } = trpc.utentes.historicoMedico.useQuery({ utenteId });

  // Queries para contadores nas abas
  const { data: consultas } = trpc.consultas.listar.useQuery(
    { clinicaId: clinicaId!, utenteId },
    { enabled: !!clinicaId }
  );
  
  const { data: notas } = trpc.notas.listar.useQuery(
    { utenteId },
    { enabled: true }
  );
  
  const { data: prescricoes } = trpc.prescricoes.listar.useQuery(
    { utenteId },
    { enabled: true }
  );
  
  const { data: pagamentos } = trpc.faturas.pagamentosUtente.useQuery(
    { utenteId, clinicaId: clinicaId! },
    { enabled: !!clinicaId }
  );

  const { data: imagens } = trpc.imagens.listar.useQuery(
    { utenteId },
    { enabled: true }
  );

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!utente) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Utente não encontrado</h3>
              <Button onClick={() => setLocation("/utentes")}>Voltar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calcularIdade = (dataNascimento: string | Date | null) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const idade = calcularIdade(utente.dataNascimento);

  // Calcular estatísticas
  const totalConsultas = consultas?.length || 0;
  const consultasRealizadas = consultas?.filter((c: any) => c.estado === "concluida").length || 0;
  const consultasPendentes = consultas?.filter((c: any) => c.estado === "agendada").length || 0;
  
  const totalNotas = notas?.length || 0;
  const notasImportantes = notas?.filter(n => n.importante).length || 0;
  
  const totalPrescricoes = prescricoes?.length || 0;
  const prescricoesAtivas = prescricoes?.filter(p => {
    if (!p.dataValidade) return false;
    return new Date(p.dataValidade) > new Date() && !p.dispensada;
  }).length || 0;
  
  const totalPago = pagamentos?.reduce((sum, p) => sum + parseFloat(p.valor.toString()), 0) || 0;
  const numPagamentos = pagamentos?.length || 0;
  
  const totalImagens = imagens?.length || 0;

  return (
    <div className="p-8 space-y-6">
      {/* Cabeçalho com informações do utente */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/utentes")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{utente.nome}</h1>
            <p className="text-muted-foreground">
              {idade ? `${idade} anos` : "Idade não informada"}
              {utente.dataNascimento && (
                <span className="ml-2">
                  • {new Date(utente.dataNascimento).toLocaleDateString("pt-PT")}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={utente.ativo ? "default" : "secondary"}>
            {utente.ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </div>

      {/* Card com informações básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {utente.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{utente.email}</p>
                </div>
              </div>
            )}
            {utente.telemovel && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{utente.telemovel}</p>
                </div>
              </div>
            )}
            {utente.nif && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">NIF</p>
                  <p className="font-medium">{utente.nif}</p>
                </div>
              </div>
            )}
            {utente.morada && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Morada</p>
                  <p className="font-medium text-sm">{utente.morada}</p>
                </div>
              </div>
            )}
          </div>

          {/* Alertas médicos */}
          {(historico?.alergias || historico?.medicamentos || historico?.condicoesMedicas) && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {historico.alergias && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="font-semibold text-red-900">Alergias</p>
                  </div>
                  <p className="text-sm text-red-800">{historico.alergias}</p>
                </div>
              )}
              {historico.medicamentos && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill className="h-4 w-4 text-blue-600" />
                    <p className="font-semibold text-blue-900">Medicamentos</p>
                  </div>
                  <p className="text-sm text-blue-800">{historico.medicamentos}</p>
                </div>
              )}
              {historico.condicoesMedicas && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-yellow-600" />
                    <p className="font-semibold text-yellow-900">Condições Médicas</p>
                  </div>
                  <p className="text-sm text-yellow-800">{historico.condicoesMedicas}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sistema de Abas Melhorado */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="visao-geral" className="flex flex-col items-center gap-1 py-3">
            <Stethoscope className="h-4 w-4" />
            <span className="text-xs">Visão Geral</span>
          </TabsTrigger>
          
          <TabsTrigger value="consultas" className="flex flex-col items-center gap-1 py-3">
            <div className="relative">
              <ClipboardList className="h-4 w-4" />
              {totalConsultas > 0 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 h-4 min-w-4 p-0 flex items-center justify-center text-[10px]">
                  {totalConsultas}
                </Badge>
              )}
            </div>
            <span className="text-xs">Consultas</span>
          </TabsTrigger>
          
          <TabsTrigger value="notas" className="flex flex-col items-center gap-1 py-3">
            <div className="relative">
              <FileText className="h-4 w-4" />
              {totalNotas > 0 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 h-4 min-w-4 p-0 flex items-center justify-center text-[10px]">
                  {totalNotas}
                </Badge>
              )}
            </div>
            <span className="text-xs">Notas</span>
            {notasImportantes > 0 && (
              <Badge variant="destructive" className="h-4 text-[10px] px-1">
                {notasImportantes} importante{notasImportantes > 1 ? 's' : ''}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="prescricoes" className="flex flex-col items-center gap-1 py-3">
            <div className="relative">
              <Pill className="h-4 w-4" />
              {totalPrescricoes > 0 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 h-4 min-w-4 p-0 flex items-center justify-center text-[10px]">
                  {totalPrescricoes}
                </Badge>
              )}
            </div>
            <span className="text-xs">Prescrições</span>
            {prescricoesAtivas > 0 && (
              <Badge variant="default" className="h-4 text-[10px] px-1">
                {prescricoesAtivas} ativa{prescricoesAtivas > 1 ? 's' : ''}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="financeiro" className="flex flex-col items-center gap-1 py-3">
            <div className="relative">
              <Wallet className="h-4 w-4" />
              {numPagamentos > 0 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 h-4 min-w-4 p-0 flex items-center justify-center text-[10px]">
                  {numPagamentos}
                </Badge>
              )}
            </div>
            <span className="text-xs">Financeiro</span>
            {totalPago > 0 && (
              <Badge variant="outline" className="h-4 text-[10px] px-1">
                €{totalPago.toFixed(0)}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="imagens" className="flex flex-col items-center gap-1 py-3">
            <div className="relative">
              <Camera className="h-4 w-4" />
              {totalImagens > 0 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 h-4 min-w-4 p-0 flex items-center justify-center text-[10px]">
                  {totalImagens}
                </Badge>
              )}
            </div>
            <span className="text-xs">Imagens</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba: Visão Geral */}
        <TabsContent value="visao-geral" className="space-y-6 mt-6">
          {/* Resumo Rápido */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Consultas</p>
                    <p className="text-2xl font-bold">{totalConsultas}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {consultasRealizadas} realizadas
                    </p>
                  </div>
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Notas</p>
                    <p className="text-2xl font-bold">{totalNotas}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notasImportantes} importantes
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Prescrições</p>
                    <p className="text-2xl font-bold">{totalPrescricoes}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {prescricoesAtivas} ativas
                    </p>
                  </div>
                  <Pill className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pago</p>
                    <p className="text-2xl font-bold">€{totalPago.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {numPagamentos} pagamentos
                    </p>
                  </div>
                  <Euro className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Odontograma utenteId={utenteId} />
          <PeriodontogramaCompleto utenteId={utenteId} clinicaId={clinicaId!} />
        </TabsContent>

        {/* Aba: Consultas */}
        <TabsContent value="consultas" className="space-y-6 mt-6">
          {/* Resumo de Consultas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold">{totalConsultas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Realizadas</p>
                    <p className="text-xl font-bold">{consultasRealizadas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                    <p className="text-xl font-bold">{consultasPendentes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <HistoricoConsultas utenteId={utenteId} />
        </TabsContent>

        {/* Aba: Notas Clínicas */}
        <TabsContent value="notas" className="space-y-6 mt-6">
          <NotasClinicas utenteId={utenteId} clinicaId={clinicaId!} />
        </TabsContent>

        {/* Aba: Prescrições */}
        <TabsContent value="prescricoes" className="space-y-6 mt-6">
          <PrescricoesUtente utenteId={utenteId} clinicaId={clinicaId!} />
        </TabsContent>

        {/* Aba: Financeiro */}
        <TabsContent value="financeiro" className="space-y-6 mt-6">
          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Euro className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pago</p>
                    <p className="text-xl font-bold text-green-600">€{totalPago.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wallet className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pagamentos</p>
                    <p className="text-xl font-bold">{numPagamentos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Média/Pagamento</p>
                    <p className="text-xl font-bold">
                      €{numPagamentos > 0 ? (totalPago / numPagamentos).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <HistoricoPagamentos utenteId={utenteId} clinicaId={clinicaId!} />
        </TabsContent>

        {/* Aba: Imagens */}
        <TabsContent value="imagens" className="space-y-6 mt-6">
          <GaleriaImagens utenteId={utenteId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
