import { Module } from '@nestjs/common';
import { ComprobanteController } from './comprobante.controller';
import { ComprobanteService } from './comprobante.service';
import { CuentaContableModule } from '../cuenta-contable/cuenta-contable.module';
import { TerceroModule } from '../tercero/tercero.module';
import { CentroCostoModule } from '../centro-costo/centro-costo.module';

/**
 * Module encapsulating the core accounting engine (Comprobantes and Movimientos).
 * Imports CuentaContable, Tercero, and CentroCosto modules in case cross-module
 * validation is needed in the future (currently Prisma handles referential integrity).
 */
@Module({
  imports: [CuentaContableModule, TerceroModule, CentroCostoModule],
  controllers: [ComprobanteController],
  providers: [ComprobanteService],
  exports: [ComprobanteService],
})
export class ComprobanteModule {}
