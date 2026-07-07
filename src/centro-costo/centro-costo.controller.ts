import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CentroCostoService } from './centro-costo.service';
import { CentroCostoResponseDto } from './dto/centro-costo-response.dto';
import { CreateCentroCostoDto } from './dto/create-centro-costo.dto';
import { UpdateCentroCostoDto } from './dto/update-centro-costo.dto';

/**
 * Controller to manage CentroCosto resources.
 * Uses ParseIntPipe on all :id params to automatically validate and convert
 * the string route param to a typed integer before reaching the service.
 * Protected by JwtAuthGuard as part of BFF security.
 */
@Controller('centros-costo')
export class CentroCostoController {
  constructor(private readonly centroCostoService: CentroCostoService) {}

  /**
   * Retrieves all cost centers, ordered alphabetically.
   * @returns Array of CentroCostoResponseDto
   */
  @Get()
  async findAll(): Promise<CentroCostoResponseDto[]> {
    return this.centroCostoService.findAll();
  }

  /**
   * Retrieves a single cost center by its integer ID.
   * @param id The integer ID of the cost center
   * @returns CentroCostoResponseDto
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CentroCostoResponseDto> {
    return this.centroCostoService.findOne(id);
  }

  /**
   * Creates a new cost center.
   * @param createCentroCostoDto The creation payload
   * @returns The created CentroCostoResponseDto with the auto-generated ID
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCentroCostoDto: CreateCentroCostoDto,
  ): Promise<CentroCostoResponseDto> {
    return this.centroCostoService.create(createCentroCostoDto);
  }

  /**
   * Updates a cost center's name.
   * @param id The integer ID of the cost center to update
   * @param updateCentroCostoDto The updated name
   * @returns The updated CentroCostoResponseDto
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCentroCostoDto: UpdateCentroCostoDto,
  ): Promise<CentroCostoResponseDto> {
    return this.centroCostoService.update(id, updateCentroCostoDto);
  }

  /**
   * Deletes a cost center by its ID.
   * Linked Movimientos will have their centroCostoId set to NULL.
   * @param id The integer ID of the cost center to delete
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.centroCostoService.remove(id);
  }
}
