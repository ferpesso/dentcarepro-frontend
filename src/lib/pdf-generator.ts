import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface FaturaData {
  fatura: {
    numeroFatura: string;
    dataFatura: Date | string;
    dataVencimento?: Date | string | null;
    subtotal: string;
    valorIVA: string;
    percentagemIVA: string;
    valorDesconto: string;
    valorTotal: string;
    valorPago: string;
    estado: string;
    observacoes?: string | null;
  };
  utente: {
    nome: string;
    email?: string | null;
    telemovel?: string | null;
    morada?: string | null;
    cidade?: string | null;
    codigoPostal?: string | null;
    nif?: string | null;
  };
  itens: Array<{
    descricao: string;
    quantidade: number;
    precoUnitario: string;
    precoTotal: string;
  }>;
  pagamentos?: Array<{
    dataPagamento: Date | string;
    metodoPagamento: string;
    valor: string;
    referencia?: string | null;
  }>;
}

interface ClinicaData {
  nome: string;
  email?: string | null;
  telemovel?: string | null;
  morada?: string | null;
  cidade?: string | null;
  codigoPostal?: string | null;
  nif?: string | null;
}

/**
 * Formatar moeda para EUR
 */
function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(num);
}

/**
 * Formatar data para formato português
 */
function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("pt-PT");
}

/**
 * Gerar PDF da fatura
 */
export function gerarPDFFatura(faturaData: FaturaData, clinicaData: ClinicaData) {
  const doc = new jsPDF();
  
  // Configurações
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // ============================================
  // CABEÇALHO - DADOS DA CLÍNICA
  // ============================================
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(clinicaData.nome, margin, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  if (clinicaData.morada) {
    doc.text(clinicaData.morada, margin, yPos);
    yPos += 5;
  }
  
  if (clinicaData.codigoPostal || clinicaData.cidade) {
    const localizacao = [clinicaData.codigoPostal, clinicaData.cidade]
      .filter(Boolean)
      .join(" ");
    doc.text(localizacao, margin, yPos);
    yPos += 5;
  }
  
  if (clinicaData.telemovel) {
    doc.text(`Tel: ${clinicaData.telemovel}`, margin, yPos);
    yPos += 5;
  }
  
  if (clinicaData.email) {
    doc.text(`Email: ${clinicaData.email}`, margin, yPos);
    yPos += 5;
  }
  
  if (clinicaData.nif) {
    doc.text(`NIF: ${clinicaData.nif}`, margin, yPos);
    yPos += 5;
  }

  // ============================================
  // TÍTULO DA FATURA
  // ============================================
  yPos += 10;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("FATURA", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 8;
  doc.setFontSize(12);
  doc.text(faturaData.fatura.numeroFatura, pageWidth / 2, yPos, { align: "center" });

  // ============================================
  // INFORMAÇÕES DA FATURA E UTENTE
  // ============================================
  yPos += 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Dados da Fatura:", margin, yPos);
  doc.text("Dados do Utente:", pageWidth / 2 + 10, yPos);
  
  yPos += 6;
  doc.setFont("helvetica", "normal");
  
  // Coluna esquerda - Dados da fatura
  const leftCol = margin;
  let leftYPos = yPos;
  
  doc.text(`Data de Emissão: ${formatDate(faturaData.fatura.dataFatura)}`, leftCol, leftYPos);
  leftYPos += 5;
  
  if (faturaData.fatura.dataVencimento) {
    doc.text(`Data de Vencimento: ${formatDate(faturaData.fatura.dataVencimento)}`, leftCol, leftYPos);
    leftYPos += 5;
  }
  
  doc.text(`Estado: ${faturaData.fatura.estado.toUpperCase()}`, leftCol, leftYPos);
  leftYPos += 5;
  
  // Coluna direita - Dados do utente
  const rightCol = pageWidth / 2 + 10;
  let rightYPos = yPos;
  
  doc.text(faturaData.utente.nome, rightCol, rightYPos);
  rightYPos += 5;
  
  if (faturaData.utente.morada) {
    doc.text(faturaData.utente.morada, rightCol, rightYPos);
    rightYPos += 5;
  }
  
  if (faturaData.utente.codigoPostal || faturaData.utente.cidade) {
    const localizacao = [faturaData.utente.codigoPostal, faturaData.utente.cidade]
      .filter(Boolean)
      .join(" ");
    doc.text(localizacao, rightCol, rightYPos);
    rightYPos += 5;
  }
  
  if (faturaData.utente.telemovel) {
    doc.text(`Tel: ${faturaData.utente.telemovel}`, rightCol, rightYPos);
    rightYPos += 5;
  }
  
  if (faturaData.utente.email) {
    doc.text(`Email: ${faturaData.utente.email}`, rightCol, rightYPos);
    rightYPos += 5;
  }
  
  if (faturaData.utente.nif) {
    doc.text(`NIF: ${faturaData.utente.nif}`, rightCol, rightYPos);
    rightYPos += 5;
  }

  // Atualizar yPos para a maior das duas colunas
  yPos = Math.max(leftYPos, rightYPos) + 10;

  // ============================================
  // TABELA DE ITENS
  // ============================================
  const tableData = faturaData.itens.map(item => [
    item.descricao,
    item.quantidade.toString(),
    formatCurrency(item.precoUnitario),
    formatCurrency(item.precoTotal),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Descrição", "Qtd", "Preço Unit.", "Total"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246], // Azul
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "right", cellWidth: 35 },
      3: { halign: "right", cellWidth: 35 },
    },
    margin: { left: margin, right: margin },
  });

  // Obter posição Y após a tabela
  yPos = (doc as any).lastAutoTable.finalY + 10;

  // ============================================
  // TOTAIS
  // ============================================
  const totaisX = pageWidth - margin - 60;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Subtotal
  doc.text("Subtotal:", totaisX, yPos);
  doc.text(formatCurrency(faturaData.fatura.subtotal), pageWidth - margin, yPos, { align: "right" });
  yPos += 6;
  
  // Desconto (se houver)
  if (parseFloat(faturaData.fatura.valorDesconto) > 0) {
    doc.setTextColor(0, 128, 0); // Verde
    doc.text("Desconto:", totaisX, yPos);
    doc.text(`-${formatCurrency(faturaData.fatura.valorDesconto)}`, pageWidth - margin, yPos, { align: "right" });
    doc.setTextColor(0, 0, 0); // Voltar ao preto
    yPos += 6;
  }
  
  // IVA (se houver)
  if (parseFloat(faturaData.fatura.valorIVA) > 0) {
    doc.text(`IVA (${faturaData.fatura.percentagemIVA}%):`, totaisX, yPos);
    doc.text(formatCurrency(faturaData.fatura.valorIVA), pageWidth - margin, yPos, { align: "right" });
    yPos += 6;
  }
  
  // Linha separadora
  doc.setLineWidth(0.5);
  doc.line(totaisX, yPos, pageWidth - margin, yPos);
  yPos += 8;
  
  // Total
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", totaisX, yPos);
  doc.text(formatCurrency(faturaData.fatura.valorTotal), pageWidth - margin, yPos, { align: "right" });
  yPos += 8;
  
  // Valor Pago
  doc.setFontSize(10);
  doc.setTextColor(0, 128, 0); // Verde
  doc.text("Pago:", totaisX, yPos);
  doc.text(formatCurrency(faturaData.fatura.valorPago), pageWidth - margin, yPos, { align: "right" });
  yPos += 6;
  
  // Saldo Pendente
  const saldoPendente = parseFloat(faturaData.fatura.valorTotal) - parseFloat(faturaData.fatura.valorPago);
  if (saldoPendente > 0) {
    doc.setTextColor(255, 0, 0); // Vermelho
    doc.text("Saldo Pendente:", totaisX, yPos);
    doc.text(formatCurrency(saldoPendente), pageWidth - margin, yPos, { align: "right" });
  }
  
  doc.setTextColor(0, 0, 0); // Voltar ao preto
  doc.setFont("helvetica", "normal");

  // ============================================
  // HISTÓRICO DE PAGAMENTOS (se houver)
  // ============================================
  if (faturaData.pagamentos && faturaData.pagamentos.length > 0) {
    yPos += 15;
    
    // Verificar se há espaço na página
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Histórico de Pagamentos", margin, yPos);
    yPos += 8;
    
    const pagamentosData = faturaData.pagamentos.map(pag => [
      formatDate(pag.dataPagamento),
      pag.metodoPagamento.charAt(0).toUpperCase() + pag.metodoPagamento.slice(1),
      pag.referencia || "-",
      formatCurrency(pag.valor),
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Data", "Método", "Referência", "Valor"]],
      body: pagamentosData,
      theme: "striped",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 50 },
        3: { halign: "right", cellWidth: 30 },
      },
      margin: { left: margin, right: margin },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // ============================================
  // OBSERVAÇÕES (se houver)
  // ============================================
  if (faturaData.fatura.observacoes) {
    yPos += 10;
    
    // Verificar se há espaço na página
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Observações:", margin, yPos);
    yPos += 6;
    
    doc.setFont("helvetica", "normal");
    const observacoesLines = doc.splitTextToSize(
      faturaData.fatura.observacoes,
      pageWidth - 2 * margin
    );
    doc.text(observacoesLines, margin, yPos);
  }

  // ============================================
  // RODAPÉ
  // ============================================
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Documento gerado em ${formatDate(new Date())}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  // Retornar o documento
  return doc;
}

/**
 * Descarregar PDF da fatura
 */
export function descarregarPDFFatura(faturaData: FaturaData, clinicaData: ClinicaData) {
  const doc = gerarPDFFatura(faturaData, clinicaData);
  const nomeArquivo = `${faturaData.fatura.numeroFatura.replace(/\//g, "-")}.pdf`;
  doc.save(nomeArquivo);
}

/**
 * Imprimir PDF da fatura
 */
export function imprimirPDFFatura(faturaData: FaturaData, clinicaData: ClinicaData) {
  const doc = gerarPDFFatura(faturaData, clinicaData);
  doc.autoPrint();
  window.open(doc.output("bloburl"), "_blank");
}
