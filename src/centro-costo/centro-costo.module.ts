import { Module } from '@nestjs/common';
import { CentroCostoController } from './centro-costo.controller';
import { CentroCostoService } from './centro-costo.service';

/**
 * Module encapsulating the CentroCosto domain.
 * Exported so the ComprobanteModule can validate centroCostoId when creating Movimientos.
 */
@Module({
  controllers: [CentroCostoController],
  providers: [CentroCostoService],
  exports: [CentroCostoService],
})
export class CentroCostoModule {}
