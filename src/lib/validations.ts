/**
 * Utilitários de validação de formulários
 */

/**
 * Valida email
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida telemóvel português
 */
export function validarTelemovel(telemovel: string): boolean {
  // Remove espaços e caracteres especiais
  const cleaned = telemovel.replace(/[\s\-\(\)]/g, '');
  
  // Aceita formatos: +351XXXXXXXXX, 00351XXXXXXXXX, XXXXXXXXX
  const regex = /^(\+351|00351|351)?9[1236]\d{7}$/;
  return regex.test(cleaned);
}

/**
 * Valida NIF português
 */
export function validarNIF(nif: string): boolean {
  const cleaned = nif.replace(/\s/g, '');
  
  if (cleaned.length !== 9) return false;
  if (!/^\d+$/.test(cleaned)) return false;
  
  const checkDigit = parseInt(cleaned.charAt(8));
  let sum = 0;
  
  for (let i = 0; i < 8; i++) {
    sum += parseInt(cleaned.charAt(i)) * (9 - i);
  }
  
  const mod = sum % 11;
  const expectedCheckDigit = mod < 2 ? 0 : 11 - mod;
  
  return checkDigit === expectedCheckDigit;
}

/**
 * Valida número da ordem dos médicos dentistas
 */
export function validarNumeroOrdem(numero: string): boolean {
  const cleaned = numero.replace(/\s/g, '');
  return /^\d{4,6}$/.test(cleaned);
}

/**
 * Valida preço
 */
export function validarPreco(preco: string): boolean {
  const numero = parseFloat(preco);
  return !isNaN(numero) && numero >= 0;
}

/**
 * Valida duração em minutos
 */
export function validarDuracao(duracao: string): boolean {
  const numero = parseInt(duracao);
  return !isNaN(numero) && numero > 0 && numero <= 480; // Máximo 8 horas
}

/**
 * Formata telemóvel português
 */
export function formatarTelemovel(telemovel: string): string {
  const cleaned = telemovel.replace(/[\s\-\(\)]/g, '');
  
  if (cleaned.startsWith('+351')) {
    const numero = cleaned.substring(4);
    return `+351 ${numero.substring(0, 3)} ${numero.substring(3, 6)} ${numero.substring(6)}`;
  }
  
  if (cleaned.startsWith('00351')) {
    const numero = cleaned.substring(5);
    return `+351 ${numero.substring(0, 3)} ${numero.substring(3, 6)} ${numero.substring(6)}`;
  }
  
  if (cleaned.startsWith('351')) {
    const numero = cleaned.substring(3);
    return `+351 ${numero.substring(0, 3)} ${numero.substring(3, 6)} ${numero.substring(6)}`;
  }
  
  if (cleaned.length === 9) {
    return `+351 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  
  return telemovel;
}

/**
 * Formata NIF português
 */
export function formatarNIF(nif: string): string {
  const cleaned = nif.replace(/\s/g, '');
  
  if (cleaned.length === 9) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  
  return nif;
}

/**
 * Formata preço em euros
 */
export function formatarPreco(preco: string | number): string {
  const numero = typeof preco === 'string' ? parseFloat(preco) : preco;
  
  if (isNaN(numero)) return '€0,00';
  
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(numero);
}

/**
 * Mensagens de erro de validação
 */
export const MENSAGENS_ERRO = {
  EMAIL_INVALIDO: 'Email inválido',
  TELEMOVEL_INVALIDO: 'Telemóvel inválido. Use o formato: +351 912 345 678',
  NIF_INVALIDO: 'NIF inválido',
  NUMERO_ORDEM_INVALIDO: 'Número da ordem inválido',
  PRECO_INVALIDO: 'Preço inválido',
  DURACAO_INVALIDA: 'Duração inválida (1-480 minutos)',
  CAMPO_OBRIGATORIO: 'Este campo é obrigatório',
  NOME_CURTO: 'Nome deve ter pelo menos 2 caracteres',
};
