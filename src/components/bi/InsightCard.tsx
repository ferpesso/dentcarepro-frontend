import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { CardModern } from '@/components/ui/card-modern';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface InsightCardProps {
  prioridade: 'alto' | 'medio' | 'positivo';
  tipo: 'oportunidade' | 'alerta' | 'sucesso';
  titulo: string;
  descricao: string;
  acaoSugerida?: string;
  link?: string;
}

export function InsightCard({
  prioridade,
  tipo,
  titulo,
  descricao,
  acaoSugerida,
  link,
}: InsightCardProps) {
  const [, setLocation] = useLocation();

  const configPrioridade = {
    alto: {
      cor: 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800',
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      icone: AlertCircle,
      iconeColor: 'text-red-600 dark:text-red-400',
      label: 'ALTA PRIORIDADE',
    },
    medio: {
      cor: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800',
      badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      icone: AlertTriangle,
      iconeColor: 'text-yellow-600 dark:text-yellow-400',
      label: 'MÉDIA PRIORIDADE',
    },
    positivo: {
      cor: 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800',
      badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      icone: CheckCircle,
      iconeColor: 'text-green-600 dark:text-green-400',
      label: 'SUCESSO',
    },
  };

  const config = configPrioridade[prioridade];
  const Icon = config.icone;

  const handleAcao = () => {
    if (link) {
      setLocation(link);
    }
  };

  return (
    <div className={`
      border-2 rounded-xl p-4 transition-all-smooth
      ${config.cor}
      hover:shadow-md
      animate-fade-in-up
    `}>
      <div className="flex items-start gap-3">
        {/* Ícone */}
        <div className={`flex-shrink-0 ${config.iconeColor}`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          {/* Badge de Prioridade */}
          <span className={`
            inline-block px-2 py-0.5 rounded text-xs font-semibold mb-2
            ${config.badge}
          `}>
            {config.label}
          </span>

          {/* Título */}
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            {titulo}
          </h4>

          {/* Descrição */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {descricao}
          </p>

          {/* Ação Sugerida */}
          {acaoSugerida && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAcao}
              className="group"
            >
              {acaoSugerida}
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
