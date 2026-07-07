import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TipoCuenta } from 'generated/prisma';

export class UpdateCuentaContableDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsEnum(TipoCuenta, {
    message:
      'El tipo debe ser uno de los siguientes: ACTIVO, PASIVO, PATRIMONIO, RESULTADO_PERDIDA, RESULTADO_GANANCIA',
  })
  tipo?: TipoCuenta;
}
