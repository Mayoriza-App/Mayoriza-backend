import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Filter DTO for financial reports (Balance, F29).
 * empresaRut is REQUIRED for multi-tenant security.
 * The period (mes/anio) is optional; if omitted, it could aggregate all history,
 * but usually users filter by a specific year.
 */
export class ReporteFilterDto {
  @IsNotEmpty({ message: 'El RUT de la empresa es obligatorio' })
  @IsString({ message: 'El RUT de la empresa debe ser una cadena de texto' })
  empresaRut: string;

  @IsOptional()
  @IsInt({ message: 'El mes debe ser un número entero' })
  @Min(0, { message: 'El mes debe ser entre 0 y 12' })
  @Max(12, { message: 'El mes debe ser entre 1 y 12' })
  @Type(() => Number)
  mes?: number;

  @IsOptional()
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(2000, { message: 'El año debe ser mayor o igual a 2000' })
  @Type(() => Number)
  anio?: number;

  @IsOptional()
  @IsString({ message: 'La fecha de inicio debe ser una cadena' })
  fechaDesde?: string; // Formato YYYY-MM-DD

  @IsOptional()
  @IsString({ message: 'La fecha de fin debe ser una cadena' })
  fechaHasta?: string; // Formato YYYY-MM-DD
}
