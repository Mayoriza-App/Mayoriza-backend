import { Module } from '@nestjs/common';
import { CuentaContableController } from './cuenta-contable.controller';
import { CuentaContableService } from './cuenta-contable.service';

/**
 * Module encapsulating the CuentaContable domain (Plan de Cuentas).
 * Exported so the ComprobanteModule can validate account codes when creating Movimientos.
 */
@Module({
  controllers: [CuentaContableController],
  providers: [CuentaContableService],
  exports: [CuentaContableService],
})
export class CuentaContableModule {}
