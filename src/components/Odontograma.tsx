import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/**
 * Odontograma Interativo
 * Sistema FDI de numeração dentária
 * Adulto: 11-18, 21-28, 31-38, 41-48
 */

interface DenteData {
  numero: number;
  estado: string;
  faces?: {
    oclusal?: string;
    mesial?: string;
    distal?: string;
    vestibular?: string;
    lingual?: string;
  };
  observacoes?: string;
  cor?: string;
}

const ESTADOS_DENTE = [
  { value: "sadio", label: "Sadio", cor: "#FFFFFF", borda: "#E5E7EB" },
  { value: "cariado", label: "Cariado", cor: "#EF4444", borda: "#DC2626" },
  { value: "restaurado", label: "Restaurado", cor: "#3B82F6", borda: "#2563EB" },
  { value: "ausente", label: "Ausente", cor: "#000000", borda: "#000000" },
  { value: "implante", label: "Implante", cor: "#8B5CF6", borda: "#7C3AED" },
  { value: "protese", label: "Prótese", cor: "#F59E0B", borda: "#D97706" },
  { value: "canal", label: "Canal", cor: "#10B981", borda: "#059669" },
  { value: "fraturado", label: "Fraturado", cor: "#F97316", borda: "#EA580C" },
  { value: "extrair", label: "A Extrair", cor: "#DC2626", borda: "#B91C1C" },
  { value: "em_tratamento", label: "Em Tratamento", cor: "#FBBF24", borda: "#F59E0B" },
];

interface OdontogramaProps {
  utenteId: number;
  dados?: DenteData[];
  onSave?: (dados: DenteData[]) => void;
  readonly?: boolean;
}

export function Odontograma({ utenteId, dados = [], onSave, readonly = false }: OdontogramaProps) {
  const [dentesData, setDentesData] = useState<Map<number, DenteData>>(
    new Map(dados.map((d) => [d.numero, d]))
  );
  const [denteSelected, setDenteSelected] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Quadrantes FDI
  const quadrantes = [
    { id: 1, nome: "Superior Direito", dentes: [18, 17, 16, 15, 14, 13, 12, 11] },
    { id: 2, nome: "Superior Esquerdo", dentes: [21, 22, 23, 24, 25, 26, 27, 28] },
    { id: 3, nome: "Inferior Esquerdo", dentes: [38, 37, 36, 35, 34, 33, 32, 31] },
    { id: 4, nome: "Inferior Direito", dentes: [41, 42, 43, 44, 45, 46, 47, 48] },
  ];

  const getDenteData = (numero: number): DenteData => {
    return dentesData.get(numero) || { numero, estado: "sadio" };
  };

  const getCorDente = (estado: string) => {
    return ESTADOS_DENTE.find((e) => e.value === estado) || ESTADOS_DENTE[0];
  };

  const handleDenteClick = (numero: number) => {
    if (readonly) return;
    setDenteSelected(numero);
    setDialogOpen(true);
  };

  const handleSaveDente = (data: Partial<DenteData>) => {
    if (!denteSelected) return;

    const novoDente: DenteData = {
      ...getDenteData(denteSelected),
      ...data,
      numero: denteSelected,
    };

    const novoMap = new Map(dentesData);
    novoMap.set(denteSelected, novoDente);
    setDentesData(novoMap);

    toast.success(`Dente ${denteSelected} atualizado`);
    setDialogOpen(false);

    // Callback para salvar
    if (onSave) {
      onSave(Array.from(novoMap.values()));
    }
  };

  const renderDente = (numero: number) => {
    const data = getDenteData(numero);
    const corInfo = getCorDente(data.estado);

    return (
      <div
        key={numero}
        className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
        onClick={() => handleDenteClick(numero)}
      >
        {/* Número do dente */}
        <div className="text-xs font-medium text-muted-foreground mb-1">{numero}</div>

        {/* Dente visual */}
        <div
          className="relative w-12 h-16 rounded-lg border-2 flex items-center justify-center shadow-sm"
          style={{
            backgroundColor: data.estado === "ausente" ? "#f3f4f6" : corInfo.cor,
            borderColor: corInfo.borda,
          }}
        >
          {data.estado === "ausente" ? (
            <span className="text-2xl text-gray-400">✕</span>
          ) : (
            <div className="text-xs font-bold text-gray-700">
              {data.estado === "implante" && "🔩"}
              {data.estado === "protese" && "👑"}
              {data.estado === "canal" && "📍"}
            </div>
          )}

          {/* Indicador de faces afetadas */}
          {data.faces && Object.keys(data.faces).length > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
          )}
        </div>

        {/* Estado */}
        <div className="text-[10px] mt-1 text-center max-w-[50px] truncate">
          {corInfo.label}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Odontograma</CardTitle>
            {!readonly && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Imprimir
                </Button>
                <Button variant="outline" size="sm">
                  Histórico
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Legenda */}
          <div className="flex flex-wrap gap-3 justify-center pb-4 border-b">
            {ESTADOS_DENTE.map((estado) => (
              <div key={estado.value} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border-2"
                  style={{
                    backgroundColor: estado.cor,
                    borderColor: estado.borda,
                  }}
                />
                <span className="text-xs">{estado.label}</span>
              </div>
            ))}
          </div>

          {/* Arcada Superior */}
          <div className="space-y-4">
            <div className="text-center font-semibold text-sm text-muted-foreground">
              ARCADA SUPERIOR
            </div>
            <div className="grid grid-cols-2 gap-8">
              {/* Quadrante 1 - Superior Direito */}
              <div className="flex justify-end">
                <div className="flex gap-2">
                  {quadrantes[0].dentes.map((n) => renderDente(n))}
                </div>
              </div>

              {/* Quadrante 2 - Superior Esquerdo */}
              <div className="flex justify-start">
                <div className="flex gap-2">
                  {quadrantes[1].dentes.map((n) => renderDente(n))}
                </div>
              </div>
            </div>
          </div>

          {/* Linha divisória */}
          <div className="border-t-2 border-dashed" />

          {/* Arcada Inferior */}
          <div className="space-y-4">
            <div className="text-center font-semibold text-sm text-muted-foreground">
              ARCADA INFERIOR
            </div>
            <div className="grid grid-cols-2 gap-8">
              {/* Quadrante 4 - Inferior Direito */}
              <div className="flex justify-end">
                <div className="flex gap-2">
                  {quadrantes[3].dentes.map((n) => renderDente(n))}
                </div>
              </div>

              {/* Quadrante 3 - Inferior Esquerdo */}
              <div className="flex justify-start">
                <div className="flex gap-2">
                  {quadrantes[2].dentes.map((n) => renderDente(n))}
                </div>
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-2xl">
                  {Array.from(dentesData.values()).filter((d) => d.estado === "sadio").length}
                </div>
                <div className="text-muted-foreground">Sadios</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-2xl text-red-600">
                  {Array.from(dentesData.values()).filter((d) => d.estado === "cariado").length}
                </div>
                <div className="text-muted-foreground">Cariados</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-2xl text-blue-600">
                  {Array.from(dentesData.values()).filter((d) => d.estado === "restaurado")
                    .length}
                </div>
                <div className="text-muted-foreground">Restaurados</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-2xl text-gray-600">
                  {Array.from(dentesData.values()).filter((d) => d.estado === "ausente").length}
                </div>
                <div className="text-muted-foreground">Ausentes</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      {denteSelected && (
        <DialogEditarDente
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          numero={denteSelected}
          data={getDenteData(denteSelected)}
          onSave={handleSaveDente}
        />
      )}
    </>
  );
}

// Dialog para editar dente
function DialogEditarDente({
  open,
  onOpenChange,
  numero,
  data,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  numero: number;
  data: DenteData;
  onSave: (data: Partial<DenteData>) => void;
}) {
  const [estado, setEstado] = useState(data.estado);
  const [observacoes, setObservacoes] = useState(data.observacoes || "");

  const handleSave = () => {
    onSave({
      estado,
      observacoes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Dente {numero}</DialogTitle>
          <DialogDescription>
            Atualize o estado e observações do dente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Estado do Dente</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_DENTE.map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{
                          backgroundColor: e.cor,
                          borderColor: e.borda,
                        }}
                      />
                      {e.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Notas sobre este dente..."
              rows={4}
            />
          </div>

          {/* Preview */}
          <div className="p-4 bg-accent rounded-lg">
            <div className="text-sm font-medium mb-2">Preview:</div>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-20 rounded-lg border-2 flex items-center justify-center"
                style={{
                  backgroundColor:
                    estado === "ausente"
                      ? "#f3f4f6"
                      : ESTADOS_DENTE.find((e) => e.value === estado)?.cor,
                  borderColor: ESTADOS_DENTE.find((e) => e.value === estado)?.borda,
                }}
              >
                {estado === "ausente" ? (
                  <span className="text-3xl text-gray-400">✕</span>
                ) : (
                  <div className="text-xl">
                    {estado === "implante" && "🔩"}
                    {estado === "protese" && "👑"}
                    {estado === "canal" && "📍"}
                  </div>
                )}
              </div>
              <div>
                <div className="font-semibold">Dente {numero}</div>
                <Badge>{ESTADOS_DENTE.find((e) => e.value === estado)?.label}</Badge>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
