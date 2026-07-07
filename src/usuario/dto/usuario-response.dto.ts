import { RolUsuario } from 'generated/prisma';

/**
 * BFF-shaped response DTO for a Usuario resource.
 * Never exposes raw database entities to the frontend.
 */
export interface UsuarioResponseDto {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
  activo: boolean;
}
