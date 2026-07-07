import { CanActivate, ExecutionContext, Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<any>();

    if (!request.user || !request.user.id) {
      return true; // Asumimos que JwtAuthGuard se encarga de proteger la ruta si es requerida
    }

    const userId = request.user.id;
    const dbUser = await this.prisma.usuario.findUnique({ where: { id: userId } });

    if (!dbUser) return true;

    const isModifying = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);

    this.logger.log(`SubscriptionGuard check: method=${request.method}, url=${request.url}, isModifying=${isModifying}, dbUser.rol=${dbUser?.rol}, dbUser.activo=${dbUser?.activo}`);

    if (dbUser.rol === 'CONTADOR' && isModifying) {
      if (dbUser.activo === false) {
        this.logger.warn(`Usuario inactivo intentó modificar recursos. Metodo: ${request.method} URL: ${request.url}`);
        throw new ForbiddenException('Suscripción Inactiva. No tienes permisos para crear o modificar registros.');
      }
    }

    return true;
  }
}
