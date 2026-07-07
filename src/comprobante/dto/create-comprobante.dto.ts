import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoComprobante } from '@prisma/client';

/**
 * DTO for a single accounting line (Movimiento) within a journal entry.
 * Each line debits or credits a CuentaContable.
 * Per sii-chile.md: BigInt amounts come in as plain numbers from the frontend (CLP, no decimals).
 */
export class CreateMovimientoDto {
  @IsNotEmpty({ message: 'El código de la cuenta contable es obligatorio' })
  @IsString({ message: 'El código de cuenta debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El código de cuenta no puede exceder los 20 caracteres' })
  cuentaCodigo: string;

  @IsOptional()
  @IsString({ message: 'El RUT del tercero debe ser una cadena de texto' })
  @MaxLength(12, { message: 'El RUT del tercero no puede exceder los 12 caracteres' })
  terceroRut?: string;

  @IsOptional()
  @IsInt({ message: 'El ID del centro de costo debe ser un número entero' })
  @IsPositive({ message: 'El ID del centro de costo debe ser un número positivo' })
  @Type(() => Number)
  centroCostoId?: number;

  @IsOptional()
  @IsInt({ message: 'El monto del debe debe ser un número entero (CLP sin decimales)' })
  @Min(0, { message: 'El monto del debe no puede ser negativo' })
  @Type(() => Number)
  debe?: number;

  @IsOptional()
  @IsInt({ message: 'El monto del haber debe ser un número entero (CLP sin decimales)' })
  @Min(0, { message: 'El monto del haber no puede ser negativo' })
  @Type(() => Number)
  haber?: number;

  @IsOptional()
  @IsString({ message: 'La glosa de línea debe ser una cadena de texto' })
  @MaxLength(255, { message: 'La glosa de línea no puede exceder los 255 caracteres' })
  glosaLinea?: string;

  /**
   * SII Document Type code. Refer to sii-chile.md [DTE_CODES_DICTIONARY].
   * 33=Factura, 34=Factura Exenta, 39=Boleta, 41=Boleta Exenta, 56=Nota Débito, 61=Nota Crédito.
   */
  @IsOptional()
  @IsInt({ message: 'El tipo de DTE SII debe ser un número entero' })
  @IsEnum([33, 34, 39, 41, 56, 61], {
    message:
      'El tipo de DTE SII debe ser uno de los siguientes: 33, 34, 39, 41, 56, 61',
  })
  @Type(() => Number)
  siiTipoDte?: number;

  @IsOptional()
  @IsInt({ message: 'El folio del documento SII debe ser un número entero' })
  @IsPositive({ message: 'El folio del documento SII debe ser un número positivo' })
  @Type(() => Number)
  siiFolioDoc?: number;
}

export class CierreEjercicioDto {
  @IsString()
  @IsNotEmpty()
  empresaRut: string;

  @IsInt()
  @Min(2000)
  anio: number;

  @IsString()
  @IsString()
  cuentaPatrimonioCodigo: string;

  @IsDateString()
  fechaCierre: string;
}

export class AperturaEjercicioDto {
  @IsNotEmpty()
  @IsString()
  empresaRut: string;

  @IsNotEmpty()
  @IsInt()
  @Min(2000)
  anioAAbrir: number; // El año en el que se generará el asiento (ej. 2026). Tomará saldos del anioAAbrir - 1.

  @IsDateString()
  fechaApertura: string;
}

export class CreateComprobanteDto {
  @IsNotEmpty({ message: 'El RUT de la empresa es obligatorio' })
  @IsString({ message: 'El RUT de la empresa debe ser una cadena de texto' })
  @MaxLength(12, { message: 'El RUT de la empresa no puede exceder los 12 caracteres' })
  empresaRut: string;

  @IsEnum(TipoComprobante, {
    message:
      'El tipo de comprobante debe ser uno de los siguientes: INGRESO, EGRESO, TRASPASO',
  })
  tipo: TipoComprobante;

  @IsNotEmpty({ message: 'La fecha del comprobante es obligatoria' })
  @IsString({ message: 'La fecha debe ser una cadena en formato ISO 8601 (YYYY-MM-DD)' })
  fecha: string;

  @IsNotEmpty({ message: 'La glosa general del comprobante es obligatoria' })
  @IsString({ message: 'La glosa general debe ser una cadena de texto' })
  glosaGeneral: string;

  @IsInt({ message: 'El período (mes) debe ser un número entero' })
  @Min(1, { message: 'El mes debe ser entre 1 y 12' })
  @Max(12, { message: 'El mes debe ser entre 1 y 12' })
  @Type(() => Number)
  periodoMes: number;

  @IsInt({ message: 'El período (año) debe ser un número entero' })
  @Min(2000, { message: 'El año debe ser mayor o igual a 2000' })
  @Type(() => Number)
  periodoAnio: number;

  @IsNotEmpty({ message: 'El comprobante debe tener al menos una línea de movimiento' })
  @ValidateNested({ each: true })
  @Type(() => CreateMovimientoDto)
  movimientos: CreateMovimientoDto[];
}
