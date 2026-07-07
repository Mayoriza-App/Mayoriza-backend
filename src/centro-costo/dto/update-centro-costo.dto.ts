import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCentroCostoDto {
  @IsNotEmpty({ message: 'El nombre del centro de costo es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(255, {
    message: 'El nombre no puede exceder los 255 caracteres',
  })
  nombre: string;
}
