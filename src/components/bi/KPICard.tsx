import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { CardModern } from '@/components/ui/card-modern';

interface KPICardProps {
  titulo: string;
  valor: number | string;
  variacao: number;
  meta?: number;
  icone: LucideIcon;
  cor?: 'blue' | 'green' | 'purple' | 'orange';
  formato?: 'numero' | 'moeda' | 'percentual';
  sufixo?: string;
}

export function KPICard({
  titulo,
  valor,
  variacao,
  meta,
  icone: Icon,
  cor = 'blue',
  formato = 'numero',
  sufixo = '',
}: KPICardProps) {
  const formatarValor = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (formato) {
      case 'moeda':
        return new Intl.NumberFormat('pt-PT', {
          style: 'currency',
          currency: 'EUR',
        }).format(val);
      case 'percentual':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString('pt-PT');
    }
  };

  const calcularProgresso = () => {
    if (!meta || typeof valor !== 'number') return 0;
    return Math.min((valor / meta) * 100, 100);
  };

  const progresso = calcularProgresso();
  const isPositivo = variacao >= 0;

  const coresIcone = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  };

  return (
    <CardModern className="animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {titulo}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {formatarValor(valor)}
            {sufixo && <span className="text-lg ml-1">{sufixo}</span>}
          </p>

          {/* Indicador de Variação */}
          <div className="mt-2 flex items-center gap-2">
            <div className={`flex items-center gap-1 text-sm font-medium ${
              isPositivo ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositivo ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(variacao).toFixed(1)}%</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              vs período anterior
            </span>
          </div>

          {/* Barra de Progresso (se houver meta) */}
          {meta && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  Meta: {formatarValor(meta)}
                </span>
                <span className={`font-semibold ${
                  progresso >= 100 ? 'text-green-600' : 'text-gray-900 dark:text-white'
                }`}>
                  {progresso.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    progresso >= 100
                      ? 'bg-green-500'
                      : progresso >= 75
                      ? 'bg-blue-500'
                      : progresso >= 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${progresso}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Ícone */}
        <div className={`
          p-3 rounded-lg ${coresIcone[cor]}
          transition-all-smooth hover-scale
        `}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardModern>
  );
}
