import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface AdicionarPrescricaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  utenteId: number;
  consultaId?: number;
  onSuccess?: () => void;
}

interface Medicamento {
  nome: string;
  principioAtivo: string;
  dosagem: string;
  via: string;
  frequencia: string;
  duracao: string;
  quantidade: number;
  instrucoes: string;
}

export function AdicionarPrescricaoDialog({
  open,
  onOpenChange,
  utenteId,
  consultaId,
  onSuccess,
}: AdicionarPrescricaoDialogProps) {
  const [formData, setFormData] = useState({
    diagnostico: "",
    indicacao: "",
    observacoes: "",
    contraindicacoes: "",
    validadeDias: 30,
  });

  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([
    {
      nome: "",
      principioAtivo: "",
      dosagem: "",
      via: "oral",
      frequencia: "",
      duracao: "",
      quantidade: 1,
      instrucoes: "",
    },
  ]);

  const criarPrescricao = trpc.prescricoes.criar.useMutation({
    onSuccess: () => {
      toast.success("Prescrição criada com sucesso!");
      resetForm();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao criar prescrição: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      diagnostico: "",
      indicacao: "",
      observacoes: "",
      contraindicacoes: "",
      validadeDias: 30,
    });
    setMedicamentos([
      {
        nome: "",
        principioAtivo: "",
        dosagem: "",
        via: "oral",
        frequencia: "",
        duracao: "",
        quantidade: 1,
        instrucoes: "",
      },
    ]);
  };

  const adicionarMedicamento = () => {
    setMedicamentos([
      ...medicamentos,
      {
        nome: "",
        principioAtivo: "",
        dosagem: "",
        via: "oral",
        frequencia: "",
        duracao: "",
        quantidade: 1,
        instrucoes: "",
      },
    ]);
  };

  const removerMedicamento = (index: number) => {
    if (medicamentos.length > 1) {
      setMedicamentos(medicamentos.filter((_, i) => i !== index));
    }
  };

  const atualizarMedicamento = (index: number, campo: keyof Medicamento, valor: any) => {
    const novosMedicamentos = [...medicamentos];
    novosMedicamentos[index] = {
      ...novosMedicamentos[index],
      [campo]: valor,
    };
    setMedicamentos(novosMedicamentos);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar medicamentos
    const medicamentosValidos = medicamentos.filter(
      (med) => med.nome.trim() && med.dosagem.trim()
    );

    if (medicamentosValidos.length === 0) {
      toast.error("Adicione pelo menos um medicamento com nome e dosagem");
      return;
    }

    criarPrescricao.mutate({
      utenteId,
      consultaId,
      dataPrescricao: new Date(),
      medicamentos: medicamentosValidos,
      diagnostico: formData.diagnostico || undefined,
      indicacao: formData.indicacao || undefined,
      observacoes: formData.observacoes || undefined,
      contraindicacoes: formData.contraindicacoes || undefined,
      validadeDias: formData.validadeDias,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Prescrição Médica</DialogTitle>
          <DialogDescription>
            Prescreva medicamentos para o utente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Diagnóstico e Indicação */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="diagnostico">Diagnóstico</Label>
              <Textarea
                id="diagnostico"
                value={formData.diagnostico}
                onChange={(e) =>
                  setFormData({ ...formData, diagnostico: e.target.value })
                }
                placeholder="Diagnóstico clínico"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="indicacao">Indicação</Label>
              <Textarea
                id="indicacao"
                value={formData.indicacao}
                onChange={(e) =>
                  setFormData({ ...formData, indicacao: e.target.value })
                }
                placeholder="Indicação do tratamento"
                rows={2}
              />
            </div>
          </div>

          {/* Medicamentos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Medicamentos *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={adicionarMedicamento}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Medicamento
              </Button>
            </div>

            {medicamentos.map((med, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Medicamento {index + 1}
                  </span>
                  {medicamentos.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerMedicamento(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Nome do Medicamento *</Label>
                    <Input
                      value={med.nome}
                      onChange={(e) =>
                        atualizarMedicamento(index, "nome", e.target.value)
                      }
                      placeholder="Ex: Amoxicilina"
                      required
                    />
                  </div>
                  <div>
                    <Label>Princípio Ativo</Label>
                    <Input
                      value={med.principioAtivo}
                      onChange={(e) =>
                        atualizarMedicamento(index, "principioAtivo", e.target.value)
                      }
                      placeholder="Ex: Amoxicilina"
                    />
                  </div>
                  <div>
                    <Label>Dosagem *</Label>
                    <Input
                      value={med.dosagem}
                      onChange={(e) =>
                        atualizarMedicamento(index, "dosagem", e.target.value)
                      }
                      placeholder="Ex: 500mg"
                      required
                    />
                  </div>
                  <div>
                    <Label>Via de Administração</Label>
                    <Input
                      value={med.via}
                      onChange={(e) =>
                        atualizarMedicamento(index, "via", e.target.value)
                      }
                      placeholder="Ex: oral, tópico"
                    />
                  </div>
                  <div>
                    <Label>Frequência</Label>
                    <Input
                      value={med.frequencia}
                      onChange={(e) =>
                        atualizarMedicamento(index, "frequencia", e.target.value)
                      }
                      placeholder="Ex: 8/8h, 12/12h"
                    />
                  </div>
                  <div>
                    <Label>Duração</Label>
                    <Input
                      value={med.duracao}
                      onChange={(e) =>
                        atualizarMedicamento(index, "duracao", e.target.value)
                      }
                      placeholder="Ex: 7 dias, 14 dias"
                    />
                  </div>
                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      value={med.quantidade}
                      onChange={(e) =>
                        atualizarMedicamento(
                          index,
                          "quantidade",
                          parseInt(e.target.value) || 1
                        )
                      }
                      min={1}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Instruções</Label>
                    <Textarea
                      value={med.instrucoes}
                      onChange={(e) =>
                        atualizarMedicamento(index, "instrucoes", e.target.value)
                      }
                      placeholder="Instruções de uso"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Observações e Contraindicações */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
                placeholder="Observações adicionais"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="contraindicacoes">Contraindicações</Label>
              <Textarea
                id="contraindicacoes"
                value={formData.contraindicacoes}
                onChange={(e) =>
                  setFormData({ ...formData, contraindicacoes: e.target.value })
                }
                placeholder="Contraindicações"
                rows={2}
              />
            </div>
          </div>

          {/* Validade */}
          <div>
            <Label htmlFor="validadeDias">Validade (dias)</Label>
            <Input
              id="validadeDias"
              type="number"
              value={formData.validadeDias}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  validadeDias: parseInt(e.target.value) || 30,
                })
              }
              min={1}
              max={365}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={criarPrescricao.isPending}>
              {criarPrescricao.isPending ? "Criando..." : "Criar Prescrição"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
