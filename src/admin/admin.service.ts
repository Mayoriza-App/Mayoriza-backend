import { Injectable, ForbiddenException, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { createClient } from '@supabase/supabase-js';
import { InviteUsuarioDto } from './dto/invite-usuario.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Invita a un usuario a la plataforma a través del SDK Admin de Supabase y
   * registra su perfil en la base de datos de Prisma con el rol por defecto.
   * 
   * @param user - El usuario administrador que ejecuta la acción
   * @param inviteDto - Datos del usuario a invitar (email, nombre)
   * @throws {InternalServerErrorException} Si Supabase no está configurado
   * @throws {ConflictException} Si el correo ya existe en la base de datos
   * @throws {BadRequestException} Si falla la invitación en Supabase
   * @returns Un mensaje de éxito y el perfil del usuario creado
   */
  async inviteUsuario(user: any, inviteDto: InviteUsuarioDto) {
    await this.verifyAdmin(user?.id);

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new InternalServerErrorException('Supabase Admin SDK no configurado (falta SUPABASE_SECRET_KEY)');
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const existing = await this.prisma.usuario.findUnique({ where: { email: inviteDto.email } });
    if (existing) {
      throw new ConflictException('Ya existe un usuario con este correo en la base de datos');
    }

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(inviteDto.email);

    if (error) {
      throw new BadRequestException(`Error invitando usuario en Supabase: ${error.message}`);
    }

    if (!data.user) {
      throw new InternalServerErrorException('No se recibió la información del usuario desde Supabase');
    }

    const newUserId = data.user.id;

    const newUsuario = await this.prisma.usuario.create({
      data: {
        id: newUserId,
        email: inviteDto.email,
        nombre: inviteDto.nombre,
        rol: 'CONTADOR',
        activo: true
      }
    });

    return {
      message: 'Invitación enviada exitosamente',
      usuario: { id: newUsuario.id, email: newUsuario.email, nombre: newUsuario.nombre, rol: newUsuario.rol }
    };
  }

  async findAllUsuarios(user: any) {
    await this.verifyAdmin(user?.id);
    return this.prisma.usuario.findMany({
      select: { id: true, nombre: true, email: true, rol: true, activo: true }
    });
  }

  async findAllEmpresas(user: any) {
    await this.verifyAdmin(user?.id);
    const empresas = await this.prisma.empresa.findMany({
      where: { transferenciaHabilitada: true },
      include: {
        usuario: { select: { nombre: true, email: true } }
      }
    });

    return empresas.map(empresa => ({
      rut: empresa.rut,
      razonSocial: empresa.razonSocial,
      giro: empresa.giro,
      direccion: empresa.direccion || undefined,
      comuna: empresa.comuna || undefined,
      ciudad: empresa.ciudad || undefined,
      telefono: empresa.telefono || undefined,
      correo: empresa.correo || undefined,
      duenoActual: empresa.usuario ? {
        nombre: empresa.usuario.nombre,
        email: empresa.usuario.email,
        id: empresa.usuarioId
      } : null,
      transferenciaDestinoEmail: empresa.transferenciaDestinoEmail
    }));
  }

  /**
   * Transfiere la propiedad de una empresa a otro usuario basándose en su correo de destino.
   * La empresa debe haber habilitado la transferencia previamente.
   * 
   * @param user - El usuario administrador que ejecuta la acción
   * @param rut - RUT de la empresa a transferir
   * @throws {NotFoundException} Si la empresa no se encuentra o no está habilitada
   * @throws {BadRequestException} Si la empresa no tiene destino configurado o el usuario ya la posee
   * @returns Un objeto con el rut actualizado y mensaje de éxito
   */
  async transferirEmpresa(user: any, rut: string) {
    await this.verifyAdmin(user?.id);

    const empresas = await this.prisma.empresa.findMany({ where: { rut, transferenciaHabilitada: true } });
    if (empresas.length === 0) {
      throw new NotFoundException('No se encontró ninguna empresa habilitada para transferencia con ese RUT');
    }
    if (empresas.length > 1) {
      throw new BadRequestException('Hay múltiples empresas con ese RUT habilitadas para transferencia. Contacte a soporte.');
    }

    const empresaATransferir = empresas[0];

    if (!empresaATransferir.transferenciaDestinoEmail) {
      throw new BadRequestException('La empresa no tiene un correo destino configurado para la transferencia');
    }

    const nuevoUser = await this.prisma.usuario.findUnique({ where: { email: empresaATransferir.transferenciaDestinoEmail } });
    if (!nuevoUser) {
      throw new NotFoundException(`El usuario destino (${empresaATransferir.transferenciaDestinoEmail}) no está registrado en el sistema`);
    }

    const nuevoUsuarioId = nuevoUser.id;

    const empresaTarget = await this.prisma.empresa.findUnique({
      where: { rut_usuarioId: { rut, usuarioId: nuevoUsuarioId } },
    });
    if (empresaTarget) {
      throw new BadRequestException('El usuario destino ya tiene registrada una empresa con ese RUT');
    }

    const empresaActualizada = await this.prisma.empresa.update({
      where: { rut_usuarioId: { rut, usuarioId: empresaATransferir.usuarioId } },
      data: { 
        usuarioId: nuevoUsuarioId,
        transferenciaHabilitada: false,
        transferenciaDestinoEmail: null
      },
    });

    const historialesPendientes = await this.prisma.historialTransferencia.findMany({
      where: { empresaRut: rut, estado: 'PENDIENTE' },
      orderBy: { fechaSolicitud: 'desc' }
    });

    if (historialesPendientes.length > 0) {
      await this.prisma.historialTransferencia.update({
        where: { id: historialesPendientes[0].id },
        data: {
          estado: 'COMPLETADA',
          fechaTransferencia: new Date()
        }
      });
    }

    return { rut: empresaActualizada.rut, mensaje: 'Empresa transferida exitosamente' };
  }

  async toggleUserStatus(user: any, targetUserId: string) {
    await this.verifyAdmin(user?.id);

    const targetUser = await this.prisma.usuario.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (targetUser.rol === 'ADMIN') {
      throw new BadRequestException('No se puede modificar el estado de un Administrador');
    }

    const updatedUser = await this.prisma.usuario.update({
      where: { id: targetUserId },
      data: { activo: !targetUser.activo },
      select: { id: true, nombre: true, email: true, rol: true, activo: true }
    });

    return { 
      mensaje: `Suscripción ${updatedUser.activo ? 'activada' : 'desactivada'} exitosamente`,
      usuario: updatedUser
    };
  }

  private async verifyAdmin(userId: string) {
    if (!userId) {
      throw new ForbiddenException('Acceso denegado: Se requiere rol de Administrador');
    }
    const userDb = await this.prisma.usuario.findUnique({ where: { id: userId } });
    if (!userDb || userDb.rol !== 'ADMIN') {
      throw new ForbiddenException('Acceso denegado: Se requiere rol de Administrador');
    }
  }
}
