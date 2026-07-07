import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CentroCostoResponseDto } from './dto/centro-costo-response.dto';
import { CreateCentroCostoDto } from './dto/create-centro-costo.dto';
import { UpdateCentroCostoDto } from './dto/update-centro-costo.dto';

@Injectable()
export class CentroCostoService {
  private readonly logger = new Logger(CentroCostoService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all cost centers ordered alphabetically by name.
   * @returns Array of CentroCostoResponseDto
   */
  async findAll(): Promise<CentroCostoResponseDto[]> {
    const centros = await this.prisma.centroCosto.findMany({
      orderBy: { nombre: 'asc' },
    });
    return centros.map((c) => this.toResponseDto(c));
  }

  /**
   * Retrieves a single cost center by its auto-incremented integer ID.
   * @param id The integer ID of the cost center
   * @returns CentroCostoResponseDto
   * @throws NotFoundException if the cost center does not exist
   */
  async findOne(id: number): Promise<CentroCostoResponseDto> {
    const centro = await this.prisma.centroCosto.findUnique({ where: { id } });

    if (!centro) {
      throw new NotFoundException(
        `El centro de costo con ID "${id}" no fue encontrado`,
      );
    }

    return this.toResponseDto(centro);
  }

  /**
   * Creates a new cost center.
   * Enforces unique names to prevent duplicate departments (e.g., two "Ventas" entries).
   * @param createCentroCostoDto The cost center creation payload
   * @returns CentroCostoResponseDto with the generated ID
   * @throws ConflictException if a cost center with the same name already exists
   */
  async create(
    createCentroCostoDto: CreateCentroCostoDto,
  ): Promise<CentroCostoResponseDto> {
    const existing = await this.prisma.centroCosto.findFirst({
      where: { nombre: { equals: createCentroCostoDto.nombre, mode: 'insensitive' } },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un centro de costo con el nombre "${createCentroCostoDto.nombre}"`,
      );
    }

    const nuevoCentro = await this.prisma.centroCosto.create({
      data: { nombre: createCentroCostoDto.nombre },
    });

    this.logger.log(
      `New cost center created: ID=${nuevoCentro.id} - ${nuevoCentro.nombre}`,
    );
    return this.toResponseDto(nuevoCentro);
  }

  /**
   * Updates a cost center's name.
   * @param id The integer ID of the cost center to update
   * @param updateCentroCostoDto The updated name
   * @returns CentroCostoResponseDto
   * @throws NotFoundException if the cost center does not exist
   * @throws ConflictException if the new name is already taken by another cost center
   */
  async update(
    id: number,
    updateCentroCostoDto: UpdateCentroCostoDto,
  ): Promise<CentroCostoResponseDto> {
    await this.findOne(id); // Ensures the cost center exists

    const duplicate = await this.prisma.centroCosto.findFirst({
      where: {
        nombre: { equals: updateCentroCostoDto.nombre, mode: 'insensitive' },
        NOT: { id },
      },
    });

    if (duplicate) {
      throw new ConflictException(
        `Ya existe un centro de costo con el nombre "${updateCentroCostoDto.nombre}"`,
      );
    }

    const centroActualizado = await this.prisma.centroCosto.update({
      where: { id },
      data: { nombre: updateCentroCostoDto.nombre },
    });

    return this.toResponseDto(centroActualizado);
  }

  /**
   * Deletes a cost center by its ID.
   * Linked Movimientos will have their centroCostoId set to NULL (SetNull policy in schema).
   * @param id The integer ID of the cost center to delete
   * @throws NotFoundException if the cost center does not exist
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id); // Ensures the cost center exists

    await this.prisma.centroCosto.delete({ where: { id } });
    this.logger.log(`Cost center ID=${id} has been deleted`);
  }

  /**
   * Maps a Prisma CentroCosto entity to a BFF-friendly CentroCostoResponseDto.
   * @param centro The raw Prisma entity
   * @returns CentroCostoResponseDto
   */
  private toResponseDto(centro: { id: number; nombre: string }): CentroCostoResponseDto {
    return {
      id: centro.id,
      nombre: centro.nombre,
    };
  }
}
