import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface AdicionarUtenteDialogProps {
  clinicaId: number;
  onSuccess?: () => void;
}

export function AdicionarUtenteDialog({ clinicaId, onSuccess }: AdicionarUtenteDialogProps) {
  const [open, setOpen] = useState(false);
  const [dataNascimento, setDataNascimento] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telemovel: "",
    nif: "",
    morada: "",
    cidade: "",
    codigoPostal: "",
    observacoes: "",
  });

  const utils = trpc.useUtils();

  const criarUtente = trpc.utentes.criar.useMutation({
    onSuccess: () => {
      toast.success("Utente criado com sucesso!");
      setOpen(false);
      setFormData({
        nome: "",
        email: "",
        telemovel: "",
        nif: "",
        morada: "",
        cidade: "",
        codigoPostal: "",
        observacoes: "",
      });
      setDataNascimento(null);
      utils.utentes.listar.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao criar utente: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    criarUtente.mutate({
      clinicaId,
      nome: formData.nome,
      email: formData.email || undefined,
      telemovel: formData.telemovel || undefined,
      dataNascimento: dataNascimento || undefined,
      nif: formData.nif || undefined,
      morada: formData.morada || undefined,
      cidade: formData.cidade || undefined,
      codigoPostal: formData.codigoPostal || undefined,
      observacoes: formData.observacoes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Utente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Utente</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo utente. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="João Silva"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="joao@example.com"
              />
            </div>

            <div>
              <Label htmlFor="telemovel">Telemóvel</Label>
              <Input
                id="telemovel"
                value={formData.telemovel}
                onChange={(e) => setFormData({ ...formData, telemovel: e.target.value })}
                placeholder="+351 912 345 678"
              />
            </div>

            <div>
              <Label htmlFor="dataNascimento">Data de Nascimento</Label>
              <div className="relative">
                <DatePicker
                  id="dataNascimento"
                  selected={dataNascimento}
                  onChange={(date) => setDataNascimento(date)}
                  dateFormat="dd/MM/yyyy"
                  locale={pt}
                  placeholderText="Selecione a data"
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  maxDate={new Date()}
                  yearDropdownItemNumber={100}
                  scrollableYearDropdown
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  wrapperClassName="w-full"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="nif">NIF</Label>
              <Input
                id="nif"
                value={formData.nif}
                onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                placeholder="123456789"
                maxLength={9}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="morada">Morada</Label>
              <Input
                id="morada"
                value={formData.morada}
                onChange={(e) => setFormData({ ...formData, morada: e.target.value })}
                placeholder="Rua Example, 123"
              />
            </div>

            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                placeholder="Lisboa"
              />
            </div>

            <div>
              <Label htmlFor="codigoPostal">Código Postal</Label>
              <Input
                id="codigoPostal"
                value={formData.codigoPostal}
                onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                placeholder="1000-001"
                maxLength={8}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Notas adicionais sobre o utente..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={criarUtente.isPending}>
              {criarUtente.isPending ? "Criando..." : "Criar Utente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
