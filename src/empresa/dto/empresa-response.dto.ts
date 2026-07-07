export interface EmpresaResponseDto {
  rut: string;
  razonSocial: string;
  giro: string;
  direccion?: string;
  comuna?: string;
  ciudad?: string;
  telefono?: string;
  correo?: string;
  activa: boolean;
  transferenciaHabilitada: boolean;
  transferenciaDestinoEmail?: string | null;
}
