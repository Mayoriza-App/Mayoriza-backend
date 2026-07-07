import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateTerceroDto {
  @IsNotEmpty({ message: 'El RUT del tercero es obligatorio' })
  @IsString({ message: 'El RUT debe ser una cadena de texto' })
  @MaxLength(12, { message: 'El RUT no puede exceder los 12 caracteres' })
  @Matches(/^[0-9]+-[0-9kK]{1}$/, {
    message: 'El formato del RUT es inválido (Ej: 76000000-K)',
  })
  rut: string;

  @IsNotEmpty({ message: 'La razón social es obligatoria' })
  @IsString({ message: 'La razón social debe ser una cadena de texto' })
  @MaxLength(255, {
    message: 'La razón social no puede exceder los 255 caracteres',
  })
  razonSocial: string;

  @IsOptional()
  @IsString({ message: 'El giro debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El giro no puede exceder los 255 caracteres' })
  giro?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  comuna?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ciudad?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  correo?: string;
}
