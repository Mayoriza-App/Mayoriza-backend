import { TipoCuenta } from '@prisma/client';

export interface CuentaBalanceDto {
  cuentaCodigo: string;
  cuentaNombre: string;
  tipo: TipoCuenta;
  /** Sum of all debe movements. BigInt converted to Number. */
  totalDebe: number;
  /** Sum of all haber movements. BigInt converted to Number. */
  totalHaber: number;

  saldoDeudor: number;
  saldoAcreedor: number;
  activo: number;
  pasivo: number;
  perdida: number;
  ganancia: number;
}

export interface BalanceResponseDto {
  empresaRut: string;
  periodoAnio?: number;
  periodoMes?: number;
  cuentas: CuentaBalanceDto[];
  totales: {
    debe: number;
    haber: number;
    saldoDeudor: number;
    saldoAcreedor: number;
    activos: number;
    pasivos: number;
    resultadoPerdida: number;
    resultadoGanancia: number;
    utilidadDelEjercicio: number;
  };
}

export interface BorradorF29ResponseDto {
  empresaRut: string;
  periodoAnio?: number;
  periodoMes?: number;
  /** Aggregation of IVA Debito Fiscal (sales) */
  totalIvaDebito: number;
  /** Aggregation of IVA Credito Fiscal (purchases) */
  totalIvaCredito: number;
  /** Aggregation of Honorarios retentions */
  totalRetencionHonorarios: number;
  /** Iva a pagar (Debito - Credito) */
  ivaAPagar: number;
}

export interface LibroMayorLineaDto {
  fecha: string;
  comprobanteId: number;
  comprobanteTipo: string;
  glosaLinea: string | null;
  debe: number;
  haber: number;
  saldoAcumulado: number;
  terceroRut?: string;
  terceroRazonSocial?: string;
  centroCostoNombre?: string;
}

export interface LibroMayorResponseDto {
  empresaRut: string;
  cuentaCodigo: string;
  cuentaNombre: string;
  lineas: LibroMayorLineaDto[];
  totalDebe: number;
  totalHaber: number;
  saldoFinal: number;
}

export interface CuentaConMovimientosDto {
  cuentaCodigo: string;
  cuentaNombre: string;
  lineas: LibroMayorLineaDto[];
  totalDebe: number;
  totalHaber: number;
  saldoFinal: number;
  saldoInicial?: number;
  esDeudor: boolean;
}

export interface LibroMayorCompletoResponseDto {
  empresaRut: string;
  periodoAnio?: number;
  periodoMes?: number;
  cuentas: CuentaConMovimientosDto[];
}

export interface EvolucionMesDto {
  mes: number;
  anio: number;
  ingresos: number;
  egresos: number;
  utilidad: number;
}

export interface EvolucionResultadosDto {
  empresaRut: string;
  meses: EvolucionMesDto[];
}

export interface LibroDiarioLineaDto {
  dia: string;
  tipo: string; // 'ING', 'EGR', 'TRA'
  comprobante: string; // '000001'
  secuencia: string; // '01'
  glosa: string;
  debe: number;
  haber: number;
  cuenta: string; // '110101 CAJA'
}

export interface LibroDiarioResponseDto {
  empresaRut: string;
  periodoAnio: number;
  periodoMes: number;
  lineas: LibroDiarioLineaDto[];
  totalesMes: {
    debe: number;
    haber: number;
  };
  acumulacionesAnteriores: {
    debe: number;
    haber: number;
  };
  totalesPeriodo: {
    debe: number;
    haber: number;
  };
}
