import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsEnum(RolUsuario, {
    message: 'El rol debe ser uno de los siguientes: ADMIN, CONTADOR, CLIENTE',
  })
  rol?: RolUsuario;
}
