import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { SubscriptionGuard } from './auth/guards/subscription.guard';
import { CentroCostoModule } from './centro-costo/centro-costo.module';
import { ComprobanteModule } from './comprobante/comprobante.module';
import { CuentaContableModule } from './cuenta-contable/cuenta-contable.module';
import { EmpresaModule } from './empresa/empresa.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReporteModule } from './reporte/reporte.module';
import { TerceroModule } from './tercero/tercero.module';
import { UsuarioModule } from './usuario/usuario.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`],
    }),

    PrismaModule,
    AuthModule,

    EmpresaModule,
    UsuarioModule,
    CuentaContableModule,
    TerceroModule,
    CentroCostoModule,
    ComprobanteModule,
    ReporteModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SubscriptionGuard,
    },
  ],
})
export class AppModule {}
