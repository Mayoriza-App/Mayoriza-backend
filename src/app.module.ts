import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EmpresaModule } from './empresa/empresa.module';
import { UsuarioModule } from './usuario/usuario.module';
import { CuentaContableModule } from './cuenta-contable/cuenta-contable.module';
import { TerceroModule } from './tercero/tercero.module';
import { CentroCostoModule } from './centro-costo/centro-costo.module';
import { ComprobanteModule } from './comprobante/comprobante.module';
import { ReporteModule } from './reporte/reporte.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { APP_GUARD } from '@nestjs/core';
import { SubscriptionGuard } from './auth/guards/subscription.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

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
  controllers: [AppController],
  providers: [
    AppService,
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
