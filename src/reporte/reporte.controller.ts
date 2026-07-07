import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ReporteFilterDto } from './dto/reporte-filter.dto';
import { BalanceResponseDto, BorradorF29ResponseDto, LibroMayorResponseDto, EvolucionResultadosDto, LibroDiarioResponseDto, LibroMayorCompletoResponseDto } from './dto/reporte-response.dto';
import { ReporteService } from './reporte.service';

/**
 * Controller to expose financial reporting endpoints.
 * Protected by JwtAuthGuard.
 */
@Controller('reportes')
export class ReporteController {
  constructor(private readonly reporteService: ReporteService) {}

  /**
   * Endpoint to retrieve the General Balance and Income Statement.
   * @param filter Query params (empresaRut required)
   * @returns BalanceResponseDto
   */
  @Get('balance')
  async getBalance(
    @Req() req: any,
    @Query() filter: ReporteFilterDto,
  ): Promise<BalanceResponseDto> {
    return this.reporteService.getBalance(req.user.id, filter);
  }

  /**
   * Endpoint to retrieve the Draft F29 (Borrador F29).
   * @param filter Query params (empresaRut required)
   * @returns BorradorF29ResponseDto
   */
  @Get('borrador-f29')
  async getBorradorF29(
    @Req() req: any,
    @Query() filter: ReporteFilterDto,
  ): Promise<BorradorF29ResponseDto> {
    return this.reporteService.getBorradorF29(req.user.id, filter);
  }

  @Get('evolucion-resultados')
  async getEvolucionResultados(
    @Req() req: any,
    @Query() filter: ReporteFilterDto,
  ): Promise<EvolucionResultadosDto> {
    return this.reporteService.getEvolucionResultados(req.user.id, filter);
  }

  @Get('libro-mayor-completo')
  async getLibroMayorCompleto(
    @Req() req: any,
    @Query() filter: ReporteFilterDto,
  ): Promise<LibroMayorCompletoResponseDto> {
    return this.reporteService.getLibroMayorCompleto(req.user.id, filter);
  }

  @Get('libro-mayor/:cuentaCodigo')
  async getLibroMayor(
    @Req() req: any,
    @Query() filter: ReporteFilterDto,
    @Param('cuentaCodigo') cuentaCodigo: string,
  ): Promise<LibroMayorResponseDto> {
    return this.reporteService.getLibroMayor(req.user.id, filter, cuentaCodigo);
  }

  @Get('anios-disponibles')
  async getAniosDisponibles(
    @Req() req: any,
    @Query() filter: ReporteFilterDto,
  ): Promise<number[]> {
    return this.reporteService.getAniosDisponibles(req.user.id, filter.empresaRut);
  }

  @Get('libro-diario')
  async getLibroDiario(
    @Req() req: any,
    @Query() filter: ReporteFilterDto,
  ): Promise<LibroDiarioResponseDto> {
    return this.reporteService.getLibroDiario(req.user.id, filter);
  }
}
