/**
 * BFF-shaped response DTO for a CentroCosto resource.
 * The movimientos relation is intentionally omitted to keep responses lean.
 */
export interface CentroCostoResponseDto {
  id: number;
  nombre: string;
}
