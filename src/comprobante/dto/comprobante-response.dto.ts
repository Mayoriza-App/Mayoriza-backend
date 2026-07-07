import { TipoComprobante } from 'generated/prisma';

/**
 * BFF-shaped response DTO for a single Movimiento (accounting line).
 * [BFF SERIALIZATION RULE] per sii-chile.md: debe, haber, and siiFolioDoc
 * are stored as BigInt in the DB. They are explicitly converted to Number
 * here to prevent JSON.stringify() serialization failures.
 */
export interface MovimientoResponseDto {
  id: number;
  cuentaCodigo: string;
  terceroRut: string | null;
  centroCostoId: number | null;
  /** Amount in CLP (Chilean Peso). Converted from BigInt → Number. */
  debe: number;
  /** Amount in CLP (Chilean Peso). Converted from BigInt → Number. */
  haber: number;
  glosaLinea: string | null;
  siiTipoDte: number | null;
  /** SII document folio. Converted from BigInt? → number | null. */
  siiFolioDoc: number | null;
}

/**
 * Full BFF-shaped response DTO for a Comprobante.
 * Embeds movimientos for a complete journal entry view.
 * fecha is serialized as an ISO 8601 string for frontend consumption.
 */
export interface ComprobanteResponseDto {
  id: number;
  empresaRut: string;
  tipo: TipoComprobante;
  fecha: string;
  glosaGeneral: string;
  periodoMes: number;
  periodoAnio: number;
  movimientos: MovimientoResponseDto[];
  /** Computed summary for UI display convenience */
  totales: {
    debe: number;
    haber: number;
    cuadrado: boolean;
  };
}

/**
 * Lean BFF-shaped response DTO for the comprobante list view.
 * Omits movimiento lines for performance; use findOne for the full entry.
 */
export interface ComprobanteListItemDto {
  id: number;
  empresaRut: string;
  tipo: TipoComprobante;
  fecha: string;
  glosaGeneral: string;
  periodoMes: number;
  periodoAnio: number;
  totalMovimientos: number;
}
