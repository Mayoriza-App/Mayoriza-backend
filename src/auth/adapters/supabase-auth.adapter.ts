import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { IAuthService } from '../interfaces/auth.service.interface';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Adapter that implements IAuthService using Supabase as the underlying provider.
 * Follows the Adapter Pattern to prevent vendor lock-in.
 */
@Injectable()
export class SupabaseAuthAdapter implements IAuthService {
  private readonly supabase?: SupabaseClient;
  private readonly logger = new Logger(SupabaseAuthAdapter.name);

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    } else {
      this.logger.warn(
        'Supabase URL or Key not provided. Token validation will fail unless bypassed (e.g., using MOCK_AUTH_USER_ID in development).',
      );
    }
  }

  /**
   * Validates a token using the Supabase Auth API.
   * @param token The JWT bearer token.
   * @returns The authenticated user object.
   * @throws UnauthorizedException with a Spanish message if validation fails.
   */
  async validateToken(token: string): Promise<any> {
    if (!this.supabase) {
      this.logger.error('Token validation attempted but Supabase Client is not initialized');
      throw new UnauthorizedException('El servicio de autenticación no está configurado');
    }
    try {
      const { data, error } = await this.supabase.auth.getUser(token);

      if (error || !data.user) {
        this.logger.warn(`Token validation failed: ${error?.message || 'No user found'}`);
        throw new UnauthorizedException('El token provisto es inválido o ha expirado');
      }

      return data.user;
    } catch (error) {
      this.logger.error('Error validating token', error instanceof Error ? error.stack : error);
      throw new UnauthorizedException('El token provisto es inválido o ha expirado');
    }
  }
}
