import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

/**
 * DTO for assigning a user to a company (EmpresaUsuario join table).
 */
export class AssignEmpresaDto {
  @IsNotEmpty({ message: 'El RUT de la empresa es obligatorio' })
  @IsString({ message: 'El RUT debe ser una cadena de texto' })
  @MaxLength(12, { message: 'El RUT no puede exceder los 12 caracteres' })
  @Matches(/^[0-9]+-[0-9kK]{1}$/, {
    message: 'El formato del RUT es inválido (Ej: 76000000-K)',
  })
  empresaRut: string;

  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID v4 válido' })
  usuarioId: string;
}
