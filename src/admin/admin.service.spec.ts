import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminService } from './admin.service';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

const mockPrismaService = {
  usuario: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  empresa: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  historialTransferencia: {
    findMany: jest.fn(),
    update: jest.fn(),
  }
};

describe('AdminService', () => {
  let service: AdminService;
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = process.env;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(async () => {
    process.env = { ...originalEnv, SUPABASE_URL: 'http://test', SUPABASE_SECRET_KEY: 'secret' };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  const mockAdminUser = { id: 'admin-1', rol: 'ADMIN' };
  const mockNormalUser = { id: 'user-1', rol: 'CONTADOR' };

  describe('verifyAdmin', () => {
    it('should throw ForbiddenException if user is not admin', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(mockNormalUser);
      await expect(service.findAllUsuarios({ id: 'user-1' })).rejects.toThrow(ForbiddenException);
    });

    it('should pass if user is admin', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(mockAdminUser);
      mockPrismaService.usuario.findMany.mockResolvedValue([]);
      await expect(service.findAllUsuarios({ id: 'admin-1' })).resolves.toEqual([]);
    });
  });

  describe('inviteUsuario', () => {
    const inviteDto = { email: 'new@test.com', nombre: 'New User' };

    it('should invite user and create in DB', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(mockAdminUser); // for verifyAdmin
      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(null); // for existing check
      
      const mockInviteUserByEmail = jest.fn().mockResolvedValue({ data: { user: { id: 'new-id' } }, error: null });
      (createClient as jest.Mock).mockReturnValue({
        auth: { admin: { inviteUserByEmail: mockInviteUserByEmail } }
      });

      mockPrismaService.usuario.create.mockResolvedValue({ id: 'new-id', ...inviteDto, rol: 'CONTADOR', activo: true });

      const result = await service.inviteUsuario({ id: 'admin-1' }, inviteDto);
      expect(result.usuario.id).toEqual('new-id');
      expect(mockInviteUserByEmail).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(mockAdminUser); // verify
      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(mockNormalUser); // existing
      
      await expect(service.inviteUsuario({ id: 'admin-1' }, inviteDto)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException if no env vars', async () => {
      delete process.env.SUPABASE_URL;
      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(mockAdminUser);
      await expect(service.inviteUsuario({ id: 'admin-1' }, inviteDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('reenviarInvitacion', () => {
    it('should resend invitation', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(mockNormalUser);
      
      const mockInviteUserByEmail = jest.fn().mockResolvedValue({ data: {}, error: null });
      (createClient as jest.Mock).mockReturnValue({
        auth: { admin: { inviteUserByEmail: mockInviteUserByEmail } }
      });

      const result = await service.reenviarInvitacion({ id: 'admin-1' }, 'user-1');
      expect(result.message).toContain('Invitación reenviada');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      await expect(service.reenviarInvitacion({ id: 'admin-1' }, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllEmpresas', () => {
    it('should return mapped empresas', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(mockAdminUser);
      mockPrismaService.empresa.findMany.mockResolvedValue([{
        rut: '123',
        razonSocial: 'Test',
        usuarioId: 'user-1',
        usuario: { nombre: 'User', email: 'test@test.com' }
      }]);

      const result = await service.findAllEmpresas({ id: 'admin-1' });
      expect(result).toHaveLength(1);
      expect(result[0].rut).toEqual('123');
      expect(result[0].duenoActual?.nombre).toEqual('User');
    });
  });

  describe('transferirEmpresa', () => {
    const mockEmpresaATransferir = {
      rut: '123',
      usuarioId: 'user-1',
      transferenciaDestinoEmail: 'new@test.com',
      transferenciaHabilitada: true
    };
    const mockNuevoUser = { id: 'user-2', email: 'new@test.com' };

    it('should transfer company and update history', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(mockAdminUser); // verifyAdmin
      mockPrismaService.empresa.findMany.mockResolvedValue([mockEmpresaATransferir]);
      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(mockNuevoUser); // get target user
      mockPrismaService.empresa.findUnique.mockResolvedValue(null); // check if target has company with same rut
      mockPrismaService.empresa.update.mockResolvedValue({ rut: '123' });
      mockPrismaService.historialTransferencia.findMany.mockResolvedValue([{ id: 1 }]);
      
      const result = await service.transferirEmpresa({ id: 'admin-1' }, '123');
      expect(result.mensaje).toContain('exitosa');
      expect(mockPrismaService.empresa.update).toHaveBeenCalled();
      expect(mockPrismaService.historialTransferencia.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if no company found', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(mockAdminUser);
      mockPrismaService.empresa.findMany.mockResolvedValue([]);
      await expect(service.transferirEmpresa({ id: 'admin-1' }, '123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleUserStatus', () => {
    it('should toggle status of normal user', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(mockAdminUser); // verifyAdmin
      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(mockNormalUser);
      mockPrismaService.usuario.update.mockResolvedValue({ ...mockNormalUser, activo: false });

      const result = await service.toggleUserStatus({ id: 'admin-1' }, 'user-1');
      expect(result.usuario.activo).toBe(false);
    });

    it('should throw BadRequestException if target is admin', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(mockAdminUser); // verifyAdmin
      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(mockAdminUser); // target
      
      await expect(service.toggleUserStatus({ id: 'admin-1' }, 'admin-1')).rejects.toThrow(BadRequestException);
    });
  });
});
