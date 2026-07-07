import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';

export class ClonarCuentasDto {
  @IsNotEmpty({ message: 'El RUT destino es obligatorio' })
  @IsString()
  empresaRut: string;

  @IsOptional()
  @IsInt()
  origenPlanId?: number;

  @IsOptional()
  @IsString()
  origenEmpresaRut?: string;
}
