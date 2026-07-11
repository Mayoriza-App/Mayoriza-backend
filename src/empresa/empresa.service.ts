import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CuentaContableService } from '../cuenta-contable/cuenta-contable.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { EmpresaResponseDto } from './dto/empresa-response.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { OpcionesPlanDto } from './dto/opciones-plan.dto';

@Injectable()
export class EmpresaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cuentaContableService: CuentaContableService,
  ) {}

  /**
   * Retrieves all companies belonging to a user.
   * @param userId The ID of the authenticated user
   * @returns Array of EmpresaResponseDto
   */
  async findAll(userId: string): Promise<EmpresaResponseDto[]> {
    const empresas = await this.prisma.empresa.findMany({
      where: { usuarioId: userId }
    });
    return empresas.map((empresa) => ({
      rut: empresa.rut,
      razonSocial: empresa.razonSocial,
      giro: empresa.giro,
      direccion: empresa.direccion || undefined,
      comuna: empresa.comuna || undefined,
      ciudad: empresa.ciudad || undefined,
      telefono: empresa.telefono || undefined,
      correo: empresa.correo || undefined,
      activa: empresa.activa,
      transferenciaHabilitada: empresa.transferenciaHabilitada,
      transferenciaDestinoEmail: empresa.transferenciaDestinoEmail,
    }));
  }

  /**
   * Retrieves available chart of accounts options (templates and user's companies).
   * @param userId The ID of the authenticated user
   */
  async getOpcionesPlan(userId: string): Promise<OpcionesPlanDto> {
    const plantillas = await this.prisma.planPlantilla.findMany({
      select: { id: true, nombre: true },
      orderBy: { id: 'asc' },
    });

    const empresas = await this.prisma.empresa.findMany({
      where: { usuarioId: userId },
      select: { rut: true, razonSocial: true },
      orderBy: { razonSocial: 'asc' },
    });

    return {
      plantillas,
      empresas,
    };
  }

  /**
   * Retrieves a specific company by its RUT, ensuring the user owns it.
   * @param userId The ID of the authenticated user
   * @param rut The RUT of the company
   * @returns EmpresaResponseDto
   * @throws NotFoundException if the company does not exist or doesn't belong to the user
   */
  async findOne(userId: string, rut: string): Promise<EmpresaResponseDto> {
    const empresa = await this.prisma.empresa.findFirst({
      where: { rut, usuarioId: userId },
    });

    if (!empresa) {
      throw new NotFoundException('La empresa no fue encontrada o no tienes permisos');
    }

    return {
      rut: empresa.rut,
      razonSocial: empresa.razonSocial,
      giro: empresa.giro,
      direccion: empresa.direccion || undefined,
      comuna: empresa.comuna || undefined,
      ciudad: empresa.ciudad || undefined,
      telefono: empresa.telefono || undefined,
      correo: empresa.correo || undefined,
      activa: empresa.activa,
      transferenciaHabilitada: empresa.transferenciaHabilitada,
      transferenciaDestinoEmail: empresa.transferenciaDestinoEmail,
    };
  }

  /**
   * Creates a new company and links it to the user.
   * @param userId The ID of the authenticated user
   * @param createEmpresaDto The data to create the company
   * @returns EmpresaResponseDto
   * @throws ConflictException if the RUT already exists
   */
  async create(
    userId: string,
    createEmpresaDto: CreateEmpresaDto,
  ): Promise<EmpresaResponseDto> {
    const existingEmpresa = await this.prisma.empresa.findUnique({
      where: { rut_usuarioId: { rut: createEmpresaDto.rut, usuarioId: userId } },
    });

    if (existingEmpresa) {
      throw new ConflictException(
        'Ya existe una empresa registrada con este RUT en tu cuenta',
      );
    }

    const nuevaEmpresa = await this.prisma.empresa.create({
      data: {
        rut: createEmpresaDto.rut,
        razonSocial: createEmpresaDto.razonSocial,
        giro: createEmpresaDto.giro,
        direccion: createEmpresaDto.direccion,
        comuna: createEmpresaDto.comuna,
        ciudad: createEmpresaDto.ciudad,
        telefono: createEmpresaDto.telefono,
        correo: createEmpresaDto.correo,
        usuarioId: userId,
      },
    });

    return {
      rut: nuevaEmpresa.rut,
      razonSocial: nuevaEmpresa.razonSocial,
      giro: nuevaEmpresa.giro,
      direccion: nuevaEmpresa.direccion || undefined,
      comuna: nuevaEmpresa.comuna || undefined,
      ciudad: nuevaEmpresa.ciudad || undefined,
      telefono: nuevaEmpresa.telefono || undefined,
      correo: nuevaEmpresa.correo || undefined,
      activa: nuevaEmpresa.activa,
      transferenciaHabilitada: nuevaEmpresa.transferenciaHabilitada,
      transferenciaDestinoEmail: nuevaEmpresa.transferenciaDestinoEmail,
    };
  }

  /**
   * Updates an existing company.
   * @param userId The ID of the authenticated user
   * @param rut The RUT of the company to update
   * @param updateEmpresaDto The updated data
   * @returns EmpresaResponseDto
   * @throws NotFoundException if the company does not exist
   */
  async update(
    userId: string,
    rut: string,
    updateEmpresaDto: UpdateEmpresaDto,
  ): Promise<EmpresaResponseDto> {
    await this.findOne(userId, rut); // Ensures the company exists and belongs to the user

    const empresaActualizada = await this.prisma.empresa.update({
      where: { rut_usuarioId: { rut, usuarioId: userId } },
      data: {
        razonSocial: updateEmpresaDto.razonSocial,
        giro: updateEmpresaDto.giro,
        direccion: updateEmpresaDto.direccion,
        comuna: updateEmpresaDto.comuna,
        ciudad: updateEmpresaDto.ciudad,
        telefono: updateEmpresaDto.telefono,
        correo: updateEmpresaDto.correo,
      },
    });

    return {
      rut: empresaActualizada.rut,
      razonSocial: empresaActualizada.razonSocial,
      giro: empresaActualizada.giro,
      direccion: empresaActualizada.direccion || undefined,
      comuna: empresaActualizada.comuna || undefined,
      ciudad: empresaActualizada.ciudad || undefined,
      telefono: empresaActualizada.telefono || undefined,
      correo: empresaActualizada.correo || undefined,
      activa: empresaActualizada.activa,
      transferenciaHabilitada: empresaActualizada.transferenciaHabilitada,
      transferenciaDestinoEmail: empresaActualizada.transferenciaDestinoEmail,
    };
  }

  /**
   * Deletes a company by its RUT.
   * @param userId The ID of the authenticated user
   * @param rut The RUT of the company
   * @throws NotFoundException if the company does not exist
   */
  async remove(userId: string, rut: string): Promise<void> {
    await this.findOne(userId, rut); // Ensures the company exists and belongs to the user

    await this.prisma.empresa.delete({
      where: { rut_usuarioId: { rut, usuarioId: userId } },
    });
  }

  /**
   * Habilita la transferencia de la empresa y especifica el correo destino.
   */
  async habilitarTransferencia(userId: string, rut: string, destinoEmail: string) {
    const empresa = await this.findOne(userId, rut);
    
    await this.prisma.empresa.update({
      where: { rut_usuarioId: { rut, usuarioId: userId } },
      data: {
        transferenciaHabilitada: true,
        transferenciaDestinoEmail: destinoEmail
      }
    });

    await this.prisma.historialTransferencia.create({
      data: {
        empresaRut: rut,
        razonSocialEmpresa: empresa.razonSocial,
        solicitanteId: userId,
        destinoEmail: destinoEmail,
        estado: 'PENDIENTE'
      }
    });

    return { message: 'Transferencia habilitada' };
  }

  /**
   * Cambia el estado de una empresa (activa/inactiva).
   */
  async cambiarEstado(userId: string, rut: string, activa: boolean) {
    await this.findOne(userId, rut); // Verifica propiedad

    const empresa = await this.prisma.empresa.update({
      where: { rut_usuarioId: { rut, usuarioId: userId } },
      data: { activa },
    });

    return { 
      message: `La empresa ha sido ${activa ? 'habilitada' : 'deshabilitada'}`,
      activa: empresa.activa 
    };
  }

}
