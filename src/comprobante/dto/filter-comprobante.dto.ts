import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO to filter the comprobante list.
 * empresaRut is REQUIRED — all queries must be scoped to a single company (multi-tenancy).
 * mes and anio are optional filters for periodic reporting (e.g., building a draft F29).
 */
export class FilterComprobanteDto {
  @IsNotEmpty({ message: 'El RUT de la empresa es obligatorio para filtrar comprobantes' })
  @IsString({ message: 'El RUT de la empresa debe ser una cadena de texto' })
  empresaRut: string;

  @IsOptional()
  @IsInt({ message: 'El mes debe ser un número entero' })
  @Min(1, { message: 'El mes debe ser entre 1 y 12' })
  @Max(12, { message: 'El mes debe ser entre 1 y 12' })
  @Type(() => Number)
  mes?: number;

  @IsOptional()
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(2000, { message: 'El año debe ser mayor o igual a 2000' })
  @Type(() => Number)
  anio?: number;
}
