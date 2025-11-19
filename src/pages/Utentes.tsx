import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/badge-modern";
import { Search, Plus, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/skeleton-modern";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { AdicionarUtenteDialog } from "@/components/AdicionarUtenteDialog";
import { AIAssistant, PageFooter } from "@/components/AIAssistant";
import { useAIAssistant } from "@/hooks/useAIAssistant";

export default function Utentes() {
  const [, setLocation] = useLocation();
  const [clinicaId, setClinicaId] = useState<number | null>(null);
  const [pesquisa, setPesquisa] = useState("");
  
  // Assistente IA
  const { recommendations, alerts, quickTips, loading: loadingAI } = useAIAssistant("utentes", clinicaId || undefined);

  const { data: clinicas } = trpc.clinicas.minhas.useQuery();

  useEffect(() => {
    if (clinicas && clinicas.length > 0 && !clinicaId) {
      setClinicaId(clinicas[0].clinica.id);
    }
  }, [clinicas, clinicaId]);

  const { data: utentes, isLoading } = trpc.utentes.listar.useQuery(
    { clinicaId: clinicaId!, pesquisa: pesquisa || undefined },
    { enabled: !!clinicaId }
  );

  if (!clinicaId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Selecione uma clínica</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Utentes</h1>
          <p className="text-muted-foreground mt-1">Gerir fichas de utentes</p>
        </div>
        <AdicionarUtenteDialog clinicaId={clinicaId} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar utentes..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Assistente IA */}
      {!loadingAI && (
        <AIAssistant
          recommendations={recommendations}
          alerts={alerts}
          quickTips={quickTips}
          showInsights={true}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Utentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={8} />
          ) : !utentes || utentes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum utente encontrado</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Utente</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telemóvel</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {utentes.map((utente) => (
                    <TableRow key={utente.id}>
                      <TableCell className="font-mono text-sm">{utente.numeroUtente}</TableCell>
                      <TableCell className="font-medium">{utente.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{utente.email || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{utente.telemovel || "-"}</TableCell>
                      <TableCell>
                        <StatusBadge 
                          status={utente.ativo ? "active" : "inactive"}
                          pulse={utente.ativo}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLocation(`/utentes/${utente.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rodapé com Recomendações */}
      <PageFooter
        recommendations={recommendations}
        stats={[
          { label: "Total Utentes", value: utentes?.length || 0 },
          { label: "Ativos", value: utentes?.filter(u => u.ativo).length || 0 },
          { label: "Inativos", value: utentes?.filter(u => !u.ativo).length || 0 },
        ]}
      />
    </div>
  );
}
