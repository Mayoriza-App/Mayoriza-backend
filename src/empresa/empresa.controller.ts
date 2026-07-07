import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { EmpresaResponseDto } from './dto/empresa-response.dto';

/**
 * Controller to manage Empresa resources.
 * Protected by JwtAuthGuard as part of BFF security.
 */
@Controller('empresas')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  /**
   * Retrieves a list of all companies belonging to the user.
   * @returns Array of companies
   */
  @Get()
  async findAll(@Req() req: any): Promise<EmpresaResponseDto[]> {
    return this.empresaService.findAll(req.user.id);
  }

  /**
   * Retrieves available chart of accounts options.
   */
  @Get('opciones-plan')
  async getOpcionesPlan(@Req() req: any) {
    return this.empresaService.getOpcionesPlan(req.user.id);
  }

  /**
   * Retrieves a single company by its RUT.
   * @param rut RUT of the company
   * @returns The company data
   */
  @Get(':rut')
  async findOne(@Req() req: any, @Param('rut') rut: string): Promise<EmpresaResponseDto> {
    return this.empresaService.findOne(req.user.id, rut);
  }

  /**
   * Creates a new company.
   * @param createEmpresaDto The company creation payload
   * @returns The created company data
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: any, @Body() createEmpresaDto: CreateEmpresaDto): Promise<EmpresaResponseDto> {
    return this.empresaService.create(req.user.id, createEmpresaDto);
  }

  /**
   * Cambia el estado (activa/inactiva) de una empresa.
   */
  @Patch(':rut/estado')
  async cambiarEstado(
    @Req() req: any,
    @Param('rut') rut: string,
    @Body('activa') activa: boolean,
  ) {
    return this.empresaService.cambiarEstado(req.user.id, rut, activa);
  }

  /**
   * Updates a company.
   * @param rut RUT of the company
   * @param updateEmpresaDto The payload to update the company
   * @returns The updated company data
   */
  @Patch(':rut')
  async update(
    @Req() req: any,
    @Param('rut') rut: string,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
  ): Promise<EmpresaResponseDto> {
    return this.empresaService.update(req.user.id, rut, updateEmpresaDto);
  }

  /**
   * Deletes a company by its RUT.
   * @param rut RUT of the company
   */
  @Delete(':rut')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req: any, @Param('rut') rut: string): Promise<void> {
    return this.empresaService.remove(req.user.id, rut);
  }

  /**
   * Habilita la transferencia de una empresa y designa el correo destino.
   */
  @Post(':rut/habilitar-transferencia')
  async habilitarTransferencia(
    @Req() req: any,
    @Param('rut') rut: string,
    @Body('destinoEmail') destinoEmail: string,
  ) {
    return this.empresaService.habilitarTransferencia(req.user.id, rut, destinoEmail);
  }
}
