import { TipoCuenta } from '@prisma/client';

/**
 * BFF-shaped response DTO for a CuentaContable resource.
 * Maps the internal accounting account to a frontend-friendly shape.
 */
export interface CuentaContableResponseDto {
  codigo: string;
  nombre: string;
  tipo: TipoCuenta;
}
