import { useState, useEffect } from "react";
import { CalendarioAgendaMelhorado } from "@/components/CalendarioAgendaMelhorado";
import { AgendarConsultaDialog } from "@/components/AgendarConsultaDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { AIAssistant, PageFooter } from "@/components/AIAssistant";
import { useAIAssistant } from "@/hooks/useAIAssistant";

export default function Agenda() {
  const [clinicaId, setClinicaId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Assistente IA
  const { recommendations, alerts, quickTips, loading: loadingAI } = useAIAssistant("agenda", clinicaId || undefined);

  // Buscar clínicas do utilizador
  const { data: clinicas, isLoading: loadingClinicas } = trpc.clinicas.minhas.useQuery();

  // Definir clínica ativa
  useEffect(() => {
    if (clinicas && clinicas.length > 0 && !clinicaId) {
      setClinicaId(clinicas[0].clinica.id);
    }
  }, [clinicas, clinicaId]);

  if (loadingClinicas) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Agenda</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center py-8">A carregar...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clinicas || clinicas.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Agenda</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center py-8">
              Nenhuma clínica encontrada. Crie uma clínica primeiro.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clinicaId) {
    return null;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground mt-1">
            Visualize e gerencie as consultas agendadas
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Consulta
        </Button>
      </div>

      {/* Assistente IA */}
      {!loadingAI && (
        <AIAssistant
          recommendations={recommendations}
          alerts={alerts}
          quickTips={quickTips}
          showInsights={true}
        />
      )}

      <CalendarioAgendaMelhorado clinicaId={clinicaId} />
      
      <AgendarConsultaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clinicaId={clinicaId}
      />

      {/* Rodapé com Recomendações */}
      <PageFooter
        recommendations={recommendations}
      />
    </div>
  );
}
