import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ComprobanteListItemDto,
  ComprobanteResponseDto,
  MovimientoResponseDto,
} from './dto/comprobante-response.dto';
import { CreateComprobanteDto, CreateMovimientoDto } from './dto/create-comprobante.dto';
import { FilterComprobanteDto } from './dto/filter-comprobante.dto';
import { Movimiento, TipoComprobante } from 'generated/prisma';

@Injectable()
export class ComprobanteService {
  private readonly logger = new Logger(ComprobanteService.name);

  constructor(private readonly prisma: PrismaService) {}




  /**
   * Lists comprobantes scoped to a company, with optional period filters.
   * Per sii-chile.md [DATABASE_MAPPING_RULES]: Every query MUST be scoped by empresaRut.
   * @param filter Contains required empresaRut and optional mes/anio period filters
   * @returns Array of ComprobanteResponseDto (incluye totales)
   */
  async findAll(userId: string, filter: FilterComprobanteDto): Promise<ComprobanteResponseDto[]> {
    const comprobantes = await this.prisma.comprobante.findMany({
      where: {
        empresa: { rut: filter.empresaRut, usuarioId: userId },
        ...(filter.mes !== undefined && { periodoMes: filter.mes }),
        ...(filter.anio !== undefined && { periodoAnio: filter.anio }),
      },
      include: { movimientos: true, empresa: true },
      orderBy: [{ periodoAnio: 'desc' }, { periodoMes: 'desc' }, { fecha: 'desc' }],
    });

    return comprobantes.map((c) => this.toComprobanteResponseDto(c as any));
  }

  /**
   * Retrieves a single comprobante with all its movimiento lines.
   * Includes computed totals (debe, haber, cuadrado) for UI display.
   * @param id The integer ID of the comprobante
   * @returns ComprobanteResponseDto with embedded movimientos and computed totals
   * @throws NotFoundException if the comprobante does not exist
   */
  async findOne(userId: string, id: number): Promise<ComprobanteResponseDto> {
    const comprobante = await this.prisma.comprobante.findUnique({
      where: { id, empresa: { usuarioId: userId } },
      include: { movimientos: true, empresa: true },
    });

    if (!comprobante) {
      throw new NotFoundException(
        `El comprobante con ID "${id}" no fue encontrado`,
      );
    }

    return this.toComprobanteResponseDto(comprobante as any);
  }




  /**
   * Creates a new journal entry (asiento de diario) along with all its movimiento lines.
   *
   * This method enforces two critical pre-conditions before touching the database:
   * 1. The movimientos array must have at least 2 lines (double-entry requires it).
   * 2. Double-entry rule: sum(debe) MUST equal sum(haber) across all lines.
   *    Per sii-chile.md [DATABASE_MAPPING_RULES #2]: This is CRITICAL and non-negotiable.
   *
   * The entire operation is wrapped in a Prisma transaction to guarantee atomicity:
   * either the comprobante AND all movimientos are saved, or nothing is saved.
   *
   * @param createComprobanteDto The full journal entry payload including movimientos
   * @returns ComprobanteResponseDto with the created entry and embedded lines
   * @throws BadRequestException if double-entry rule is violated or movimientos < 2
   * @throws NotFoundException if empresaRut does not exist in the system
   */
  async create(
    userId: string,
    createComprobanteDto: CreateComprobanteDto,
  ): Promise<ComprobanteResponseDto> {
    const { movimientos, empresaRut, ...headerData } = createComprobanteDto;

    if (!movimientos || movimientos.length < 2) {
      throw new BadRequestException(
        'El comprobante debe tener al menos 2 líneas de movimiento (partida doble)',
      );
    }

    this.validateDoubleEntry(movimientos);

    const empresa = await this.prisma.empresa.findUnique({ where: { rut_usuarioId: { rut: empresaRut, usuarioId: userId } } });
    if (!empresa) {
      throw new NotFoundException(
        `La empresa con RUT "${empresaRut}" no fue encontrada`,
      );
    }

    const nuevoComprobante = await this.prisma.$transaction(async (tx) => {

      const cuentasCodigos = [...new Set(movimientos.map(m => m.cuentaCodigo))];
      const cuentas = await tx.cuentaEmpresa.findMany({
        where: { empresaId: empresa.id, codigo: { in: cuentasCodigos } }
      });
      const cuentaMap = new Map(cuentas.map(c => [c.codigo, c.id]));

      for (const codigo of cuentasCodigos) {
        if (!cuentaMap.has(codigo)) {
          throw new BadRequestException(`La cuenta contable ${codigo} no existe en la empresa ${empresaRut}`);
        }
      }

      const comprobante = await tx.comprobante.create({
        data: {
          empresaId: empresa.id,
          tipo: headerData.tipo,
          fecha: new Date(headerData.fecha),
          glosaGeneral: headerData.glosaGeneral,
          periodoMes: headerData.periodoMes,
          periodoAnio: headerData.periodoAnio,
          movimientos: {
            createMany: {
              data: movimientos.map((m) => ({
                cuentaCodigo: m.cuentaCodigo,
                cuentaEmpresaId: cuentaMap.get(m.cuentaCodigo)!,
                terceroRut: m.terceroRut ?? null,
                centroCostoId: m.centroCostoId ?? null,
                debe: BigInt(m.debe ?? 0),
                haber: BigInt(m.haber ?? 0),
                glosaLinea: m.glosaLinea ?? null,
                siiTipoDte: m.siiTipoDte ?? null,
                siiFolioDoc: m.siiFolioDoc ? BigInt(m.siiFolioDoc) : null,
              })),
            },
          },
        },
        include: { movimientos: true },
      });

      return comprobante;
    });

    this.logger.log(
      `Comprobante ID=${nuevoComprobante.id} [${nuevoComprobante.tipo}] created for empresa ${empresaRut}`,
    );

    return this.toComprobanteResponseDto(nuevoComprobante as any);
  }

  /**
   * Updates an existing journal entry.
   * Deletes old movimientos and creates new ones in a transaction.
   */
  async update(userId: string, id: number, updateDto: CreateComprobanteDto): Promise<ComprobanteResponseDto> {
    const { movimientos, empresaRut, ...headerData } = updateDto;

    if (!movimientos || movimientos.length < 2) {
      throw new BadRequestException('El comprobante debe tener al menos 2 líneas de movimiento (partida doble)');
    }
    this.validateDoubleEntry(movimientos);

    const comprobanteExistente = await this.prisma.comprobante.findUnique({ where: { id }, include: { empresa: true } });
    if (comprobanteExistente && comprobanteExistente.empresa.usuarioId !== userId) {
      throw new NotFoundException(`El comprobante con ID "${id}" no fue encontrado`);
    }
    if (!comprobanteExistente) {
      throw new NotFoundException(`El comprobante con ID "${id}" no fue encontrado`);
    }

    if (comprobanteExistente.empresa.rut !== empresaRut) {
      throw new BadRequestException('No se puede cambiar la empresa de un comprobante existente');
    }

    const comprobanteActualizado = await this.prisma.$transaction(async (tx) => {

      const cuentasCodigos = [...new Set(movimientos.map(m => m.cuentaCodigo))];
      const cuentas = await tx.cuentaEmpresa.findMany({
        where: { empresaId: comprobanteExistente.empresaId, codigo: { in: cuentasCodigos } }
      });
      const cuentaMap = new Map(cuentas.map(c => [c.codigo, c.id]));

      for (const codigo of cuentasCodigos) {
        if (!cuentaMap.has(codigo)) {
          throw new BadRequestException(`La cuenta contable ${codigo} no existe en la empresa ${empresaRut}`);
        }
      }

      await tx.movimiento.deleteMany({ where: { comprobanteId: id } });

      return tx.comprobante.update({
        where: { id },
        data: {
          tipo: headerData.tipo,
          fecha: new Date(headerData.fecha),
          glosaGeneral: headerData.glosaGeneral,
          periodoMes: headerData.periodoMes,
          periodoAnio: headerData.periodoAnio,
          movimientos: {
            createMany: {
              data: movimientos.map((m) => ({
                cuentaCodigo: m.cuentaCodigo,
                cuentaEmpresaId: cuentaMap.get(m.cuentaCodigo)!,
                terceroRut: m.terceroRut ?? null,
                centroCostoId: m.centroCostoId ?? null,
                debe: BigInt(m.debe ?? 0),
                haber: BigInt(m.haber ?? 0),
                glosaLinea: m.glosaLinea ?? null,
                siiTipoDte: m.siiTipoDte ?? null,
                siiFolioDoc: m.siiFolioDoc ? BigInt(m.siiFolioDoc) : null,
              })),
            },
          },
        },
        include: { movimientos: true },
      });
    });

    this.logger.log(`Comprobante ID=${id} updated for empresa ${empresaRut}`);
    return this.toComprobanteResponseDto(comprobanteActualizado as any);
  }

  /**
   * Genera el Asiento de Cierre Comercial (Refundición de Resultados).
   * Toma todas las cuentas de pérdida y ganancia que tuvieron movimiento en el año,
   * las deja a cero y abona/carga la diferencia en la cuenta de Patrimonio dada.
   */
  async generarAsientoCierre(
    userId: string,
    dto: import('./dto/create-comprobante.dto').CierreEjercicioDto,
  ): Promise<ComprobanteResponseDto> {
    const { empresaRut, anio, cuentaPatrimonioCodigo, fechaCierre } = dto;
    const empresa = await this.prisma.empresa.findUnique({ where: { rut_usuarioId: { rut: empresaRut, usuarioId: userId } } });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');

    const cuentaPatrimonio = await this.prisma.cuentaEmpresa.findUnique({
      where: { empresaId_codigo: { empresaId: empresa.id, codigo: cuentaPatrimonioCodigo } },
    });
    if (!cuentaPatrimonio || cuentaPatrimonio.tipo !== 'PATRIMONIO') {
      throw new BadRequestException('La cuenta de destino debe ser de tipo PATRIMONIO');
    }

    const movimientos = await this.prisma.movimiento.findMany({
      where: {
        comprobante: {
            empresa: { rut: empresaRut, usuarioId: userId },
          periodoAnio: anio,
        },
        cuenta: {
          tipo: { in: ['RESULTADO_PERDIDA', 'RESULTADO_GANANCIA'] },
        },
      },
      include: { cuenta: true },
    });

    if (movimientos.length === 0) {
      throw new BadRequestException('No hay movimientos de resultados para cerrar en este año');
    }

    const saldos = new Map<string, { debe: number; haber: number; tipo: string }>();
    for (const mov of movimientos) {
      const code = mov.cuentaCodigo;
      if (!saldos.has(code)) {
        saldos.set(code, { debe: 0, haber: 0, tipo: (mov as any).cuenta.tipo });
      }
      const acc = saldos.get(code)!;
      acc.debe += Number(mov.debe);
      acc.haber += Number(mov.haber);
    }

    const lineasAsiento: import('./dto/create-comprobante.dto').CreateMovimientoDto[] = [];
    let utilidadNeta = 0; // Ganancias - Pérdidas

    for (const [code, sal] of saldos.entries()) {
      let saldo = 0;
      if (sal.tipo === 'RESULTADO_PERDIDA') {

        saldo = sal.debe - sal.haber;
        if (saldo !== 0) {
          lineasAsiento.push({
            cuentaCodigo: code,
            glosaLinea: 'Cierre cuenta de pérdida',
            debe: saldo < 0 ? Math.abs(saldo) : 0,
            haber: saldo > 0 ? saldo : 0,
          });
          utilidadNeta -= saldo;
        }
      } else {

        saldo = sal.haber - sal.debe;
        if (saldo !== 0) {
          lineasAsiento.push({
            cuentaCodigo: code,
            glosaLinea: 'Cierre cuenta de ganancia',
            debe: saldo > 0 ? saldo : 0,
            haber: saldo < 0 ? Math.abs(saldo) : 0,
          });
          utilidadNeta += saldo;
        }
      }
    }

    if (utilidadNeta > 0) {

      lineasAsiento.push({
        cuentaCodigo: cuentaPatrimonioCodigo,
        glosaLinea: 'Traspaso Utilidad del Ejercicio',
        debe: 0,
        haber: utilidadNeta,
      });
    } else if (utilidadNeta < 0) {

      lineasAsiento.push({
        cuentaCodigo: cuentaPatrimonioCodigo,
        glosaLinea: 'Traspaso Pérdida del Ejercicio',
        debe: Math.abs(utilidadNeta),
        haber: 0,
      });
    }

    if (lineasAsiento.length < 2) {
      throw new BadRequestException('El saldo neto de resultados ya es cero, no hay nada que cerrar.');
    }

    const createDto: import('./dto/create-comprobante.dto').CreateComprobanteDto = {
      empresaRut,
      tipo: 'TRASPASO',
      fecha: fechaCierre,
      periodoMes: 12,
      periodoAnio: anio,
      glosaGeneral: `Refundición de Resultados (Cierre) Año ${anio}`,
      movimientos: lineasAsiento,
    };

    return this.create(userId, createDto);
  }

  /**
   * Genera el Asiento de Apertura para un nuevo año.
   * Toma los saldos finales de las cuentas de Activo, Pasivo y Patrimonio
   * del año anterior (anioAAbrir - 1) y los registra con fecha 1 de Enero.
   */
  async generarAsientoApertura(
    userId: string,
    dto: import('./dto/create-comprobante.dto').AperturaEjercicioDto,
  ): Promise<ComprobanteResponseDto> {
    const { empresaRut, anioAAbrir, fechaApertura } = dto;
    const empresa = await this.prisma.empresa.findUnique({ where: { rut_usuarioId: { rut: empresaRut, usuarioId: userId } } });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');
    const anioAnterior = anioAAbrir - 1;

    const movimientos = await this.prisma.movimiento.findMany({
      where: {
        comprobante: {
          empresaId: empresa.id,
            periodoAnio: anioAnterior,
        },
        cuenta: {
          tipo: { in: ['ACTIVO', 'PASIVO', 'PATRIMONIO'] },
        },
      },
      include: { cuenta: true },
    });

    if (movimientos.length === 0) {
      throw new BadRequestException(`No hay movimientos en el año ${anioAnterior} para abrir en ${anioAAbrir}.`);
    }

    const saldos = new Map<string, { debe: number; haber: number; tipo: string }>();
    for (const mov of movimientos) {
      const code = mov.cuentaCodigo;
      if (!saldos.has(code)) {
        saldos.set(code, { debe: 0, haber: 0, tipo: mov.cuenta.tipo });
      }
      const acc = saldos.get(code)!;
      acc.debe += Number(mov.debe);
      acc.haber += Number(mov.haber);
    }

    const lineasAsiento: import('./dto/create-comprobante.dto').CreateMovimientoDto[] = [];

    for (const [code, sal] of saldos.entries()) {
      let saldo = 0;
      if (sal.tipo === 'ACTIVO') {
        saldo = sal.debe - sal.haber;
        if (saldo !== 0) {


          lineasAsiento.push({
            cuentaCodigo: code,
            glosaLinea: `Apertura Saldo ${anioAnterior}`,
            debe: saldo > 0 ? saldo : 0,
            haber: saldo < 0 ? Math.abs(saldo) : 0,
          });
        }
      } else {

        saldo = sal.haber - sal.debe;
        if (saldo !== 0) {


          lineasAsiento.push({
            cuentaCodigo: code,
            glosaLinea: `Apertura Saldo ${anioAnterior}`,
            debe: saldo < 0 ? Math.abs(saldo) : 0,
            haber: saldo > 0 ? saldo : 0,
          });
        }
      }
    }

    if (lineasAsiento.length < 2) {
      throw new BadRequestException('Saldos nulos, no hay nada que abrir.');
    }

    const createDto: import('./dto/create-comprobante.dto').CreateComprobanteDto = {
      empresaRut,
      tipo: 'TRASPASO',
      fecha: fechaApertura, // Normalmente 1 de Enero
      periodoMes: 1,
      periodoAnio: anioAAbrir,
      glosaGeneral: `Asiento de Apertura Año ${anioAAbrir}`,
      movimientos: lineasAsiento,
    };

    return this.create(userId, createDto);
  }

  /**
   * Deletes a comprobante and all its movimiento lines.
   * Movimientos are deleted automatically via Cascade on the DB relation.
   * @param id The integer ID of the comprobante to delete
   * @throws NotFoundException if the comprobante does not exist
   */
  async remove(userId: string, id: number): Promise<void> {

    const comprobante = await this.prisma.comprobante.findUnique({ where: { id, empresa: { usuarioId: userId } } });
    if (!comprobante) {
      throw new NotFoundException(
        `El comprobante con ID "${id}" no fue encontrado`,
      );
    }

    await this.prisma.comprobante.delete({ where: { id } });
    this.logger.log(`Comprobante ID=${id} and its movimientos have been deleted`);
  }




  /**
   * Validates the double-entry (partida doble) accounting rule.
   * [CRITICAL per sii-chile.md]: sum(debe) MUST equal sum(haber).
   * Uses integer arithmetic to avoid floating-point precision errors.
   * @param movimientos The array of journal entry lines to validate
   * @throws BadRequestException with the exact imbalance amount for debugging
   */
  private validateDoubleEntry(movimientos: CreateMovimientoDto[]): void {
    const totalDebe = movimientos.reduce((sum, m) => sum + (m.debe ?? 0), 0);
    const totalHaber = movimientos.reduce((sum, m) => sum + (m.haber ?? 0), 0);

    if (totalDebe !== totalHaber) {
      throw new BadRequestException(
        `El asiento no cuadra: la suma del Debe (${totalDebe}) debe ser igual a la suma del Haber (${totalHaber}). ` +
          `Diferencia: ${Math.abs(totalDebe - totalHaber)} CLP`,
      );
    }

    if (totalDebe === 0) {
      throw new BadRequestException(
        'El comprobante no puede tener un total de Debe y Haber en $0',
      );
    }
  }

  /**
   * Maps a raw Prisma Comprobante entity (with movimientos) to a full ComprobanteResponseDto.
   * [BFF SERIALIZATION RULE per sii-chile.md]: Converts BigInt fields (debe, haber, siiFolioDoc)
   * to Number using Number() to prevent JSON.stringify() serialization failures.
   * @param comprobante Prisma entity with included movimientos
   * @returns ComprobanteResponseDto
   */
  private toComprobanteResponseDto(comprobante: {
    id: number;
    empresaRut: string;
    tipo: TipoComprobante;
    fecha: Date;
    glosaGeneral: string;
    periodoMes: number;
    periodoAnio: number;
    movimientos: Movimiento[];
  }): ComprobanteResponseDto {
    const mappedMovimientos: MovimientoResponseDto[] = comprobante.movimientos.map(
      (m) => ({
        id: m.id,
        cuentaCodigo: m.cuentaCodigo,
        terceroRut: m.terceroRut,
        centroCostoId: m.centroCostoId,
        debe: Number(m.debe),       // BigInt → Number (CLP)
        haber: Number(m.haber),     // BigInt → Number (CLP)
        glosaLinea: m.glosaLinea,
        siiTipoDte: m.siiTipoDte,
        siiFolioDoc: m.siiFolioDoc !== null ? Number(m.siiFolioDoc) : null, // BigInt? → number | null
      }),
    );

    const totalDebe = mappedMovimientos.reduce((sum, m) => sum + m.debe, 0);
    const totalHaber = mappedMovimientos.reduce((sum, m) => sum + m.haber, 0);

    return {
      id: comprobante.id,
      empresaRut: (comprobante as any).empresa?.rut || '',
      tipo: comprobante.tipo,
      fecha: comprobante.fecha.toISOString().split('T')[0],
      glosaGeneral: comprobante.glosaGeneral,
      periodoMes: comprobante.periodoMes,
      periodoAnio: comprobante.periodoAnio,
      movimientos: mappedMovimientos,
      totales: {
        debe: totalDebe,
        haber: totalHaber,
        cuadrado: totalDebe === totalHaber,
      },
    };
  }
}
