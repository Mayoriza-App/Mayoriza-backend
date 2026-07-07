import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CuentaContableResponseDto } from './dto/cuenta-contable-response.dto';
import { CreateCuentaContableDto } from './dto/create-cuenta-contable.dto';
import { UpdateCuentaContableDto } from './dto/update-cuenta-contable.dto';
import { TipoCuenta } from '@prisma/client';

@Injectable()
export class CuentaContableService {
  private readonly logger = new Logger(CuentaContableService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all accounts for a specific company, optionally filtered by type.
   */
  async findAll(userId: string, empresaRut: string, tipo?: TipoCuenta): Promise<CuentaContableResponseDto[]> {
    const cuentas = await this.prisma.cuentaEmpresa.findMany({
      where: { empresa: { rut: empresaRut, usuarioId: userId }, ...(tipo ? { tipo } : {}) },
      orderBy: { codigo: 'asc' },
    });
    return cuentas.map((c) => this.toResponseDto(c));
  }

  /**
   * Retrieves a single account by its hierarchical code within a company.
   */
  async findOne(userId: string, empresaRut: string, codigo: string): Promise<CuentaContableResponseDto> {
    const cuenta = await this.prisma.cuentaEmpresa.findFirst({
      where: { empresa: { rut: empresaRut, usuarioId: userId }, codigo },
    });

    if (!cuenta) {
      throw new NotFoundException(`La cuenta contable con código "${codigo}" no fue encontrada para la empresa`);
    }

    return this.toResponseDto(cuenta);
  }

  /**
   * Creates a new account in the company's chart of accounts.
   */
  async create(userId: string, createCuentaContableDto: CreateCuentaContableDto): Promise<CuentaContableResponseDto> {
    const { empresaRut, codigo, nombre, tipo } = createCuentaContableDto;
    const empresa = await this.prisma.empresa.findUnique({ where: { rut_usuarioId: { rut: empresaRut, usuarioId: userId } } });
    if (!empresa) throw new BadRequestException('Empresa no encontrada');

    const existing = await this.prisma.cuentaEmpresa.findUnique({
      where: { empresaId_codigo: { empresaId: empresa.id, codigo } },
    });

    if (existing) {
      throw new ConflictException(`Ya existe una cuenta contable con el código "${codigo}" en esta empresa`);
    }

    const nuevaCuenta = await this.prisma.cuentaEmpresa.create({
      data: { empresaId: empresa.id, codigo, nombre, tipo },
    });

    this.logger.log(`New account created: [${nuevaCuenta.tipo}] ${nuevaCuenta.codigo} for company ${empresaRut}`);
    return this.toResponseDto(nuevaCuenta);
  }

  /**
   * Updates an account's name or type. The code is immutable.
   */
  async update(userId: string, empresaRut: string, codigo: string, updateCuentaContableDto: UpdateCuentaContableDto): Promise<CuentaContableResponseDto> {
    await this.findOne(userId, empresaRut, codigo);

    const empresa = await this.prisma.empresa.findUnique({ where: { rut_usuarioId: { rut: empresaRut, usuarioId: userId } } });
    if (!empresa) throw new BadRequestException('Empresa no encontrada');

    const cuentaActualizada = await this.prisma.cuentaEmpresa.update({
      where: { empresaId_codigo: { empresaId: empresa.id, codigo } },
      data: {
        nombre: updateCuentaContableDto.nombre,
        tipo: updateCuentaContableDto.tipo,
      },
    });

    return this.toResponseDto(cuentaActualizada);
  }

  /**
   * Deletes an account from the company's chart of accounts.
   */
  async remove(userId: string, empresaRut: string, codigo: string): Promise<void> {
    await this.findOne(userId, empresaRut, codigo);

    try {
      const empresa = await this.prisma.empresa.findUnique({ where: { rut_usuarioId: { rut: empresaRut, usuarioId: userId } } });
      if (!empresa) throw new BadRequestException('Empresa no encontrada');
      await this.prisma.cuentaEmpresa.delete({ where: { empresaId_codigo: { empresaId: empresa.id, codigo } } });
      this.logger.log(`Account ${codigo} deleted for company ${empresaRut}`);
    } catch (error: any) {
      this.logger.error(`Error deleting account ${codigo}: ${error.message || error}`, error.stack);
      if (error.code === 'P2003') {
        throw new BadRequestException(`No se puede eliminar la cuenta ${codigo} porque tiene movimientos contables asociados.`);
      }
      throw new BadRequestException(`No se pudo eliminar la cuenta ${codigo}. Verifica que no esté en uso.`);
    }
  }

  /**
   * Clones accounts from either a system template or another company.
   */
  async clonarCuentas(userId: string, empresaRut: string, origenPlanId?: number, origenEmpresaRut?: string): Promise<void> {
    const destEmpresa = await this.prisma.empresa.findUnique({ where: { rut_usuarioId: { rut: empresaRut, usuarioId: userId } } });
    if (!destEmpresa) throw new BadRequestException('Empresa destino no encontrada');
    let accountsToClone: any[] = [];

    if (origenPlanId) {
      accountsToClone = await this.prisma.cuentaPlantilla.findMany({
        where: { planPlantillaId: origenPlanId, activa: true },
      });
    } else if (origenEmpresaRut) {
      accountsToClone = await this.prisma.cuentaEmpresa.findMany({
        where: { empresa: { rut: origenEmpresaRut, usuarioId: userId } },
      });
    } else {
      throw new BadRequestException('Se debe proveer un origenPlanId o un origenEmpresaRut para clonar cuentas.');
    }

    if (accountsToClone.length === 0) {
      this.logger.warn('No accounts found to clone for the specified origin.');
      return;
    }

    const dataToInsert = accountsToClone.map(c => ({
      empresaId: destEmpresa.id,
      codigo: c.codigo,
      nombre: c.nombre,
      tipo: c.tipo,
    }));

    await this.prisma.cuentaEmpresa.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });

    this.logger.log(`Cloned ${accountsToClone.length} accounts for company ${empresaRut}`);
  }

  /**
   * Retrieves the accounts from a template.
   */
  async getPlantillaCuentas(planPlantillaId: number): Promise<CuentaContableResponseDto[]> {
    const cuentas = await this.prisma.cuentaPlantilla.findMany({
      where: { planPlantillaId, activa: true },
      orderBy: { codigo: 'asc' },
    });
    return cuentas.map(c => this.toResponseDto(c));
  }

  /**
   * Maps a Prisma CuentaContable entity to a BFF-friendly CuentaContableResponseDto.
   * Centralizes mapping logic following the DRY principle.
   * @param cuenta The raw Prisma entity
   * @returns CuentaContableResponseDto
   */
  private toResponseDto(cuenta: {
    codigo: string;
    nombre: string;
    tipo: TipoCuenta;
  }): CuentaContableResponseDto {
    return {
      codigo: cuenta.codigo,
      nombre: cuenta.nombre,
      tipo: cuenta.tipo,
    };
  }
}
