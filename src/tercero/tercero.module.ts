import { Module } from '@nestjs/common';
import { TerceroController } from './tercero.controller';
import { TerceroService } from './tercero.service';

/**
 * Module encapsulating the Tercero domain (clients and vendors).
 * Exported so the ComprobanteModule can validate terceroRut when creating Movimientos.
 */
@Module({
  controllers: [TerceroController],
  providers: [TerceroService],
  exports: [TerceroService],
})
export class TerceroModule {}
