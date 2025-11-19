import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { User, Phone, Mail, Calendar, MapPin } from "lucide-react";

interface CadastroRapidoUtenteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicaId: number;
  onSuccess: (utenteId: number, nome: string) => void;
  nomeInicial?: string;
}

export function CadastroRapidoUtenteDialog({
  open,
  onOpenChange,
  clinicaId,
  onSuccess,
  nomeInicial = "",
}: CadastroRapidoUtenteDialogProps) {
  const [formData, setFormData] = useState({
    nome: nomeInicial,
    telemovel: "",
    email: "",
    dataNascimento: "",
    genero: "",
    morada: "",
    cidade: "",
    codigoPostal: "",
    nif: "",
    numeroUtenteSNS: "",
  });

  const [modoCompleto, setModoCompleto] = useState(false);

  // Mutation para criar utente
  const criarUtenteMutation = trpc.utentes.criar.useMutation({
    onSuccess: (data) => {
      toast.success("Utente cadastrado com sucesso!");
      onSuccess(data.id, formData.nome);
      limparFormulario();
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar utente: " + error.message);
    },
  });

  const limparFormulario = () => {
    setFormData({
      nome: "",
      telemovel: "",
      email: "",
      dataNascimento: "",
      genero: "",
      morada: "",
      cidade: "",
      codigoPostal: "",
      nif: "",
      numeroUtenteSNS: "",
    });
    setModoCompleto(false);
  };

  const handleSubmit = () => {
    // Validações
    if (!formData.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (!formData.telemovel.trim() && !formData.email.trim()) {
      toast.error("Informe pelo menos telemóvel ou email");
      return;
    }

    // Preparar dados
    const dados: any = {
      clinicaId,
      nome: formData.nome.trim(),
    };

    if (formData.telemovel) dados.telemovel = formData.telemovel;
    if (formData.email) dados.email = formData.email;
    if (formData.dataNascimento) dados.dataNascimento = new Date(formData.dataNascimento);
    if (formData.genero) dados.genero = formData.genero;
    if (formData.morada) dados.morada = formData.morada;
    if (formData.cidade) dados.cidade = formData.cidade;
    if (formData.codigoPostal) dados.codigoPostal = formData.codigoPostal;
    if (formData.nif) dados.nif = formData.nif;
    if (formData.numeroUtenteSNS) dados.numeroUtenteSNS = formData.numeroUtenteSNS;

    criarUtenteMutation.mutate(dados);
  };

  useEffect(() => {
    if (open && nomeInicial) {
      setFormData((prev) => ({ ...prev, nome: nomeInicial }));
    }
  }, [open, nomeInicial]);

  useEffect(() => {
    if (!open) {
      limparFormulario();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastro Rápido de Utente</DialogTitle>
          <DialogDescription>
            Preencha os dados essenciais para cadastrar um novo utente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campos Essenciais */}
          <div className="space-y-4 p-4 border rounded-lg bg-accent/50">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Informações Essenciais
            </h3>

            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome Completo * <span className="text-xs text-muted-foreground">(obrigatório)</span>
              </Label>
              <Input
                id="nome"
                placeholder="Nome completo do utente"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                autoFocus
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telemovel" className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Telemóvel *
                </Label>
                <Input
                  id="telemovel"
                  placeholder="+351 912 345 678"
                  value={formData.telemovel}
                  onChange={(e) => setFormData({ ...formData, telemovel: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Botão para mostrar campos adicionais */}
          <Button
            variant="outline"
            onClick={() => setModoCompleto(!modoCompleto)}
            className="w-full"
            type="button"
          >
            {modoCompleto ? "Ocultar" : "Mostrar"} Campos Adicionais (Opcional)
          </Button>

          {/* Campos Adicionais */}
          {modoCompleto && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm">Informações Adicionais</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Data de Nascimento
                  </Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) =>
                      setFormData({ ...formData, dataNascimento: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genero">Género</Label>
                  <Select
                    value={formData.genero}
                    onValueChange={(value) => setFormData({ ...formData, genero: value })}
                  >
                    <SelectTrigger id="genero">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="morada" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Morada
                </Label>
                <Input
                  id="morada"
                  placeholder="Rua, número, andar"
                  value={formData.morada}
                  onChange={(e) => setFormData({ ...formData, morada: e.target.value })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    placeholder="Lisboa"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigoPostal">Código Postal</Label>
                  <Input
                    id="codigoPostal"
                    placeholder="1000-001"
                    value={formData.codigoPostal}
                    onChange={(e) =>
                      setFormData({ ...formData, codigoPostal: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nif">NIF</Label>
                  <Input
                    id="nif"
                    placeholder="Número de contribuinte"
                    value={formData.nif}
                    onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroUtenteSNS">Nº Utente SNS</Label>
                  <Input
                    id="numeroUtenteSNS"
                    placeholder="Número do SNS"
                    value={formData.numeroUtenteSNS}
                    onChange={(e) =>
                      setFormData({ ...formData, numeroUtenteSNS: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Informação */}
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
            <p className="font-medium mb-1">💡 Dica:</p>
            <p>
              Preencha apenas nome e telemóvel para cadastro rápido. Os demais dados podem
              ser completados depois na ficha do utente.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={criarUtenteMutation.isPending}
          >
            {criarUtenteMutation.isPending ? "Cadastrando..." : "Cadastrar Utente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
