import { Module } from '@nestjs/common';
import { CuentaContableModule } from '../cuenta-contable/cuenta-contable.module';
import { EmpresaController } from './empresa.controller';
import { EmpresaService } from './empresa.service';

/**
 * Module encapsulating the Empresa domain.
 */
@Module({
  imports: [CuentaContableModule],
  controllers: [EmpresaController],
  providers: [EmpresaService],
  exports: [EmpresaService],
})
export class EmpresaModule {}
