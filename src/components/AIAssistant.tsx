import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  Lightbulb, 
  TrendingUp, 
  AlertCircle, 
  Info,
  CheckCircle,
  XCircle,
  Sparkles,
  X,
  Check,
  ArrowRight,
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner";

interface Recommendation {
  text: string;
  type?: "tip" | "insight" | "warning" | "success";
}

interface AIAlert {
  type: "warning" | "info" | "success" | "error";
  message: string;
}

interface AIAssistantProps {
  recommendations: string[];
  alerts?: AIAlert[];
  quickTips?: string[];
  showInsights?: boolean;
  compact?: boolean;
}

export function AIAssistant({
  recommendations = [],
  alerts = [],
  quickTips = [],
  showInsights = true,
  compact = false,
}: AIAssistantProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [completedRecommendations, setCompletedRecommendations] = useState<Set<number>>(new Set());

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-4 w-4" />;
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string): "default" | "destructive" => {
    return type === "error" || type === "warning" ? "destructive" : "default";
  };

  const dismissAlert = (message: string) => {
    setDismissedAlerts(new Set(dismissedAlerts).add(message));
  };

  const markAsComplete = (index: number) => {
    setCompletedRecommendations(new Set(completedRecommendations).add(index));
    toast.success("Recomendação marcada como concluída!");
  };

  const handleAction = (index: number) => {
    toast.info("Funcionalidade em desenvolvimento");
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.message));

  if (recommendations.length === 0 && alerts.length === 0 && quickTips.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Alertas Importantes */}
      {visibleAlerts.length > 0 && (
        <div className="space-y-2">
          {visibleAlerts.map((alert, index) => (
            <Alert
              key={index}
              variant={getAlertVariant(alert.type)}
              className="relative"
            >
              <div className="flex items-start gap-2">
                {getAlertIcon(alert.type)}
                <AlertDescription className="flex-1">
                  {alert.message}
                </AlertDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => dismissAlert(alert.message)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Grid: Assistente + Dicas lado a lado */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recomendações da IA */}
        {showInsights && recommendations.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                Assistente Inteligente
                <Badge variant="secondary" className="ml-1 text-xs">
                  IA
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 p-2.5 rounded-lg bg-white border transition-all ${
                      completedRecommendations.has(index)
                        ? "border-green-200 bg-green-50/50 opacity-60"
                        : "border-blue-100 hover:border-blue-200 hover:shadow-sm"
                    }`}
                  >
                    <Lightbulb className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                      completedRecommendations.has(index) ? "text-green-600" : "text-blue-600"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${
                        completedRecommendations.has(index)
                          ? "text-gray-500 line-through"
                          : "text-gray-700"
                      }`}>
                        {rec}
                      </p>
                    </div>
                    {!completedRecommendations.has(index) && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-green-100"
                          onClick={() => markAsComplete(index)}
                          title="Marcar como concluída"
                        >
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-blue-100"
                          onClick={() => handleAction(index)}
                          title="Executar ação"
                        >
                          <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dicas Rápidas */}
        {quickTips.length > 0 && (
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-purple-700">
                <TrendingUp className="h-4 w-4" />
                Dicas Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {quickTips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-purple-100 hover:border-purple-200 hover:shadow-sm transition-all"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0 mt-1.5" />
                    <span className="text-sm text-purple-700 flex-1">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * Componente de Rodapé com Recomendações
 */
interface PageFooterProps {
  recommendations: string[];
  stats?: {
    label: string;
    value: string | number;
    trend?: "up" | "down" | "neutral";
  }[];
}

export function PageFooter({ recommendations = [], stats = [] }: PageFooterProps) {
  if (recommendations.length === 0 && (!stats || stats.length === 0)) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recomendações */}
        {recommendations.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              Recomendações
            </h3>
            <div className="space-y-2">
              {recommendations.slice(0, 3).map((rec, index) => (
                <div
                  key={index}
                  className="text-sm text-gray-600 flex items-start gap-2"
                >
                  <span className="text-yellow-600">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estatísticas */}
        {stats && stats.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Estatísticas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg font-semibold text-gray-900">
                      {stat.value}
                    </p>
                    {stat.trend && (
                      <Badge
                        variant={
                          stat.trend === "up"
                            ? "default"
                            : stat.trend === "down"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {stat.trend === "up" ? "↑" : stat.trend === "down" ? "↓" : "→"}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rodapé do Sistema */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>© 2025 DentCarePro SaaS</span>
            <span>•</span>
            <span>Sistema conforme RGPD</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Assistido por IA
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              v5.5.0
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook movido para /hooks/useAIAssistant.ts
// Importar de lá: import { useAIAssistant } from "@/hooks/useAIAssistant";
