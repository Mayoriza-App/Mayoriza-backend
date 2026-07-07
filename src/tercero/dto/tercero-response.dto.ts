/**
 * BFF-shaped response DTO for a Tercero resource (client or vendor).
 * The movimientos relation is intentionally omitted to keep the response lean.
 */
export interface TerceroResponseDto {
  rut: string;
  razonSocial: string;
  giro: string | null;
  direccion?: string | null;
  comuna?: string | null;
  ciudad?: string | null;
  telefono?: string | null;
  correo?: string | null;
}
