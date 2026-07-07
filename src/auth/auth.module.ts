import { Module, Global } from '@nestjs/common';
import { IAuthService } from './interfaces/auth.service.interface';
import { SupabaseAuthAdapter } from './adapters/supabase-auth.adapter';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Global Authentication Module.
 * Provides the SupabaseAuthAdapter implementation for the IAuthService interface
 * and registers the JwtAuthGuard for token validation.
 */
@Global()
@Module({
  providers: [
    {
      provide: IAuthService,
      useClass: SupabaseAuthAdapter, // Strategy injection
    },
    JwtAuthGuard,
  ],
  exports: [IAuthService, JwtAuthGuard],
})
export class AuthModule {}
