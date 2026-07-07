import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTerceroDto } from './dto/create-tercero.dto';
import { TerceroResponseDto } from './dto/tercero-response.dto';
import { UpdateTerceroDto } from './dto/update-tercero.dto';

@Injectable()
export class TerceroService {
  private readonly logger = new Logger(TerceroService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all registered third parties (clients and vendors).
   * Ordered alphabetically by razonSocial for a predictable frontend list.
   * @returns Array of TerceroResponseDto
   */
  async findAll(): Promise<TerceroResponseDto[]> {
    const terceros = await this.prisma.tercero.findMany({
      orderBy: { razonSocial: 'asc' },
    });
    return terceros.map((t) => this.toResponseDto(t));
  }

  /**
   * Retrieves a single third party by RUT.
   * @param rut The Chilean RUT of the third party (e.g., "76000000-K")
   * @returns TerceroResponseDto
   * @throws NotFoundException if the third party does not exist
   */
  async findOne(rut: string): Promise<TerceroResponseDto> {
    const tercero = await this.prisma.tercero.findUnique({ where: { rut } });

    if (!tercero) {
      throw new NotFoundException(
        `El tercero con RUT "${rut}" no fue encontrado`,
      );
    }

    return this.toResponseDto(tercero);
  }

  /**
   * Creates a new third party. Each RUT must be unique across the system.
   * Per sii-chile.md rules, the RUT is the canonical identifier for clients/vendors
   * and is used to link them to Movimientos as Documentos Tributarios (DTE).
   * @param createTerceroDto The third party creation payload
   * @returns TerceroResponseDto
   * @throws ConflictException if the RUT is already registered
   */
  async create(createTerceroDto: CreateTerceroDto): Promise<TerceroResponseDto> {
    const existing = await this.prisma.tercero.findUnique({
      where: { rut: createTerceroDto.rut },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un tercero registrado con el RUT "${createTerceroDto.rut}"`,
      );
    }

    const nuevoTercero = await this.prisma.tercero.create({
      data: {
        rut: createTerceroDto.rut,
        razonSocial: createTerceroDto.razonSocial,
        giro: createTerceroDto.giro,
      },
    });

    this.logger.log(
      `New third party created: ${nuevoTercero.rut} - ${nuevoTercero.razonSocial}`,
    );
    return this.toResponseDto(nuevoTercero);
  }

  /**
   * Updates a third party's razonSocial or giro.
   * The RUT (PK) is immutable to preserve referential integrity with Movimientos.
   * @param rut The RUT of the third party to update
   * @param updateTerceroDto The updated fields
   * @returns TerceroResponseDto
   * @throws NotFoundException if the third party does not exist
   */
  async update(
    rut: string,
    updateTerceroDto: UpdateTerceroDto,
  ): Promise<TerceroResponseDto> {
    await this.findOne(rut); // Ensures the third party exists

    const terceroActualizado = await this.prisma.tercero.update({
      where: { rut },
      data: {
        razonSocial: updateTerceroDto.razonSocial,
        giro: updateTerceroDto.giro,
      },
    });

    return this.toResponseDto(terceroActualizado);
  }

  /**
   * Deletes a third party by RUT.
   * Will be rejected at DB-level if the tercero has associated Movimientos
   * (onDelete: SetNull — rows are nullified, not blocked, so deletion is always safe).
   * @param rut The RUT of the third party to delete
   * @throws NotFoundException if the third party does not exist
   */
  async remove(rut: string): Promise<void> {
    await this.findOne(rut); // Ensures the third party exists

    await this.prisma.tercero.delete({ where: { rut } });
    this.logger.log(`Third party ${rut} has been deleted`);
  }

  /**
   * Maps a Prisma Tercero entity to a BFF-friendly TerceroResponseDto.
   * Centralizes mapping logic following the DRY principle.
   * @param tercero The raw Prisma entity
   * @returns TerceroResponseDto
   */
  private toResponseDto(tercero: {
    rut: string;
    razonSocial: string;
    giro: string | null;
  }): TerceroResponseDto {
    return {
      rut: tercero.rut,
      razonSocial: tercero.razonSocial,
      giro: tercero.giro,
    };
  }
}
