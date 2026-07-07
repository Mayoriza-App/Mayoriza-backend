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
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TipoCuenta } from '@prisma/client';
import { CuentaContableResponseDto } from './dto/cuenta-contable-response.dto';
import { CreateCuentaContableDto } from './dto/create-cuenta-contable.dto';
import { UpdateCuentaContableDto } from './dto/update-cuenta-contable.dto';
import { CuentaContableService } from './cuenta-contable.service';
import { ClonarCuentasDto } from './dto/clonar-cuentas.dto';

/**
 * Controller to manage the chart of accounts (Plan de Cuentas).
 * Protected by JwtAuthGuard as part of BFF security.
 */
@Controller('cuentas-contables')
export class CuentaContableController {
  constructor(private readonly cuentaContableService: CuentaContableService) {}

  /**
   * Retrieves all accounts, optionally filtered by account type.
   * Results are sorted by code to reflect the hierarchical tree.
   * @param tipo Optional query param to filter by TipoCuenta enum value
   * @returns Array of CuentaContableResponseDto
   */
  @Get()
  async findAll(
    @Req() req: any,
    @Query('empresaRut') empresaRut: string,
    @Query('tipo') tipo?: TipoCuenta,
  ): Promise<CuentaContableResponseDto[]> {
    return this.cuentaContableService.findAll(req.user.id, empresaRut, tipo);
  }

  /**
   * Retrieves the template accounts for previewing.
   */
  @Get('plantilla/:id')
  async getPlantilla(
    @Param('id') id: string,
  ): Promise<CuentaContableResponseDto[]> {
    return this.cuentaContableService.getPlantillaCuentas(parseInt(id, 10));
  }

  /**
   * Clones accounts from a template or another company into the specified company.
   */
  @Post('clonar')
  @HttpCode(HttpStatus.OK)
  async clonar(
    @Req() req: any,
    @Body() clonarDto: ClonarCuentasDto,
  ): Promise<{ message: string }> {
    await this.cuentaContableService.clonarCuentas(
      req.user.id,
      clonarDto.empresaRut,
      clonarDto.origenPlanId,
      clonarDto.origenEmpresaRut,
    );
    return { message: 'Cuentas clonadas exitosamente' };
  }

  /**
   * Retrieves a single account by its hierarchical code.
   * @param codigo The unique account code (e.g., "1.1.01.01")
   * @returns CuentaContableResponseDto
   */
  @Get(':codigo')
  async findOne(
    @Req() req: any,
    @Query('empresaRut') empresaRut: string,
    @Param('codigo') codigo: string,
  ): Promise<CuentaContableResponseDto> {
    return this.cuentaContableService.findOne(req.user.id, empresaRut, codigo);
  }

  /**
   * Creates a new account in the chart of accounts.
   * @param createCuentaContableDto The account creation payload
   * @returns The created CuentaContableResponseDto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: any,
    @Body() createCuentaContableDto: CreateCuentaContableDto,
  ): Promise<CuentaContableResponseDto> {
    return this.cuentaContableService.create(req.user.id, createCuentaContableDto);
  }

  /**
   * Updates an account's name or type. The code is immutable.
   * @param codigo The account code to update
   * @param updateCuentaContableDto The fields to update
   * @returns The updated CuentaContableResponseDto
   */
  @Patch(':codigo')
  async update(
    @Req() req: any,
    @Query('empresaRut') empresaRut: string,
    @Param('codigo') codigo: string,
    @Body() updateCuentaContableDto: UpdateCuentaContableDto,
  ): Promise<CuentaContableResponseDto> {
    return this.cuentaContableService.update(req.user.id, empresaRut, codigo, updateCuentaContableDto);
  }

  /**
   * Deletes an account from the chart of accounts.
   * Will be rejected if the account has Movimientos linked to it.
   * @param codigo The account code to delete
   */
  @Delete(':codigo')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: any,
    @Query('empresaRut') empresaRut: string,
    @Param('codigo') codigo: string,
  ): Promise<void> {
    return this.cuentaContableService.remove(req.user.id, empresaRut, codigo);
  }
}
