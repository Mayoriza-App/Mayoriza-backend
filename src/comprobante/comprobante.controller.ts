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
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ComprobanteService } from './comprobante.service';
import {
  ComprobanteListItemDto,
  ComprobanteResponseDto,
} from './dto/comprobante-response.dto';
import { 
  CierreEjercicioDto, 
  CreateComprobanteDto,
  AperturaEjercicioDto 
} from './dto/create-comprobante.dto';
import { FilterComprobanteDto } from './dto/filter-comprobante.dto';

/**
 * Controller to manage Comprobantes (Journal Entries) and their Movimientos.
 * Protected by JwtAuthGuard as part of BFF security.
 */
@Controller('comprobantes')
export class ComprobanteController {
  constructor(private readonly comprobanteService: ComprobanteService) {}

  /**
   * Retrieves a list of comprobantes scoped to a company.
   * @param filter Filter criteria including required empresaRut and optional mes/anio
   * @returns Array of ComprobanteResponseDto
   */
  @Get()
  async findAll(
    @Req() req: any,
    @Query() filter: FilterComprobanteDto,
  ): Promise<ComprobanteResponseDto[]> {
    return this.comprobanteService.findAll(req.user.id, filter);
  }

  /**
   * Retrieves a single comprobante with all its line items.
   * @param id The integer ID of the comprobante
   * @returns ComprobanteResponseDto with embedded movimientos
   */
  @Get(':id')
  async findOne(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ComprobanteResponseDto> {
    return this.comprobanteService.findOne(req.user.id, id);
  }

  /**
   * Creates a new journal entry with all its lines.
   * Enforces double-entry accounting rule (Debe = Haber).
   * @param createComprobanteDto The full payload including header and lines
   * @returns The created ComprobanteResponseDto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: any,
    @Body() createComprobanteDto: CreateComprobanteDto,
  ): Promise<ComprobanteResponseDto> {
    return this.comprobanteService.create(req.user.id, createComprobanteDto);
  }

  /**
   * Updates an existing journal entry.
   * @param id The ID of the comprobante to update
   * @param updateDto The updated full payload
   */
  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: CreateComprobanteDto,
  ): Promise<ComprobanteResponseDto> {
    return this.comprobanteService.update(req.user.id, id, updateDto);
  }

  @Post('cierre-ejercicio')
  async generarAsientoCierre(
    @Req() req: any,
    @Body() dto: CierreEjercicioDto,
  ): Promise<ComprobanteResponseDto> {
    return this.comprobanteService.generarAsientoCierre(req.user.id, dto);
  }

  @Post('apertura-ejercicio')
  async generarAsientoApertura(
    @Req() req: any,
    @Body() dto: AperturaEjercicioDto,
  ): Promise<ComprobanteResponseDto> {
    return this.comprobanteService.generarAsientoApertura(req.user.id, dto);
  }

  /**
   * Deletes a comprobante and all its lines via DB cascade.
   * Note: There is NO PATCH endpoint; comprobantes are immutable once posted.
   * To fix an error, accountants either reverse it (extorno) or delete and recreate.
   * @param id The integer ID of the comprobante to delete
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number
  ): Promise<void> {
    return this.comprobanteService.remove(req.user.id, id);
  }
}
