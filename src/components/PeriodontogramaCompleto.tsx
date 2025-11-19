import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Save,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Calendar,
} from "lucide-react";

/**
 * Periodontograma Completo e Funcional
 * Sistema real de avaliação periodontal
 */

interface MedicaoDente {
  profundidadeSondagem: {
    mesial: number;
    central: number;
    distal: number;
  };
  nivelInsercao: {
    mesial: number;
    central: number;
    distal: number;
  };
  sangramento: boolean;
  supuracao: boolean;
  mobilidade: number;
  furca: number;
  placa: boolean;
}

interface Medicoes {
  [dente: string]: MedicaoDente;
}

interface PeriodontogramaCompletoProps {
  utenteId: number;
  clinicaId: number;
  avaliacaoId?: number; // Se existir, carrega avaliação existente
  onSalvar?: (id: number) => void;
}

const dentesSuperiores = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
const dentesInferiores = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];

export function PeriodontogramaCompleto({
  utenteId,
  clinicaId,
  avaliacaoId,
  onSalvar,
}: PeriodontogramaCompletoProps) {
  const [medicoes, setMedicoes] = useState<Medicoes>({});
  const [denteSelecionado, setDenteSelecionado] = useState<string | null>(null);
  const [diagnostico, setDiagnostico] = useState("");
  const [planoTratamento, setPlanoTratamento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [indices, setIndices] = useState({
    indicePlaca: 0,
    indiceSangramento: 0,
    indiceProfundidade: 0,
  });

  // Inicializar medições vazias
  useEffect(() => {
    const medicoesIniciais: Medicoes = {};
    [...dentesSuperiores, ...dentesInferiores].forEach((dente) => {
      medicoesIniciais[dente] = {
        profundidadeSondagem: { mesial: 2, central: 2, distal: 2 },
        nivelInsercao: { mesial: 0, central: 0, distal: 0 },
        sangramento: false,
        supuracao: false,
        mobilidade: 0,
        furca: 0,
        placa: false,
      };
    });
    setMedicoes(medicoesIniciais);

    // Se avaliacaoId existir, carregar dados
    if (avaliacaoId) {
      carregarAvaliacao(avaliacaoId);
    }
  }, [avaliacaoId]);

  // Recalcular índices quando medições mudam
  useEffect(() => {
    calcularIndices();
  }, [medicoes]);

  const carregarAvaliacao = async (id: number) => {
    try {
      const response = await fetch(`/api/periodontograma/${id}`);
      const data = await response.json();
      
      setMedicoes(data.medicoes);
      setDiagnostico(data.diagnostico || "");
      setPlanoTratamento(data.planoTratamento || "");
      setObservacoes(data.observacoes || "");
    } catch (error) {
      toast.error("Erro ao carregar avaliação");
    }
  };

  const calcularIndices = () => {
    const dentes = Object.keys(medicoes);
    const totalDentes = dentes.length;

    if (totalDentes === 0) return;

    let dentesComPlaca = 0;
    let sitiosComSangramento = 0;
    let totalSitios = 0;
    let somaProfundidades = 0;

    dentes.forEach((dente) => {
      const medicao = medicoes[dente];
      if (medicao.placa) dentesComPlaca++;
      totalSitios += 3;
      if (medicao.sangramento) sitiosComSangramento += 3;
      somaProfundidades +=
        medicao.profundidadeSondagem.mesial +
        medicao.profundidadeSondagem.central +
        medicao.profundidadeSondagem.distal;
    });

    setIndices({
      indicePlaca: Math.round((dentesComPlaca / totalDentes) * 1000) / 10,
      indiceSangramento: Math.round((sitiosComSangramento / totalSitios) * 1000) / 10,
      indiceProfundidade: Math.round((somaProfundidades / totalSitios) * 10) / 10,
    });
  };

  const atualizarMedicao = (dente: string, campo: string, valor: any) => {
    setMedicoes((prev) => ({
      ...prev,
      [dente]: {
        ...prev[dente],
        [campo]: valor,
      },
    }));
  };

  const atualizarProfundidade = (dente: string, posicao: "mesial" | "central" | "distal", valor: number) => {
    setMedicoes((prev) => ({
      ...prev,
      [dente]: {
        ...prev[dente],
        profundidadeSondagem: {
          ...prev[dente].profundidadeSondagem,
          [posicao]: valor,
        },
      },
    }));
  };

  const salvar = async () => {
    setCarregando(true);
    try {
      const endpoint = avaliacaoId
        ? `/api/periodontograma/${avaliacaoId}`
        : "/api/periodontograma";
      
      const method = avaliacaoId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utenteId,
          clinicaId,
          dataAvaliacao: new Date(),
          medicoes,
          diagnostico,
          planoTratamento,
          observacoes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(avaliacaoId ? "Avaliação atualizada!" : "Avaliação salva!");
        if (onSalvar) onSalvar(data.id);
      } else {
        toast.error("Erro ao salvar avaliação");
      }
    } catch (error) {
      toast.error("Erro ao salvar avaliação");
    } finally {
      setCarregando(false);
    }
  };

  const getCorProfundidade = (prof: number) => {
    if (prof <= 3) return "bg-green-500";
    if (prof <= 5) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getDiagnosticoSugerido = () => {
    const diagnosticos: string[] = [];

    if (indices.indicePlaca > 50) {
      diagnosticos.push("Controle de placa inadequado");
    }
    if (indices.indiceSangramento > 30) {
      diagnosticos.push("Gengivite/Periodontite ativa");
    }
    if (indices.indiceProfundidade > 5) {
      diagnosticos.push("Periodontite moderada a severa");
    } else if (indices.indiceProfundidade > 3) {
      diagnosticos.push("Periodontite leve");
    } else if (indices.indiceProfundidade > 2) {
      diagnosticos.push("Gengivite");
    } else {
      diagnosticos.push("Saúde periodontal");
    }

    return diagnosticos.join(" - ");
  };

  const renderDente = (dente: string) => {
    const medicao = medicoes[dente];
    if (!medicao) return null;

    const profMax = Math.max(
      medicao.profundidadeSondagem.mesial,
      medicao.profundidadeSondagem.central,
      medicao.profundidadeSondagem.distal
    );

    return (
      <div
        key={dente}
        className={`flex flex-col items-center p-2 border rounded cursor-pointer transition-colors ${
          denteSelecionado === dente ? "bg-primary/10 border-primary" : "hover:bg-muted"
        }`}
        onClick={() => setDenteSelecionado(dente)}
      >
        {/* Profundidades */}
        <div className="flex gap-1 mb-1">
          {["mesial", "central", "distal"].map((pos) => {
            const prof = medicao.profundidadeSondagem[pos as keyof typeof medicao.profundidadeSondagem];
            return (
              <div
                key={pos}
                className={`w-6 h-6 flex items-center justify-center text-xs font-bold text-white rounded ${getCorProfundidade(
                  prof
                )}`}
              >
                {prof}
              </div>
            );
          })}
        </div>

        {/* Número do dente */}
        <div className="text-sm font-bold">{dente}</div>

        {/* Indicadores */}
        <div className="flex gap-1 mt-1">
          {medicao.sangramento && <div className="w-2 h-2 bg-red-500 rounded-full" title="Sangramento" />}
          {medicao.supuracao && <div className="w-2 h-2 bg-purple-500 rounded-full" title="Supuração" />}
          {medicao.placa && <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Placa" />}
          {medicao.mobilidade > 0 && (
            <Badge variant="outline" className="text-[10px] px-1">
              M{medicao.mobilidade}
            </Badge>
          )}
          {medicao.furca > 0 && (
            <Badge variant="outline" className="text-[10px] px-1">
              F{medicao.furca}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header com Índices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Periodontograma</CardTitle>
            <div className="flex gap-2">
              <Button onClick={salvar} disabled={carregando}>
                <Save className="h-4 w-4 mr-2" />
                {carregando ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legenda */}
          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span>1-3mm (Saudável)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span>4-5mm (Atenção)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span>6+mm (Problema)</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span>Sangramento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span>Supuração</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span>Placa</span>
            </div>
          </div>

          {/* Índices */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{indices.indiceProfundidade} mm</div>
                  <div className="text-sm text-muted-foreground">Profundidade Média</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500">{indices.indiceSangramento} %</div>
                  <div className="text-sm text-muted-foreground">Sangramento</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{indices.indicePlaca} %</div>
                  <div className="text-sm text-muted-foreground">Placa</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="visual">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visual">Visualização</TabsTrigger>
              <TabsTrigger value="edicao">Edição</TabsTrigger>
              <TabsTrigger value="analise">Análise</TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="space-y-4">
              {/* Arcada Superior */}
              <div>
                <h3 className="text-sm font-medium mb-2">Arcada Superior</h3>
                <div className="flex gap-2 flex-wrap">{dentesSuperiores.map(renderDente)}</div>
              </div>

              <Separator />

              {/* Arcada Inferior */}
              <div>
                <h3 className="text-sm font-medium mb-2">Arcada Inferior</h3>
                <div className="flex gap-2 flex-wrap">{dentesInferiores.map(renderDente)}</div>
              </div>
            </TabsContent>

            <TabsContent value="edicao">
              {denteSelecionado && medicoes[denteSelecionado] ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Editando Dente {denteSelecionado}</h3>

                  {/* Profundidades de Sondagem */}
                  <div>
                    <Label>Profundidades de Sondagem (mm)</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {["mesial", "central", "distal"].map((pos) => (
                        <div key={pos}>
                          <Label className="text-xs capitalize">{pos}</Label>
                          <Input
                            type="number"
                            min="0"
                            max="15"
                            value={
                              medicoes[denteSelecionado].profundidadeSondagem[
                                pos as keyof typeof medicoes[string]["profundidadeSondagem"]
                              ]
                            }
                            onChange={(e) =>
                              atualizarProfundidade(
                                denteSelecionado,
                                pos as "mesial" | "central" | "distal",
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sangramento"
                        checked={medicoes[denteSelecionado].sangramento}
                        onCheckedChange={(checked) =>
                          atualizarMedicao(denteSelecionado, "sangramento", checked)
                        }
                      />
                      <Label htmlFor="sangramento">Sangramento à Sondagem</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="supuracao"
                        checked={medicoes[denteSelecionado].supuracao}
                        onCheckedChange={(checked) =>
                          atualizarMedicao(denteSelecionado, "supuracao", checked)
                        }
                      />
                      <Label htmlFor="supuracao">Supuração</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="placa"
                        checked={medicoes[denteSelecionado].placa}
                        onCheckedChange={(checked) =>
                          atualizarMedicao(denteSelecionado, "placa", checked)
                        }
                      />
                      <Label htmlFor="placa">Presença de Placa</Label>
                    </div>
                  </div>

                  {/* Mobilidade e Furca */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Mobilidade</Label>
                      <Select
                        value={medicoes[denteSelecionado].mobilidade.toString()}
                        onValueChange={(value) =>
                          atualizarMedicao(denteSelecionado, "mobilidade", parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Grau 0 (Normal)</SelectItem>
                          <SelectItem value="1">Grau I (Leve)</SelectItem>
                          <SelectItem value="2">Grau II (Moderada)</SelectItem>
                          <SelectItem value="3">Grau III (Severa)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Furca</Label>
                      <Select
                        value={medicoes[denteSelecionado].furca.toString()}
                        onValueChange={(value) =>
                          atualizarMedicao(denteSelecionado, "furca", parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Grau 0 (Ausente)</SelectItem>
                          <SelectItem value="1">Grau I (Inicial)</SelectItem>
                          <SelectItem value="2">Grau II (Através)</SelectItem>
                          <SelectItem value="3">Grau III (Completa)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Selecione um dente para editar
                </div>
              )}
            </TabsContent>

            <TabsContent value="analise" className="space-y-4">
              {/* Diagnóstico Sugerido */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Diagnóstico Sugerido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{getDiagnosticoSugerido()}</p>
                </CardContent>
              </Card>

              {/* Diagnóstico e Plano */}
              <div className="space-y-4">
                <div>
                  <Label>Diagnóstico</Label>
                  <Input
                    value={diagnostico}
                    onChange={(e) => setDiagnostico(e.target.value)}
                    placeholder="Digite o diagnóstico..."
                  />
                </div>

                <div>
                  <Label>Plano de Tratamento</Label>
                  <textarea
                    className="w-full min-h-[100px] p-2 border rounded-md"
                    value={planoTratamento}
                    onChange={(e) => setPlanoTratamento(e.target.value)}
                    placeholder="Digite o plano de tratamento..."
                  />
                </div>

                <div>
                  <Label>Observações</Label>
                  <textarea
                    className="w-full min-h-[80px] p-2 border rounded-md"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
