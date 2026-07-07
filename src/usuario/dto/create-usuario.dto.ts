import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { RolUsuario } from 'generated/prisma';

export class CreateUsuarioDto {
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID v4 válido' })
  id: string;

  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  @MaxLength(255, {
    message: 'El correo electrónico no puede exceder los 255 caracteres',
  })
  email: string;

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres' })
  nombre: string;

  @IsEnum(RolUsuario, {
    message: 'El rol debe ser uno de los siguientes: ADMIN, CONTADOR, CLIENTE',
  })
  rol: RolUsuario;
}
