import { IsEnum, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { TipoCuenta } from '@prisma/client';

export class CreateCuentaContableDto {
  @IsNotEmpty({ message: 'El RUT de la empresa es obligatorio' })
  @IsString()
  empresaRut: string;

  @IsNotEmpty({ message: 'El código de la cuenta es obligatorio' })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El código no puede exceder los 20 caracteres' })
  @Matches(/^\d+(\.\d+)*$/, {
    message:
      'El formato del código es inválido. Debe ser numérico y jerárquico (Ej: 1.1.01.01)',
  })
  codigo: string;

  @IsNotEmpty({ message: 'El nombre de la cuenta es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres' })
  nombre: string;

  @IsEnum(TipoCuenta, {
    message:
      'El tipo debe ser uno de los siguientes: ACTIVO, PASIVO, PATRIMONIO, RESULTADO_PERDIDA, RESULTADO_GANANCIA',
  })
  tipo: TipoCuenta;
}
