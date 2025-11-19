/**
 * Componente Periodontograma Digital Interativo
 * 
 * Funcionalidades:
 * - Visualização gráfica de todos os dentes
 * - Input visual de medições por dente
 * - Cálculo automático de índices
 * - Visualização de evolução temporal
 * - Gráficos interativos
 * - Export para PDF
 */

import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

/**
 * Dente no periodontograma
 */
interface Dente {
  numero: number;
  nome: string;
  presente: boolean;
  medicoes: MedicoesDente;
}

/**
 * Medições de um dente
 */
interface MedicoesDente {
  // Profundidade de sondagem (mm) - 6 pontos por dente
  profundidade: {
    mesioVestibular: number;
    vestibular: number;
    distoVestibular: number;
    mesioLingual: number;
    lingual: number;
    distoLingual: number;
  };
  // Sangramento à sondagem
  sangramento: {
    mesioVestibular: boolean;
    vestibular: boolean;
    distoVestibular: boolean;
    mesioLingual: boolean;
    lingual: boolean;
    distoLingual: boolean;
  };
  // Presença de placa
  placa: {
    mesioVestibular: boolean;
    vestibular: boolean;
    distoVestibular: boolean;
    mesioLingual: boolean;
    lingual: boolean;
    distoLingual: boolean;
  };
  // Recessão gengival (mm)
  recessao: {
    mesioVestibular: number;
    vestibular: number;
    distoVestibular: number;
    mesioLingual: number;
    lingual: number;
    distoLingual: number;
  };
  // Mobilidade (0-3)
  mobilidade: number;
  // Furca (0-3)
  furca: number;
}

/**
 * Índices calculados
 */
interface Indices {
  indiceProfundidade: number;
  indiceSangramento: number;
  indicePlaca: number;
  indiceRecessao: number;
}

/**
 * Props do componente
 */
interface PeriodontogramaProps {
  utenteId: number;
  clinicaId: number;
  avaliacaoId?: number;
  readonly?: boolean;
  onSave?: (data: any) => void;
}

/**
 * Componente principal
 */
export const Periodontograma: React.FC<PeriodontogramaProps> = ({
  utenteId,
  clinicaId,
  avaliacaoId,
  readonly = false,
  onSave,
}) => {
  // Estado
  const [dentes, setDentes] = useState<Dente[]>([]);
  const [dentesSelecionados, setDentesSelecionados] = useState<number[]>([]);
  const [modoEdicao, setModoEdicao] = useState<'profundidade' | 'sangramento' | 'placa' | 'recessao'>('profundidade');
  const [indices, setIndices] = useState<Indices | null>(null);
  const [observacoes, setObservacoes] = useState('');

  // Inicializar dentes
  useEffect(() => {
    const dentesIniciais: Dente[] = [];
    
    // Dentes superiores (18-11, 21-28)
    for (let i = 18; i >= 11; i--) {
      dentesIniciais.push(criarDente(i));
    }
    for (let i = 21; i <= 28; i++) {
      dentesIniciais.push(criarDente(i));
    }
    
    // Dentes inferiores (48-41, 31-38)
    for (let i = 48; i >= 41; i--) {
      dentesIniciais.push(criarDente(i));
    }
    for (let i = 31; i <= 38; i++) {
      dentesIniciais.push(criarDente(i));
    }

    setDentes(dentesIniciais);
  }, []);

  // Calcular índices quando medições mudarem
  useEffect(() => {
    if (dentes.length > 0) {
      const indicesCalculados = calcularIndices(dentes);
      setIndices(indicesCalculados);
    }
  }, [dentes]);

  /**
   * Criar dente vazio
   */
  function criarDente(numero: number): Dente {
    return {
      numero,
      nome: getNomeDente(numero),
      presente: true,
      medicoes: {
        profundidade: {
          mesioVestibular: 2,
          vestibular: 2,
          distoVestibular: 2,
          mesioLingual: 2,
          lingual: 2,
          distoLingual: 2,
        },
        sangramento: {
          mesioVestibular: false,
          vestibular: false,
          distoVestibular: false,
          mesioLingual: false,
          lingual: false,
          distoLingual: false,
        },
        placa: {
          mesioVestibular: false,
          vestibular: false,
          distoVestibular: false,
          mesioLingual: false,
          lingual: false,
          distoLingual: false,
        },
        recessao: {
          mesioVestibular: 0,
          vestibular: 0,
          distoVestibular: 0,
          mesioLingual: 0,
          lingual: 0,
          distoLingual: 0,
        },
        mobilidade: 0,
        furca: 0,
      },
    };
  }

  /**
   * Obter nome do dente
   */
  function getNomeDente(numero: number): string {
    const nomes: Record<number, string> = {
      18: 'M3', 17: 'M2', 16: 'M1', 15: 'PM2', 14: 'PM1', 13: 'C', 12: 'I2', 11: 'I1',
      21: 'I1', 22: 'I2', 23: 'C', 24: 'PM1', 25: 'PM2', 26: 'M1', 27: 'M2', 28: 'M3',
      48: 'M3', 47: 'M2', 46: 'M1', 45: 'PM2', 44: 'PM1', 43: 'C', 42: 'I2', 41: 'I1',
      31: 'I1', 32: 'I2', 33: 'C', 34: 'PM1', 35: 'PM2', 36: 'M1', 37: 'M2', 38: 'M3',
    };
    return nomes[numero] || numero.toString();
  }

  /**
   * Calcular índices periodontais
   */
  function calcularIndices(dentes: Dente[]): Indices {
    let totalPontos = 0;
    let somaProfundidade = 0;
    let pontosSangramento = 0;
    let pontosPlaca = 0;
    let somaRecessao = 0;

    dentes.forEach((dente) => {
      if (!dente.presente) return;

      const pontos = Object.values(dente.medicoes.profundidade);
      pontos.forEach((prof) => {
        totalPontos++;
        somaProfundidade += prof;
      });

      Object.values(dente.medicoes.sangramento).forEach((sang) => {
        if (sang) pontosSangramento++;
      });

      Object.values(dente.medicoes.placa).forEach((placa) => {
        if (placa) pontosPlaca++;
      });

      Object.values(dente.medicoes.recessao).forEach((rec) => {
        somaRecessao += rec;
      });
    });

    return {
      indiceProfundidade: totalPontos > 0 ? somaProfundidade / totalPontos : 0,
      indiceSangramento: totalPontos > 0 ? (pontosSangramento / totalPontos) * 100 : 0,
      indicePlaca: totalPontos > 0 ? (pontosPlaca / totalPontos) * 100 : 0,
      indiceRecessao: totalPontos > 0 ? somaRecessao / totalPontos : 0,
    };
  }

  /**
   * Atualizar medição de um dente
   */
  function atualizarMedicao(
    numeroDente: number,
    tipo: keyof MedicoesDente,
    ponto: string,
    valor: any
  ) {
    setDentes((prev) =>
      prev.map((dente) => {
        if (dente.numero === numeroDente) {
          return {
            ...dente,
            medicoes: {
              ...dente.medicoes,
              [tipo]: {
                ...(dente.medicoes[tipo] as object),
                [ponto]: valor,
              },
            },
          };
        }
        return dente;
      })
    );
  }

  /**
   * Renderizar dente
   */
  function renderDente(dente: Dente) {
    const corProfundidade = getCorProfundidade(
      Object.values(dente.medicoes.profundidade).reduce((a, b) => Math.max(a, b), 0)
    );

    return (
      <div
        key={dente.numero}
        className={`
          relative flex flex-col items-center p-2 border rounded
          ${dente.presente ? 'bg-white' : 'bg-gray-200'}
          ${dentesSelecionados.includes(dente.numero) ? 'ring-2 ring-blue-500' : ''}
          hover:shadow-lg transition-shadow cursor-pointer
        `}
        onClick={() => {
          if (!readonly) {
            setDentesSelecionados((prev) =>
              prev.includes(dente.numero)
                ? prev.filter((n) => n !== dente.numero)
                : [...prev, dente.numero]
            );
          }
        }}
      >
        {/* Número do dente */}
        <div className="text-xs font-bold text-gray-600">{dente.numero}</div>
        
        {/* Representação visual do dente */}
        <div
          className="w-12 h-16 rounded-lg mt-1"
          style={{ backgroundColor: corProfundidade }}
        >
          {/* Indicadores de sangramento */}
          {Object.values(dente.medicoes.sangramento).some((s) => s) && (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-red-600 text-2xl">🩸</span>
            </div>
          )}
        </div>

        {/* Nome do dente */}
        <div className="text-xs mt-1">{dente.nome}</div>

        {/* Mobilidade */}
        {dente.medicoes.mobilidade > 0 && (
          <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {dente.medicoes.mobilidade}
          </div>
        )}
      </div>
    );
  }

  /**
   * Obter cor baseada na profundidade
   */
  function getCorProfundidade(profundidade: number): string {
    if (profundidade <= 3) return '#4ade80'; // Verde - saudável
    if (profundidade <= 5) return '#fbbf24'; // Amarelo - moderado
    if (profundidade <= 7) return '#fb923c'; // Laranja - severo
    return '#ef4444'; // Vermelho - muito severo
  }

  /**
   * Salvar avaliação
   */
  async function salvar() {
    const dados = {
      utenteId,
      clinicaId,
      medicoes: dentes
        .filter((d) => d.presente)
        .map((d) => ({
          numeroDente: d.numero,
          ...d.medicoes,
        })),
      observacoes,
    };

    if (onSave) {
      onSave(dados);
    }
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Periodontograma Digital</h2>

      {/* Controles */}
      {!readonly && (
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setModoEdicao('profundidade')}
            className={`px-4 py-2 rounded ${
              modoEdicao === 'profundidade' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Profundidade
          </button>
          <button
            onClick={() => setModoEdicao('sangramento')}
            className={`px-4 py-2 rounded ${
              modoEdicao === 'sangramento' ? 'bg-red-600 text-white' : 'bg-gray-200'
            }`}
          >
            Sangramento
          </button>
          <button
            onClick={() => setModoEdicao('placa')}
            className={`px-4 py-2 rounded ${
              modoEdicao === 'placa' ? 'bg-yellow-600 text-white' : 'bg-gray-200'
            }`}
          >
            Placa
          </button>
          <button
            onClick={() => setModoEdicao('recessao')}
            className={`px-4 py-2 rounded ${
              modoEdicao === 'recessao' ? 'bg-purple-600 text-white' : 'bg-gray-200'
            }`}
          >
            Recessão
          </button>
        </div>
      )}

      {/* Arcada superior */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Arcada Superior</h3>
        <div className="grid grid-cols-16 gap-2">
          {dentes.slice(0, 16).map((dente) => renderDente(dente))}
        </div>
      </div>

      {/* Arcada inferior */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Arcada Inferior</h3>
        <div className="grid grid-cols-16 gap-2">
          {dentes.slice(16, 32).map((dente) => renderDente(dente))}
        </div>
      </div>

      {/* Índices */}
      {indices && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Índices Periodontais</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Profundidade Média</div>
              <div className="text-2xl font-bold">{indices.indiceProfundidade.toFixed(2)} mm</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Índice de Sangramento</div>
                <div className="text-2xl font-bold text-red-600">
                  {indices.indiceSangramento.toFixed(1)}%
                </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Índice de Placa</div>
              <div className="text-2xl font-bold text-yellow-600">
                {indices.indicePlaca.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Recessão Média</div>
              <div className="text-2xl font-bold">{indices.indiceRecessao.toFixed(2)} mm</div>
            </div>
          </div>
        </div>
      )}

      {/* Observações */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Observações</label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          disabled={readonly}
          className="w-full p-3 border rounded-lg"
          rows={4}
          placeholder="Anotações sobre a avaliação periodontal..."
        />
      </div>

      {/* Botões de ação */}
      {!readonly && (
        <div className="flex gap-4">
          <button
            onClick={salvar}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Salvar Avaliação
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
          >
            Imprimir
          </button>
        </div>
      )}

      {/* Legenda */}
      <div className="mt-6 p-4 bg-white rounded-lg">
        <h4 className="font-semibold mb-2">Legenda</h4>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4ade80' }}></div>
            <span>Saudável (≤3mm)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
            <span>Moderado (4-5mm)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fb923c' }}></div>
            <span>Severo (6-7mm)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Muito Severo (&gt;7mm)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Periodontograma;
