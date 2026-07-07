import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTerceroDto {
  @IsOptional()
  @IsString({ message: 'La razón social debe ser una cadena de texto' })
  @MaxLength(255, {
    message: 'La razón social no puede exceder los 255 caracteres',
  })
  razonSocial?: string;

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
