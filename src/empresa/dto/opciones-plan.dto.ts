export class OpcionesPlanDto {
  plantillas: { id: number; nombre: string }[];
  empresas: { rut: string; razonSocial: string }[];
}
