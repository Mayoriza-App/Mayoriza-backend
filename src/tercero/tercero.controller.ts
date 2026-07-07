import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateTerceroDto } from './dto/create-tercero.dto';
import { TerceroResponseDto } from './dto/tercero-response.dto';
import { UpdateTerceroDto } from './dto/update-tercero.dto';
import { TerceroService } from './tercero.service';

/**
 * Controller to manage Tercero resources (clients and vendors).
 * Protected by JwtAuthGuard as part of BFF security.
 */
@Controller('terceros')
export class TerceroController {
  constructor(private readonly terceroService: TerceroService) {}

  /**
   * Retrieves all third parties, ordered alphabetically.
   * @returns Array of TerceroResponseDto
   */
  @Get()
  async findAll(): Promise<TerceroResponseDto[]> {
    return this.terceroService.findAll();
  }

  /**
   * Retrieves a single third party by its RUT.
   * @param rut The RUT of the third party (e.g., "76000000-K")
   * @returns TerceroResponseDto
   */
  @Get(':rut')
  async findOne(@Param('rut') rut: string): Promise<TerceroResponseDto> {
    return this.terceroService.findOne(rut);
  }

  /**
   * Creates a new third party (client or vendor).
   * @param createTerceroDto The third party creation payload
   * @returns The created TerceroResponseDto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTerceroDto: CreateTerceroDto,
  ): Promise<TerceroResponseDto> {
    return this.terceroService.create(createTerceroDto);
  }

  /**
   * Updates a third party's razonSocial or giro. RUT is immutable.
   * @param rut The RUT of the third party to update
   * @param updateTerceroDto The fields to update
   * @returns The updated TerceroResponseDto
   */
  @Patch(':rut')
  async update(
    @Param('rut') rut: string,
    @Body() updateTerceroDto: UpdateTerceroDto,
  ): Promise<TerceroResponseDto> {
    return this.terceroService.update(rut, updateTerceroDto);
  }

  /**
   * Deletes a third party by RUT.
   * Linked Movimientos will have their terceroRut set to NULL (SetNull policy).
   * @param rut The RUT of the third party to delete
   */
  @Delete(':rut')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('rut') rut: string): Promise<void> {
    return this.terceroService.remove(rut);
  }
}
