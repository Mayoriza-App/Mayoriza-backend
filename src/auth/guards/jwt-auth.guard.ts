import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { IAuthService } from '../interfaces/auth.service.interface';

/**
 * Global Guard to enforce JWT Authentication.
 * Integrates with IAuthService and includes a bypass mechanism for development.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly authService: IAuthService) {}

  /**
   * Determines if the current request is authorized.
   * Bypasses validation in development if MOCK_AUTH_USER_ID is present.
   * @param context Execution context for the current request.
   * @returns A boolean indicating whether the request can proceed.
   * @throws UnauthorizedException in Spanish if authorization fails.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromHeader(request);

    if (process.env.NODE_ENV === 'development') {

      if (!token || token.length < 50) {
        const mockId = token || process.env.MOCK_AUTH_USER_ID;
        if (mockId) {
          this.logger.log(`Bypassing auth in development. Mock User ID: ${mockId}`);
          (request as any).user = { id: mockId };
          return true;
        }
      }
    }

    if (!token) {
      throw new UnauthorizedException('Token de autorización no provisto');
    }

    try {
      const user = await this.authService.validateToken(token);
      (request as any).user = user;
    } catch {
      throw new UnauthorizedException('No autorizado');
    }

    return true;
  }

  /**
   * Extracts the Bearer token from the Authorization header.
   * @param request The Express HTTP request.
   * @returns The token string or undefined.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
