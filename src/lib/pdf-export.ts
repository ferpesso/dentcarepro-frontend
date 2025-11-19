/**
 * Utilitário para exportação de relatórios em PDF
 * Usa jsPDF e html2canvas para gerar PDFs do lado do cliente
 */

export interface RelatorioAvaliacoes {
  titulo: string;
  periodo: string;
  estatisticas: {
    total: number;
    media: number;
    taxaRecomendacao: number;
    nps: number;
  };
  avaliacoes: Array<{
    utente: string;
    classificacao: number;
    tipo: string;
    comentario: string;
    data: string;
    aprovada: boolean;
  }>;
}

export interface RelatorioCustos {
  titulo: string;
  periodo: string;
  resumo: {
    total: number;
    fixos: number;
    variaveis: number;
    pendentes: number;
  };
  custos: Array<{
    descricao: string;
    categoria: string;
    valor: number;
    fornecedor?: string;
    data: string;
    pago: boolean;
  }>;
}

/**
 * Exporta relatório de avaliações para PDF
 */
export async function exportarAvaliacoesPDF(dados: RelatorioAvaliacoes): Promise<void> {
  // Importação dinâmica do jsPDF
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF() as any;

  // Título
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text(dados.titulo, 20, 20);

  // Período
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(dados.periodo, 20, 30);

  // Estatísticas
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Estatísticas Gerais', 20, 45);

  const stats = [
    ['Total de Avaliações', dados.estatisticas.total.toString()],
    ['Média de Classificação', `${dados.estatisticas.media.toFixed(1)}/5 ⭐`],
    ['Taxa de Recomendação', `${dados.estatisticas.taxaRecomendacao.toFixed(1)}%`],
    ['NPS Score', dados.estatisticas.nps.toString()],
  ];

  doc.autoTable({
    startY: 50,
    head: [['Métrica', 'Valor']],
    body: stats,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
  });

  // Avaliações Detalhadas
  let currentY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('Avaliações Detalhadas', 20, currentY);

  const avaliacoesData = dados.avaliacoes.map(av => [
    av.utente,
    '⭐'.repeat(av.classificacao),
    av.tipo,
    av.comentario.substring(0, 50) + (av.comentario.length > 50 ? '...' : ''),
    av.data,
    av.aprovada ? 'Sim' : 'Não',
  ]);

  doc.autoTable({
    startY: currentY + 5,
    head: [['Utente', 'Classificação', 'Tipo', 'Comentário', 'Data', 'Aprovada']],
    body: avaliacoesData,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 8 },
    columnStyles: {
      3: { cellWidth: 60 },
    },
  });

  // Rodapé
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleDateString('pt-PT')}`,
      20,
      doc.internal.pageSize.height - 10
    );
  }

  // Download
  doc.save(`relatorio-avaliacoes-${new Date().getTime()}.pdf`);
}

/**
 * Exporta relatório de custos para PDF
 */
export async function exportarCustosPDF(dados: RelatorioCustos): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF() as any;

  // Título
  doc.setFontSize(20);
  doc.setTextColor(239, 68, 68); // red-600
  doc.text(dados.titulo, 20, 20);

  // Período
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(dados.periodo, 20, 30);

  // Resumo Financeiro
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Resumo Financeiro', 20, 45);

  const resumo = [
    ['Custos Totais', `€${dados.resumo.total.toFixed(2)}`],
    ['Custos Fixos', `€${dados.resumo.fixos.toFixed(2)}`],
    ['Custos Variáveis', `€${dados.resumo.variaveis.toFixed(2)}`],
    ['Pendentes de Pagamento', dados.resumo.pendentes.toString()],
  ];

  doc.autoTable({
    startY: 50,
    head: [['Categoria', 'Valor']],
    body: resumo,
    theme: 'grid',
    headStyles: { fillColor: [239, 68, 68] },
  });

  // Custos Detalhados
  let currentY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('Custos Detalhados', 20, currentY);

  const custosData = dados.custos.map(custo => [
    custo.descricao,
    custo.categoria,
    `€${custo.valor.toFixed(2)}`,
    custo.fornecedor || '-',
    custo.data,
    custo.pago ? 'Pago' : 'Pendente',
  ]);

  doc.autoTable({
    startY: currentY + 5,
    head: [['Descrição', 'Categoria', 'Valor', 'Fornecedor', 'Data', 'Estado']],
    body: custosData,
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68] },
    styles: { fontSize: 8 },
  });

  // Rodapé
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleDateString('pt-PT')}`,
      20,
      doc.internal.pageSize.height - 10
    );
  }

  // Download
  doc.save(`relatorio-custos-${new Date().getTime()}.pdf`);
}
