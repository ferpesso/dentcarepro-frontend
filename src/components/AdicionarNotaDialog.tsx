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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AdicionarNotaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  utenteId: number;
  consultaId?: number;
  onSuccess?: () => void;
}

export function AdicionarNotaDialog({
  open,
  onOpenChange,
  utenteId,
  consultaId,
  onSuccess,
}: AdicionarNotaDialogProps) {
  const [formData, setFormData] = useState({
    tipo: "clinica",
    titulo: "",
    conteudo: "",
    importante: false,
    privada: false,
    tags: "",
  });

  const criarNota = trpc.notas.criar.useMutation({
    onSuccess: () => {
      toast.success("Nota criada com sucesso!");
      setFormData({
        tipo: "clinica",
        titulo: "",
        conteudo: "",
        importante: false,
        privada: false,
        tags: "",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao criar nota: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.conteudo.trim()) {
      toast.error("Conteúdo é obrigatório");
      return;
    }

    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    criarNota.mutate({
      utenteId,
      consultaId,
      tipo: formData.tipo,
      titulo: formData.titulo || undefined,
      conteudo: formData.conteudo,
      importante: formData.importante,
      privada: formData.privada,
      tags: tags.length > 0 ? tags : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Nota Clínica</DialogTitle>
          <DialogDescription>
            Adicione uma nota sobre o utente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tipo">Tipo de Nota *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) =>
                setFormData({ ...formData, tipo: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clinica">Clínica</SelectItem>
                <SelectItem value="diagnostico">Diagnóstico</SelectItem>
                <SelectItem value="evolucao">Evolução</SelectItem>
                <SelectItem value="observacao">Observação</SelectItem>
                <SelectItem value="lembrete">Lembrete</SelectItem>
                <SelectItem value="administrativa">Administrativa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="titulo">Título (opcional)</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) =>
                setFormData({ ...formData, titulo: e.target.value })
              }
              placeholder="Título da nota"
            />
          </div>

          <div>
            <Label htmlFor="conteudo">Conteúdo *</Label>
            <Textarea
              id="conteudo"
              value={formData.conteudo}
              onChange={(e) =>
                setFormData({ ...formData, conteudo: e.target.value })
              }
              placeholder="Escreva a nota aqui..."
              rows={6}
              required
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="urgente, seguimento, revisão"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="importante"
                checked={formData.importante}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, importante: checked as boolean })
                }
              />
              <Label htmlFor="importante" className="cursor-pointer">
                Marcar como importante
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="privada"
                checked={formData.privada}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, privada: checked as boolean })
                }
              />
              <Label htmlFor="privada" className="cursor-pointer">
                Nota privada
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={criarNota.isPending}>
              {criarNota.isPending ? "Criando..." : "Criar Nota"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
