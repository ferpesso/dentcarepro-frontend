import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Key,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2
} from "lucide-react";

export default function GestaoEquipa() {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [novoUtilizador, setNovoUtilizador] = useState({
    nome: "",
    email: "",
    password: "",
    funcaoId: "",
  });

  // Mock data - substituir por tRPC query
  const utilizadores = [
    {
      id: 1,
      nome: "Dr. João Silva",
      email: "joao@dentcarepro.pt",
      funcaoNome: "Admin",
      nivelAcesso: 3,
      ativo: true,
      ultimoAcesso: new Date(),
    },
    {
      id: 2,
      nome: "Dra. Maria Santos",
      email: "maria@dentcarepro.pt",
      funcaoNome: "Dentista",
      nivelAcesso: 2,
      ativo: true,
      ultimoAcesso: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: 3,
      nome: "Ana Costa",
      email: "ana@dentcarepro.pt",
      funcaoNome: "Rececionista",
      nivelAcesso: 1,
      ativo: true,
      ultimoAcesso: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: 4,
      nome: "Carlos Pereira",
      email: "carlos@dentcarepro.pt",
      funcaoNome: "Dentista",
      nivelAcesso: 2,
      ativo: false,
      ultimoAcesso: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  ];

  const funcoes = [
    { id: 1, nome: "Admin", nivelAcesso: 3, descricao: "Acesso total ao sistema" },
    { id: 2, nome: "Dentista", nivelAcesso: 2, descricao: "Acesso a consultas e prontuários" },
    { id: 3, nome: "Rececionista", nivelAcesso: 1, descricao: "Agendamento e atendimento" },
    { id: 4, nome: "Gestor", nivelAcesso: 2, descricao: "Relatórios e financeiro" },
    { id: 5, nome: "Auxiliar", nivelAcesso: 1, descricao: "Apoio clínico" },
  ];

  const permissoesPorModulo = {
    "Utentes": ["Ver", "Criar", "Editar", "Eliminar"],
    "Consultas": ["Ver", "Criar", "Editar", "Cancelar", "Realizar"],
    "Prontuários": ["Ver", "Criar", "Editar"],
    "Faturas": ["Ver", "Criar", "Editar", "Eliminar", "Pagamentos"],
    "Procedimentos": ["Ver", "Criar", "Editar", "Eliminar"],
    "Relatórios": ["Financeiro", "Operacional", "Executivo"],
    "Configurações": ["Clínica", "Utilizadores", "Permissões", "Lembretes"],
    "Auditoria": ["Ver", "Exportar"],
  };

  const handleCriarUtilizador = () => {
    // TODO: Implementar criação via tRPC
    console.log("Criar utilizador:", novoUtilizador);
    setDialogAberto(false);
    setNovoUtilizador({ nome: "", email: "", password: "", funcaoId: "" });
  };

  const getNivelAcessoBadge = (nivel: number) => {
    if (nivel === 3) return <Badge variant="default">Admin</Badge>;
    if (nivel === 2) return <Badge variant="secondary">Médio</Badge>;
    return <Badge variant="outline">Básico</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Gestão de Equipa
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerir utilizadores, funções e permissões
          </p>
        </div>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Utilizador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Utilizador</DialogTitle>
              <DialogDescription>
                Criar um novo utilizador e atribuir função
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={novoUtilizador.nome}
                  onChange={(e) =>
                    setNovoUtilizador({ ...novoUtilizador, nome: e.target.value })
                  }
                  placeholder="João Silva"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={novoUtilizador.email}
                  onChange={(e) =>
                    setNovoUtilizador({ ...novoUtilizador, email: e.target.value })
                  }
                  placeholder="joao@dentcarepro.pt"
                />
              </div>
              <div className="space-y-2">
                <Label>Password Inicial</Label>
                <Input
                  type="password"
                  value={novoUtilizador.password}
                  onChange={(e) =>
                    setNovoUtilizador({ ...novoUtilizador, password: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label>Função</Label>
                <Select
                  value={novoUtilizador.funcaoId}
                  onValueChange={(value) =>
                    setNovoUtilizador({ ...novoUtilizador, funcaoId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    {funcoes.map((funcao) => (
                      <SelectItem key={funcao.id} value={funcao.id.toString()}>
                        {funcao.nome} - {funcao.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCriarUtilizador} className="w-full">
                Criar Utilizador
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Utilizadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilizadores.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {utilizadores.filter(u => u.ativo).length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Administradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {utilizadores.filter(u => u.nivelAcesso === 3).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Nível máximo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dentistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {utilizadores.filter(u => u.funcaoNome === "Dentista").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Profissionais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Equipa de Apoio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {utilizadores.filter(u => u.nivelAcesso === 1).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Rececionistas e auxiliares</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Utilizadores */}
      <Card>
        <CardHeader>
          <CardTitle>Utilizadores da Clínica</CardTitle>
          <CardDescription>
            Gerir acesso e permissões dos membros da equipa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {utilizadores.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {user.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{user.nome}</p>
                      {user.ativo ? (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{user.funcaoNome}</Badge>
                      {getNivelAcessoBadge(user.nivelAcesso)}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Último acesso: {user.ultimoAcesso.toLocaleDateString("pt-PT")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Funções e Permissões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funções */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Funções Disponíveis
            </CardTitle>
            <CardDescription>
              Funções pré-definidas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funcoes.map((funcao) => (
                <div key={funcao.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold">{funcao.nome}</p>
                    {getNivelAcessoBadge(funcao.nivelAcesso)}
                  </div>
                  <p className="text-sm text-muted-foreground">{funcao.descricao}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permissões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Matriz de Permissões
            </CardTitle>
            <CardDescription>
              Permissões por módulo do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(permissoesPorModulo).map(([modulo, permissoes]) => (
                <div key={modulo}>
                  <p className="font-semibold text-sm mb-2">{modulo}</p>
                  <div className="flex flex-wrap gap-1">
                    {permissoes.map((perm) => (
                      <Badge key={perm} variant="outline" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
