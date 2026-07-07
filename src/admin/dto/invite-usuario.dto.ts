import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class InviteUsuarioDto {
  @IsEmail({}, { message: 'El correo debe ser válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email: string;

  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString({ message: 'El RUT de la empresa debe ser texto' })
  @IsOptional()
  rutEmpresa?: string;
}
